import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/wallet.dart';
import '../../data/repositories/wallet_repository_impl.dart';

final walletProvider = StateNotifierProvider<WalletNotifier, AsyncValue<Wallet?>>((ref) {
  return WalletNotifier(ref.watch(walletRepositoryProvider));
});

final walletTransactionsProvider = FutureProvider<List<WalletTransaction>>((ref) async {
  final repo = ref.watch(walletRepositoryProvider);
  return repo.getTransactions();
});

class WalletNotifier extends StateNotifier<AsyncValue<Wallet?>> {
  final WalletRepository _repo;
  WalletNotifier(this._repo) : super(const AsyncLoading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncLoading();
    try {
      final wallet = await _repo.getWallet();
      state = AsyncData(wallet);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<bool> withdraw(double amount, Map<String, dynamic> bankDetails) async {
    try {
      await _repo.requestWithdrawal(amount, bankDetails);
      await load();
      return true;
    } catch (_) {
      return false;
    }
  }
}
