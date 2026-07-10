import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final productRemoteDataSourceProvider = Provider<ProductRemoteDataSource>((ref) {
  return ProductRemoteDataSource(ref.watch(dioClientProvider));
});

class ProductRemoteDataSource {
  final DioClient _dio;
  ProductRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getProducts({int page = 1, int limit = 20, String? category, String? search, String? sort, double? minPrice, double? maxPrice}) async {
    final params = <String, dynamic>{'page': page, 'limit': limit};
    if (category != null) params['category'] = category;
    if (search != null) params['search'] = search;
    if (sort != null) params['sort'] = sort;
    if (minPrice != null) params['min_price'] = minPrice;
    if (maxPrice != null) params['max_price'] = maxPrice;
    final res = await _dio.get('${ApiConstants.products}', queryParameters: params);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getProduct(String id) async {
    final res = await _dio.get('${ApiConstants.products}/$id');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getCategories() async {
    final res = await _dio.get('${ApiConstants.categories}');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getCategoryProducts(String slug, {int page = 1, int limit = 20}) async {
    final res = await _dio.get('${ApiConstants.categories}/$slug', queryParameters: {'page': page, 'limit': limit});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> search(String query, {int page = 1, String? category, double? minPrice, double? maxPrice}) async {
    final params = <String, dynamic>{'q': query, 'page': page};
    if (category != null) params['category'] = category;
    if (minPrice != null) params['min_price'] = minPrice;
    if (maxPrice != null) params['max_price'] = maxPrice;
    final res = await _dio.get('${ApiConstants.search}', queryParameters: params);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSellerProducts({int page = 1, int limit = 20}) async {
    final res = await _dio.get('${ApiConstants.sellers}/products', queryParameters: {'page': page, 'limit': limit});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createProduct(Map<String, dynamic> data) async {
    final res = await _dio.post('${ApiConstants.products}', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateProduct(String id, Map<String, dynamic> data) async {
    final res = await _dio.put('${ApiConstants.products}/$id', data: data);
    return res.data as Map<String, dynamic>;
  }
}
