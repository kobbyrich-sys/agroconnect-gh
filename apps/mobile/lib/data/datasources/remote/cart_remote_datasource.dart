import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final cartRemoteDataSourceProvider = Provider<CartRemoteDataSource>((ref) {
  return CartRemoteDataSource(ref.watch(dioClientProvider));
});

class CartRemoteDataSource {
  final DioClient _dio;
  CartRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getCart() async {
    final res = await _dio.get('${ApiConstants.cart}');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addToCart(String productId, {int quantity = 1, bool wholesale = false}) async {
    final res = await _dio.post('${ApiConstants.cart}', data: {'product_id': productId, 'quantity': quantity, 'wholesale': wholesale});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateCartItem(String itemId, int quantity) async {
    final res = await _dio.patch('${ApiConstants.cart}/$itemId', data: {'quantity': quantity});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> removeFromCart(String itemId) async {
    final res = await _dio.delete('${ApiConstants.cart}/$itemId');
    return res.data as Map<String, dynamic>;
  }
}
