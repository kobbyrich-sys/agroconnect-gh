import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: AppColors.green,
                  child: Text(
                    (user?.fullName ?? 'U').substring(0, 1).toUpperCase(),
                    style: const TextStyle(fontSize: 32, color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 12),
                Text(user?.fullName ?? 'User', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(user?.email ?? '', style: TextStyle(color: Colors.grey.shade600)),
              ],
            ),
          ),
          const SizedBox(height: 32),
          _MenuItem(icon: Icons.shopping_bag_outlined, title: 'My Orders', onTap: () => context.go('/orders')),
          _MenuItem(icon: Icons.favorite_outline, title: 'Wishlist', onTap: () => context.go('/wishlist')),
          _MenuItem(icon: Icons.location_on_outlined, title: 'My Addresses', onTap: () {}),
          _MenuItem(icon: Icons.payment_outlined, title: 'Payment Methods', onTap: () {}),
          _MenuItem(icon: Icons.store_outlined, title: 'Seller Dashboard', onTap: () => context.go('/seller/dashboard')),
          _MenuItem(icon: Icons.wallet_outlined, title: 'Wallet', onTap: () => context.go('/wallet')),
          _MenuItem(icon: Icons.headset_mic_outlined, title: 'Support', onTap: () => context.go('/support')),
          _MenuItem(icon: Icons.settings_outlined, title: 'Settings', onTap: () => context.go('/settings')),
          const SizedBox(height: 16),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Sign Out', style: TextStyle(color: Colors.red)),
            onTap: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Sign Out'),
                  content: const Text('Are you sure you want to sign out?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        ref.read(authProvider.notifier).logout();
                      },
                      child: const Text('Sign Out', style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.green),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
