import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/product.dart';
import '../../data/repositories/wishlist_repository_impl.dart';

final wishlistProvider = StateNotifierProvider<WishlistNotifier, AsyncValue<List<Product>>>((ref) {
  return WishlistNotifier(ref.watch(wishlistRepositoryProvider));
});

class WishlistNotifier extends StateNotifier<AsyncValue<List<Product>>> {
  final WishlistRepository _repo;
  WishlistNotifier(this._repo) : super(const AsyncLoading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncLoading();
    try {
      final items = await _repo.getWishlist();
      state = AsyncData(items);
    } catch (e, st) {
      state = AsyncError(e, st);
      state = const AsyncData([]);
    }
  }

  Future<bool> toggle(String productId) async {
    try {
      final isWished = await _repo.toggleWishlist(productId);
      if (isWished) {
        final res = await _repo.getWishlist();
        state = AsyncData(res);
      } else {
        state = AsyncData(state.value?.where((p) => p.id != productId).toList() ?? []);
      }
      return isWished;
    } catch (e) {
      return false;
    }
  }

  bool isInWishlist(String productId) =>
      state.value?.any((p) => p.id == productId) ?? false;
}
