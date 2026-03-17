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
import 'modern_app_bar.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

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
          // Restore original background image
          Positioned.fill(
            child: Image.asset(
              'assets/home-final.jpg',
              fit: BoxFit.cover,
            ),
          ),
          Container(
            color: Colors.black.withOpacity(0.2),
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

                      // Welcome section
                      Expanded(
                        child: _buildWelcomeSection(screenSize),
                      ),

                      // Navigation cards section
                      _buildNavigationSection(screenSize),
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

  Widget _buildAnimatedBackground() {
    return Positioned.fill(
      child: CustomPaint(
        painter: BackgroundPainter(),
        child: Container(),
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
              // Share button with glassmorphism effect
              _buildGlassmorphicButton(
                icon: Icons.share_rounded,
                onPressed: () {
                  Share.share(
                      'Check out this awesome app! Download it here: https://play.google.com/store/apps/details?id=com.topcoders.ansarportal');
                },
                screenSize: screenSize,
              ),

              // Menu button with glassmorphism effect
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
    final buttonSize = screenSize.width * 0.12; // Responsive button size

    return Container(
      width: buttonSize,
      height: buttonSize,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Colors.white.withOpacity(0.15),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onPressed,
          child: Container(
            padding: EdgeInsets.all(buttonSize * 0.25),
            child: Icon(
              icon,
              color: Colors.white,
              size: buttonSize * 0.4,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeSection(Size screenSize) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo with subtle glow
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.deepOrange.withOpacity(0.2),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(15),
                  child: Image.asset(
                    'assets/ansarportallogo.png',
                    height: screenSize.height * 0.12, // Smaller logo
                  ),
                ),
              ),

              SizedBox(height: screenSize.height * 0.03),

              // Modern welcome text design
              Container(
                margin:
                    EdgeInsets.symmetric(horizontal: screenSize.width * 0.08),
                child: Column(
                  children: [
                    // English text
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: screenSize.width * 0.05,
                          vertical: screenSize.height * 0.01),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: Colors.deepOrange.withOpacity(0.9),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.deepOrange.withOpacity(0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Text(
                        'ANSAR PORTAL',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white,
                          
                          fontSize:
                              screenSize.width * 0.045, // Responsive font size
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                    ),

                    SizedBox(height: screenSize.height * 0.01),

                    // Arabic text
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: screenSize.width * 0.05,
                          vertical: screenSize.height * 0.01),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: Colors.white.withOpacity(0.9),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Text(
                        'المنصّة الرقميّة لبلدية أنصار',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.tajawal(
                          color: Colors.deepOrange,
                          fontSize:
                              screenSize.width * 0.04, // Responsive font size
                          fontWeight: FontWeight.w700,
                          height: 1.4,
                          letterSpacing: 0.5,
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
  }

  Widget _buildNavigationSection(Size screenSize) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: screenSize.width * 0.04,
        vertical: screenSize.height * 0.02,
      ),
      child: Column(
        children: [
          // First row - 2 buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildModernNavigationCard(
                icon: Icons.description_rounded,
                label: 'بيانات البلدية',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const MunicipalityStatementsPage()),
                ),
                delay: 0,
                screenSize: screenSize,
              ),
              _buildModernNavigationCard(
                icon: Icons.feedback_rounded,
                label: 'تقديم الشكاوى',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const ComplaintsPage()),
                ),
                delay: 100,
                screenSize: screenSize,
              ),
            ],
          ),

          SizedBox(height: screenSize.height * 0.02),

          // Second row - 2 buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildModernNavigationCard(
                icon: Icons.store_rounded,
                label: 'STORES',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const StoresPage()),
                ),
                delay: 200,
                screenSize: screenSize,
              ),
              _buildModernNavigationCard(
                icon: FontAwesomeIcons.buildingColumns,
                label: 'ANSAR',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => TourismPage()),
                ),
                delay: 300,
                isFontAwesome: true,
                screenSize: screenSize,
              ),
            ],
          ),

          SizedBox(height: screenSize.height * 0.02),

          // Third row - single centered button
          Center(
            child: _buildModernNavigationCard(
              icon: Icons.info_rounded,
              label: 'عن البلدية',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => const AboutMunicipalityPage()),
              ),
              delay: 400,
              screenSize: screenSize,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModernNavigationCard({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    required int delay,
    bool isFontAwesome = false,
    required Size screenSize,
  }) {
    // Bigger sizing for better usability - 14% of screen height
    final cardHeight = screenSize.height * 0.14;
    final cardWidth = screenSize.width * 0.42;
    final iconSize = cardHeight * 0.35;
    final fontSize = screenSize.width * 0.035;

    return TweenAnimationBuilder<double>(
      duration: Duration(milliseconds: 400 + delay),
      tween: Tween(begin: 0.0, end: 1.0),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: Container(
              width: cardWidth,
              height: cardHeight,
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: onTap,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withOpacity(0.25),
                          Colors.white.withOpacity(0.20),
                        ],
                      ),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.5),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.15),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                          spreadRadius: 0,
                        ),
                        BoxShadow(
                          color: Colors.deepOrange.withOpacity(0.2),
                          blurRadius: 30,
                          offset: const Offset(0, 5),
                          spreadRadius: -5,
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Stack(
                        children: [
                          // Subtle gradient overlay
                          Positioned(
                            top: -50,
                            right: -50,
                            child: Container(
                              width: 150,
                              height: 150,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: RadialGradient(
                                  colors: [
                                    Colors.white.withOpacity(0.1),
                                    Colors.transparent,
                                  ],
                                ),
                              ),
                            ),
                          ),
                          
                          // Centered content
                          Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                // Icon section with refined styling
                                Container(
                                  width: cardHeight * 0.42,
                                  height: cardHeight * 0.42,
                                  margin: EdgeInsets.only(bottom: cardHeight * 0.10),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(18),
                                    gradient: LinearGradient(
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                      colors: [
                                        const Color(0xFFFF5722),
                                        const Color(0xFFE64A19),
                                      ],
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.deepOrange.withOpacity(0.4),
                                        blurRadius: 12,
                                        offset: const Offset(0, 6),
                                      ),
                                    ],
                                  ),
                                  child: Center(
                                    child: isFontAwesome
                                        ? FaIcon(
                                            icon as IconData,
                                            size: iconSize,
                                            color: Colors.white,
                                          )
                                        : Icon(
                                            icon,
                                            size: iconSize,
                                            color: Colors.white,
                                          ),
                                  ),
                                ),

                                // Text section with professional Arabic font
                                Container(
                                  padding: EdgeInsets.symmetric(
                                      horizontal: cardHeight * 0.1),
                                  child: Text(
                                    label,
                                    style: GoogleFonts.tajawal(
                                      color: Colors.white,
                                      fontSize: fontSize,
                                      fontWeight: FontWeight.w700,
                                      height: 1.3,
                                      letterSpacing: 0.5,
                                      shadows: [
                                        Shadow(
                                          color: Colors.black.withOpacity(0.5),
                                          offset: const Offset(0, 2),
                                          blurRadius: 4,
                                        ),
                                      ],
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
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
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.95),
                  Colors.white.withOpacity(0.9),
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
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
                const Divider(height: 1),
                _buildModernMenuItem(
                  icon: Icons.supervised_user_circle_rounded,
                  title: 'About Us',
                  onTap: () {
                    Navigator.of(context).pop();
                    _showAboutUsDialog(context);
                  },
                ),
                const Divider(height: 1),
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
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.deepOrange.withOpacity(0.1),
                ),
                child: Icon(
                  icon,
                  color: Colors.deepOrange,
                  size: 20,
                ),
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
            ClipOval(
              child: Image.asset(
                imageUrl,
                fit: BoxFit.cover,
                width: imgSize.clamp(80.0, 200.0),
                height: imgSize.clamp(80.0, 200.0),
              ),
            ),
            SizedBox(height: 15.0),
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                
                fontSize: 16.0,
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
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.95),
                  Colors.white.withOpacity(0.9),
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'ANSAR PORTAL',
                  style: TextStyle(
                    
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.deepOrange,
                  ),
                ),
                const SizedBox(height: 20),
                Flexible(
                  child: SingleChildScrollView(
                    child: Text(
                      "أهلاً بكم في بوابة أنصار، تطبيقكم الأمثل لاكتشاف كل ما هو جديد ومميز في أنصار ! نقدم لكم منصة شاملة تعرض أحدث الأخبار، العروض الحصرية، ومعلومات عن جميع المتاجر المحلية. تم تصميم بوابة أنصار لتجعل حياتكم أسهل، حيث يمكنكم العثور على كل ما تحتاجونه بلمسة زر. نهدف إلى تعزيز التجارة المحلية ودعم الاقتصاد في أنصار من خلال تسهيل الوصول إلى المعلومات والعروض التي تهمكم. انضموا إلينا الآن وكونوا جزءًا من مجتمع بوابة أنصار!",
                      style: TextStyle(
                        
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
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.95),
                  Colors.white.withOpacity(0.9),
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
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
        );
      },
    );
  }

  void _launchEmail() async {
    final Uri emailLaunchUri = Uri(
      scheme: 'mailto',
      path: 'topcoders.lb@gmail.com',
      query: encodeQueryParameters(<String, String>{
        'subject': 'Inquiry from Ansar Portal',
      }),
    );
    launchUrl(emailLaunchUri);
  }
}

// Custom painter for animated background
class BackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.05)
      ..style = PaintingStyle.fill;

    // Draw animated circles
    for (int i = 0; i < 5; i++) {
      final x = (size.width * 0.2) + (i * size.width * 0.15);
      final y = (size.height * 0.1) + (i * size.height * 0.2);
      canvas.drawCircle(Offset(x, y), 50 + (i * 20), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
