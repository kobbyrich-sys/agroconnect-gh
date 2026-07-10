import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/cart_item.dart';
import '../../data/repositories/cart_repository_impl.dart';

final cartProvider = StateNotifierProvider<CartNotifier, AsyncValue<List<CartItem>>>((ref) {
  return CartNotifier(ref.watch(cartRepositoryProvider));
});

class CartNotifier extends StateNotifier<AsyncValue<List<CartItem>>> {
  final CartRepository _repo;
  CartNotifier(this._repo) : super(const AsyncLoading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncLoading();
    try {
      final items = await _repo.getCart();
      state = AsyncData(items);
    } catch (e, st) {
      state = AsyncData([]);
    }
  }

  Future<void> addToCart(String productId, {int quantity = 1, bool wholesale = false}) async {
    try {
      await _repo.addToCart(productId, quantity: quantity, wholesale: wholesale);
      await load();
    } catch (_) {}
  }

  Future<void> updateQuantity(String itemId, int quantity) async {
    try {
      if (quantity <= 0) {
        await _repo.removeFromCart(itemId);
      } else {
        await _repo.updateCartItem(itemId, quantity);
      }
      await load();
    } catch (_) {}
  }

  Future<void> removeItem(String itemId) async {
    try {
      await _repo.removeFromCart(itemId);
      await load();
    } catch (_) {}
  }

  double get subtotal => state.value?.fold<double>(0, (sum, item) => sum + item.total) ?? 0;
  int get itemCount => state.value?.length ?? 0;
}
