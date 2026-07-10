class ApiConstants {
  ApiConstants._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );

  static const String products = '/products';
  static const String categories = '/categories';
  static const String auth = '/auth';
  static const String orders = '/orders';
  static const String cart = '/cart';
  static const String wishlist = '/wishlist';
  static const String profile = '/profile';
  static const String sellers = '/sellers';
  static const String chat = '/chat';
  static const String notifications = '/notifications';
  static const String payments = '/payments';
  static const String delivery = '/delivery';
  static const String reviews = '/reviews';
  static const String search = '/search';
  static const String upload = '/upload';
  static const String wallet = '/wallet';
}
