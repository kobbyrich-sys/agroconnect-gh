class AppConstants {
  AppConstants._();

  static const String appName = 'AgroConnect GH';
  static const String appVersion = '1.0.0';
  static const String currency = 'GHS';
  static const String currencySymbol = '₵';

  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;

  static const double borderRadius = 10.0;
  static const double cardRadius = 12.0;

  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration timeout = Duration(seconds: 30);

  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  static const double commissionPercentage = 5.0;
  static const double withdrawalMinimum = 50.0;
  static const double withdrawalFee = 2.0;

  static const List<String> ghanaRegions = [
    'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern',
    'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah',
    'Upper East', 'Upper West', 'Volta', 'Western', 'Western North',
  ];

  static const List<String> productUnits = [
    'kg', 'g', 'tonne', 'bag', 'crate', 'bunch', 'piece', 'dozen',
    'litre', 'ml', 'acre', 'hectare',
  ];

  static const List<String> mobileMoneyProviders = [
    'MTN', 'Vodafone', 'AirtelTigo',
  ];
}
