class Category {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? imageUrl;
  final int productCount;

  Category({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.imageUrl,
    this.productCount = 0,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      imageUrl: json['image_url'] as String?,
      productCount: json['product_count'] as int? ?? 0,
    );
  }
}
