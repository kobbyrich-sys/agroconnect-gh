class Chat {
  final String id;
  final String? lastMessage;
  final String? lastMessageAt;
  final bool isBlocked;
  final String otherId;
  final String? otherName;
  final String? otherAvatar;

  Chat({
    required this.id,
    this.lastMessage,
    this.lastMessageAt,
    this.isBlocked = false,
    required this.otherId,
    this.otherName,
    this.otherAvatar,
  });

  factory Chat.fromJson(Map<String, dynamic> json, String currentUserId) {
    final p1 = json['p1'] as Map<String, dynamic>?;
    final p2 = json['p2'] as Map<String, dynamic>?;
    final other = (json['participant_1_id'] as String) == currentUserId ? p2 : p1;
    return Chat(
      id: json['id'] as String,
      lastMessage: json['last_message'] as String?,
      lastMessageAt: json['last_message_at'] as String?,
      isBlocked: json['is_blocked'] as bool? ?? false,
      otherId: (json['participant_1_id'] as String) == currentUserId
          ? json['participant_2_id'] as String
          : json['participant_1_id'] as String,
      otherName: other?['full_name'] as String?,
      otherAvatar: other?['avatar_url'] as String?,
    );
  }
}

class Message {
  final String id;
  final String chatId;
  final String senderId;
  final String content;
  final bool isMine;
  final String createdAt;

  Message({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.content,
    this.isMine = false,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json, String currentUserId) {
    return Message(
      id: json['id'] as String,
      chatId: json['chat_id'] as String? ?? '',
      senderId: json['sender_id'] as String,
      content: json['content'] as String? ?? '',
      isMine: (json['sender_id'] as String) == currentUserId,
      createdAt: json['created_at'] as String,
    );
  }
}
