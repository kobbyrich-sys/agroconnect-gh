import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/order_repository.dart';
import '../../domain/entities/order.dart';
import '../datasources/remote/order_remote_datasource.dart';

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return OrderRepositoryImpl(ref.watch(orderRemoteDataSourceProvider));
});

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDataSource _ds;
  OrderRepositoryImpl(this._ds);

  @override
  Future<List<Order>> getOrders({String? status, int page = 1, int limit = 20}) async {
    final res = await _ds.getOrders(status: status, page: page, limit: limit);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load orders');
    return (res['orders'] as List<dynamic>).map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<Order> getOrder(String id) async {
    final res = await _ds.getOrder(id);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Order not found');
    return Order.fromJson(res['order'] as Map<String, dynamic>);
  }

  @override
  Future<Order> createOrder(Map<String, dynamic> data) async {
    final res = await _ds.createOrder(data);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to create order');
    return Order.fromJson(res['order'] as Map<String, dynamic>);
  }

  @override
  Future<void> cancelOrder(String id) async {
    final res = await _ds.cancelOrder(id);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to cancel order');
  }
}
