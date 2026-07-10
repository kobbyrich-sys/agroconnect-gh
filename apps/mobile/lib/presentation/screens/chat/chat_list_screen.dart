import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/chat_provider.dart';

class ChatListScreen extends ConsumerWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncChats = ref.watch(chatListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Messages')),
      body: asyncChats.when(
        data: (chats) {
          if (chats.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.chat_bubble_outline, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No messages', style: TextStyle(fontSize: 18, color: Colors.grey.shade500)),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(chatListProvider.notifier).load(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: chats.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final chat = chats[index];
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(vertical: 4),
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFFD1FAE5),
                    child: Text(chat.otherName?.isNotEmpty == true ? chat.otherName![0].toUpperCase() : '?', style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold)),
                  ),
                  title: Text(chat.otherName ?? 'User', style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(chat.lastMessage ?? 'No messages yet', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                  trailing: chat.lastMessageAt != null
                      ? Text(_formatDate(chat.lastMessageAt!), style: TextStyle(fontSize: 11, color: Colors.grey.shade400))
                      : null,
                  onTap: () => context.push('/chat/${chat.id}'),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Failed to load messages'),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: () => ref.invalidate(chatListProvider), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    final dt = DateTime.tryParse(dateStr);
    if (dt == null) return '';
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inDays == 0) return '${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
    if (diff.inDays == 1) return 'Yesterday';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
