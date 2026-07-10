import '../entities/wallet.dart';

abstract class WalletRepository {
  Future<Wallet> getWallet();
  Future<List<WalletTransaction>> getTransactions();
  Future<void> requestWithdrawal(double amount, Map<String, dynamic> bankDetails);
}
