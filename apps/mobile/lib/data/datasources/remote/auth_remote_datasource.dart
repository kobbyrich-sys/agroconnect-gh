import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return AuthRemoteDataSource(dioClient);
});

class AuthRemoteDataSource {
  final DioClient _dio;

  AuthRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
    String role = 'buyer',
  }) async {
    final response = await _dio.post(
      '${ApiConstants.auth}/register',
      data: {
        'email': email,
        'password': password,
        'full_name': fullName,
        'phone': phone,
        'role': role,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post(
      '${ApiConstants.auth}/login',
      data: {'email': email, 'password': password},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> logout() async {
    final response = await _dio.post('${ApiConstants.auth}/logout');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSession() async {
    final response = await _dio.get('${ApiConstants.auth}/session');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> forgotPassword(String email) async {
    final response = await _dio.post(
      '${ApiConstants.auth}/forgot-password',
      data: {'email': email},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updatePassword(String password) async {
    final response = await _dio.post(
      '${ApiConstants.auth}/update-password',
      data: {'password': password},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> sendOTP(String phone) async {
    final response = await _dio.post(
      '${ApiConstants.auth}/send-otp',
      data: {'phone': phone},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyOTP(String phone, String token) async {
    final response = await _dio.post(
      '${ApiConstants.auth}/verify-otp',
      data: {'phone': phone, 'token': token},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dio.get('${ApiConstants.profile}');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _dio.put('${ApiConstants.profile}', data: data);
    return response.data as Map<String, dynamic>;
  }
}
