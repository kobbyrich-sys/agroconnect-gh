import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/order_provider.dart';

final _statusTabs = <String?>[null, 'pending', 'confirmed', 'processing', 'completed', 'cancelled'];
final _statusLabels = ['All', 'Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled'];

class OrderListScreen extends ConsumerStatefulWidget {
  const OrderListScreen({super.key});

  @override
  ConsumerState<OrderListScreen> createState() => _OrderListScreenState();
}

class _OrderListScreenState extends ConsumerState<OrderListScreen> {
  int _tabIndex = 0;

  @override
  Widget build(BuildContext context) {
    final asyncOrders = ref.watch(orderListProvider);

    return DefaultTabController(
      length: _statusTabs.length,
      initialIndex: 0,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Orders'),
          bottom: TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            onTap: (i) {
              _tabIndex = i;
              ref.read(orderListProvider.notifier).load(status: _statusTabs[i]);
            },
            tabs: _statusLabels.map((l) => Tab(text: l)).toList(),
          ),
        ),
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
                    const SizedBox(height: 24),
                    ElevatedButton(onPressed: () => context.go('/home'), child: const Text('Start Shopping')),
                  ],
                ),
              );
            }
            return RefreshIndicator(
              onRefresh: () => ref.read(orderListProvider.notifier).load(status: _statusTabs[_tabIndex]),
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
                                _statusBadge(o.status),
                              ],
                            ),
                            const SizedBox(height: 12),
                            ...o.items.take(2).map((item) => Padding(
                              padding: const EdgeInsets.only(bottom: 4),
                              child: Text('${item.productName} x${item.quantity}', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                            )),
                            if (o.items.length > 2)
                              Text('+${o.items.length - 2} more items', style: TextStyle(fontSize: 12, color: Colors.grey.shade400)),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('₵${o.total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF059669))),
                                Text(_formatDate(o.createdAt), style: TextStyle(fontSize: 12, color: Colors.grey.shade400)),
                              ],
                            ),
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
          error: (_, __) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Failed to load orders'),
                const SizedBox(height: 16),
                ElevatedButton(onPressed: () => ref.invalidate(orderListProvider), child: const Text('Retry')),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _statusBadge(String status) {
    Color color;
    switch (status) {
      case 'pending': color = Colors.amber; break;
      case 'confirmed': color = Colors.blue; break;
      case 'processing': color = Colors.indigo; break;
      case 'completed': color = Colors.green; break;
      case 'cancelled': color = Colors.red; break;
      default: color = Colors.grey;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
      child: Text(status.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
    );
  }

  String _formatDate(String dateStr) {
    final dt = DateTime.tryParse(dateStr);
    if (dt == null) return '';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
