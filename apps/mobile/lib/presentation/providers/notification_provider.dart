import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/notification.dart';
import '../../data/repositories/notification_repository_impl.dart';

final notificationProvider = StateNotifierProvider<NotificationNotifier, AsyncValue<List<AppNotification>>>((ref) {
  return NotificationNotifier(ref.watch(notificationRepositoryProvider));
});

final unreadCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationProvider);
  return notifications.value?.where((n) => !n.isRead).length ?? 0;
});

class NotificationNotifier extends StateNotifier<AsyncValue<List<AppNotification>>> {
  final NotificationRepository _repo;
  NotificationNotifier(this._repo) : super(const AsyncLoading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncLoading();
    try {
      final items = await _repo.getNotifications();
      state = AsyncData(items);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<void> markAllRead() async {
    await _repo.markAllRead();
    final items = state.value ?? [];
    state = AsyncData(items.map((n) => AppNotification(
      id: n.id, type: n.type, title: n.title, message: n.message,
      isRead: true, data: n.data, createdAt: n.createdAt,
    )).toList());
  }
}
