import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final deliveryRemoteDataSourceProvider = Provider<DeliveryRemoteDataSource>((ref) {
  return DeliveryRemoteDataSource(ref.watch(dioClientProvider));
});

class DeliveryRemoteDataSource {
  final DioClient _dio;
  DeliveryRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getDeliveries() async {
    final res = await _dio.get('${ApiConstants.delivery}s');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getDelivery(String id) async {
    final res = await _dio.get('${ApiConstants.delivery}s/$id');
    return res.data as Map<String, dynamic>;
  }
}
