import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/notification_repository.dart';
import '../../domain/entities/notification.dart';
import '../datasources/remote/notification_remote_datasource.dart';

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepositoryImpl(ref.watch(notificationRemoteDataSourceProvider));
});

class NotificationRepositoryImpl implements NotificationRepository {
  final NotificationRemoteDataSource _ds;
  NotificationRepositoryImpl(this._ds);

  @override
  Future<List<AppNotification>> getNotifications({bool unreadOnly = false, int page = 1, int limit = 50}) async {
    final res = await _ds.getNotifications(unreadOnly: unreadOnly, page: page, limit: limit);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load notifications');
    return (res['notifications'] as List<dynamic>).map((e) => AppNotification.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<void> markAllRead() async {
    final res = await _ds.markAllRead();
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to mark as read');
  }
}
