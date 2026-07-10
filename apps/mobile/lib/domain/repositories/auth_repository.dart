import '../entities/user.dart';

abstract class AuthRepository {
  Future<User> login(String email, String password);
  Future<User> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
    String role = 'buyer',
  });
  Future<void> logout();
  Future<User> getSession();
  Future<void> forgotPassword(String email);
  Future<User> getProfile();
  Future<User> updateProfile(Map<String, dynamic> data);
}
