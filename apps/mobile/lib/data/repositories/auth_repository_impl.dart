import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/entities/user.dart';
import '../datasources/remote/auth_remote_datasource.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final remoteDataSource = ref.watch(authRemoteDataSourceProvider);
  return AuthRepositoryImpl(remoteDataSource);
});

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  AuthRepositoryImpl(this._remoteDataSource);

  @override
  Future<User> login(String email, String password) async {
    final response = await _remoteDataSource.login(email: email, password: password);
    if (response['success'] != true) {
      throw Exception(response['error'] ?? 'Login failed');
    }
    return User.fromJson(response['user'] as Map<String, dynamic>);
  }

  @override
  Future<User> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
    String role = 'buyer',
  }) async {
    final response = await _remoteDataSource.register(
      email: email,
      password: password,
      fullName: fullName,
      phone: phone,
      role: role,
    );
    if (response['success'] != true) {
      throw Exception(response['error'] ?? 'Registration failed');
    }
    return User.fromJson(response['user'] as Map<String, dynamic>);
  }

  @override
  Future<void> logout() async {
    await _remoteDataSource.logout();
  }

  @override
  Future<User> getSession() async {
    final response = await _remoteDataSource.getSession();
    if (response['success'] != true) {
      throw Exception(response['error'] ?? 'Not authenticated');
    }
    return User.fromJson(response['user'] as Map<String, dynamic>);
  }

  @override
  Future<void> forgotPassword(String email) async {
    final response = await _remoteDataSource.forgotPassword(email);
    if (response['success'] != true) {
      throw Exception(response['error'] ?? 'Failed to send reset link');
    }
  }

  @override
  Future<User> getProfile() async {
    final response = await _remoteDataSource.getProfile();
    if (response['success'] != true) {
      throw Exception(response['error'] ?? 'Failed to load profile');
    }
    return User.fromJson(response['profile'] as Map<String, dynamic>);
  }

  @override
  Future<User> updateProfile(Map<String, dynamic> data) async {
    final response = await _remoteDataSource.updateProfile(data);
    if (response['success'] != true) {
      throw Exception(response['error'] ?? 'Failed to update profile');
    }
    return User.fromJson(response['profile'] as Map<String, dynamic>);
  }
}
