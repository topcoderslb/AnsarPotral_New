import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'modern_app_bar.dart';
import 'services/api_service.dart';

class MunicipalityStatement {
  final String id;
  final String title;
  final String description;
  final List<String> imageUrls;
  final String date;
  final String category;

  MunicipalityStatement({
    required this.id,
    required this.title,
    required this.description,
    required this.imageUrls,
    required this.date,
    required this.category,
  });
}

class MunicipalityStatementsPage extends StatefulWidget {
  const MunicipalityStatementsPage({Key? key}) : super(key: key);

  @override
  _MunicipalityStatementsPageState createState() =>
      _MunicipalityStatementsPageState();
}

class _MunicipalityStatementsPageState
    extends State<MunicipalityStatementsPage> {
  final ApiService _apiService = ApiService();
  List<MunicipalityStatement> statements = [];
  String? selectedCategory;
  List<String> categories = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStatements();
  }

  Future<void> _loadStatements() async {
    try {
      final data = await _apiService.getStatements();
      setState(() {
        statements = data.map((item) {
          // Handle images - could be a list of image objects or URLs
          List<String> imageUrls = [];
          final images = item['images'] ?? item['imageUrls'];
          if (images is List) {
            imageUrls = images
                .map((img) {
                  if (img is Map) {
                    return (img['image_url'] ?? img['imageUrl'] ?? '')
                        as String;
                  }
                  return img.toString();
                })
                .where((url) => url.isNotEmpty)
                .toList();
          }

          return MunicipalityStatement(
            id: item['id']?.toString() ?? '',
            title: item['title'] ?? '',
            description: item['description'] ?? '',
            imageUrls: imageUrls,
            date: item['date'] ?? '',
            category: item['category'] ?? '',
          );
        }).toList();

        categories = statements.map((s) => s.category).toSet().toList();
        categories.insert(0, 'جميع البيانات');
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading statements: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showStatementPopup(MunicipalityStatement statement) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        final screenHeight = MediaQuery.of(context).size.height;
        final screenWidth = MediaQuery.of(context).size.width;
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
                  // Image Carousel in popup
                  if (statement.imageUrls.isNotEmpty)
                    Container(
                      height: MediaQuery.of(context).size.height * 0.3,
                      decoration: BoxDecoration(
                        borderRadius:
                            BorderRadius.vertical(top: Radius.circular(20)),
                      ),
                      child: ClipRRect(
                        borderRadius:
                            BorderRadius.vertical(top: Radius.circular(20)),
                        child: CarouselSlider(
                          options: CarouselOptions(
                            height: MediaQuery.of(context).size.height * 0.3,
                            viewportFraction: 1.0,
                            autoPlay: true,
                            autoPlayInterval: Duration(seconds: 4),
                            autoPlayAnimationDuration:
                                Duration(milliseconds: 1000),
                            autoPlayCurve: Curves.easeInOutCubic,
                            enlargeCenterPage: false,
                            scrollDirection: Axis.horizontal,
                          ),
                          items: statement.imageUrls.map((imageUrl) {
                            return CachedNetworkImage(
                              imageUrl: imageUrl,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (context, url) => Container(
                                color: Colors.grey.shade300,
                                child: Center(
                                  child: CircularProgressIndicator(
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.deepOrange),
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
                            );
                          }).toList(),
                        ),
                      ),
                    ),

                  // Statement Info in popup
                  Padding(
                    padding: EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Title and Category
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                statement.title,
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.deepOrange.shade700,
                                ),
                              ),
                            ),
                            Container(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.deepOrange.shade50,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                    color: Colors.deepOrange.shade200),
                              ),
                              child: Text(
                                statement.category,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.deepOrange.shade700,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),

                        SizedBox(height: 12),

                        // Date
                        Text(
                          'التاريخ: ${statement.date}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                            height: 1.2,
                            letterSpacing: 0.2,
                          ),
                        ),

                        SizedBox(height: 8),

                        // Description
                        Container(
                          width: double.infinity,
                          child: Text(
                            statement.description,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade600,
                              height: 1.5,
                              letterSpacing: 0.3,
                            ),
                            maxLines: 4,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.justify,
                          ),
                        ),

                        SizedBox(height: 20),

                        // Close Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => Navigator.of(context).pop(),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.deepOrange,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: EdgeInsets.symmetric(vertical: 15),
                            ),
                            child: Text(
                              'إغلاق',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
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
    if (_isLoading) {
      return Scaffold(
        appBar: ModernAppBar(title: 'بيانات البلدية', showBackButton: false),
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Colors.deepOrange),
          ),
        ),
      );
    }

    final filteredStatements =
        selectedCategory == null || selectedCategory == 'جميع البيانات'
            ? statements
            : statements.where((s) => s.category == selectedCategory).toList();

    return Scaffold(
      appBar: ModernAppBar(title: 'بيانات البلدية', showBackButton: false),
      body: Column(
        children: [
          // Category Filter
          Container(
            height: 44,
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
                      });
                    },
                    child: Container(
                      margin: EdgeInsets.only(right: 8),
                      padding:
                          EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? Colors.deepOrange : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected
                              ? Colors.deepOrange
                              : Colors.grey.shade300,
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 4,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        category,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.deepOrange,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          height: 1.2,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          SizedBox(height: 16),

          // Statements List
          Expanded(
            child: filteredStatements.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.description_outlined,
                          size: 64,
                          color: Colors.grey.shade400,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'لا توجد بيانات',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filteredStatements.length,
                    itemBuilder: (context, index) {
                      final statement = filteredStatements[index];
                      return _buildStatementCard(statement);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatementCard(MunicipalityStatement statement) {
    return GestureDetector(
      onTap: () => _showStatementPopup(statement),
      child: Container(
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
            // Statement Image with Carousel
            if (statement.imageUrls.isNotEmpty)
              Container(
                height: MediaQuery.of(context).size.height * 0.22,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                  child: CarouselSlider(
                    options: CarouselOptions(
                      height: MediaQuery.of(context).size.height * 0.22,
                      viewportFraction: 1.0,
                      autoPlay: true,
                      autoPlayInterval: Duration(seconds: 3),
                      autoPlayAnimationDuration: Duration(milliseconds: 800),
                      autoPlayCurve: Curves.fastOutSlowIn,
                      enlargeCenterPage: false,
                      scrollDirection: Axis.horizontal,
                    ),
                    items: statement.imageUrls.map((imageUrl) {
                      return CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        placeholder: (context, url) => Container(
                          color: Colors.grey.shade300,
                          child: Center(
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.deepOrange),
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
                      );
                    }).toList(),
                  ),
                ),
              ),

            // Statement Info
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Category
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 3,
                        child: Text(
                          statement.title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.deepOrange.shade700,
                            height: 1.4,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),
                      SizedBox(width: 8),
                      Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.deepOrange.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.deepOrange.shade200),
                        ),
                        child: Text(
                          statement.category,
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.deepOrange.shade700,
                            fontWeight: FontWeight.bold,
                            height: 1.2,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 8),

                  // Date
                  Text(
                    'التاريخ: ${statement.date}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),

                  SizedBox(height: 8),

                  // Description
                  Text(
                    statement.description,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade600,
                      height: 1.3,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),

                  // Tap indicator
                  SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.touch_app,
                        color: Colors.deepOrange.shade400,
                        size: 16,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'اضغط لعرض التفاصيل',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.deepOrange.shade400,
                          fontWeight: FontWeight.w500,
                          height: 1.2,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
