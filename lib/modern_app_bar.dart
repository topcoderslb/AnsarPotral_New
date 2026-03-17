import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ModernAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final VoidCallback? onBackPressed;
  final List<Widget>? actions;
  final bool showBackButton;

  const ModernAppBar({
    Key? key,
    required this.title,
    this.onBackPressed,
    this.actions,
    this.showBackButton = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenWidth < 360;
    final barHeight = screenHeight < 600 ? 70.0 : (isSmallScreen ? 80.0 : 90.0);
    final hPad = screenWidth * 0.04;
    final vPad = screenHeight < 600 ? 8.0 : 12.0;
    final titleFontSize = (screenWidth * 0.04).clamp(12.0, 18.0);
    final backBtnSize = isSmallScreen ? 36.0 : 42.0;

    return PreferredSize(
      preferredSize: Size.fromHeight(barHeight),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.deepOrange.shade700,
              Colors.deepOrange.shade500,
              Colors.orange.shade600,
            ],
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: SafeArea(
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: hPad, vertical: vPad),
            child: Row(
              children: [
                // Back Button (if enabled)
                if (showBackButton)
                  Container(
                    width: backBtnSize,
                    height: backBtnSize,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      icon: Icon(Icons.arrow_back_ios_rounded,
                          color: Colors.white, size: backBtnSize * 0.5),
                      onPressed: onBackPressed ?? () => Navigator.pop(context),
                    ),
                  ),

                // Spacer if no back button
                if (!showBackButton) SizedBox(width: backBtnSize),

                // Title
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      title,
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: titleFontSize,
                        height: 1.4,
                        letterSpacing: 0.1,
                        shadows: [
                          Shadow(
                            color: Colors.black.withOpacity(0.3),
                            offset: Offset(0, 2),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      softWrap: true,
                    ),
                  ),
                ),

                // Actions or balance spacer
                if (actions != null) ...actions! else SizedBox(width: backBtnSize),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Size get preferredSize {
    // This is a fallback; the actual height adapts in build via PreferredSize
    return Size.fromHeight(90);
  }
}
