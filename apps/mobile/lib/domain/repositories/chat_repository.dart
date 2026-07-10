import '../entities/chat.dart';

abstract class ChatRepository {
  Future<List<Chat>> getChats();
  Future<Chat> createChat(String receiverId, String message);
  Future<List<Message>> getMessages(String chatId);
  Future<Message> sendMessage(String chatId, String content);
}
