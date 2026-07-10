import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/repositories/product_repository_impl.dart';

final _sellerProductsProvider = FutureProvider.autoDispose((ref) async {
  final repo = ref.watch(productRepositoryProvider);
  return repo.getSellerProducts();
});

class ProductManagementScreen extends ConsumerWidget {
  const ProductManagementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncProducts = ref.watch(_sellerProductsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Products'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/seller/products/add'),
          ),
        ],
      ),
      body: asyncProducts.when(
        data: (products) {
          if (products.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inventory_2_outlined, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No products yet', style: TextStyle(fontSize: 18, color: Colors.grey.shade500)),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => context.push('/seller/products/add'),
                    icon: const Icon(Icons.add),
                    label: const Text('Add Product'),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(_sellerProductsProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final p = products[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(8)),
                      child: p.primaryImage != null
                          ? Image.network(p.primaryImage!, fit: BoxFit.cover)
                          : const Icon(Icons.image, color: Colors.grey),
                    ),
                    title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                    subtitle: Text('₵${p.retailPrice.toStringAsFixed(2)} · ${p.status}', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                    trailing: Icon(p.status == 'active' ? Icons.check_circle : Icons.hourglass_empty, color: p.status == 'active' ? Colors.green : Colors.orange),
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load products')),
      ),
    );
  }
}
