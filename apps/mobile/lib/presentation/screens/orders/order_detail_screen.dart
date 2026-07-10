import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/order_provider.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      appBar: AppBar(title: const Text('Order Details')),
      body: orderAsync.when(
        data: (order) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(order.orderNumber, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('Placed ${_formatDate(order.createdAt)}', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: order.status == 'delivered' ? Colors.green.withOpacity(0.1) : Colors.amber.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(order.status.toUpperCase(), style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w600,
                        color: order.status == 'delivered' ? Colors.green : Colors.amber,
                      )),
                    ),
                  ],
                ),

                const SizedBox(height: 24),
                const Text('Items', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                ...order.items.map((item) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Container(
                          width: 56, height: 56,
                          decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(8)),
                          child: item.productImage != null
                              ? Image.network(item.productImage!, fit: BoxFit.cover)
                              : const Icon(Icons.image, color: Colors.grey),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.productName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              const SizedBox(height: 4),
                              Text('Qty: ${item.quantity} × ₵${item.unitPrice.toStringAsFixed(2)}', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                              const SizedBox(height: 2),
                              Text('₵${item.total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                )),

                const SizedBox(height: 24),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Order Summary', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 12),
                        _summaryRow('Subtotal', '₵${order.subtotal.toStringAsFixed(2)}'),
                        _summaryRow('Delivery Fee', '₵${order.deliveryFee.toStringAsFixed(2)}'),
                        if (order.discount > 0) _summaryRow('Discount', '-₵${order.discount.toStringAsFixed(2)}', isNegative: true),
                        const Divider(),
                        _summaryRow('Total', '₵${order.total.toStringAsFixed(2)}', isTotal: true),
                      ],
                    ),
                  ),
                ),

                if (order.deliveries != null && order.deliveries!.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  const Text('Delivery', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  ...order.deliveries!.map((d) => Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Status: ${d.status.toUpperCase()}', style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: d.status == 'delivered' ? Colors.green : Colors.amber,
                          )),
                          const SizedBox(height: 8),
                          Text('Pickup: ${d.pickupAddress}', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                          Text('Deliver to: ${d.deliveryAddress}', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                          if (d.estimatedDeliveryTime != null)
                            Text('Est: ${_formatDate(d.estimatedDeliveryTime!)}', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                          if (d.partner != null) ...[
                            const SizedBox(height: 8),
                            Text('Partner: ${d.partner!['full_name'] ?? ''}', style: const TextStyle(fontWeight: FontWeight.w500)),
                            Text('${d.partner!['vehicle_type'] ?? ''} - ${d.partner!['vehicle_number'] ?? ''}', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                          ],
                        ],
                      ),
                    ),
                  )),
                ],

                if (order.isCancellable) ...[
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final confirm = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
                          title: const Text('Cancel Order'),
                          content: const Text('Are you sure you want to cancel this order?'),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
                            TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes, Cancel')),
                          ],
                        ));
                        if (confirm == true) {
                          ref.read(orderListProvider.notifier).cancelOrder(order.id);
                          if (context.mounted) context.pop();
                        }
                      },
                      icon: const Icon(Icons.cancel_outlined),
                      label: const Text('Cancel Order'),
                      style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load order')),
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool isNegative = false, bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: isTotal ? 16 : 14, fontWeight: isTotal ? FontWeight.w600 : FontWeight.normal, color: Colors.grey.shade600)),
          Text(value, style: TextStyle(
            fontSize: isTotal ? 16 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
            color: isNegative ? Colors.green : (isTotal ? const Color(0xFF059669) : null),
          )),
        ],
      ),
    );
  }

  String _formatDate(String dateStr) {
    final dt = DateTime.tryParse(dateStr);
    if (dt == null) return '';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
