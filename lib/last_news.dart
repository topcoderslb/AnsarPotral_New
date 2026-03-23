import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'modern_app_bar.dart';
import 'services/api_service.dart';

class LastNewsPage extends StatefulWidget {
  const LastNewsPage({Key? key}) : super(key: key);

  @override
  State<LastNewsPage> createState() => _LastNewsPageState();
}

class _LastNewsPageState extends State<LastNewsPage> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _news = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNews();
  }

  Future<void> _loadNews() async {
    try {
      final data = await _apiService.getNews();
      setState(() {
        _news = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  /// Returns "23 / 03 / 2026"
  String _formatDate(dynamic dateValue) {
    if (dateValue == null || dateValue.toString().isEmpty) return '';
    try {
      final dt = DateTime.parse(dateValue.toString()).toLocal();
      return '${dt.day.toString().padLeft(2, '0')} / '
          '${dt.month.toString().padLeft(2, '0')} / '
          '${dt.year}';
    } catch (_) {
      return '';
    }
  }

  /// Returns "14:30"
  String _formatTime(dynamic dateValue) {
    if (dateValue == null || dateValue.toString().isEmpty) return '';
    try {
      final dt = DateTime.parse(dateValue.toString()).toLocal();
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: ModernAppBar(title: 'آخر الأخبار', showBackButton: false),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.deepOrange),
              ),
            )
          : _news.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.newspaper_rounded,
                          size: 64, color: Colors.grey.shade300),
                      const SizedBox(height: 16),
                      Text(
                        'لا توجد أخبار حالياً',
                        style: GoogleFonts.tajawal(
                          fontSize: 18,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadNews,
                  color: Colors.deepOrange,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 20),
                    itemCount: _news.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final item = _news[index];
                      final raw = item['published_at'] ?? item['publishedAt'];
                      return _NewsCard(
                        item: item,
                        dateText: _formatDate(raw),
                        timeText: _formatTime(raw),
                      );
                    },
                  ),
                ),
    );
  }
}

class _NewsCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final String dateText;
  final String timeText;

  const _NewsCard({
    required this.item,
    required this.dateText,
    required this.timeText,
  });

  @override
  Widget build(BuildContext context) {
    final title = item['title'] ?? '';
    final content = item['content'] ?? '';
    final imageUrl = item['image_url'] ?? item['imageUrl'] ?? '';
    final hasImage = imageUrl.toString().isNotEmpty;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.07),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image (optional)
            if (hasImage)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: CachedNetworkImage(
                  imageUrl: imageUrl,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(
                    color: Colors.grey.shade200,
                    child: const Center(
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(Colors.deepOrange),
                      ),
                    ),
                  ),
                  errorWidget: (_, __, ___) => Container(
                    color: Colors.grey.shade200,
                    child:
                        Icon(Icons.broken_image, color: Colors.grey.shade400),
                  ),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // Date + Time row
                  if (dateText.isNotEmpty || timeText.isNotEmpty)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        // Time badge
                        if (timeText.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.orange.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.access_time_rounded,
                                    size: 13, color: Colors.deepOrange),
                                const SizedBox(width: 4),
                                Text(
                                  timeText,
                                  style: GoogleFonts.tajawal(
                                    fontSize: 13,
                                    color: Colors.deepOrange,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        if (dateText.isNotEmpty && timeText.isNotEmpty)
                          const SizedBox(width: 8),
                        // Date badge
                        if (dateText.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.deepOrange.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.calendar_today_rounded,
                                    size: 13, color: Colors.deepOrange),
                                const SizedBox(width: 4),
                                Text(
                                  dateText,
                                  style: GoogleFonts.tajawal(
                                    fontSize: 13,
                                    color: Colors.deepOrange,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),

                  const SizedBox(height: 10),

                  // Title
                  Text(
                    title,
                    textAlign: TextAlign.right,
                    style: GoogleFonts.tajawal(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade900,
                      height: 1.4,
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Content
                  Text(
                    content,
                    textAlign: TextAlign.right,
                    style: GoogleFonts.tajawal(
                      fontSize: 15,
                      color: Colors.grey.shade700,
                      height: 1.6,
                    ),
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
