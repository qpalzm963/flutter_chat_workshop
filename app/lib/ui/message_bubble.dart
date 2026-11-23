import 'package:flutter/material.dart';

import '../models/message.dart';

class MessageBubble extends StatelessWidget {
  const MessageBubble({super.key, required this.message, required this.isMine, this.onRetry});

  final Message message;
  final bool isMine;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final time = DateTime.fromMillisecondsSinceEpoch(message.ts);
    final hhmm = '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    final meta = '${message.seq != null ? '#${message.seq} · ' : ''}$hhmm';

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
          if (!isMine)
            Text(message.sender, style: Theme.of(context).textTheme.labelSmall),
          Text(message.text),
          Text(meta, style: Theme.of(context).textTheme.labelSmall?.copyWith(color: scheme.outline)),
        ],
      ),
    );

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: Row(
        mainAxisAlignment: isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (isMine) _StatusIcon(status: message.status, onRetry: onRetry),
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
      MessageStatus.sending =>
        const SizedBox.square(dimension: 14, child: CircularProgressIndicator(strokeWidth: 2)),
      MessageStatus.sent => Icon(Icons.done, size: 16, color: Theme.of(context).colorScheme.outline),
      MessageStatus.failed => GestureDetector(
          onTap: onRetry,
          child: const Icon(Icons.error, size: 22, color: Colors.red),
        ),
    };
  }
}
