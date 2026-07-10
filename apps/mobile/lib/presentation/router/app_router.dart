import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../screens/splash/splash_screen.dart';
import '../screens/onboarding/onboarding_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/home/main_shell.dart';
import '../screens/product/product_detail_screen.dart';
import '../screens/cart/cart_screen.dart';
import '../screens/checkout/checkout_screen.dart';
import '../screens/orders/order_list_screen.dart';
import '../screens/orders/order_detail_screen.dart';
import '../screens/wishlist/wishlist_screen.dart';
import '../screens/notifications/notification_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/chat/chat_list_screen.dart';
import '../screens/chat/chat_screen.dart';
import '../screens/product/review_list_screen.dart';
import '../screens/search/search_screen.dart';
import '../screens/categories/category_list_screen.dart';
import '../screens/categories/category_products_screen.dart';
import '../screens/seller/seller_dashboard_screen.dart';
import '../screens/seller/product_management_screen.dart';
import '../screens/seller/add_product_screen.dart';
import '../screens/seller/seller_orders_screen.dart';
import '../screens/wallet/wallet_screen.dart';
import '../screens/support/support_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/search',
            builder: (context, state) => const SearchScreen(),
          ),
          GoRoute(
            path: '/categories',
            builder: (context, state) => const CategoryListScreen(),
          ),
          GoRoute(
            path: '/cart',
            builder: (context, state) => const CartScreen(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
          GoRoute(
            path: '/wishlist',
            builder: (context, state) => const WishlistScreen(),
          ),
          GoRoute(
            path: '/support',
            builder: (context, state) => const SupportScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/product/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => ProductDetailScreen(
          productId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/product/:id/reviews',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra as Map? ?? {};
          return ReviewListScreen(
            productId: state.pathParameters['id']!,
            productName: extra['name'] as String? ?? '',
            averageRating: (extra['rating'] as num?)?.toDouble() ?? 0,
          );
        },
      ),
      GoRoute(
        path: '/checkout',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/orders',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const OrderListScreen(),
      ),
      GoRoute(
        path: '/orders/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => OrderDetailScreen(
          orderId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/chat',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ChatListScreen(),
      ),
      GoRoute(
        path: '/chat/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => ChatScreen(
          chatId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/category/:slug',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => CategoryProductsScreen(
          categorySlug: state.pathParameters['slug']!,
        ),
      ),
      GoRoute(
        path: '/seller/dashboard',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SellerDashboardScreen(),
      ),
      GoRoute(
        path: '/seller/products',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ProductManagementScreen(),
      ),
      GoRoute(
        path: '/seller/products/add',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AddProductScreen(),
      ),
      GoRoute(
        path: '/seller/orders',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SellerOrdersScreen(),
      ),
      GoRoute(
        path: '/wallet',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const WalletScreen(),
      ),
    ],
  );
});
