import '../entities/product.dart';

abstract class WishlistRepository {
  Future<List<Product>> getWishlist();
  Future<bool> toggleWishlist(String productId);
  Future<void> removeFromWishlist(String productId);
}
