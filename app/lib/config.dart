import 'dart:io';

/// Server 位址。Android 模擬器要用 10.0.2.2 才能連到電腦本機。
/// 實機測試：flutter run --dart-define=HOST=192.168.x.x
const _hostOverride = String.fromEnvironment('HOST');
final String serverHost = _hostOverride.isNotEmpty ? _hostOverride : (Platform.isAndroid ? '10.0.2.2' : 'localhost');
const int serverPort = 8080;

/// 帶 --dart-define=USER=Amy 啟動可跳過取名頁（兩台模擬器各帶一個名字，第二台用 Amy-2）
const presetUser = String.fromEnvironment('USER');

Uri wsUrl(String user) =>
    Uri(scheme: 'ws', host: serverHost, port: serverPort, path: '/ws', queryParameters: {'user': user});

Uri apiUrl(List<String> pathSegments, [Map<String, String>? query]) =>
    Uri(scheme: 'http', host: serverHost, port: serverPort, pathSegments: pathSegments, queryParameters: query);
