import 'package:flutter/material.dart';

import '../models/message_status.dart';

/// 聊天氣泡。只吃顯示需要的欄位，Message 長什麼樣子都不影響它。
class MessageBubble extends StatelessWidget {
  const MessageBubble({
    super.key,
    required this.sender,
    required this.text,
    required this.ts,
    required this.isMine,
    this.seq,
    this.status,
    this.readLabel,
    this.onRetry,
  });

  final String sender;
  final String text;
  final int ts;
  final bool isMine;
  final int? seq;

  /// 自己的訊息才顯示：sending 轉圈、sent 勾勾、failed 紅點（點擊呼叫 [onRetry]）
  final MessageStatus? status;

  /// 自己的訊息：「已讀」（一對一）或「已讀 N」（群組）；null = 還沒人讀
  final String? readLabel;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final small = Theme.of(context).textTheme.labelSmall;
    final time = DateTime.fromMillisecondsSinceEpoch(ts);
    final hhmm = '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    final meta = '${seq != null ? '#$seq · ' : ''}$hhmm';

    final bubble = Container(
      constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.7),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isMine ? scheme.primaryContainer : scheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (!isMine) Text(sender, style: small),
          Text(text),
          Text(meta, style: small?.copyWith(color: scheme.outline)),
        ],
      ),
    );

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: Row(
        mainAxisAlignment: isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (isMine)
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (readLabel != null) Text(readLabel!, style: small?.copyWith(color: scheme.primary)),
                if (status != null) _StatusIcon(status: status!, onRetry: onRetry),
              ],
            ),
          if (isMine) const SizedBox(width: 6),
          Flexible(child: bubble),
        ],
      ),
    );
  }
}

class _StatusIcon extends StatelessWidget {
  const _StatusIcon({required this.status, this.onRetry});

  final MessageStatus status;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return switch (status) {
      MessageStatus.sending => const SizedBox.square(dimension: 14, child: CircularProgressIndicator(strokeWidth: 2)),
      MessageStatus.sent => Icon(Icons.done, size: 16, color: Theme.of(context).colorScheme.outline),
      MessageStatus.failed => GestureDetector(
        onTap: onRetry,
        child: const Icon(Icons.error, size: 22, color: Colors.red),
      ),
    };
  }
}
