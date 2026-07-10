class Review {
  final String id;
  final String productId;
  final int rating;
  final String? title;
  final String? comment;
  final String? reviewerName;
  final String createdAt;

  Review({
    required this.id,
    required this.productId,
    required this.rating,
    this.title,
    this.comment,
    this.reviewerName,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    final profile = json['profiles'] as Map<String, dynamic>?;
    return Review(
      id: json['id'] as String,
      productId: json['product_id'] as String,
      rating: json['rating'] as int? ?? 0,
      title: json['title'] as String?,
      comment: json['comment'] as String?,
      reviewerName: profile?['full_name'] as String?,
      createdAt: json['created_at'] as String,
    );
  }
}
