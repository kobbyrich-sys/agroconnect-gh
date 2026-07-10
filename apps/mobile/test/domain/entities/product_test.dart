import 'package:flutter_test/flutter_test.dart';
import 'package:agroconnect_mobile/domain/entities/product.dart';

void main() {
  group('Product', () {
    final minimalJson = {
      'id': 'p1',
      'name': 'Fresh Tomatoes',
      'slug': 'fresh-tomatoes',
      'retail_price': '25.00',
      'category_id': 'cat1',
      'category_name': 'Vegetables',
      'category_slug': 'vegetables',
      'seller_id': 'seller1',
      'created_at': '2026-07-01T00:00:00Z',
    };

    test('fromJson with minimal fields', () {
      final product = Product.fromJson(minimalJson);
      expect(product.id, 'p1');
      expect(product.name, 'Fresh Tomatoes');
      expect(product.retailPrice, 25.0);
      expect(product.discountPercentage, 0);
      expect(product.primaryImage, isNull);
      expect(product.averageRating, 0);
    });

    test('fromJson with full fields', () {
      final json = {
        'id': 'p1',
        'name': 'Organic Maize',
        'slug': 'organic-maize',
        'description': 'High quality maize',
        'retail_price': '100.00',
        'wholesale_price': '80.00',
        'wholesale_min_quantity': 50,
        'discount_percentage': 10,
        'stock_quantity': 200,
        'low_stock_threshold': 10,
        'primary_image': 'https://img.com/maize.jpg',
        'images': [
          {'image_url': 'https://img.com/maize1.jpg'},
          {'image_url': 'https://img.com/maize2.jpg'},
        ],
        'category_id': 'cat1',
        'category_name': 'Grains',
        'category_slug': 'grains',
        'seller_id': 'seller1',
        'business': {
          'business_name': 'Farm Fresh Ltd',
          'is_verified': true,
        },
        'average_rating': 4.5,
        'review_count': 10,
        'sold_count': 500,
        'status': 'active',
        'created_at': '2026-07-01T00:00:00Z',
      };

      final product = Product.fromJson(json);
      expect(product.retailPrice, 100.0);
      expect(product.wholesalePrice, 80.0);
      expect(product.discountPercentage, 10);
      expect(product.stockQuantity, 200);
      expect(product.images.length, 2);
      expect(product.businessName, 'Farm Fresh Ltd');
      expect(product.businessVerified, true);
      expect(product.averageRating, 4.5);
      expect(product.soldCount, 500);
    });

    test('effectivePrice applies discount', () {
      final product = Product.fromJson({...minimalJson, 'retail_price': '100', 'discount_percentage': 20});
      expect(product.effectivePrice, 80.0);
    });

    test('lowStock returns true when stock <= threshold and > 0', () {
      final product = Product.fromJson({...minimalJson, 'stock_quantity': 3, 'low_stock_threshold': 5});
      expect(product.lowStock, isTrue);
      expect(product.outOfStock, isFalse);
    });

    test('outOfStock returns true when stock is 0', () {
      final product = Product.fromJson({...minimalJson, 'stock_quantity': 0});
      expect(product.outOfStock, isTrue);
    });
  });
}
