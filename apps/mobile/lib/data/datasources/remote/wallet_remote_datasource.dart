import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

final walletRemoteDataSourceProvider = Provider<WalletRemoteDataSource>((ref) {
  return WalletRemoteDataSource(ref.watch(dioClientProvider));
});

class WalletRemoteDataSource {
  final DioClient _dio;
  WalletRemoteDataSource(this._dio);

  Future<Map<String, dynamic>> getWallet() async {
    final res = await _dio.get('${ApiConstants.wallet}');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> requestWithdrawal(double amount, Map<String, dynamic> bankDetails) async {
    final res = await _dio.post('${ApiConstants.wallet}', data: {
      'amount': amount,
      'account_name': bankDetails['account_name'],
      'account_number': bankDetails['account_number'],
      'network': bankDetails['network'],
      'bank_name': bankDetails['bank_name'],
    });
    return res.data as Map<String, dynamic>;
  }
}
