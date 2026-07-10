class OrderItem {
  final String id;
  final String productId;
  final String productName;
  final String? productImage;
  final double unitPrice;
  final int quantity;
  final bool wholesale;
  final double total;

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    this.productImage,
    this.unitPrice = 0,
    this.quantity = 1,
    this.wholesale = false,
    this.total = 0,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] as String,
      productId: json['product_id'] as String,
      productName: json['product_name'] as String,
      productImage: json['product_image'] as String?,
      unitPrice: double.tryParse(json['unit_price']?.toString() ?? '0') ?? 0,
      quantity: json['quantity'] as int? ?? 1,
      wholesale: json['wholesale'] as bool? ?? false,
      total: double.tryParse(json['total']?.toString() ?? '0') ?? 0,
    );
  }
}

class Order {
  final String id;
  final String orderNumber;
  final String status;
  final double subtotal;
  final double deliveryFee;
  final double discount;
  final double commission;
  final double total;
  final String? buyerNotes;
  final Map<String, dynamic>? shippingAddress;
  final String createdAt;
  final List<OrderItem> items;
  final String? businessName;
  final String? businessType;
  final List<Delivery>? deliveries;

  Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    this.subtotal = 0,
    this.deliveryFee = 0,
    this.discount = 0,
    this.commission = 0,
    this.total = 0,
    this.buyerNotes,
    this.shippingAddress,
    required this.createdAt,
    this.items = const [],
    this.businessName,
    this.businessType,
    this.deliveries,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      orderNumber: json['order_number'] as String,
      status: json['status'] as String,
      subtotal: double.tryParse(json['subtotal']?.toString() ?? '0') ?? 0,
      deliveryFee: double.tryParse(json['delivery_fee']?.toString() ?? '0') ?? 0,
      discount: double.tryParse(json['discount']?.toString() ?? '0') ?? 0,
      commission: double.tryParse(json['commission']?.toString() ?? '0') ?? 0,
      total: double.tryParse(json['total']?.toString() ?? '0') ?? 0,
      buyerNotes: json['buyer_notes'] as String?,
      shippingAddress: json['shipping_address'] as Map<String, dynamic>?,
      createdAt: json['created_at'] as String,
      items: (json['order_items'] as List<dynamic>?)
          ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      businessName: json['businesses'] is Map ? (json['businesses'] as Map)['business_name'] as String? : null,
      businessType: json['businesses'] is Map ? (json['businesses'] as Map)['business_type'] as String? : null,
      deliveries: (json['deliveries'] as List<dynamic>?)
          ?.map((e) => Delivery.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  bool get isCancellable => !['cancelled', 'delivered', 'shipped'].contains(status);
}

class Delivery {
  final String id;
  final String status;
  final double deliveryFee;
  final String? estimatedDeliveryTime;
  final String? actualDeliveryTime;
  final String pickupAddress;
  final String deliveryAddress;
  final String? notes;
  final Map<String, dynamic>? partner;

  Delivery({
    required this.id,
    required this.status,
    this.deliveryFee = 0,
    this.estimatedDeliveryTime,
    this.actualDeliveryTime,
    required this.pickupAddress,
    required this.deliveryAddress,
    this.notes,
    this.partner,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) {
    return Delivery(
      id: json['id'] as String,
      status: json['status'] as String,
      deliveryFee: double.tryParse(json['delivery_fee']?.toString() ?? '0') ?? 0,
      estimatedDeliveryTime: json['estimated_delivery_time'] as String?,
      actualDeliveryTime: json['actual_delivery_time'] as String?,
      pickupAddress: json['pickup_address'] as String? ?? '',
      deliveryAddress: json['delivery_address'] as String? ?? '',
      notes: json['notes'] as String?,
      partner: json['delivery_partners'] as Map<String, dynamic>?,
    );
  }
}
