import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// 列表頂端「載入更早訊息中」的轉圈。loading 為 false 時不佔空間。
class LoadingOlderIndicator extends StatelessWidget {
  const LoadingOlderIndicator({super.key, required this.loading});

  final ValueListenable<bool> loading;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: loading,
      builder: (context, value, _) => value
          ? const Padding(
              padding: EdgeInsets.all(12),
              child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
            )
          : const SizedBox.shrink(),
    );
  }
}
