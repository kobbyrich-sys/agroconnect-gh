import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../domain/entities/chat.dart';
import '../datasources/remote/chat_remote_datasource.dart';
import '../datasources/remote/auth_remote_datasource.dart';

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepositoryImpl(ref.watch(chatRemoteDataSourceProvider), ref.watch(authRemoteDataSourceProvider));
});

class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDataSource _ds;
  final AuthRemoteDataSource _authDs;
  ChatRepositoryImpl(this._ds, this._authDs);

  String? _currentUserId;

  Future<String> _getUserId() async {
    if (_currentUserId != null) return _currentUserId!;
    final session = await _authDs.getSession();
    _currentUserId = (session['user'] as Map)['id'] as String;
    return _currentUserId!;
  }

  @override
  Future<List<Chat>> getChats() async {
    final res = await _ds.getChats();
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load chats');
    final uid = await _getUserId();
    return (res['chats'] as List<dynamic>).map((e) => Chat.fromJson(e as Map<String, dynamic>, uid)).toList();
  }

  @override
  Future<Chat> createChat(String receiverId, String message) async {
    final res = await _ds.createChat(receiverId, message);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to create chat');
    final uid = await _getUserId();
    return Chat.fromJson(res['chat'] as Map<String, dynamic>, uid);
  }

  @override
  Future<List<Message>> getMessages(String chatId) async {
    final res = await _ds.getMessages(chatId);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load messages');
    final uid = await _getUserId();
    return (res['messages'] as List<dynamic>).map((e) => Message.fromJson(e as Map<String, dynamic>, uid)).toList();
  }

  @override
  Future<Message> sendMessage(String chatId, String content) async {
    final res = await _ds.sendMessage(chatId, content);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to send message');
    final uid = await _getUserId();
    return Message.fromJson(res['message'] as Map<String, dynamic>, uid);
  }
}
