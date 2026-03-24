import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'modern_app_bar.dart';
import 'services/api_service.dart';

class AboutMunicipalityPage extends StatefulWidget {
  const AboutMunicipalityPage({super.key});

  @override
  State<AboutMunicipalityPage> createState() => _AboutMunicipalityPageState();
}

class _AboutMunicipalityPageState extends State<AboutMunicipalityPage> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _sections = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSections();
  }

  Future<void> _loadSections() async {
    try {
      final sections = await _apiService.getAboutSections();
      setState(() {
        _sections = sections;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading about sections: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  IconData _getIconForSection(String icon) {
    // Map emoji/text icons to Material icons
    switch (icon) {
      case '🏛️':
      case 'work':
        return Icons.work;
      case '🔨':
      case 'construction':
        return Icons.construction;
      case '👥':
      case 'groups':
        return Icons.groups;
      case '📞':
      case 'contact_phone':
        return Icons.contact_phone;
      case '👁️':
      case 'visibility':
        return Icons.visibility;
      default:
        return Icons.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        appBar: ModernAppBar(title: 'عن البلدية', showBackButton: false),
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Colors.deepOrange),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: const ModernAppBar(title: 'عن البلدية', showBackButton: false),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final screenWidth = constraints.maxWidth;
          final isSmall = screenWidth < 360;
          final headerIconSize = isSmall ? 36.0 : 44.0;
          final headerTitleSize = (screenWidth * 0.065).clamp(20.0, 28.0);
          final headerSubSize = (screenWidth * 0.04).clamp(13.0, 16.0);
          return SingleChildScrollView(
            padding: EdgeInsets.all(screenWidth * 0.04),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Section
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.deepOrange.shade50,
                        Colors.orange.shade50
                      ],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.deepOrange.shade200),
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.deepOrange.shade100,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.account_balance,
                          size: headerIconSize,
                          color: Colors.deepOrange.shade700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'بلدية أنصار',
                        style: GoogleFonts.tajawal(
                          fontSize: headerTitleSize,
                          fontWeight: FontWeight.bold,
                          color: Colors.deepOrange.shade700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'المنصّة الرقميّة لبلدية أنصار',
                        style: GoogleFonts.tajawal(
                          fontSize: headerSubSize,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Dynamic Sections from API
                ..._sections.map((section) {
                  final title = section['title'] ?? '';
                  final icon = section['icon'] ?? '';
                  final content = section['content'];
                  List<String> contentList = [];

                  if (content is List) {
                    contentList = content.map((e) => e.toString()).toList();
                  } else if (content is String) {
                    contentList = [content];
                  }

                  return Column(
                    children: [
                      _buildSection(
                        title: title,
                        icon: _getIconForSection(icon),
                        content: contentList,
                      ),
                      const SizedBox(height: 24),
                    ],
                  );
                }),

                // Footer
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.favorite,
                        color: Colors.deepOrange.shade400,
                        size: 24,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'بلدية أنصار',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.deepOrange.shade700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'في خدمة المواطنين',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required IconData icon,
    required List<String> content,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.deepOrange.shade50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: Colors.deepOrange.shade700,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.deepOrange.shade700,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Section Content
          ...content.map((text) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 6, right: 8),
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: Colors.deepOrange.shade400,
                        shape: BoxShape.circle,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        text,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade700,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}
