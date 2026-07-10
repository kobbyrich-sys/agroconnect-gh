import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/wishlist_repository.dart';
import '../../domain/entities/product.dart';
import '../datasources/remote/wishlist_remote_datasource.dart';

final wishlistRepositoryProvider = Provider<WishlistRepository>((ref) {
  return WishlistRepositoryImpl(ref.watch(wishlistRemoteDataSourceProvider));
});

class WishlistRepositoryImpl implements WishlistRepository {
  final WishlistRemoteDataSource _ds;
  WishlistRepositoryImpl(this._ds);

  @override
  Future<List<Product>> getWishlist() async {
    final res = await _ds.getWishlist();
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load wishlist');
    return (res['items'] as List<dynamic>).map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<bool> toggleWishlist(String productId) async {
    final res = await _ds.toggleWishlist(productId);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to toggle wishlist');
    return res['is_wished'] as bool? ?? false;
  }

  @override
  Future<void> removeFromWishlist(String productId) async {
    final res = await _ds.removeFromWishlist(productId);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to remove from wishlist');
  }
}
