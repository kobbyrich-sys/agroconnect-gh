import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/repositories/product_repository_impl.dart';
import '../../domain/entities/product.dart';

final _categoryProductsProvider = FutureProvider.family<List<Product>, String>((ref, slug) async {
  final repo = ref.watch(productRepositoryProvider);
  return repo.getCategoryProducts(slug);
});

class CategoryProductsScreen extends ConsumerWidget {
  final String categorySlug;
  const CategoryProductsScreen({super.key, required this.categorySlug});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncProducts = ref.watch(_categoryProductsProvider(categorySlug));

    return Scaffold(
      appBar: AppBar(title: Text(_titleFromSlug(categorySlug))),
      body: asyncProducts.when(
        data: (products) {
          if (products.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inventory_2_outlined, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No products found', style: TextStyle(fontSize: 18, color: Colors.grey.shade500)),
                ],
              ),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2, childAspectRatio: 0.7, crossAxisSpacing: 12, mainAxisSpacing: 12,
            ),
            itemCount: products.length,
            itemBuilder: (context, index) {
              final p = products[index];
              return Card(
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () => context.push('/product/${p.id}'),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          color: Colors.grey.shade100,
                          child: p.primaryImage != null
                              ? Image.network(p.primaryImage!, fit: BoxFit.cover)
                              : Center(child: Icon(Icons.image, color: Colors.grey.shade300, size: 48)),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(p.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                            const SizedBox(height: 4),
                            Text('₵${p.retailPrice.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF059669), fontSize: 15)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Failed to load products'),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: () => ref.invalidate(_categoryProductsProvider(categorySlug)), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  String _titleFromSlug(String slug) {
    return slug.replaceAll('-', ' ').split(' ').map((w) => w.isNotEmpty ? '${w[0].toUpperCase()}${w.substring(1)}' : '').join(' ');
  }
}
