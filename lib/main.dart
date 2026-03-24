import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:in_app_update/in_app_update.dart';
import 'package:flutter/foundation.dart';
import 'home.dart';
import 'stores.dart';
import 'municipality_statements.dart';
import 'complaints.dart';
import 'about_municipality.dart';
import 'last_news.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
    _checkForUpdate();
  }

  Future<void> _checkForUpdate() async {
    if (kIsWeb || defaultTargetPlatform != TargetPlatform.android) return;
    try {
      final AppUpdateInfo updateInfo = await InAppUpdate.checkForUpdate();
      if (updateInfo.updateAvailability == UpdateAvailability.updateAvailable) {
        _showUpdateDialog();
      }
    } catch (e) {
      print('Error checking for update: $e');
    }
  }

  void _showUpdateDialog() async {
    final bool? update = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Update Available'),
          content: const Text(
              'A new version of the app is available. Please update to continue.'),
          actions: <Widget>[
            TextButton(
              child: const Text('Later'),
              onPressed: () => Navigator.of(context).pop(false),
            ),
            TextButton(
              child: const Text('Update'),
              onPressed: () => Navigator.of(context).pop(true),
            ),
          ],
        );
      },
    );
    if (update == true) {
      _performImmediateUpdate();
    }
  }

  void _performImmediateUpdate() async {
    try {
      await InAppUpdate.performImmediateUpdate();
    } catch (e) {
      print('Error during update: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ansar',
      theme: ThemeData(
        primarySwatch: Colors.deepOrange,
        colorScheme: ColorScheme.fromSwatch(primarySwatch: Colors.deepOrange),
        textTheme: GoogleFonts.tajawalTextTheme(
          Theme.of(context).textTheme,
        ),
        fontFamily: GoogleFonts.tajawal().fontFamily,
      ),
      home: const MainShell(),
      debugShowCheckedModeBanner: false,
    );
  }
}

/// Root shell with bottom navigation bar
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _pages = [];

  @override
  void initState() {
    super.initState();
    _pages.addAll([
      HomePage(
          onNavigateToTab: (index) => setState(() => _currentIndex = index)),
      const StoresPage(),
      const MunicipalityStatementsPage(),
      const ComplaintsPage(),
      const AboutMunicipalityPage(),
      const LastNewsPage(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      // Allow natural back (exit) only when on the home tab
      canPop: _currentIndex == 0,
      onPopInvoked: (didPop) {
        if (!didPop) {
          // Back pressed on a non-home tab → go home
          setState(() => _currentIndex = 0);
        }
      },
      child: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: _pages,
        ),
        bottomNavigationBar: _currentIndex == 0
            ? null
            : Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 20,
                      offset: const Offset(0, -4),
                    ),
                  ],
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(20)),
                  child: BottomNavigationBar(
                    currentIndex: _currentIndex,
                    onTap: (index) => setState(() => _currentIndex = index),
                    type: BottomNavigationBarType.fixed,
                    backgroundColor: Colors.white,
                    selectedItemColor: Colors.deepOrange,
                    unselectedItemColor: Colors.grey.shade400,
                    selectedFontSize: 11,
                    unselectedFontSize: 10,
                    elevation: 0,
                    selectedLabelStyle:
                        GoogleFonts.tajawal(fontWeight: FontWeight.w700),
                    unselectedLabelStyle:
                        GoogleFonts.tajawal(fontWeight: FontWeight.w500),
                    items: const [
                      BottomNavigationBarItem(
                        icon: Icon(Icons.home_rounded),
                        activeIcon: Icon(Icons.home_rounded, size: 28),
                        label: 'الرئيسية',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(Icons.store_rounded),
                        activeIcon: Icon(Icons.store_rounded, size: 28),
                        label: 'المتاجر',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(Icons.description_rounded),
                        activeIcon: Icon(Icons.description_rounded, size: 28),
                        label: 'بلدية أنصار',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(Icons.feedback_rounded),
                        activeIcon: Icon(Icons.feedback_rounded, size: 28),
                        label: 'الشكاوى',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(Icons.info_rounded),
                        activeIcon: Icon(Icons.info_rounded, size: 28),
                        label: 'عن البلدية',
                      ),
                      BottomNavigationBarItem(
                        icon: Icon(Icons.newspaper_rounded),
                        activeIcon: Icon(Icons.newspaper_rounded, size: 28),
                        label: 'آخر الأخبار',
                      ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  /// Navigate to a specific tab (called from HomePage cards)
  void navigateToTab(int index) {
    setState(() => _currentIndex = index);
  }
}
