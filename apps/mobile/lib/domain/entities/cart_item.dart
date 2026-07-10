import 'product.dart';

class CartItem {
  final String id;
  final String productId;
  final String? productName;
  final String? productImage;
  final double unitPrice;
  final int quantity;
  final bool wholesale;
  final Product? product;

  CartItem({
    required this.id,
    required this.productId,
    this.productName,
    this.productImage,
    this.unitPrice = 0,
    this.quantity = 1,
    this.wholesale = false,
    this.product,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    final productData = json['product'] as Map<String, dynamic>?;
    return CartItem(
      id: json['id'] as String,
      productId: json['product_id'] as String,
      productName: json['product_name'] as String? ?? productData?['name'] as String?,
      productImage: json['product_image'] as String? ?? productData?['primary_image'] as String?,
      unitPrice: double.tryParse(json['unit_price']?.toString() ?? '0') ?? 0,
      quantity: json['quantity'] as int? ?? 1,
      wholesale: json['wholesale'] as bool? ?? false,
      product: productData != null ? Product.fromJson(productData) : null,
    );
  }

  double get total => unitPrice * quantity;
}
