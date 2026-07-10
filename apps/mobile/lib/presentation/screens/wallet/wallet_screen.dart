import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/wallet_provider.dart';

class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(walletProvider);
    final transactionsAsync = ref.watch(walletTransactionsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Wallet')),
      body: walletAsync.when(
        data: (wallet) {
          if (wallet == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.account_balance_wallet, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No wallet found', style: TextStyle(fontSize: 18, color: Colors.grey.shade500)),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(walletProvider.notifier).load(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Card(
                    color: const Color(0xFF059669),
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          const Text('Available Balance', style: TextStyle(color: Colors.white70, fontSize: 14)),
                          const SizedBox(height: 8),
                          Text('₵${wallet.balance.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _statItem('Earned', '₵${wallet.totalEarned.toStringAsFixed(2)}'),
                              _statItem('Withdrawn', '₵${wallet.totalWithdrawn.toStringAsFixed(2)}'),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  if (wallet.balance > 0) ...[
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => _showWithdrawDialog(context, ref, wallet.balance),
                        icon: const Icon(Icons.arrow_upward),
                        label: const Text('Withdraw Funds'),
                        style: OutlinedButton.styleFrom(foregroundColor: const Color(0xFF059669)),
                      ),
                    ),
                  ],

                  const SizedBox(height: 24),
                  const Align(alignment: Alignment.centerLeft, child: Text('Transaction History', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600))),
                  const SizedBox(height: 8),

                  transactionsAsync.when(
                    data: (txns) {
                      if (txns.isEmpty) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 32),
                          child: Center(child: Text('No transactions yet', style: TextStyle(color: Colors.grey.shade500))),
                        );
                      }
                      return ...txns.map((t) => Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: t.type == 'credit' ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                            child: Icon(t.type == 'credit' ? Icons.arrow_downward : Icons.arrow_upward, color: t.type == 'credit' ? Colors.green : Colors.red, size: 20),
                          ),
                          title: Text(t.description ?? t.type, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                          subtitle: Text(_formatDate(t.createdAt), style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                          trailing: Text(
                            '${t.type == 'credit' ? '+' : '-'}₵${t.amount.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: t.type == 'credit' ? Colors.green : Colors.red,
                            ),
                          ),
                        ),
                      ));
                    },
                    loading: () => const SizedBox(height: 100, child: Center(child: CircularProgressIndicator())),
                    error: (_, __) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 32),
                      child: Center(child: Text('Failed to load transactions', style: TextStyle(color: Colors.grey.shade500))),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Failed to load wallet'),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: () => ref.invalidate(walletProvider), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
      ],
    );
  }

  void _showWithdrawDialog(BuildContext context, WidgetRef ref, double balance) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Withdraw Funds'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Amount (₵)',
                hintText: 'Max: ₵${balance.toStringAsFixed(2)}',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              decoration: InputDecoration(labelText: 'Bank Name', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))),
            ),
            const SizedBox(height: 8),
            TextField(
              decoration: InputDecoration(labelText: 'Account Number', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))),
            ),
            const SizedBox(height: 8),
            TextField(
              decoration: InputDecoration(labelText: 'Account Name', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Submit'),
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
