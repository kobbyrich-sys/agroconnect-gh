import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/notification_provider.dart';
import '../../data/repositories/product_repository_impl.dart';

final _featuredProductsProvider = FutureProvider.autoDispose((ref) async {
  final repo = ref.watch(productRepositoryProvider);
  return repo.getProducts(page: 1, limit: 10, sort: 'newest');
});

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featuredAsync = ref.watch(_featuredProductsProvider);
    final unreadCount = ref.watch(unreadCountProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AgroConnect GH'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.favorite_outline),
                onPressed: () => context.go('/wishlist'),
              ),
            ],
          ),
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => context.go('/notifications'),
              ),
              if (unreadCount > 0)
                Positioned(
                  right: 6, top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    child: Text('$unreadCount', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _SearchBar(onTap: () => context.go('/search')),
            const SizedBox(height: 20),
            _BannerCarousel(),
            const SizedBox(height: 24),
            _SectionHeader(title: 'Categories', onSeeAll: () => context.go('/categories')),
            const SizedBox(height: 12),
            _CategoryGrid(),
            const SizedBox(height: 24),
            _SectionHeader(title: 'Featured Products', onSeeAll: () => context.go('/search')),
            const SizedBox(height: 12),
            featuredAsync.when(
              data: (products) => _FeaturedProducts(products: products),
              loading: () => const SizedBox(height: 240, child: Center(child: CircularProgressIndicator())),
              error: (_, __) => const SizedBox(height: 240, child: Center(child: Text('Failed to load products'))),
            ),
          ],
        ),
      ),
    );
  }
}

class _SearchBar extends StatelessWidget {
  final VoidCallback onTap;
  const _SearchBar({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(12)),
        child: Row(
          children: [
            Icon(Icons.search, color: Colors.grey.shade500),
            const SizedBox(width: 12),
            Text('Search products...', style: TextStyle(color: Colors.grey.shade500)),
          ],
        ),
      ),
    );
  }
}

class _BannerCarousel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 160,
      child: ListView(scrollDirection: Axis.horizontal, children: [
        _BannerCard(color: AppColors.green, text: 'Fresh Farm Produce\nDirect from Farmers'),
        _BannerCard(color: AppColors.gold, text: 'Manufacturing Supplies\nWholesale Prices'),
        _BannerCard(color: AppColors.earth, text: 'Sell Your Products\nJoin Thousands of Sellers'),
      ]),
    );
  }
}

class _BannerCard extends StatelessWidget {
  final Color color;
  final String text;
  const _BannerCard({required this.color, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width * 0.8,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(16)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center,
        children: [Text(text, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600))],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final VoidCallback onSeeAll;
  const _SectionHeader({required this.title, required this.onSeeAll});

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(title, style: Theme.of(context).textTheme.titleLarge),
      TextButton(onPressed: onSeeAll, child: const Text('See All')),
    ]);
  }
}

class _CategoryGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final categories = [
      ('Vegetables', Icons.eco, 'vegetables'),
      ('Fruits', Icons.apple, 'fruits'),
      ('Grains', Icons.grass, 'grains'),
      ('Dairy', Icons.egg, 'dairy'),
      ('Livestock', Icons.pets, 'livestock'),
      ('Equipment', Icons.build, 'equipment'),
    ];

    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.85,
      ),
      itemCount: categories.length,
      itemBuilder: (context, index) {
        return InkWell(
          onTap: () => context.push('/category/${categories[index].$3}'),
          child: Container(
            decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(12)),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(categories[index].$2, size: 32, color: AppColors.green),
              const SizedBox(height: 8),
              Text(categories[index].$1, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
            ]),
          ),
        );
      },
    );
  }
}

class _FeaturedProducts extends StatelessWidget {
  final List products;
  const _FeaturedProducts({required this.products});

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) {
      return const SizedBox(height: 240, child: Center(child: Text('No products yet')));
    }
    return SizedBox(
      height: 240,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: products.length,
        itemBuilder: (context, index) {
          final p = products[index];
          return GestureDetector(
            onTap: () => context.push('/product/${p.id}'),
            child: Container(
              width: 160, margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(
                  height: 120,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                  ),
                  child: p.primaryImage != null
                      ? Image.network(p.primaryImage!, fit: BoxFit.cover, width: double.infinity)
                      : Center(child: Icon(Icons.image, color: Colors.grey.shade400, size: 40)),
                ),
                Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(p.name, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    Text('₵${p.retailPrice.toStringAsFixed(2)}', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.green)),
                  ]),
                ),
              ]),
            ),
          );
        },
      ),
    );
  }
}
