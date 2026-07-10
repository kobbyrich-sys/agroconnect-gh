import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../data/repositories/product_repository_impl.dart';
import '../../../domain/entities/review.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final _reviewsProvider = FutureProvider.family<List<Review>, String>((ref, productId) async {
  final dio = ref.watch(dioClientProvider);
  final res = await dio.get('${ApiConstants.reviews}', queryParameters: {'product_id': productId, 'limit': 50});
  final data = res.data as Map<String, dynamic>;
  if (data['success'] != true) throw Exception('Failed to load reviews');
  return (data['reviews'] as List<dynamic>).map((e) => Review.fromJson(e as Map<String, dynamic>)).toList();
});

class ReviewListScreen extends ConsumerWidget {
  final String productId;
  final String productName;
  final double averageRating;
  const ReviewListScreen({super.key, required this.productId, required this.productName, this.averageRating = 0});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviewsAsync = ref.watch(_reviewsProvider(productId));

    return Scaffold(
      appBar: AppBar(title: const Text('Reviews')),
      body: reviewsAsync.when(
        data: (reviews) {
          if (reviews.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.rate_review_outlined, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No reviews yet', style: TextStyle(fontSize: 18, color: Colors.grey.shade500)),
                  const SizedBox(height: 8),
                  Text('Be the first to review', style: TextStyle(color: Colors.grey.shade400)),
                ],
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (averageRating > 0)
                Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Text('${averageRating.toStringAsFixed(1)}', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('⭐' * 5, style: const TextStyle(fontSize: 14)),
                          Text('${reviews.length} review(s)', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                        ],
                      ),
                    ],
                  ),
                ),
              ...reviews.map((r) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundColor: Colors.grey.shade200,
                          child: Text(r.reviewerName?.isNotEmpty == true ? r.reviewerName![0].toUpperCase() : 'U', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 8),
                        Text(r.reviewerName ?? 'Anonymous', style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                        const Spacer(),
                        Text('⭐' * r.rating, style: const TextStyle(fontSize: 12)),
                      ],
                    ),
                    if (r.title != null) ...[
                      const SizedBox(height: 4),
                      Text(r.title!, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    ],
                    if (r.comment != null) ...[
                      const SizedBox(height: 4),
                      Text(r.comment!, style: TextStyle(color: Colors.grey.shade600, fontSize: 13, height: 1.4)),
                    ],
                    const SizedBox(height: 4),
                    Text(_formatDate(r.createdAt), style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
                    const Divider(height: 24),
                  ],
                ),
              )),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Failed to load reviews'),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: () => ref.invalidate(_reviewsProvider(productId)), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    final dt = DateTime.tryParse(dateStr);
    if (dt == null) return '';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
