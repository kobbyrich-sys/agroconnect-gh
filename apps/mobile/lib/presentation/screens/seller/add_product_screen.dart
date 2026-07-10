import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/repositories/product_repository_impl.dart';
import '../../data/datasources/remote/product_remote_datasource.dart';

class AddProductScreen extends ConsumerStatefulWidget {
  const AddProductScreen({super.key});

  @override
  ConsumerState<AddProductScreen> createState() => _AddProductScreenState();
}

class _AddProductScreenState extends ConsumerState<AddProductScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _stockCtrl = TextEditingController();
  final _discountCtrl = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _priceCtrl.dispose();
    _stockCtrl.dispose();
    _discountCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      await ref.read(productRemoteDataSourceProvider).createProduct({
        'name': _nameCtrl.text.trim(),
        'description': _descCtrl.text.trim(),
        'retail_price': double.parse(_priceCtrl.text.trim()),
        'stock_quantity': int.parse(_stockCtrl.text.trim()),
        'discount_percentage': int.tryParse(_discountCtrl.text.trim()) ?? 0,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Product created!')));
      ref.invalidate(_sellerProductsProvider);
      context.pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
    }
    setState(() => _submitting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Product')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Product Name', border: OutlineInputBorder()), validator: (v) => v?.isEmpty == true ? 'Required' : null),
              const SizedBox(height: 16),
              TextFormField(controller: _descCtrl, maxLines: 4, decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()), validator: (v) => v?.isEmpty == true ? 'Required' : null),
              const SizedBox(height: 16),
              TextFormField(controller: _priceCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Price (₵)', border: OutlineInputBorder()), validator: (v) => v?.isEmpty == true ? 'Required' : null),
              const SizedBox(height: 16),
              TextFormField(controller: _stockCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Stock Quantity', border: OutlineInputBorder()), validator: (v) => v?.isEmpty == true ? 'Required' : null),
              const SizedBox(height: 16),
              TextFormField(controller: _discountCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Discount (%) - optional', border: OutlineInputBorder())),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _submitting ? null : _submit,
                  child: _submitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Submit Product', style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
