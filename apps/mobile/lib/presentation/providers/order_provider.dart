import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/order.dart';
import '../../data/repositories/order_repository_impl.dart';

final orderListProvider = StateNotifierProvider<OrderListNotifier, AsyncValue<List<Order>>>((ref) {
  return OrderListNotifier(ref.watch(orderRepositoryProvider));
});

final orderDetailProvider = FutureProvider.family<Order, String>((ref, id) async {
  final repo = ref.watch(orderRepositoryProvider);
  return repo.getOrder(id);
});

class OrderListNotifier extends StateNotifier<AsyncValue<List<Order>>> {
  final OrderRepository _repo;
  String? _statusFilter;

  OrderListNotifier(this._repo) : super(const AsyncLoading()) {
    load();
  }

  Future<void> load({String? status}) async {
    _statusFilter = status;
    state = const AsyncLoading();
    try {
      final items = await _repo.getOrders(status: status);
      state = AsyncData(items);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<void> cancelOrder(String id) async {
    try {
      await _repo.cancelOrder(id);
      await load(status: _statusFilter);
    } catch (_) {}
  }
}
