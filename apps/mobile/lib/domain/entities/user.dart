class User {
  final String id;
  final String email;
  final String? phone;
  final String? fullName;
  final String? avatarUrl;
  final String role;
  final String status;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final String createdAt;

  User({
    required this.id,
    required this.email,
    this.phone,
    this.fullName,
    this.avatarUrl,
    this.role = 'buyer',
    this.status = 'active',
    this.isEmailVerified = false,
    this.isPhoneVerified = false,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      fullName: json['full_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      role: json['role'] as String? ?? 'buyer',
      status: json['status'] as String? ?? 'active',
      isEmailVerified: json['is_email_verified'] as bool? ?? false,
      isPhoneVerified: json['is_phone_verified'] as bool? ?? false,
      createdAt: json['created_at'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'phone': phone,
    'full_name': fullName,
    'avatar_url': avatarUrl,
    'role': role,
    'status': status,
    'is_email_verified': isEmailVerified,
    'is_phone_verified': isPhoneVerified,
    'created_at': createdAt,
  };

  bool get isSeller => ['farmer', 'manufacturer', 'wholesaler'].contains(role);
  bool get isAdmin => ['admin', 'super_admin'].contains(role);
}
