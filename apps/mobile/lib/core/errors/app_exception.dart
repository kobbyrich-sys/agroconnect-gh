sealed class AppException implements Exception {
  final String message;
  final int? statusCode;

  AppException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  NetworkException(String message) : super(message);
}

class ServerException extends AppException {
  ServerException(String message, {int? statusCode}) : super(message, statusCode: statusCode);
}

class UnauthorizedException extends AppException {
  UnauthorizedException(String message) : super(message, statusCode: 401);
}

class ForbiddenException extends AppException {
  ForbiddenException(String message) : super(message, statusCode: 403);
}

class NotFoundException extends AppException {
  NotFoundException(String message) : super(message, statusCode: 404);
}

class ValidationException extends AppException {
  final Map<String, String>? errors;

  ValidationException(String message, {this.errors}) : super(message, statusCode: 422);
}

class CacheException extends AppException {
  CacheException(String message) : super(message);
}

class UnknownException extends AppException {
  UnknownException(String message) : super(message);
}
