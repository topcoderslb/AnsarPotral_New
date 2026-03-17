import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'modern_app_bar.dart';
import 'services/api_service.dart';

class StoreDetailsPage extends StatefulWidget {
  final int storeId;

  const StoreDetailsPage({Key? key, required this.storeId}) : super(key: key);

  @override
  _StoreDetailsPageState createState() => _StoreDetailsPageState();
}

class _StoreDetailsPageState extends State<StoreDetailsPage> {
  Map<String, dynamic>? storeDetails;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    fetchStoreDetails();
  }

  Future<void> fetchStoreDetails() async {
    try {
      final response = await http.get(
        Uri.parse(
            '${ApiService.baseUrl}/stores?id=${widget.storeId}'),
      );
      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        setState(() {
          storeDetails = jsonResponse;
        });
      } else {
        throw Exception('Failed to load store details');
      }
    } catch (error) {
      print('Error fetching store details: $error');
    }
  }

  Widget _buildImageSlider() {
    final screenHeight = MediaQuery.of(context).size.height;
    // Support both 'images' array (old API) and single 'image_url' (new API)
    List<String> images = [];
    final imagesField = storeDetails!['images'];
    if (imagesField is List && imagesField.isNotEmpty) {
      images = imagesField.map((img) {
        if (img is Map) return (img['image_url'] ?? img['imageUrl'] ?? '').toString();
        return img.toString();
      }).where((url) => url.isNotEmpty).toList();
    }
    if (images.isEmpty) {
      final singleUrl = storeDetails!['image_url'] ?? storeDetails!['imageUrl'] ?? '';
      if (singleUrl.isNotEmpty) images = [singleUrl];
    }
    if (images.isEmpty) {
      return Container(
        height: screenHeight * 0.3,
        color: Colors.grey.shade200,
        child: Center(
          child: Icon(Icons.store, color: Colors.grey.shade400, size: 48),
        ),
      );
    }
    return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Stack(
            children: [
              Container(
                height: screenHeight * 0.35,
                child: PageView.builder(
                  itemCount: images.length,
                  onPageChanged: (index) {
                    setState(() {
                      _currentIndex = index;
                    });
                  },
                  itemBuilder: (context, index) {
                    final imgUrl = images[index];
                    if (imgUrl.isEmpty) {
                      return Container(
                        color: Colors.grey.shade200,
                        child: Icon(Icons.image_not_supported, color: Colors.grey),
                      );
                    }
                    return CachedNetworkImage(
                      imageUrl: imgUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Center(
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.deepOrange),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey.shade200,
                        child: Icon(Icons.image_not_supported, color: Colors.grey, size: 40),
                      ),
                    );
                  },
                ),
              ),

        Positioned(
          top: 16,
          left: 16,
          child: SafeArea(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.deepOrange[700],
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 16,
          right: 16,
          child: Container(
            padding: EdgeInsets.symmetric(vertical: 4, horizontal: 8),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '${_currentIndex + 1}/${images.length}',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
              ),
            ),
          ),
        ),
      ],
    ),
    ]);
  }

  Widget _buildDetailRow(IconData icon, String value, String? url, String? phone) {
    return Row(
      children: [
        Icon(icon, size: 28, color: Colors.deepOrange),
        SizedBox(width: 12),
        Expanded(
          child: InkWell(
            onTap: () {
              if (url != null && url.isNotEmpty) {
                _launchURL(url);
              } else if (phone != null && phone.isNotEmpty) {
                _launchPhone(phone);
              }
            },
            child: Text(
              value,
              style: TextStyle(fontSize: 15),
              overflow: TextOverflow.ellipsis,
              maxLines: 2,
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: ModernAppBar(title: storeDetails?['store_name'] ?? 'Store Details'),
      body: storeDetails != null
          ? SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildImageSlider(),
            Padding(
              padding: EdgeInsets.all(0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    color: Colors.grey.shade900,
                    padding:
                    EdgeInsets.symmetric(vertical: 12, horizontal: 15),
                    child: Text(
                      storeDetails!['store_name'] ?? storeDetails!['name'] ?? '',
                      style: TextStyle(
                        fontSize: 20,
                        
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  SizedBox(height: 8),
                  Padding(
                    padding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          storeDetails!['description'] ?? '',
                          style:
                          TextStyle(fontSize: 15),
                        ),
                        SizedBox(height: 15),
                        Container(
                          height: 1,
                          color: Colors.grey.shade900,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 10),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: _buildDetailRow(Icons.store,
                        storeDetails!['category_name'] ?? storeDetails!['category'] ?? '', null, null),
                  ),
                  SizedBox(height: 15),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: _buildDetailRow(
                      Icons.phone_android,
                      storeDetails!['phone_number'] ?? '',
                      null,
                      storeDetails!['phone_number'] ?? '',
                    ),
                  ),
                  SizedBox(height: 15),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: InkWell(
                      onTap: () {
                        // Add code to open map with store location
                      },
                      child: _buildDetailRow(Icons.location_on,
                          storeDetails!['location'] ?? '', null, null),
                    ),
                  ),
                  SizedBox(height: 20),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildSocialIcon('assets/facebook.png', storeDetails!['facebook_url']),
                      _buildSocialIcon('assets/instagram.png', storeDetails!['instagram_url']),
                      _buildSocialIcon('assets/whatsapp.png', storeDetails!['whatsapp_number']),
                      _buildSocialIcon('assets/tiktok.png', storeDetails!['tiktok_url']),
                    ],
                  ),
                  ),
                  SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      )
          : Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Colors.deepOrange),
        ),
      ),
    );
  }

  Widget _buildSocialIcon(String assetPath, String? url) {
    final screenWidth = MediaQuery.of(context).size.width;
    final iconSize = (screenWidth * 0.09).clamp(28.0, 44.0);
    return IconButton(
      icon: Image.asset(
        assetPath,
        width: iconSize,
        height: iconSize,
        errorBuilder: (context, error, stackTrace) =>
            Icon(Icons.link, size: iconSize, color: Colors.grey),
      ),
      iconSize: iconSize,
      onPressed: (url != null && url.isNotEmpty)
          ? () => _launchURL(url)
          : null,
    );
  }

  Future<void> _launchURL(String url) async {
    Uri uri = Uri.parse(url);
      await launchUrl(uri);
  }

  // Function to launch phone app with the provided number
  void _launchPhone(String phoneNumber) async {
    final Uri phoneLaunchUri = Uri(scheme: 'tel', path: phoneNumber);
      await launchUrl(phoneLaunchUri);
  }
}
