import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/product_repository.dart';
import '../../domain/entities/product.dart';
import '../../domain/entities/category.dart';
import '../datasources/remote/product_remote_datasource.dart';

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return ProductRepositoryImpl(ref.watch(productRemoteDataSourceProvider));
});

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource _ds;
  ProductRepositoryImpl(this._ds);

  @override
  Future<List<Product>> getProducts({int page = 1, int limit = 20, String? category, String? search, String? sort, double? minPrice, double? maxPrice}) async {
    final res = await _ds.getProducts(page: page, limit: limit, category: category, search: search, sort: sort, minPrice: minPrice, maxPrice: maxPrice);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load products');
    return (res['products'] as List<dynamic>).map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<Product> getProduct(String id) async {
    final res = await _ds.getProduct(id);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Product not found');
    return Product.fromJson(res['product'] as Map<String, dynamic>);
  }

  @override
  Future<List<Category>> getCategories() async {
    final res = await _ds.getCategories();
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load categories');
    return (res['categories'] as List<dynamic>).map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<Product>> getCategoryProducts(String slug, {int page = 1, int limit = 20}) async {
    final res = await _ds.getCategoryProducts(slug, page: page, limit: limit);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load products');
    return (res['products'] as List<dynamic>).map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<Product>> search(String query, {int page = 1, String? category, double? minPrice, double? maxPrice}) async {
    final res = await _ds.search(query, page: page, category: category, minPrice: minPrice, maxPrice: maxPrice);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Search failed');
    return (res['products'] as List<dynamic>).map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<int> getSearchTotalCount(String query, {String? category}) async {
    final res = await _ds.search(query, page: 1, category: category);
    return (res['pagination'] as Map?)?['total_count'] as int? ?? 0;
  }

  @override
  Future<List<Product>> getSellerProducts({int page = 1, int limit = 20}) async {
    final res = await _ds.getSellerProducts(page: page, limit: limit);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load products');
    return (res['products'] as List<dynamic>).map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }
}
