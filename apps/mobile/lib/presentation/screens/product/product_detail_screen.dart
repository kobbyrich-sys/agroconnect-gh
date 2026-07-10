import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/wishlist_provider.dart';
import '../../providers/cart_provider.dart';
import '../../data/repositories/product_repository_impl.dart';
import '../../../data/datasources/remote/review_remote_datasource.dart';

final _productDetailProvider = FutureProvider.family((ref, String id) async {
  final repo = ref.watch(productRepositoryProvider);
  return repo.getProduct(id);
});

class ProductDetailScreen extends ConsumerWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productAsync = ref.watch(_productDetailProvider(productId));
    final inWishlist = ref.watch(wishlistProvider).value?.any((p) => p.id == productId) ?? false;

    return Scaffold(
      appBar: AppBar(title: const Text('Product Details')),
      body: productAsync.when(
        data: (p) {
          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 300,
                  color: Colors.grey.shade200,
                  child: p.primaryImage != null
                      ? Image.network(p.primaryImage!, fit: BoxFit.cover, width: double.infinity)
                      : Center(child: Icon(Icons.image, size: 80, color: Colors.grey.shade400)),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(p.name, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Text('₵${p.retailPrice.toStringAsFixed(2)}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Color(0xFF059669))),
                          if (p.discountPercentage > 0) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                              child: Text('${p.discountPercentage}% OFF', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.red)),
                            ),
                          ],
                        ],
                      ),
                      if (p.averageRating > 0) ...[
                        const SizedBox(height: 8),
                        InkWell(
                          onTap: () => context.push('/product/${p.id}/reviews', extra: {'name': p.name, 'rating': p.averageRating}),
                          child: Row(
                            children: [
                              Text('⭐ ${p.averageRating.toStringAsFixed(1)}', style: const TextStyle(fontWeight: FontWeight.w500)),
                              const SizedBox(width: 4),
                              Text('(${p.reviewCount} reviews)', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                              const Text(' · ', style: TextStyle(color: Colors.grey)),
                              Text('${p.soldCount} sold', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                            ],
                          ),
                        ),
                      ],
                      if (p.outOfStock)
                        Container(
                          margin: const EdgeInsets.symmetric(vertical: 12),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                          child: const Text('Out of Stock', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w600, fontSize: 13)),
                        )
                      else if (p.lowStock)
                        Container(
                          margin: const EdgeInsets.symmetric(vertical: 12),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: Colors.amber.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                          child: Text('Only ${p.stockQuantity} left', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.w600, fontSize: 13)),
                        ),
                      const SizedBox(height: 16),
                      Text(p.description, style: TextStyle(color: Colors.grey.shade700, height: 1.5)),
                      const SizedBox(height: 16),
                      if (p.businessName != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade200), borderRadius: BorderRadius.circular(8)),
                          child: Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: const Color(0xFFD1FAE5),
                                child: Text(p.businessName![0].toUpperCase(), style: const TextStyle(color: Color(0xFF059669))),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(p.businessName!, style: const TextStyle(fontWeight: FontWeight.w600)),
                                  Text(p.businessVerified ? '✅ Verified' : 'Pending verification', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Reviews (${p.reviewCount})', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                          TextButton(
                            onPressed: () => context.push('/product/${p.id}/reviews', extra: {'name': p.name, 'rating': p.averageRating}),
                            child: const Text('See All'),
                          ),
                        ],
                      ),
                      Center(
                        child: TextButton.icon(
                          onPressed: () => _showReviewDialog(context, ref, p.id),
                          icon: const Icon(Icons.edit),
                          label: const Text('Write a Review'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load product')),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              IconButton(
                icon: Icon(inWishlist ? Icons.favorite : Icons.favorite_border, color: inWishlist ? Colors.red : null),
                onPressed: () => ref.read(wishlistProvider.notifier).toggle(productId),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  onPressed: p.outOfStock ? null : () => ref.read(cartProvider.notifier).addToCart(productId),
                  child: const Text('Add to Cart'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: p.outOfStock ? null : () => context.go('/checkout'),
                  child: const Text('Buy Now'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showReviewDialog(BuildContext context, WidgetRef ref, String productId) {
    final titleCtrl = TextEditingController();
    final commentCtrl = TextEditingController();
    final orderIdCtrl = TextEditingController();
    int rating = 5;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Write a Review'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: orderIdCtrl, decoration: const InputDecoration(labelText: 'Order ID', border: OutlineInputBorder(), hintText: 'Enter your order ID')),
              const SizedBox(height: 12),
              StatefulBuilder(
                builder: (context, setInnerState) => Column(
                  children: [
                    const Text('Rating'),
                    const SizedBox(height: 4),
                    Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(5, (i) => IconButton(
                      icon: Icon(i < rating ? Icons.star : Icons.star_border, color: Colors.amber, size: 32),
                      onPressed: () => setInnerState(() => rating = i + 1),
                    ))),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Title (optional)', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: commentCtrl, decoration: const InputDecoration(labelText: 'Your review', border: OutlineInputBorder()), maxLines: 4),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (commentCtrl.text.trim().isEmpty || orderIdCtrl.text.trim().isEmpty) return;
              try {
                final ds = ref.read(reviewRemoteDataSourceProvider);
                await ds.createReview(
                  productId: productId,
                  orderId: orderIdCtrl.text.trim(),
                  rating: rating,
                  title: titleCtrl.text.trim().isEmpty ? null : titleCtrl.text.trim(),
                  comment: commentCtrl.text.trim(),
                );
                if (ctx.mounted) Navigator.pop(ctx);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Review submitted!')));
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
                }
              }
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }
}
