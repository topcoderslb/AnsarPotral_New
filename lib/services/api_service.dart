// API Service for Ansar Portal Flutter App
// Handles all HTTP operations for fetching dynamic content from the backend

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // Use 10.0.2.2 for Android emulator, localhost for web/desktop/iOS simulator
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000/api';
    }
    // For Android emulator, 10.0.2.2 maps to host machine's localhost
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000/api';
    }
    // For desktop (Windows/macOS/Linux) and iOS simulator
    return 'http://localhost:3000/api';
  }

  // ============= STORES =============

  Future<List<Map<String, dynamic>>> getStores() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/stores?active_only=1'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      print('Error fetching stores: ${response.statusCode}');
      return [];
    } catch (e) {
      print('Error fetching stores: $e');
      return [];
    }
  }

  Future<List<String>> getStoreCategories() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/store-categories'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => item['name'] as String).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching store categories: $e');
      return [];
    }
  }

  // ============= MUNICIPALITY STATEMENTS =============

  Future<List<Map<String, dynamic>>> getStatements() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/statements?active_only=1'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching statements: $e');
      return [];
    }
  }

  Future<List<String>> getStatementCategories() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/statement-categories'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => item['name'] as String).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching statement categories: $e');
      return [];
    }
  }

  // ============= LANDMARKS & TOURISM =============

  Future<List<Map<String, dynamic>>> getLandmarks() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/landmarks?active_only=1'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching landmarks: $e');
      return [];
    }
  }

  Future<List<String>> getCarouselImages() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/carousel?active_only=1'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data
            .map((item) => (item['image_url'] ?? item['imageUrl'] ?? '') as String)
            .where((url) => url.isNotEmpty)
            .toList();
      }
      return [];
    } catch (e) {
      print('Error fetching carousel images: $e');
      return [];
    }
  }

  // ============= ABOUT MUNICIPALITY =============

  Future<List<Map<String, dynamic>>> getAboutSections() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/about?active_only=1'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching about sections: $e');
      return [];
    }
  }

  // ============= COMPLAINTS =============

  Future<bool> submitComplaint({
    required String name,
    required String phone,
    required String complaintText,
    String? imageUrl,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/complaints'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'phone': phone,
          'complaintText': complaintText,
          'imageUrl': imageUrl,
        }),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error submitting complaint: $e');
      return false;
    }
  }

  // ============= APP SETTINGS =============

  Future<Map<String, dynamic>?> getAppSettings() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/settings'),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      print('Error fetching app settings: $e');
      return null;
    }
  }

  // ============= FILE UPLOAD =============

  Future<String?> uploadImage(XFile imageFile) async {
    try {
      final uri = Uri.parse('$baseUrl/upload');
      final request = http.MultipartRequest('POST', uri);
      final bytes = await imageFile.readAsBytes();
      request.files.add(
        http.MultipartFile.fromBytes(
          'image',
          bytes,
          filename: imageFile.name,
        ),
      );

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['url'] as String?;
      }
      print('Upload failed: ${response.body}');
      return null;
    } catch (e) {
      print('Error uploading image: $e');
      return null;
    }
  }
}
