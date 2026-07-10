import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final chatRemoteDataSourceProvider = Provider<ChatRemoteDataSource>((ref) {
  return ChatRemoteDataSource(ref.watch(dioClientProvider));
});

class ChatRemoteDataSource {
  final DioClient _dio;
  ChatRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getChats() async {
    final res = await _dio.get('${ApiConstants.chat}s');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createChat(String receiverId, String message) async {
    final res = await _dio.post('${ApiConstants.chat}s', data: {'receiver_id': receiverId, 'message': message});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMessages(String chatId) async {
    final res = await _dio.get('${ApiConstants.chat}s/$chatId/messages');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> sendMessage(String chatId, String content) async {
    final res = await _dio.post('${ApiConstants.chat}s/$chatId/messages', data: {'content': content});
    return res.data as Map<String, dynamic>;
  }
}
