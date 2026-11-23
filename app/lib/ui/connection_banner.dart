import 'package:flutter/material.dart';

import '../models/connection_status.dart';

class ConnectionBanner extends StatelessWidget {
  const ConnectionBanner({super.key, required this.status});

  final ValueNotifier<ConnectionStatus> status;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: status,
      builder: (context, s, _) {
        if (s == ConnectionStatus.connected) return const SizedBox.shrink();
        final (text, color) = switch (s) {
          ConnectionStatus.connecting => ('連線中…', Colors.orange),
          _ => ('已斷線，自動重連中…', Colors.red),
        };
        return Container(
          width: double.infinity,
          color: color,
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white),
          ),
        );
      },
    );
  }
}
