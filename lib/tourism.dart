import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:carousel_slider/carousel_slider.dart' as carousel;
import 'package:flutter/widgets.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'modern_app_bar.dart';
import 'services/api_service.dart';

class TourismPage extends StatefulWidget {
  const TourismPage({super.key});

  @override
  _TourismPageState createState() => _TourismPageState();
}

class _TourismPageState extends State<TourismPage> {
  final ApiService _apiService = ApiService();
  List<String> _carouselImages = [];
  List<Map<String, dynamic>> _landmarks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final images = await _apiService.getCarouselImages();
      final landmarks = await _apiService.getLandmarks();
      setState(() {
        _carouselImages = images;
        _landmarks = landmarks;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading tourism data: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        appBar: ModernAppBar(title: 'ANSAR'),
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Colors.deepOrange),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: const ModernAppBar(title: 'ANSAR'),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final screenHeight = constraints.maxHeight;
          final carouselHeight = (screenHeight * 0.58).clamp(300.0, 560.0);
          return ListView(
            children: [
              // Section 1: About Ansar - Modern Carousel Slider
              if (_carouselImages.isNotEmpty)
                Container(
                  margin:
                      const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: carousel.CarouselSlider(
                      options: carousel.CarouselOptions(
                        aspectRatio: 4 / 5.5,
                        autoPlay: true,
                        autoPlayInterval: const Duration(seconds: 4),
                        autoPlayAnimationDuration:
                            const Duration(milliseconds: 1000),
                        autoPlayCurve: Curves.easeInOutCubic,
                        enlargeCenterPage: true,
                        viewportFraction: 0.85,
                        height: carouselHeight,
                      ),
                      items: _carouselImages.map((imageUrl) {
                        return _buildModernCarouselItem(imageUrl);
                      }).toList(),
                    ),
                  ),
                ),
              const SizedBox(height: 10),
              // Section 2: Places or Monuments - Cards
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Center(
                      child: Text(
                        'معالم انصار',
                        style: TextStyle(
                          fontSize: 20.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16.0),
                    ..._landmarks.map((landmark) {
                      final name = landmark['name'] ?? landmark['title'] ?? '';
                      final imageUrl =
                          landmark['image_url'] ?? landmark['imageUrl'] ?? '';
                      final phone = landmark['phone_number'] ??
                          landmark['phoneNumber'] ??
                          '';
                      final hasCall = landmark['has_call_button'] == true ||
                          landmark['has_call_button'] == 1 ||
                          landmark['hasCallButton'] == true;

                      return Column(
                        children: [
                          if (hasCall && phone.isNotEmpty)
                            _buildPlaceCardWithCall(name, imageUrl, phone)
                          else
                            _buildPlaceCard(name, imageUrl),
                          const SizedBox(height: 16.0),
                        ],
                      );
                    }),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildModernCarouselItem(String imageUrl) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 5),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 15,
              offset: const Offset(0, 8),
              spreadRadius: 2,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(15),
          child: Stack(
            children: [
              CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                width: double.infinity,
                height: double.infinity,
                placeholder: (context, url) => Container(
                  color: Colors.grey.shade300,
                  child: const Center(
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.deepOrange),
                    ),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  color: Colors.grey.shade300,
                  child: Icon(Icons.error, color: Colors.grey.shade600),
                ),
              ),
              // Gradient overlay for better text visibility
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.3),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceCardWithCall(
      String title, String imageUrl, String phoneNumber) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (imageUrl.isNotEmpty)
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 220),
              child: CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                width: double.infinity,
                placeholder: (context, url) => Container(
                  height: 200,
                  color: Colors.grey.shade300,
                  child: const Center(
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.deepOrange),
                    ),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  height: 200,
                  color: Colors.grey.shade300,
                  child: Icon(Icons.image_not_supported,
                      color: Colors.grey.shade600, size: 40),
                ),
              ),
            )
          else
            Container(
              height: 150,
              color: Colors.grey.shade200,
              child:
                  Icon(Icons.landscape, color: Colors.grey.shade400, size: 48),
            ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16.0,
                    ),
                  ),
                ),
                const SizedBox(height: 8.0),
                Center(
                  child: ElevatedButton.icon(
                    onPressed: () => _makePhoneCall(phoneNumber),
                    icon: const Icon(Icons.phone, color: Colors.white),
                    label: const Text(
                      'اتصل الآن',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 10),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceCard(String title, String imageUrl) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (imageUrl.isNotEmpty)
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 220),
              child: CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                width: double.infinity,
                placeholder: (context, url) => Container(
                  height: 200,
                  color: Colors.grey.shade300,
                  child: const Center(
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.deepOrange),
                    ),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  height: 200,
                  color: Colors.grey.shade300,
                  child: Icon(Icons.image_not_supported,
                      color: Colors.grey.shade600, size: 40),
                ),
              ),
            )
          else
            Container(
              height: 150,
              color: Colors.grey.shade200,
              child:
                  Icon(Icons.landscape, color: Colors.grey.shade400, size: 48),
            ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16.0,
                    ),
                  ),
                ),
                const SizedBox(height: 8.0),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _makePhoneCall(String phoneNumber) async {
    final Uri phoneUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(phoneUri)) {
      await launchUrl(phoneUri);
    } else {
      print('Could not launch phone app');
    }
  }
}
