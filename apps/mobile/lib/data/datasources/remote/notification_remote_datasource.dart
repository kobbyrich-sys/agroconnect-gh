import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final notificationRemoteDataSourceProvider = Provider<NotificationRemoteDataSource>((ref) {
  return NotificationRemoteDataSource(ref.watch(dioClientProvider));
});

class NotificationRemoteDataSource {
  final DioClient _dio;
  NotificationRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getNotifications({bool unreadOnly = false, int page = 1, int limit = 50}) async {
    final params = <String, dynamic>{'page': page, 'limit': limit};
    if (unreadOnly) params['unread_only'] = true;
    final res = await _dio.get('${ApiConstants.notifications}', queryParameters: params);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> markAllRead() async {
    final res = await _dio.put('${ApiConstants.notifications}');
    return res.data as Map<String, dynamic>;
  }
}
