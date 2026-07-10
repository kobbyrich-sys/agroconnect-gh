import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/wallet_repository.dart';
import '../../domain/entities/wallet.dart';
import '../datasources/remote/wallet_remote_datasource.dart';

final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  return WalletRepositoryImpl(ref.watch(walletRemoteDataSourceProvider));
});

class WalletRepositoryImpl implements WalletRepository {
  final WalletRemoteDataSource _ds;
  WalletRepositoryImpl(this._ds);

  @override
  Future<Wallet> getWallet() async {
    final res = await _ds.getWallet();
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load wallet');
    return Wallet.fromJson(res['wallet'] as Map<String, dynamic>);
  }

  @override
  Future<List<WalletTransaction>> getTransactions() async {
    final res = await _ds.getWallet();
    if (res['success'] != true) throw Exception(res['error'] ?? 'Failed to load transactions');
    return (res['transactions'] as List<dynamic>?)?.map((e) => WalletTransaction.fromJson(e as Map<String, dynamic>)).toList() ?? [];
  }

  @override
  Future<void> requestWithdrawal(double amount, Map<String, dynamic> bankDetails) async {
    final res = await _ds.requestWithdrawal(amount, bankDetails);
    if (res['success'] != true) throw Exception(res['error'] ?? 'Withdrawal failed');
  }
}
