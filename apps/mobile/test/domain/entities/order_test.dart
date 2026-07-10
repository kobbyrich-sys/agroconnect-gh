import 'package:flutter_test/flutter_test.dart';
import 'package:agroconnect_mobile/domain/entities/order.dart';

void main() {
  group('OrderItem', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'oi1',
        'product_id': 'p1',
        'product_name': 'Tomatoes',
        'product_image': 'https://img.com/t.jpg',
        'unit_price': '25.00',
        'quantity': 3,
        'wholesale': false,
        'total': '75.00',
      };
      final item = OrderItem.fromJson(json);
      expect(item.productName, 'Tomatoes');
      expect(item.unitPrice, 25.0);
      expect(item.quantity, 3);
      expect(item.total, 75.0);
    });
  });

  group('Order', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'ord1',
        'order_number': 'AGC-2026-000001',
        'status': 'pending',
        'subtotal': '200.00',
        'discount': '20.00',
        'commission': '10.00',
        'total': '180.00',
        'buyer_notes': 'Please deliver quickly',
        'created_at': '2026-07-01T00:00:00Z',
        'order_items': [
          {'id': 'oi1', 'product_id': 'p1', 'product_name': 'Tomatoes', 'unit_price': '25.00', 'quantity': 2, 'total': '50.00'},
          {'id': 'oi2', 'product_id': 'p2', 'product_name': 'Onions', 'unit_price': '15.00', 'quantity': 5, 'total': '75.00'},
        ],
        'businesses': {
          'business_name': 'Fresh Farm',
          'business_type': 'farmer',
        },
      };

      final order = Order.fromJson(json);
      expect(order.orderNumber, 'AGC-2026-000001');
      expect(order.status, 'pending');
      expect(order.total, 180.0);
      expect(order.items.length, 2);
      expect(order.businessName, 'Fresh Farm');
      expect(order.isCancellable, isTrue);
    });

    test('isCancellable returns false for cancelled orders', () {
      final json = {
        'id': 'ord1',
        'order_number': 'AGC-2026-000001',
        'status': 'cancelled',
        'created_at': '2026-07-01T00:00:00Z',
      };
      final order = Order.fromJson(json);
      expect(order.isCancellable, isFalse);
    });
  });
}
