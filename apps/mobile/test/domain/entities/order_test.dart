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
        'delivery_fee': '15.00',
        'discount': '20.00',
        'commission': '10.00',
        'total': '205.00',
        'buyer_notes': 'Please deliver quickly',
        'shipping_address': {'street': '123 Main St', 'city': 'Accra'},
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
      expect(order.total, 205.0);
      expect(order.shippingAddress?['city'], 'Accra');
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

    test('deliveries parse correctly', () {
      final json = {
        'id': 'ord1',
        'order_number': 'AGC-2026-000001',
        'status': 'shipped',
        'created_at': '2026-07-01T00:00:00Z',
        'deliveries': [
          {
            'id': 'del1',
            'status': 'in_transit',
            'delivery_fee': '10.00',
            'estimated_delivery_time': '2026-07-03T00:00:00Z',
            'actual_delivery_time': null,
            'pickup_address': 'Farm, Kumasi',
            'delivery_address': 'Shop, Accra',
            'notes': 'Handle with care',
            'delivery_partners': {
              'full_name': 'John Driver',
              'phone': '0241234567',
              'vehicle_type': 'truck',
            },
          },
        ],
      };

      final order = Order.fromJson(json);
      expect(order.deliveries, hasLength(1));
      expect(order.deliveries!.first.status, 'in_transit');
      expect(order.deliveries!.first.partner?['full_name'], 'John Driver');
    });
  });
}
