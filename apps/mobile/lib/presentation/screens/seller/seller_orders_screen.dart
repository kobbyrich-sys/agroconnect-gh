import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/repositories/order_repository_impl.dart';

final _sellerOrdersProvider = FutureProvider.autoDispose((ref) async {
  final repo = ref.watch(orderRepositoryProvider);
  return repo.getOrders();
});

class SellerOrdersScreen extends ConsumerWidget {
  const SellerOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncOrders = ref.watch(_sellerOrdersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Seller Orders')),
      body: asyncOrders.when(
        data: (orders) {
          if (orders.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No orders yet', style: TextStyle(fontSize: 18, color: Colors.grey.shade500)),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(_sellerOrdersProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final o = orders[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    onTap: () => context.push('/orders/${o.id}'),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(o.orderNumber, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              Text(o.status.toUpperCase(), style: TextStyle(
                                fontSize: 11, fontWeight: FontWeight.w600,
                                color: o.status == 'completed' ? Colors.green : Colors.amber,
                              )),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('₵${o.total.toStringAsFixed(2)} · ${o.items.length} item(s)', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                          const SizedBox(height: 4),
                          Text(_formatDate(o.createdAt), style: TextStyle(fontSize: 12, color: Colors.grey.shade400)),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load orders')),
      ),
    );
  }

  String _formatDate(String dateStr) {
    final dt = DateTime.tryParse(dateStr);
    if (dt == null) return '';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
