import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final reviewRemoteDataSourceProvider = Provider<ReviewRemoteDataSource>((ref) {
  return ReviewRemoteDataSource(ref.watch(dioClientProvider));
});

class ReviewRemoteDataSource {
  final DioClient _dio;
  ReviewRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getReviews(String productId, {int page = 1, int limit = 20}) async {
    final res = await _dio.get('${ApiConstants.reviews}', queryParameters: {'product_id': productId, 'page': page, 'limit': limit});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createReview({
    required String productId,
    required String orderId,
    required int rating,
    String? title,
    required String comment,
  }) async {
    final res = await _dio.post('${ApiConstants.reviews}', data: {
      'product_id': productId,
      'order_id': orderId,
      'rating': rating,
      'title': title,
      'comment': comment,
    });
    return res.data as Map<String, dynamic>;
  }
}
