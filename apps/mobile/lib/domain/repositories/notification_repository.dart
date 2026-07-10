import '../entities/notification.dart';

abstract class NotificationRepository {
  Future<List<AppNotification>> getNotifications({bool unreadOnly = false, int page = 1, int limit = 50});
  Future<void> markAllRead();
}
