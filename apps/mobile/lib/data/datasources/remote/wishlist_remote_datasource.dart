import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final wishlistRemoteDataSourceProvider = Provider<WishlistRemoteDataSource>((ref) {
  return WishlistRemoteDataSource(ref.watch(dioClientProvider));
});

class WishlistRemoteDataSource {
  final DioClient _dio;
  WishlistRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getWishlist() async {
    final res = await _dio.get('${ApiConstants.wishlist}');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> toggleWishlist(String productId) async {
    final res = await _dio.post('${ApiConstants.wishlist}', data: {'product_id': productId});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> removeFromWishlist(String productId) async {
    final res = await _dio.delete('${ApiConstants.wishlist}', data: {'product_id': productId});
    return res.data as Map<String, dynamic>;
  }
}
