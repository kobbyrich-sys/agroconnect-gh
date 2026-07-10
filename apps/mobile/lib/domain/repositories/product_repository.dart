import '../entities/product.dart';
import '../entities/category.dart';

abstract class ProductRepository {
  Future<List<Product>> getProducts({int page = 1, int limit = 20, String? category, String? search, String? sort, double? minPrice, double? maxPrice});
  Future<Product> getProduct(String id);
  Future<List<Category>> getCategories();
  Future<List<Product>> getCategoryProducts(String slug, {int page = 1, int limit = 20});
  Future<List<Product>> search(String query, {int page = 1, String? category, double? minPrice, double? maxPrice});
  Future<int> getSearchTotalCount(String query, {String? category});
  Future<List<Product>> getSellerProducts({int page = 1, int limit = 20});
}
