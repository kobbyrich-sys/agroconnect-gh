import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/repositories/product_repository_impl.dart';

final _searchResultsProvider = FutureProvider.autoDispose.family<List, String>((ref, query) async {
  if (query.isEmpty) return [];
  final repo = ref.watch(productRepositoryProvider);
  return repo.search(query);
});

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchCtrl = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final resultsAsync = ref.watch(_searchResultsProvider(_query));

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchCtrl,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Search products...',
            border: InputBorder.none,
            suffixIcon: _searchCtrl.text.isNotEmpty
                ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtrl.clear(); setState(() => _query = ''); })
                : null,
          ),
          textInputAction: TextInputAction.search,
          onSubmitted: (v) => setState(() => _query = v.trim()),
          onChanged: (v) {
            setState(() {});
            if (v.length > 2) setState(() => _query = v.trim());
          },
        ),
      ),
      body: _query.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.search, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('Search for products', style: TextStyle(fontSize: 16, color: Colors.grey.shade500)),
                ],
              ),
            )
          : resultsAsync.when(
              data: (results) {
                if (results.isEmpty) {
                  return Center(child: Text('No results for "$_query"', style: TextStyle(color: Colors.grey.shade500)));
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: results.length,
                  itemBuilder: (context, index) {
                    final p = results[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: Container(
                          width: 48, height: 48,
                          decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(8)),
                          child: p.primaryImage != null
                              ? Image.network(p.primaryImage!, fit: BoxFit.cover)
                              : const Icon(Icons.image, color: Colors.grey),
                        ),
                        title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.w500)),
                        subtitle: Text('₵${p.retailPrice.toStringAsFixed(2)}', style: const TextStyle(color: Color(0xFF059669))),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push('/product/${p.id}'),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => const Center(child: Text('Search failed')),
            ),
    );
  }
}
