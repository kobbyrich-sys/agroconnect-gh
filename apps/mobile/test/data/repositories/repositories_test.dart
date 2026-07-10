import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:agroconnect_mobile/domain/entities/product.dart';
import 'package:agroconnect_mobile/domain/entities/order.dart';
import 'package:agroconnect_mobile/domain/entities/notification.dart';
import 'package:agroconnect_mobile/domain/entities/wallet.dart';
import 'package:agroconnect_mobile/data/repositories/wishlist_repository_impl.dart';
import 'package:agroconnect_mobile/data/repositories/order_repository_impl.dart';
import 'package:agroconnect_mobile/data/repositories/notification_repository_impl.dart';
import 'package:agroconnect_mobile/data/repositories/wallet_repository_impl.dart';
import 'package:agroconnect_mobile/data/datasources/remote/wishlist_remote_datasource.dart';
import 'package:agroconnect_mobile/data/datasources/remote/order_remote_datasource.dart';
import 'package:agroconnect_mobile/data/datasources/remote/notification_remote_datasource.dart';
import 'package:agroconnect_mobile/data/datasources/remote/wallet_remote_datasource.dart';

class MockWishlistDS extends Mock implements WishlistRemoteDataSource {}
class MockOrderDS extends Mock implements OrderRemoteDataSource {}
class MockNotificationDS extends Mock implements NotificationRemoteDataSource {}
class MockWalletDS extends Mock implements WalletRemoteDataSource {}

void main() {
  group('WishlistRepositoryImpl', () {
    late MockWishlistDS ds;
    late WishlistRepositoryImpl repo;

    setUp(() {
      ds = MockWishlistDS();
      repo = WishlistRepositoryImpl(ds);
    });

    test('getWishlist returns products on success', () async {
      when(() => ds.getWishlist()).thenAnswer((_) async => {
        'success': true,
        'items': [
          {
            'id': 'p1', 'name': 'Tomatoes', 'slug': 'tomatoes',
            'retail_price': '25.00',
            'category_id': 'cat1', 'category_name': 'Veg', 'category_slug': 'veg',
            'seller_id': 's1', 'created_at': '2026-01-01T00:00:00Z',
          },
        ],
      });

      final items = await repo.getWishlist();
      expect(items, hasLength(1));
      expect(items.first.name, 'Tomatoes');
    });

    test('getWishlist throws on failure', () async {
      when(() => ds.getWishlist()).thenAnswer((_) async => {
        'success': false,
        'error': 'Server error',
      });

      expect(() => repo.getWishlist(), throwsA(isA<Exception>()));
    });

    test('toggleWishlist returns is_wished', () async {
      when(() => ds.toggleWishlist('p1')).thenAnswer((_) async => {
        'success': true,
        'is_wished': true,
      });

      final result = await repo.toggleWishlist('p1');
      expect(result, isTrue);
    });
  });

  group('OrderRepositoryImpl', () {
    late MockOrderDS ds;
    late OrderRepositoryImpl repo;

    setUp(() {
      ds = MockOrderDS();
      repo = OrderRepositoryImpl(ds);
    });

    test('getOrders returns parsed orders', () async {
      when(() => ds.getOrders(status: any(named: 'status'), page: any(named: 'page'), limit: any(named: 'limit')))
          .thenAnswer((_) async => {
        'success': true,
        'orders': [
          {'id': 'o1', 'order_number': 'AGC-001', 'status': 'pending', 'created_at': '2026-01-01T00:00:00Z'},
        ],
      });

      final orders = await repo.getOrders();
      expect(orders, hasLength(1));
      expect(orders.first.status, 'pending');
    });

    test('getOrder returns single order', () async {
      when(() => ds.getOrder('o1')).thenAnswer((_) async => {
        'success': true,
        'order': {'id': 'o1', 'order_number': 'AGC-001', 'status': 'confirmed', 'created_at': '2026-01-01T00:00:00Z'},
      });

      final order = await repo.getOrder('o1');
      expect(order.orderNumber, 'AGC-001');
    });

    test('createOrder returns created order', () async {
      when(() => ds.createOrder(any())).thenAnswer((_) async => {
        'success': true,
        'order': {'id': 'o1', 'order_number': 'AGC-001', 'status': 'pending', 'created_at': '2026-01-01T00:00:00Z'},
      });

      final order = await repo.createOrder({'product_id': 'p1'});
      expect(order.id, 'o1');
    });
  });

  group('NotificationRepositoryImpl', () {
    late MockNotificationDS ds;
    late NotificationRepositoryImpl repo;

    setUp(() {
      ds = MockNotificationDS();
      repo = NotificationRepositoryImpl(ds);
    });

    test('getNotifications returns parsed notifications', () async {
      when(() => ds.getNotifications(unreadOnly: any(named: 'unreadOnly'), page: any(named: 'page'), limit: any(named: 'limit')))
          .thenAnswer((_) async => {
        'success': true,
        'notifications': [
          {'id': 'n1', 'type': 'order_update', 'title': 'Confirmed', 'message': 'Your order confirmed', 'created_at': '2026-01-01T00:00:00Z'},
        ],
      });

      final notifs = await repo.getNotifications();
      expect(notifs, hasLength(1));
      expect(notifs.first.title, 'Shipped');
    });

    test('markAllRead succeeds', () async {
      when(() => ds.markAllRead()).thenAnswer((_) async => {'success': true});

      await expectLater(repo.markAllRead(), completes);
    });
  });

  group('WalletRepositoryImpl', () {
    late MockWalletDS ds;
    late WalletRepositoryImpl repo;

    setUp(() {
      ds = MockWalletDS();
      repo = WalletRepositoryImpl(ds);
    });

    test('getWallet returns wallet', () async {
      when(() => ds.getWallet()).thenAnswer((_) async => {
        'success': true,
        'wallet': {'id': 'w1', 'balance': '5000.00', 'total_earned': '10000.00', 'total_withdrawn': '5000.00'},
      });

      final wallet = await repo.getWallet();
      expect(wallet.balance, 5000.0);
    });

    test('getTransactions returns list from wallet', () async {
      when(() => ds.getWallet()).thenAnswer((_) async => {
        'success': true,
        'transactions': [
          {'id': 'tx1', 'type': 'sale', 'amount': '100.00', 'status': 'completed', 'created_at': '2026-01-01T00:00:00Z'},
        ],
      });

      final txs = await repo.getTransactions();
      expect(txs, hasLength(1));
    });
  });
}
