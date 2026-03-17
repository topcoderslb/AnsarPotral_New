import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:AnsarPortal/store_details.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'modern_app_bar.dart';
import 'package:url_launcher/url_launcher.dart';
import 'services/api_service.dart';

class Shop {
  final int id;
  final String name;
  final String description;
  final String category;
  final String phoneNumber;
  final String whatsappNumber;
  final String imageUrl;
  final String location;

  Shop({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.phoneNumber,
    required this.whatsappNumber,
    required this.imageUrl,
    required this.location,
  });
}

class StoresPage extends StatefulWidget {
  const StoresPage({Key? key}) : super(key: key);

  @override
  _StoresPageState createState() => _StoresPageState();
}

class _StoresPageState extends State<StoresPage> {
  List<Shop> shops = [];
  List<Shop> filteredShops = [];
  List<String> categories = [];
  String? selectedCategory;
  final TextEditingController _searchController = TextEditingController();
  bool _isLoading = true;
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _loadShopsFromApi();
  }

  Future<void> _loadShopsFromApi() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final storesData = await _apiService.getStores();
      
      shops = storesData.map((data) => Shop(
        id: int.tryParse(data['id']?.toString() ?? '0') ?? 0,
        name: data['name'] ?? '',
        description: data['description'] ?? '',
        category: data['category'] ?? '',
        phoneNumber: data['phone_number'] ?? data['phoneNumber'] ?? '',
        whatsappNumber: data['whatsapp_number'] ?? data['whatsappNumber'] ?? '',
        imageUrl: data['image_url'] ?? data['imageUrl'] ?? '',
        location: data['location'] ?? '',
      )).toList();

      // Extract unique categories from loaded shops
      categories = shops.map((shop) => shop.category).toSet().toList();
      categories.insert(0, 'جميع المتاجر');

      setState(() {
        filteredShops = List.from(shops);
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading shops: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _filterShops() {
    setState(() {
      filteredShops = shops.where((shop) {
        bool matchesSearch = shop.name.toLowerCase().contains(_searchController.text.toLowerCase()) ||
                           shop.description.toLowerCase().contains(_searchController.text.toLowerCase());
        bool matchesCategory = selectedCategory == null || 
                              selectedCategory == 'جميع المتاجر' || 
                              shop.category == selectedCategory;
        return matchesSearch && matchesCategory;
      }).toList();
    });
  }

  void _makePhoneCall(String phoneNumber) async {
    final Uri phoneUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(phoneUri)) {
      await launchUrl(phoneUri);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('لا يمكن الاتصال بالرقم')),
      );
    }
  }

  void _openWhatsApp(String phoneNumber) async {
    final Uri whatsappUri = Uri.parse('https://wa.me/$phoneNumber');
    if (await canLaunchUrl(whatsappUri)) {
      await launchUrl(whatsappUri);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('لا يمكن فتح واتساب')),
      );
    }
  }

  void _showShopPopup(BuildContext context, Shop shop) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: EdgeInsets.symmetric(
            horizontal: screenWidth * 0.05,
            vertical: screenHeight * 0.05,
          ),
          child: Container(
            constraints: BoxConstraints(
              maxHeight: screenHeight * 0.85,
              maxWidth: screenWidth * 0.95,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: 20,
                  offset: Offset(0, 10),
                ),
              ],
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Shop Image
                  if (shop.imageUrl.isNotEmpty)
                  Container(
                    height: screenHeight * 0.25,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                      child: CachedNetworkImage(
                        imageUrl: shop.imageUrl,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        placeholder: (context, url) => Container(
                          color: Colors.grey.shade300,
                          child: Center(
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.deepOrange),
                            ),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: Colors.grey.shade300,
                          child: Icon(
                            Icons.error,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ),
                    ),
                  ),
                  
                  // Shop Info
                  Padding(
                    padding: EdgeInsets.all(16), // Reduced padding
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Shop Name and Category
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                shop.name,
                                style: TextStyle(
                                  fontSize: 20, // Reduced font size
                                  fontWeight: FontWeight.bold,
                                  
                                  color: Colors.deepOrange.shade700,
                                ),
                              ),
                            ),
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.deepOrange.shade50,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.deepOrange.shade200),
                              ),
                              child: Text(
                                shop.category,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.deepOrange.shade700,
                                  
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),

                        SizedBox(height: 8), // Reduced spacing

                        // Location
                        if (shop.location.isNotEmpty)
                          Padding(
                            padding: EdgeInsets.only(bottom: 8),
                            child: Row(
                              children: [
                                Icon(Icons.location_on, size: 18, color: Colors.deepOrange),
                                SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    shop.location,
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey.shade700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                        // Description
                        Text(
                          shop.description,
                          style: TextStyle(
                            fontSize: 14, // Reduced font size
                            color: Colors.grey.shade600,
                            
                            height: 1.3,
                          ),
                          textAlign: TextAlign.justify,
                        ),

                        SizedBox(height: 16), // Reduced spacing

                        // Contact Buttons
                        Row(
                          children: [
                            // Call Button
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                  _makePhoneCall(shop.phoneNumber);
                                },
                                icon: Icon(Icons.phone, color: Colors.white, size: 18),
                                label: Text(
                                  'اتصال',
                                  style: TextStyle(
                                    color: Colors.white,
                                    
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  padding: EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),

                            SizedBox(width: 10),

                            // WhatsApp Button
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                  _openWhatsApp(shop.whatsappNumber);
                                },
                                icon: Icon(Icons.message, color: Colors.white, size: 18),
                                label: Text(
                                  'واتساب',
                                  style: TextStyle(
                                    color: Colors.white,
                                    
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color(0xFF25D366),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  padding: EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),
                          ],
                        ),

                        SizedBox(height: 12), // Reduced spacing

                        // Close Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => Navigator.of(context).pop(),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey.shade200,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding: EdgeInsets.symmetric(vertical: 10),
                            ),
                            child: Text(
                              'إغلاق',
                              style: TextStyle(
                                color: Colors.grey.shade700,
                                
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: ModernAppBar(title: 'قسم المتاجر'),
      body: Column(
        children: [
          SizedBox(height: 10),
          
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => _filterShops(),
              decoration: InputDecoration(
                hintText: 'البحث في المتاجر...',
                hintStyle: TextStyle(),
                prefixIcon: Icon(Icons.search, color: Colors.deepOrange),
                suffixIcon: IconButton(
                  icon: Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _filterShops();
                  },
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.deepOrange, width: 2),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
            ),
          ),

                     // Category Filter - Horizontally scrollable
           Container(
             height: 60,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
               padding: EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                 children: categories.map((category) {
                   final isSelected = selectedCategory == category;
                   
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          selectedCategory = isSelected ? null : category;
                         _filterShops();
                        });
                      },
                      child: Container(
                       margin: EdgeInsets.only(right: 12),
                       padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        decoration: BoxDecoration(
                         color: isSelected ? Colors.deepOrange : Colors.white,
                         borderRadius: BorderRadius.circular(30),
                         border: Border.all(
                           color: isSelected ? Colors.deepOrange : Colors.grey.shade300,
                           width: 1.5,
                         ),
                         boxShadow: [
                           BoxShadow(
                             color: Colors.black.withOpacity(0.1),
                             blurRadius: 6,
                             offset: Offset(0, 3),
                           ),
                         ],
                       ),
                       child: Center(
                        child: Text(
                          category,
                           style: TextStyle(
                             color: isSelected ? Colors.white : Colors.deepOrange,
                             
                             fontWeight: FontWeight.bold,
                             fontSize: 14,
                           ),
                         ),
                        ),
                      ),
                    );
                  }).toList(),
              ),
            ),
          ),

          SizedBox(height: 16),

          // Shops List
          Expanded(
            child: filteredShops.isEmpty
                ? Center(
            child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
              children: [
                        Icon(
                          Icons.store_outlined,
                          size: 64,
                          color: Colors.grey.shade400,
                        ),
                        SizedBox(height: 16),
                Text(
                          'لا توجد متاجر',
                  style: TextStyle(
                    fontSize: 18,
                            color: Colors.grey.shade600,
                    
                  ),
                ),
              ],
            ),
          )
                : ListView.builder(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filteredShops.length,
              itemBuilder: (context, index) {
                      final shop = filteredShops[index];
                      return _buildShopCard(shop);
                    },
                  ),
          ),
        ],
                        ),
                      );
                    }

  Widget _buildShopCard(Shop shop) {
    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: Offset(0, 5),
          ),
        ],
      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                     // Shop Image - Tappable for popup
           GestureDetector(
             onTap: () => _showShopPopup(context, shop),
             child: Container(
               height: MediaQuery.of(context).size.height * 0.22,
               decoration: BoxDecoration(
                 borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
               ),
                            child: ClipRRect(
                 borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                 child: Stack(
                   children: [
                     shop.imageUrl.isNotEmpty
                     ? CachedNetworkImage(
                       imageUrl: shop.imageUrl,
                                fit: BoxFit.cover,
                       width: double.infinity,
                       height: double.infinity,
                       placeholder: (context, url) => Container(
                         color: Colors.grey.shade300,
                         child: Center(
                           child: CircularProgressIndicator(
                             valueColor: AlwaysStoppedAnimation<Color>(Colors.deepOrange),
                           ),
                         ),
                       ),
                       errorWidget: (context, url, error) => Container(
                         color: Colors.grey.shade300,
                         child: Icon(
                           Icons.image_not_supported,
                           color: Colors.grey.shade600,
                           size: 40,
                         ),
                       ),
                     )
                     : Container(
                       color: Colors.grey.shade200,
                       child: Center(
                         child: Icon(Icons.store, color: Colors.grey.shade400, size: 48),
                       ),
                     ),
                     // Zoom indicator
                     Positioned(
                       top: 8,
                       right: 8,
                       child: Container(
                         padding: EdgeInsets.all(6),
                         decoration: BoxDecoration(
                           color: Colors.black.withOpacity(0.6),
                           borderRadius: BorderRadius.circular(20),
                         ),
                         child: Icon(
                           Icons.zoom_in,
                           color: Colors.white,
                           size: 16,
                         ),
                       ),
                     ),
                   ],
                 ),
                              ),
                            ),
                          ),

          // Shop Info
                          Padding(
                            padding: EdgeInsets.all(16),
            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Shop Name and Category
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                      child: Text(
                        shop.name,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          
                          color: Colors.deepOrange.shade700,
                        ),
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.deepOrange.shade50,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.deepOrange.shade200),
                      ),
                      child: Text(
                        shop.category,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.deepOrange.shade700,
                          
                                            fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 8),

                // Location
                if (shop.location.isNotEmpty)
                  Padding(
                    padding: EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        Icon(Icons.location_on, size: 16, color: Colors.deepOrange),
                        SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            shop.location,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey.shade700,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),

                // Description
                Text(
                  shop.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                    
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),

                SizedBox(height: 16),

                // Contact Buttons
                Row(
                                  children: [
                    // Call Button
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _makePhoneCall(shop.phoneNumber),
                        icon: Icon(Icons.phone, color: Colors.white, size: 18),
                        label: Text(
                          'اتصال',
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
                          padding: EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),

                    SizedBox(width: 12),

                    // WhatsApp Button
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _openWhatsApp(shop.whatsappNumber),
                        icon: Icon(Icons.message, color: Colors.white, size: 18),
                        label: Text(
                          'واتساب',
                          style: TextStyle(
                            color: Colors.white,
                            
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Color(0xFF25D366),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          padding: EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
