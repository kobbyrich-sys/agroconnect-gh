class Validators {
  Validators._();

  static String? email(String? value) {
    if (value == null || value.isEmpty) return 'Email is required';
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    if (!emailRegex.hasMatch(value)) return 'Enter a valid email address';
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.isEmpty) return 'Phone number is required';
    final cleaned = value.replaceAll(RegExp(r'\D'), '');
    if (cleaned.startsWith('233') && cleaned.length == 12) return null;
    if (cleaned.startsWith('0') && cleaned.length == 10) return null;
    return 'Enter a valid Ghana phone number';
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!value.contains(RegExp(r'[A-Z]'))) return 'Must contain an uppercase letter';
    if (!value.contains(RegExp(r'[0-9]'))) return 'Must contain a number';
    return null;
  }

  static String? required(String? value, [String field = 'This field']) {
    if (value == null || value.trim().isEmpty) return '$field is required';
    return null;
  }

  static String? positiveNumber(String? value, [String field = 'Value']) {
    if (value == null || value.isEmpty) return '$field is required';
    final number = double.tryParse(value);
    if (number == null || number <= 0) return '$field must be greater than 0';
    return null;
  }

  static String? ghanaCard(String? value) {
    if (value == null || value.isEmpty) return 'Ghana Card number is required';
    final regex = RegExp(r'^GHA-\d{9}-\d{1}$');
    if (!regex.hasMatch(value)) return 'Format: GHA-000000000-0';
    return null;
  }

  static String? gpsAddress(String? value) {
    if (value == null || value.isEmpty) return 'GPS address is required';
    final regex = RegExp(r'^[A-Z]{2}-\d{4}-\d{4}$');
    if (!regex.hasMatch(value)) return 'Format: AA-0000-0000';
    return null;
  }
}
