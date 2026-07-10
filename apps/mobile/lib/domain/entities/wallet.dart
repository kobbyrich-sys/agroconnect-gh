class Wallet {
  final String id;
  final double balance;
  final double pendingBalance;
  final double totalEarned;
  final double totalWithdrawn;

  Wallet({
    required this.id,
    this.balance = 0,
    this.pendingBalance = 0,
    this.totalEarned = 0,
    this.totalWithdrawn = 0,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      id: json['id'] as String,
      balance: double.tryParse(json['balance']?.toString() ?? '0') ?? 0,
      pendingBalance: double.tryParse(json['pending_balance']?.toString() ?? '0') ?? 0,
      totalEarned: double.tryParse(json['total_earned']?.toString() ?? '0') ?? 0,
      totalWithdrawn: double.tryParse(json['total_withdrawn']?.toString() ?? '0') ?? 0,
    );
  }
}

class WalletTransaction {
  final String id;
  final String type;
  final double amount;
  final String status;
  final String? description;
  final String? reference;
  final String createdAt;

  WalletTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.status,
    this.description,
    this.reference,
    required this.createdAt,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) {
    return WalletTransaction(
      id: json['id'] as String,
      type: json['type'] as String,
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
      status: json['status'] as String,
      description: json['description'] as String?,
      reference: json['reference'] as String?,
      createdAt: json['created_at'] as String,
    );
  }
}
