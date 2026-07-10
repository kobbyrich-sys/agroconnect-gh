import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});

  Future<void> _call(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  Future<void> _email(String address) async {
    final uri = Uri.parse('mailto:$address');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Support')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.phone, color: Color(0xFF059669))),
                title: const Text('Call Support'),
                subtitle: const Text('+233 XX XXX XXXX'),
                trailing: const Icon(Icons.phone),
                onTap: () => _call('+233XX'),
              ),
            ),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.email, color: Color(0xFF059669))),
                title: const Text('Email Us'),
                subtitle: const Text('support@agroconnectgh.com'),
                trailing: const Icon(Icons.email),
                onTap: () => _email('support@agroconnectgh.com'),
              ),
            ),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.chat, color: Color(0xFF059669))),
                title: const Text('Live Chat'),
                subtitle: const Text('Chat with our support team'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Live chat coming soon!')),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Column(
                children: [
                  Icon(Icons.info, color: Color(0xFF059669), size: 32),
                  SizedBox(height: 8),
                  Text('Response Time', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                  SizedBox(height: 4),
                  Text('We typically respond within 24 hours during business days.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
