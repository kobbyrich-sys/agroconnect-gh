import '../entities/order.dart';

abstract class OrderRepository {
  Future<List<Order>> getOrders({String? status, int page = 1, int limit = 20});
  Future<Order> getOrder(String id);
  Future<Order> createOrder(Map<String, dynamic> data);
  Future<void> cancelOrder(String id);
}
