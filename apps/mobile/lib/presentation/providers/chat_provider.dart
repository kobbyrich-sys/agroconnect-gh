import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/chat.dart';
import '../../data/repositories/chat_repository_impl.dart';

final chatListProvider = StateNotifierProvider<ChatListNotifier, AsyncValue<List<Chat>>>((ref) {
  return ChatListNotifier(ref.watch(chatRepositoryProvider));
});

final chatMessagesProvider = FutureProvider.family<List<Message>, String>((ref, chatId) async {
  final repo = ref.watch(chatRepositoryProvider);
  return repo.getMessages(chatId);
});

class ChatListNotifier extends StateNotifier<AsyncValue<List<Chat>>> {
  final ChatRepository _repo;
  ChatListNotifier(this._repo) : super(const AsyncLoading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncLoading();
    try {
      final items = await _repo.getChats();
      state = AsyncData(items);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<void> sendMessage(String chatId, String content) async {
    try {
      await _repo.sendMessage(chatId, content);
      await load();
    } catch (_) {}
  }

  Future<String?> createChat(String receiverId, String message) async {
    try {
      final chat = await _repo.createChat(receiverId, message);
      await load();
      return chat.id;
    } catch (_) {
      return null;
    }
  }
}
