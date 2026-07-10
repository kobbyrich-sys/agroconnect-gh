import 'package:flutter_test/flutter_test.dart';
import 'package:agroconnect_mobile/domain/entities/user.dart';
import 'package:agroconnect_mobile/domain/entities/category.dart';
import 'package:agroconnect_mobile/domain/entities/address.dart';
import 'package:agroconnect_mobile/domain/entities/review.dart';
import 'package:agroconnect_mobile/domain/entities/notification.dart';
import 'package:agroconnect_mobile/domain/entities/wallet.dart';
import 'package:agroconnect_mobile/domain/entities/chat.dart';
import 'package:agroconnect_mobile/domain/entities/cart_item.dart';

void main() {
  group('User', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'u1',
        'email': 'test@example.com',
        'phone': '0241234567',
        'full_name': 'Test User',
        'avatar_url': null,
        'role': 'buyer',
        'status': 'active',
        'is_email_verified': true,
        'is_phone_verified': false,
        'created_at': '2026-01-01T00:00:00Z',
      };
      final user = User.fromJson(json);
      expect(user.email, 'test@example.com');
      expect(user.fullName, 'Test User');
      expect(user.isEmailVerified, isTrue);
      expect(user.isSeller, isFalse);
    });

    test('toJson round-trips', () {
      final original = User(
        id: 'u1',
        email: 'a@b.com',
        fullName: 'Alice',
        role: 'farmer',
        createdAt: '2026-01-01T00:00:00Z',
      );
      final json = original.toJson();
      final restored = User.fromJson(json);
      expect(restored.id, original.id);
      expect(restored.fullName, original.fullName);
      expect(restored.isSeller, isTrue);
    });

    test('isSeller returns true for farmer/manufacturer/wholesaler', () {
      for (final role in ['farmer', 'manufacturer', 'wholesaler']) {
        expect(User(id: 'u1', email: 'a@b.com', role: role, createdAt: '').isSeller, isTrue);
      }
    });
  });

  group('Category', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'cat1',
        'name': 'Vegetables',
        'slug': 'vegetables',
        'description': 'Fresh vegetables',
        'image_url': 'https://img.com/veg.jpg',
        'product_count': 42,
      };
      final cat = Category.fromJson(json);
      expect(cat.name, 'Vegetables');
      expect(cat.productCount, 42);
    });
  });

  group('Address', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'addr1',
        'label': 'Home',
        'street': '123 Main St',
        'city': 'Accra',
        'region': 'Greater Accra',
        'gps_address': 'GA-1234-5678',
        'is_default': true,
      };
      final addr = Address.fromJson(json);
      expect(addr.region, 'Greater Accra');
      expect(addr.isDefault, isTrue);
      expect(addr.country, 'Ghana');
    });
  });

  group('Review', () {
    test('fromJson with nested profile', () {
      final json = {
        'id': 'rev1',
        'product_id': 'p1',
        'rating': 4,
        'title': 'Great product',
        'comment': 'Very fresh tomatoes',
        'profiles': {'full_name': 'John Buyer'},
        'created_at': '2026-07-01T00:00:00Z',
      };
      final review = Review.fromJson(json);
      expect(review.rating, 4);
      expect(review.reviewerName, 'John Buyer');
    });
  });

  group('AppNotification', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'notif1',
        'type': 'order_update',
        'title': 'Order Confirmed',
        'message': 'Your order has been confirmed',
        'is_read': false,
        'data': {'order_id': 'ord1'},
        'created_at': '2026-07-08T12:00:00Z',
      };
      final n = AppNotification.fromJson(json);
      expect(n.title, 'Order Confirmed');
      expect(n.data?['order_id'], 'ord1');
    });
  });

  group('Wallet', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'wal1',
        'balance': '5000.00',
        'total_earned': '15000.00',
        'total_withdrawn': '10000.00',
      };
      final w = Wallet.fromJson(json);
      expect(w.balance, 5000.0);
      expect(w.totalEarned, 15000.0);
    });
  });

  group('WalletTransaction', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'tx1',
        'type': 'sale',
        'amount': '250.00',
        'status': 'completed',
        'description': 'Order payment',
        'reference': 'ref_123',
        'created_at': '2026-07-01T00:00:00Z',
      };
      final tx = WalletTransaction.fromJson(json);
      expect(tx.amount, 250.0);
      expect(tx.reference, 'ref_123');
    });
  });

  group('Chat', () {
    test('fromJson identifies the other participant', () {
      final json = {
        'id': 'chat1',
        'participant_1_id': 'user1',
        'participant_2_id': 'user2',
        'p1': {'full_name': 'Alice', 'avatar_url': null},
        'p2': {'full_name': 'Bob', 'avatar_url': null},
        'last_message': 'Hello!',
        'last_message_at': '2026-07-01T00:00:00Z',
        'is_blocked': false,
      };
      final chat = Chat.fromJson(json, 'user1');
      expect(chat.otherId, 'user2');
      expect(chat.otherName, 'Bob');
    });
  });

  group('Message', () {
    test('fromJson marks isMine correctly', () {
      final json = {
        'id': 'msg1',
        'sender_id': 'user1',
        'content': 'Hi there',
        'created_at': '2026-07-01T00:00:00Z',
      };
      final msg = Message.fromJson(json, 'user1');
      expect(msg.isMine, isTrue);
      expect(msg.content, 'Hi there');
    });
  });

  group('CartItem', () {
    test('fromJson with nested product', () {
      final json = {
        'id': 'ci1',
        'product_id': 'p1',
        'quantity': 3,
        'wholesale': false,
        'product': {
          'id': 'p1',
          'name': 'Tomatoes',
          'slug': 'tomatoes',
          'retail_price': '25.00',
          'category_id': 'cat1',
          'category_name': 'Veg',
          'category_slug': 'veg',
          'seller_id': 's1',
          'created_at': '2026-01-01T00:00:00Z',
        },
      };
      final item = CartItem.fromJson(json);
      expect(item.quantity, 3);
      expect(item.product?.name, 'Tomatoes');
      expect(item.total, 75.0);
    });
  });
}
