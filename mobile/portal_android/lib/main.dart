import 'package:flutter/material.dart';

import 'portal_webview_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const PortalApp());
}

class PortalApp extends StatelessWidget {
  const PortalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'G&F Portal EU',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFE60000)),
        useMaterial3: true,
      ),
      home: const PortalWebViewScreen(),
    );
  }
}
