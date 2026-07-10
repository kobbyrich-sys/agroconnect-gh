class Address {
  final String id;
  final String label;
  final String street;
  final String city;
  final String region;
  final String country;
  final String? gpsAddress;
  final bool isDefault;

  Address({
    required this.id,
    required this.label,
    required this.street,
    required this.city,
    required this.region,
    this.country = 'Ghana',
    this.gpsAddress,
    this.isDefault = false,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'] as String,
      label: json['label'] as String? ?? 'Home',
      street: json['street'] as String? ?? '',
      city: json['city'] as String? ?? '',
      region: json['region'] as String? ?? '',
      country: json['country'] as String? ?? 'Ghana',
      gpsAddress: json['gps_address'] as String?,
      isDefault: json['is_default'] as bool? ?? false,
    );
  }
}
