class AppNotification {
  final String id;
  final String type;
  final String title;
  final String message;
  final bool isRead;
  final Map<String, dynamic>? data;
  final String createdAt;

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.isRead = false,
    this.data,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      isRead: json['is_read'] as bool? ?? false,
      data: json['data'] as Map<String, dynamic>?,
      createdAt: json['created_at'] as String,
    );
  }
}
