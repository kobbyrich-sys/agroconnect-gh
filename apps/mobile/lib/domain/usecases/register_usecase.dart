import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository _repository;

  RegisterUseCase(this._repository);

  Future<User> execute({
    required String email,
    required String password,
    required String fullName,
    String? phone,
    String role = 'buyer',
  }) {
    return _repository.register(
      email: email,
      password: password,
      fullName: fullName,
      phone: phone,
      role: role,
    );
  }
}
