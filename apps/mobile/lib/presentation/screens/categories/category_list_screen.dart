import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/repositories/product_repository_impl.dart';

final _categoriesProvider = FutureProvider.autoDispose((ref) async {
  final repo = ref.watch(productRepositoryProvider);
  return repo.getCategories();
});

class CategoryListScreen extends ConsumerWidget {
  const CategoryListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(_categoriesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Categories')),
      body: categoriesAsync.when(
        data: (categories) {
          if (categories.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.category, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No categories', style: TextStyle(fontSize: 18, color: Colors.grey.shade500)),
                ],
              ),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2, childAspectRatio: 1.2, crossAxisSpacing: 12, mainAxisSpacing: 12,
            ),
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final cat = categories[index];
              return Card(
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () => context.push('/category/${cat.slug}'),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(color: const Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(12)),
                        child: cat.imageUrl != null
                            ? Image.network(cat.imageUrl!, fit: BoxFit.cover)
                            : const Icon(Icons.category, color: Color(0xFF059669)),
                      ),
                      const SizedBox(height: 8),
                      Text(cat.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      if (cat.productCount > 0)
                        Text('${cat.productCount} products', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load categories')),
      ),
    );
  }
}
