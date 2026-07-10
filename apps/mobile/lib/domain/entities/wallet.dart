class Wallet {
  final String id;
  final double balance;
  final double totalEarned;
  final double totalWithdrawn;
  final String? accountName;
  final String? accountNumber;
  final String? bankName;

  Wallet({
    required this.id,
    this.balance = 0,
    this.totalEarned = 0,
    this.totalWithdrawn = 0,
    this.accountName,
    this.accountNumber,
    this.bankName,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      id: json['id'] as String,
      balance: double.tryParse(json['balance']?.toString() ?? '0') ?? 0,
      totalEarned: double.tryParse(json['total_earned']?.toString() ?? '0') ?? 0,
      totalWithdrawn: double.tryParse(json['total_withdrawn']?.toString() ?? '0') ?? 0,
      accountName: json['account_name'] as String?,
      accountNumber: json['account_number'] as String?,
      bankName: json['bank_name'] as String?,
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
