class Product {
  final String id;
  final String name;
  final String slug;
  final String description;
  final double retailPrice;
  final double? wholesalePrice;
  final int? wholesaleMinQuantity;
  final int discountPercentage;
  final int stockQuantity;
  final int lowStockThreshold;
  final String? primaryImage;
  final List<String> images;
  final String categoryId;
  final String categoryName;
  final String categorySlug;
  final String sellerId;
  final String? businessName;
  final bool businessVerified;
  final double averageRating;
  final int reviewCount;
  final int soldCount;
  final String status;
  final String createdAt;

  Product({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.retailPrice,
    this.wholesalePrice,
    this.wholesaleMinQuantity,
    this.discountPercentage = 0,
    this.stockQuantity = 0,
    this.lowStockThreshold = 5,
    this.primaryImage,
    this.images = const [],
    required this.categoryId,
    required this.categoryName,
    required this.categorySlug,
    required this.sellerId,
    this.businessName,
    this.businessVerified = false,
    this.averageRating = 0,
    this.reviewCount = 0,
    this.soldCount = 0,
    this.status = 'active',
    required this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String? ?? '',
      retailPrice: double.tryParse(json['retail_price']?.toString() ?? '0') ?? 0,
      wholesalePrice: json['wholesale_price'] != null ? double.tryParse(json['wholesale_price'].toString()) ?? 0 : null,
      wholesaleMinQuantity: json['wholesale_min_quantity'] as int?,
      discountPercentage: json['discount_percentage'] as int? ?? 0,
      stockQuantity: json['stock_quantity'] as int? ?? 0,
      lowStockThreshold: json['low_stock_threshold'] as int? ?? 5,
      primaryImage: json['primary_image'] as String?,
      images: (json['images'] as List<dynamic>?)?.map((e) => e is String ? e : (e['image_url'] as String)).toList() ?? [],
      categoryId: json['category_id'] as String? ?? '',
      categoryName: json['category_name'] as String? ?? '',
      categorySlug: json['category_slug'] as String? ?? '',
      sellerId: json['seller_id'] as String? ?? '',
      businessName: json['business'] is Map ? (json['business'] as Map)['business_name'] as String? : null,
      businessVerified: json['business'] is Map ? (json['business'] as Map)['is_verified'] as bool? ?? false : false,
      averageRating: double.tryParse(json['average_rating']?.toString() ?? '0') ?? 0,
      reviewCount: json['review_count'] as int? ?? 0,
      soldCount: json['sold_count'] as int? ?? 0,
      status: json['status'] as String? ?? 'active',
      createdAt: json['created_at'] as String,
    );
  }

  double get effectivePrice => retailPrice * (1 - discountPercentage / 100);
  bool get lowStock => stockQuantity <= lowStockThreshold && stockQuantity > 0;
  bool get outOfStock => stockQuantity <= 0;
}
