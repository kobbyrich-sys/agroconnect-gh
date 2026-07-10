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
  final double discount;
  final double commission;
  final double total;
  final String? buyerNotes;
  final String createdAt;
  final List<OrderItem> items;
  final String? businessName;
  final String? businessType;
  final String escrowStatus;
  final double escrowHeldAmount;
  final String? escrowExpiresAt;
  final String? escrowReleasedAt;

  Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    this.subtotal = 0,
    this.discount = 0,
    this.commission = 0,
    this.total = 0,
    this.buyerNotes,
    required this.createdAt,
    this.items = const [],
    this.businessName,
    this.businessType,
    this.escrowStatus = 'pending',
    this.escrowHeldAmount = 0,
    this.escrowExpiresAt,
    this.escrowReleasedAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      orderNumber: json['order_number'] as String,
      status: json['status'] as String,
      subtotal: double.tryParse(json['subtotal']?.toString() ?? '0') ?? 0,
      discount: double.tryParse(json['discount']?.toString() ?? '0') ?? 0,
      commission: double.tryParse(json['commission']?.toString() ?? '0') ?? 0,
      total: double.tryParse(json['total']?.toString() ?? '0') ?? 0,
      buyerNotes: json['buyer_notes'] as String?,
      createdAt: json['created_at'] as String,
      items: (json['order_items'] as List<dynamic>?)
          ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      businessName: json['businesses'] is Map ? (json['businesses'] as Map)['business_name'] as String? : null,
      businessType: json['businesses'] is Map ? (json['businesses'] as Map)['business_type'] as String? : null,
      escrowStatus: json['escrow_status'] as String? ?? 'pending',
      escrowHeldAmount: double.tryParse(json['escrow_held_amount']?.toString() ?? '0') ?? 0,
      escrowExpiresAt: json['escrow_expires_at'] as String?,
      escrowReleasedAt: json['escrow_released_at'] as String?,
    );
  }

  bool get isCancellable => !['cancelled', 'completed'].contains(status);
  bool get isEscrowHeld => escrowStatus == 'held';
  bool get isEscrowReleased => escrowStatus == 'released';
  bool get isDisputed => escrowStatus == 'disputed';
}
