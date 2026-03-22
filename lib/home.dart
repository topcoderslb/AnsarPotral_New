import 'dart:ui';
import 'package:AnsarPortal/tourism.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:google_fonts/google_fonts.dart';

import 'municipality_statements.dart';
import 'complaints.dart';
import 'stores.dart';
import 'about_municipality.dart';

class HomePage extends StatefulWidget {
  final void Function(int)? onNavigateToTab;

  const HomePage({Key? key, this.onNavigateToTab}) : super(key: key);

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late AnimationController _scaleController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
        CurvedAnimation(parent: _slideController, curve: Curves.easeOutCubic));
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.elasticOut),
    );

    _fadeController.forward();
    _slideController.forward();
    _scaleController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;

    return Scaffold(
      body: Stack(
        children: [
          // New background image
          Positioned.fill(
            child: Image.asset(
              'assets/BG.png',
              fit: BoxFit.cover,
            ),
          ),
          // Soft gradient overlay for readability
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.15),
                    Colors.black.withOpacity(0.30),
                    Colors.black.withOpacity(0.55),
                  ],
                  stops: const [0.0, 0.4, 1.0],
                ),
              ),
            ),
          ),

          // Main content
          SafeArea(
            child: SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight:
                      screenSize.height - MediaQuery.of(context).padding.top,
                ),
                child: IntrinsicHeight(
                  child: Column(
                    children: [
                      // Header section with animations
                      _buildAnimatedHeader(screenSize),

                      // Push buttons to bottom of screen
                      const Spacer(flex: 10),

                      // Navigation cards section
                      _buildNavigationSection(screenSize),

                      SizedBox(height: screenSize.height * 0.03),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedHeader(Size screenSize) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: Container(
          padding: EdgeInsets.symmetric(
              horizontal: screenSize.width * 0.05, vertical: 15),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Share button
              _buildGlassmorphicButton(
                icon: Icons.share_rounded,
                onPressed: () {
                  Share.share(
                      'Check out this awesome app! Download it here: https://play.google.com/store/apps/details?id=com.topcoders.ansarportal');
                },
                screenSize: screenSize,
              ),

              // Menu button
              _buildGlassmorphicButton(
                icon: Icons.menu_rounded,
                onPressed: () => _showModernMenu(context),
                screenSize: screenSize,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGlassmorphicButton({
    required IconData icon,
    required VoidCallback onPressed,
    required Size screenSize,
  }) {
    final buttonSize = screenSize.width * 0.12;

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: buttonSize,
          height: buttonSize,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: Colors.white.withOpacity(0.15),
            border: Border.all(
              color: Colors.white.withOpacity(0.3),
              width: 1.5,
            ),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: onPressed,
              child: Icon(
                icon,
                color: Colors.white,
                size: buttonSize * 0.45,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeSection(Size screenSize) {
    // Clean landing page — no text, no logo
    return const SizedBox.shrink();
  }

  Widget _buildNavigationSection(Size screenSize) {
    final rowSpacing = screenSize.height * 0.04;
    final colSpacing = screenSize.width * 0.05;

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: screenSize.width * 0.06,
        vertical: screenSize.height * 0.02,
      ),
      child: Column(
        children: [
          // Row 1 — 3 items
          Row(
            children: [
              Expanded(
                child: _buildFloatingButton(
                  icon: Icons.store_rounded,
                  label: 'المتاجر',
                  onTap: () {
                    if (widget.onNavigateToTab != null) {
                      widget.onNavigateToTab!(1);
                    } else {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const StoresPage()));
                    }
                  },
                  delay: 0,
                  screenSize: screenSize,
                ),
              ),
              SizedBox(width: colSpacing),
              Expanded(
                child: _buildFloatingButton(
                  icon: Icons.description_rounded,
                  label: 'بيانات البلدية',
                  onTap: () {
                    if (widget.onNavigateToTab != null) {
                      widget.onNavigateToTab!(2);
                    } else {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const MunicipalityStatementsPage()));
                    }
                  },
                  delay: 100,
                  screenSize: screenSize,
                ),
              ),
              SizedBox(width: colSpacing),
              Expanded(
                child: _buildFloatingButton(
                  icon: Icons.feedback_rounded,
                  label: 'تقديم الشكاوى',
                  onTap: () {
                    if (widget.onNavigateToTab != null) {
                      widget.onNavigateToTab!(3);
                    } else {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const ComplaintsPage()));
                    }
                  },
                  delay: 200,
                  screenSize: screenSize,
                ),
              ),
            ],
          ),

          SizedBox(height: rowSpacing),

          // Row 2 — 2 items centered
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: (screenSize.width - screenSize.width * 0.12 - colSpacing) / 3,
                child: _buildFloatingButton(
                  icon: FontAwesomeIcons.buildingColumns,
                  label: 'أنصار',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => TourismPage()),
                  ),
                  delay: 300,
                  isFontAwesome: true,
                  screenSize: screenSize,
                ),
              ),
              SizedBox(width: colSpacing),
              SizedBox(
                width: (screenSize.width - screenSize.width * 0.12 - colSpacing) / 3,
                child: _buildFloatingButton(
                  icon: Icons.info_rounded,
                  label: 'عن البلدية',
                  onTap: () {
                    if (widget.onNavigateToTab != null) {
                      widget.onNavigateToTab!(4);
                    } else {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const AboutMunicipalityPage()));
                    }
                  },
                  delay: 400,
                  screenSize: screenSize,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    required int delay,
    bool isFontAwesome = false,
    required Size screenSize,
  }) {
    final iconSize = screenSize.width * 0.075;
    final fontSize = (screenSize.width * 0.034).clamp(12.0, 15.0);

    return TweenAnimationBuilder<double>(
      duration: Duration(milliseconds: 500 + delay),
      tween: Tween(begin: 0.0, end: 1.0),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 24 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: _PressableCard(
              onTap: onTap,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Icon with subtle glow
                  Container(
                    width: iconSize * 1.8,
                    height: iconSize * 1.8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.deepOrange.withOpacity(0.3),
                          blurRadius: 18,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                    child: Center(
                      child: isFontAwesome
                          ? FaIcon(
                              icon,
                              size: iconSize,
                              color: Colors.white,
                              shadows: [
                                Shadow(
                                  color: Colors.black.withOpacity(0.5),
                                  offset: const Offset(0, 2),
                                  blurRadius: 8,
                                ),
                              ],
                            )
                          : Icon(
                              icon,
                              size: iconSize,
                              color: Colors.white,
                              shadows: [
                                Shadow(
                                  color: Colors.black.withOpacity(0.5),
                                  offset: const Offset(0, 2),
                                  blurRadius: 8,
                                ),
                              ],
                            ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Label
                  Text(
                    label,
                    style: GoogleFonts.tajawal(
                      color: Colors.white,
                      fontSize: fontSize,
                      fontWeight: FontWeight.w600,
                      height: 1.3,
                      shadows: [
                        Shadow(
                          color: Colors.black.withOpacity(0.7),
                          offset: const Offset(0, 1),
                          blurRadius: 6,
                        ),
                        Shadow(
                          color: Colors.black.withOpacity(0.3),
                          offset: const Offset(0, 2),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _showModernMenu(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  color: Colors.white.withOpacity(0.92),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildModernMenuItem(
                      icon: Icons.info_rounded,
                      title: 'Our Service',
                      onTap: () {
                        Navigator.of(context).pop();
                        _showOurServiceDialog(context);
                      },
                    ),
                    Divider(height: 1, color: Colors.grey.shade200),
                    _buildModernMenuItem(
                      icon: Icons.supervised_user_circle_rounded,
                      title: 'About Us',
                      onTap: () {
                        Navigator.of(context).pop();
                        _showAboutUsDialog(context);
                      },
                    ),
                    Divider(height: 1, color: Colors.grey.shade200),
                    _buildModernMenuItem(
                      icon: Icons.email_rounded,
                      title: 'Contact Us',
                      onTap: () {
                        Navigator.of(context).pop();
                        _launchEmail();
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildModernMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: Colors.deepOrange.withOpacity(0.1),
                ),
                child: Icon(icon, color: Colors.deepOrange, size: 20),
              ),
              const SizedBox(width: 16),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.black87,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Keep all existing helper methods unchanged
  String? encodeQueryParameters(Map<String, String> params) {
    return params.entries
        .map((e) =>
            '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')
        .join('&');
  }

  Widget _buildPlaceCard(String title, String imageUrl) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final imgSize = constraints.maxWidth * 0.45;
        return Column(
          children: [
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipOval(
                child: Image.asset(
                  imageUrl,
                  fit: BoxFit.cover,
                  width: imgSize.clamp(80.0, 200.0),
                  height: imgSize.clamp(80.0, 200.0),
                ),
              ),
            ),
            const SizedBox(height: 15.0),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16.0,
                color: Colors.black87,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        );
      },
    );
  }

  void _showOurServiceDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  color: Colors.white.withOpacity(0.94),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'ANSAR',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.deepOrange,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Flexible(
                      child: SingleChildScrollView(
                        child: Text(
                          "أهلاً بكم في بوابة أنصار، تطبيقكم الأمثل لاكتشاف كل ما هو جديد ومميز في أنصار ! نقدم لكم منصة شاملة تعرض أحدث الأخبار، العروض الحصرية، ومعلومات عن جميع المتاجر المحلية. تم تصميم بوابة أنصار لتجعل حياتكم أسهل، حيث يمكنكم العثور على كل ما تحتاجونه بلمسة زر. نهدف إلى تعزيز التجارة المحلية ودعم الاقتصاد في أنصار من خلال تسهيل الوصول إلى المعلومات والعروض التي تهمكم. انضموا إلينا الآن وكونوا جزءًا من مجتمع أنصار!",
                          style: const TextStyle(
                            fontSize: 16,
                            height: 1.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(15),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(15),
                        child: ConstrainedBox(
                          constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width * 0.7,
                            maxHeight: MediaQuery.of(context).size.height * 0.2,
                          ),
                          child: Image.asset(
                            'assets/ansar11.jpeg',
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.deepOrange,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 30, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                        elevation: 4,
                      ),
                      child: const Text(
                        'OK',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showAboutUsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  color: Colors.white.withOpacity(0.94),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'TopCoders\n Software Company',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.deepOrange,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Flexible(
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            _buildPlaceCard(
                                'Mahdi Fadel Assi - "CEO"', 'assets/mahdi.jpeg'),
                            const SizedBox(height: 20),
                            _buildPlaceCard(
                                'Hadi Ahmad Makki - "CTO"', 'assets/hadi.png'),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.deepOrange,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 30, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                        elevation: 4,
                      ),
                      child: const Text(
                        'Close',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _launchEmail() async {
    final Uri emailLaunchUri = Uri(
      scheme: 'mailto',
      path: 'topcoders.lb@gmail.com',
      query: encodeQueryParameters(<String, String>{
        'subject': 'Inquiry from Ansar',
      }),
    );
    launchUrl(emailLaunchUri);
  }
}

class _PressableCard extends StatefulWidget {
  final Widget child;
  final VoidCallback onTap;

  const _PressableCard({required this.child, required this.onTap});

  @override
  State<_PressableCard> createState() => _PressableCardState();
}

class _PressableCardState extends State<_PressableCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
    );
    _scale = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) {
        _controller.reverse();
        widget.onTap();
      },
      onTapCancel: () => _controller.reverse(),
      child: ScaleTransition(
        scale: _scale,
        child: widget.child,
      ),
    );
  }
}
