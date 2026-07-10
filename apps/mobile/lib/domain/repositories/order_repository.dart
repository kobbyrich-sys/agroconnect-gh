import '../entities/order.dart';

abstract class OrderRepository {
  Future<List<Order>> getOrders({String? status, int page = 1, int limit = 20});
  Future<Order> getOrder(String id);
  Future<Order> createOrder(Map<String, dynamic> data);
  Future<void> cancelOrder(String id);
  Future<void> updateOrderStatus(String id, String action);
  Future<void> raiseDispute(String orderId, String reason, String description);
}
