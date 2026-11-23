import 'package:flutter/material.dart';

import '../data/chat_service.dart';
import '../models/room.dart';
import 'chat_page.dart';
import 'connection_banner.dart';

class RoomListPage extends StatefulWidget {
  const RoomListPage({super.key, required this.service});

  final ChatService service;

  @override
  State<RoomListPage> createState() => _RoomListPageState();
}

class _RoomListPageState extends State<RoomListPage> {
  late final Stream<List<Room>> _rooms = widget.service.store.watchRooms();

  String get _me => widget.service.me;

  void _open(Room room) => Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) => ChatPage(service: widget.service, room: room),
    ),
  );

  /// 私聊：選線上學員 → 算出 dm:A:B → 先在本地建房，第一則送出時 Server 自動建房
  Future<void> _newDm() async {
    final List<String> online;
    try {
      online = (await widget.service.api.fetchOnlineUsers()).where((u) => u != _me).toList();
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('拿不到在線名單')));
      return;
    }
    if (!mounted) return;
    final other = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: online.isEmpty
            ? const Padding(padding: EdgeInsets.all(24), child: Text('目前沒有其他人在線'))
            : ListView(
                shrinkWrap: true,
                children: [
                  for (final u in online)
                    ListTile(leading: const Icon(Icons.person), title: Text(u), onTap: () => Navigator.pop(context, u)),
                ],
              ),
      ),
    );
    if (other == null) return;
    final id = Room.dmId(_me, other);
    await widget.service.store.ensureRoom(Room(id: id, name: id, kind: 'dm', members: [_me, other]..sort()));
    final room = await widget.service.store.room(id);
    if (room != null && mounted) _open(room);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('聊天室（$_me）')),
      floatingActionButton: FloatingActionButton(tooltip: '私聊', onPressed: _newDm, child: const Icon(Icons.edit)),
      body: Column(
        children: [
          ConnectionBanner(status: widget.service.socket.status),
          Expanded(
            child: StreamBuilder<List<Room>>(
              stream: _rooms,
              builder: (context, snap) {
                final rooms = snap.data ?? const <Room>[];
                if (rooms.isEmpty) return const Center(child: Text('還沒有房間'));
                return ListView.separated(
                  itemCount: rooms.length,
                  separatorBuilder: (_, _) => const Divider(height: 1),
                  itemBuilder: (context, i) => _RoomTile(room: rooms[i], me: _me, onTap: () => _open(rooms[i])),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _RoomTile extends StatelessWidget {
  const _RoomTile({required this.room, required this.me, required this.onTap});

  final Room room;
  final String me;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final icon = switch (room.kind) {
      'dm' => Icons.person,
      'lobby' => Icons.campaign,
      'private' => Icons.lock,
      _ => Icons.group,
    };
    final preview = room.lastText == null ? '還沒有訊息' : '${room.lastSender}：${room.lastText}';
    // TODO(第 9 堂) ③ 右邊顯示未讀數（Badge）
    return ListTile(
      leading: CircleAvatar(child: Icon(icon)),
      title: Text(room.titleFor(me)),
      subtitle: Text(preview, maxLines: 1, overflow: TextOverflow.ellipsis),
      onTap: onTap,
    );
  }
}
