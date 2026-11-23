import 'package:flutter/material.dart';

/// 「以下為未讀訊息」分隔線
class UnreadDivider extends StatelessWidget {
  const UnreadDivider({super.key});

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.primary;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          Expanded(child: Divider(color: color)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text('以下為未讀訊息', style: TextStyle(color: color, fontSize: 12)),
          ),
          Expanded(child: Divider(color: color)),
        ],
      ),
    );
  }
}
