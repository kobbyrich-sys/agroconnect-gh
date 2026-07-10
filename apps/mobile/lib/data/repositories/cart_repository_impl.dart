import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/cart_repository.dart';
import '../../domain/entities/cart_item.dart';
import '../datasources/remote/cart_remote_datasource.dart';

final cartRepositoryProvider = Provider<CartRepository>((ref) {
  return CartRepositoryImpl(ref.watch(cartRemoteDataSourceProvider));
});

class CartRepositoryImpl implements CartRepository {
  final CartRemoteDataSource _ds;
  CartRepositoryImpl(this._ds);

  @override
  Future<List<CartItem>> getCart() async {
    final res = await _ds.getCart();
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load cart');
    return (res['items'] as List<dynamic>).map((e) => CartItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<void> addToCart(String productId, {int quantity = 1, bool wholesale = false}) async {
    final res = await _ds.addToCart(productId, quantity: quantity, wholesale: wholesale);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to add to cart');
  }

  @override
  Future<void> updateCartItem(String itemId, int quantity) async {
    final res = await _ds.updateCartItem(itemId, quantity);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to update cart');
  }

  @override
  Future<void> removeFromCart(String itemId) async {
    final res = await _ds.removeFromCart(itemId);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to remove from cart');
  }
}
