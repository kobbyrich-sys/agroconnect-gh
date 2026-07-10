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
                        color: order.status == 'completed' ? Colors.green.withOpacity(0.1) : Colors.amber.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(order.status.toUpperCase(), style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w600,
                        color: order.status == 'completed' ? Colors.green : Colors.amber,
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
                        if (order.discount > 0) _summaryRow('Discount', '-₵${order.discount.toStringAsFixed(2)}', isNegative: true),
                        const Divider(),
                        _summaryRow('Total', '₵${order.total.toStringAsFixed(2)}', isTotal: true),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Escrow', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: order.isEscrowHeld ? Colors.blue.withOpacity(0.1) :
                                       order.isEscrowReleased ? Colors.green.withOpacity(0.1) :
                                       order.isDisputed ? Colors.red.withOpacity(0.1) : Colors.grey.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(order.escrowStatus.toUpperCase(), style: TextStyle(
                                fontSize: 10, fontWeight: FontWeight.w600,
                                color: order.isEscrowHeld ? Colors.blue :
                                       order.isEscrowReleased ? Colors.green :
                                       order.isDisputed ? Colors.red : Colors.grey,
                              )),
                            ),
                          ],
                        ),
                        if (order.escrowHeldAmount > 0) ...[
                          const SizedBox(height: 8),
                          _summaryRow('Held Amount', '₵${order.escrowHeldAmount.toStringAsFixed(2)}'),
                        ],
                        if (order.escrowExpiresAt != null && order.isEscrowHeld)
                          _summaryRow('Auto-release', _formatDate(order.escrowExpiresAt!)),
                      ],
                    ),
                  ),
                ),

                if (order.isEscrowHeld) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => _showDisputeDialog(context, ref, order.id, order.businessName ?? 'Seller'),
                      icon: const Icon(Icons.warning_amber, color: Colors.red),
                      label: const Text('Raise Dispute', style: TextStyle(color: Colors.red)),
                      style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.red)),
                    ),
                  ),
                ],

                if (order.isCancellable) ...[
                  const SizedBox(height: 12),
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

  void _showDisputeDialog(BuildContext context, WidgetRef ref, String orderId, String sellerName) {
    final reasonCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Raise Dispute'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Issue with order from $sellerName?', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              items: ['Item not received', 'Wrong item', 'Damaged item', 'Quality issue', 'Seller unresponsive', 'Other']
                  .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                  .toList(),
              onChanged: (_) {},
              decoration: InputDecoration(labelText: 'Reason', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: descCtrl,
              maxLines: 3,
              decoration: InputDecoration(labelText: 'Description', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ref.read(orderListProvider.notifier).raiseDispute(orderId, 'dispute', descCtrl.text);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Submit Dispute'),
          ),
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
