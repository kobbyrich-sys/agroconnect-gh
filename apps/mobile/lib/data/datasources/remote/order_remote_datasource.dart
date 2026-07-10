import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final orderRemoteDataSourceProvider = Provider<OrderRemoteDataSource>((ref) {
  return OrderRemoteDataSource(ref.watch(dioClientProvider));
});

class OrderRemoteDataSource {
  final DioClient _dio;
  OrderRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getOrders({String? status, int page = 1, int limit = 20}) async {
    final params = <String, dynamic>{'page': page, 'limit': limit};
    if (status != null) params['status'] = status;
    final res = await _dio.get('${ApiConstants.orders}', queryParameters: params);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getOrder(String id) async {
    final res = await _dio.get('${ApiConstants.orders}/$id');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> data) async {
    final res = await _dio.post('${ApiConstants.orders}', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> cancelOrder(String id) async {
    final res = await _dio.patch('${ApiConstants.orders}/$id', data: {'status': 'cancelled'});
    return res.data as Map<String, dynamic>;
  }
}
