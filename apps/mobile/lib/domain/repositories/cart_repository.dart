import '../entities/cart_item.dart';

abstract class CartRepository {
  Future<List<CartItem>> getCart();
  Future<void> addToCart(String productId, {int quantity = 1, bool wholesale = false});
  Future<void> updateCartItem(String itemId, int quantity);
  Future<void> removeFromCart(String itemId);
}
