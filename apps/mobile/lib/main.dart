import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/theme/app_theme.dart';
import 'presentation/router/app_router.dart';
import 'presentation/providers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp();

  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
  );

  runApp(
    const ProviderScope(
      child: AgroConnectApp(),
    ),
  );
}

class AgroConnectApp extends ConsumerWidget {
  const AgroConnectApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    ref.listen<AuthState>(authProvider, (prev, next) {
      if (prev?.status != next.status) {
        if (next.status == AuthStatus.authenticated) {
          router.go('/home');
        } else if (next.status == AuthStatus.unauthenticated) {
          router.go('/login');
        }
      }
    });

    return MaterialApp.router(
      title: 'AgroConnect GH',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      routerConfig: router,
    );
  }
}
