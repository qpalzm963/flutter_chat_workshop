import 'dart:io';

/// Server 位址。Android 模擬器要用 10.0.2.2 才能連到電腦本機。
/// 實機測試：flutter run --dart-define=HOST=192.168.x.x
const _hostOverride = String.fromEnvironment('HOST');
final String serverHost = _hostOverride.isNotEmpty
    ? _hostOverride
    : (Platform.isAndroid ? '10.0.2.2' : 'localhost');
const int serverPort = 8080;

final Uri wsUrl = Uri.parse('ws://$serverHost:$serverPort/ws');
