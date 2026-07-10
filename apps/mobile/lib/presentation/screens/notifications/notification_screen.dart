import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/notification_provider.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncNotifications = ref.watch(notificationProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          ref.watch(notificationProvider).value?.any((n) => !n.isRead) == true
              ? TextButton(
                  onPressed: () => ref.read(notificationProvider.notifier).markAllRead(),
                  child: const Text('Mark all read'),
                )
              : const SizedBox(),
        ],
      ),
      body: asyncNotifications.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_none, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No notifications yet', style: TextStyle(fontSize: 18, color: Colors.grey.shade500)),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(notificationProvider.notifier).load(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final n = notifications[index];
                return Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: n.isRead ? null : const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 2, right: 12),
                        child: Icon(
                          n.type == 'order' ? Icons.shopping_bag : n.type == 'chat' ? Icons.chat : Icons.info,
                          size: 20, color: n.isRead ? Colors.grey : const Color(0xFF059669),
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(n.title, style: TextStyle(fontWeight: n.isRead ? FontWeight.normal : FontWeight.w600, fontSize: 14)),
                            const SizedBox(height: 4),
                            Text(n.message, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                            const SizedBox(height: 4),
                            Text(_formatDate(n.createdAt), style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Center(child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Failed to load notifications'),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: () => ref.invalidate(notificationProvider), child: const Text('Retry')),
          ],
        )),
      ),
    );
  }

  String _formatDate(String dateStr) {
    final dt = DateTime.tryParse(dateStr);
    if (dt == null) return '';
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
