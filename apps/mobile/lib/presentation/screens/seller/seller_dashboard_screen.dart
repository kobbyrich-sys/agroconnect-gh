import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class SellerDashboardScreen extends ConsumerWidget {
  const SellerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Seller Dashboard')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(child: _statCard('Total Products', '0', Icons.inventory, Colors.blue)),
                const SizedBox(width: 12),
                Expanded(child: _statCard('Total Orders', '0', Icons.receipt, Colors.amber)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _statCard('Revenue', '₵0.00', Icons.trending_up, Colors.green)),
                const SizedBox(width: 12),
                Expanded(child: _statCard('Rating', '0.0', Icons.star, Colors.purple)),
              ],
            ),
            const SizedBox(height: 24),
            _menuItem(context, 'Manage Products', Icons.inventory, () => context.push('/seller/products')),
            _menuItem(context, 'Seller Orders', Icons.receipt_long, () => context.push('/seller/orders')),
            _menuItem(context, 'Wallet', Icons.account_balance_wallet, () => context.push('/wallet')),
            _menuItem(context, 'Add New Product', Icons.add_circle, () => context.push('/seller/products/add')),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: color)),
            const SizedBox(height: 4),
            Text(title, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
          ],
        ),
      ),
    );
  }

  Widget _menuItem(BuildContext context, String label, IconData icon, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF059669)),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
