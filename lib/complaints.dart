import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'modern_app_bar.dart';
import 'services/api_service.dart';

class ComplaintsPage extends StatefulWidget {
  const ComplaintsPage({super.key});

  @override
  _ComplaintsPageState createState() => _ComplaintsPageState();
}

class _ComplaintsPageState extends State<ComplaintsPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _complaintController = TextEditingController();
  XFile? _selectedImage;
  bool _isSubmitting = false;
  final ApiService _apiService = ApiService();

  String _deviceId = '';
  String _deviceName = '';
  String _deviceModel = '';
  String _osVersion = '';

  @override
  void initState() {
    super.initState();
    _loadDeviceInfo();
  }

  Future<void> _loadDeviceInfo() async {
    final deviceInfo = DeviceInfoPlugin();
    try {
      if (kIsWeb) {
        final web = await deviceInfo.webBrowserInfo;
        final ua = web.userAgent ?? '';
        _deviceId =
            '${ua.hashCode}_${web.browserName.name}_${web.platform ?? 'unknown'}';
        _deviceName = web.browserName.name;
        _deviceModel = web.platform ?? 'Web';
        _osVersion = web.appVersion ?? 'Web';
      } else if (defaultTargetPlatform == TargetPlatform.android) {
        final android = await deviceInfo.androidInfo;
        _deviceId = '${android.id}_${android.fingerprint}';
        _deviceName = android.brand;
        _deviceModel = android.model;
        _osVersion =
            'Android ${android.version.release} (SDK ${android.version.sdkInt})';
      } else if (defaultTargetPlatform == TargetPlatform.iOS) {
        final ios = await deviceInfo.iosInfo;
        _deviceId = '${ios.identifierForVendor ?? ''}_${ios.utsname.machine}';
        _deviceName = ios.name;
        _deviceModel = ios.model;
        _osVersion = '${ios.systemName} ${ios.systemVersion}';
      } else if (defaultTargetPlatform == TargetPlatform.windows) {
        final windows = await deviceInfo.windowsInfo;
        _deviceId = '${windows.deviceId}_${windows.computerName}';
        _deviceName = windows.computerName;
        _deviceModel = 'Windows';
        _osVersion =
            'Windows ${windows.majorVersion}.${windows.minorVersion} (Build ${windows.buildNumber})';
      }
    } catch (e) {
      _deviceId = 'unknown_${DateTime.now().millisecondsSinceEpoch}';
      _deviceName = 'Unknown';
      _deviceModel = 'Unknown';
      _osVersion = 'Unknown';
    }
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      setState(() {
        _selectedImage = image;
      });
    }
  }

  void _removeImage() {
    setState(() {
      _selectedImage = null;
    });
  }

  void _submitComplaint() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isSubmitting = true;
      });

      try {
        // Upload image to server if selected
        String? imageUrl;
        if (_selectedImage != null) {
          imageUrl = await _apiService.uploadImage(_selectedImage!);
        }

        // Submit complaint to API with device info
        final result = await _apiService.submitComplaint(
          name: _nameController.text,
          phone: _phoneController.text,
          complaintText: _complaintController.text,
          imageUrl: imageUrl,
          deviceId: _deviceId,
          deviceName: _deviceName,
          deviceModel: _deviceModel,
          osVersion: _osVersion,
        );

        setState(() {
          _isSubmitting = false;
        });

        if (result['blocked'] == true) {
          // Device is blocked
          showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                title: const Row(
                  children: [
                    Icon(Icons.block, color: Colors.red, size: 28),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'تم حظر الجهاز',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                content: Text(
                  result['message'] ??
                      'Your access has been restricted due to inappropriate use.',
                  style: const TextStyle(fontSize: 15),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text(
                      'حسناً',
                      style: TextStyle(
                        color: Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              );
            },
          );
        } else if (result['success'] == true) {
          // Show success dialog
          showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                title: const Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green, size: 28),
                    SizedBox(width: 8),
                    Text(
                      'تم الإرسال بنجاح',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                content: const Text(
                  'تم إرسال شكواك إلى البلدية بنجاح. سنقوم بمراجعتها والرد عليك في أقرب وقت ممكن.',
                  style: TextStyle(),
                ),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      _resetForm();
                    },
                    child: const Text(
                      'حسناً',
                      style: TextStyle(
                        color: Colors.deepOrange,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              );
            },
          );
        } else {
          // Show error
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('حدث خطأ في إرسال الشكوى. حاول مرة أخرى.')),
          );
        }
      } catch (e) {
        setState(() {
          _isSubmitting = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('حدث خطأ غير متوقع. حاول مرة أخرى.')),
        );
      }
    }
  }

  void _resetForm() {
    _formKey.currentState!.reset();
    _nameController.clear();
    _phoneController.clear();
    _complaintController.clear();
    setState(() {
      _selectedImage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const ModernAppBar(title: 'تقديم الشكاوى', showBackButton: false),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.deepOrange.shade50, Colors.orange.shade50],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.deepOrange.shade200),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.feedback_outlined,
                      size: 48,
                      color: Colors.deepOrange.shade700,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'تقديم شكوى للبلدية',
                      style: GoogleFonts.tajawal(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.deepOrange.shade700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'نحن هنا لمساعدتك. يرجى ملء النموذج أدناه لتقديم شكواك.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Full Name Field
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'الاسم الكامل',
                  hintText: 'أدخل اسمك الكامل',
                  prefixIcon:
                      const Icon(Icons.person, color: Colors.deepOrange),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        const BorderSide(color: Colors.deepOrange, width: 2),
                  ),
                  filled: true,
                  fillColor: Colors.grey.shade50,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'يرجى إدخال الاسم الكامل';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Phone Number Field
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'رقم الهاتف',
                  hintText: 'أدخل رقم هاتفك',
                  prefixIcon: const Icon(Icons.phone, color: Colors.deepOrange),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        const BorderSide(color: Colors.deepOrange, width: 2),
                  ),
                  filled: true,
                  fillColor: Colors.grey.shade50,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'يرجى إدخال رقم الهاتف';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Complaint Text Field
              TextFormField(
                controller: _complaintController,
                maxLines: 5,
                decoration: InputDecoration(
                  labelText: 'نص الشكوى',
                  hintText: 'اكتب تفاصيل شكواك هنا...',
                  prefixIcon: const Padding(
                    padding: EdgeInsets.only(bottom: 0),
                    child: Align(
                      alignment: Alignment.topCenter,
                      widthFactor: 1.0,
                      heightFactor: 2.5,
                      child: Icon(Icons.description, color: Colors.deepOrange),
                    ),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        const BorderSide(color: Colors.deepOrange, width: 2),
                  ),
                  filled: true,
                  fillColor: Colors.grey.shade50,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'يرجى إدخال نص الشكوى';
                  }
                  if (value.length < 10) {
                    return 'يجب أن تكون الشكوى أكثر من 10 أحرف';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Image Upload Section
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'إرفاق صورة (اختياري)',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.deepOrange.shade700,
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (_selectedImage == null)
                      ElevatedButton.icon(
                        onPressed: _pickImage,
                        icon:
                            const Icon(Icons.photo_camera, color: Colors.white),
                        label: const Text(
                          'اختيار صورة',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.deepOrange,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      )
                    else
                      Column(
                        children: [
                          Container(
                            height: MediaQuery.of(context).size.height * 0.15,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: kIsWeb
                                  ? Image.network(
                                      _selectedImage!.path,
                                      fit: BoxFit.cover,
                                    )
                                  : Image.network(
                                      _selectedImage!.path,
                                      fit: BoxFit.cover,
                                      errorBuilder:
                                          (context, error, stackTrace) =>
                                              const Icon(Icons.image,
                                                  size: 50, color: Colors.grey),
                                    ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: _pickImage,
                                  icon: const Icon(Icons.edit,
                                      color: Colors.white, size: 16),
                                  label: const Text(
                                    'تغيير الصورة',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.blue,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 8),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: _removeImage,
                                  icon: const Icon(Icons.delete,
                                      color: Colors.white, size: 16),
                                  label: const Text(
                                    'حذف الصورة',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 8),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Submit Button
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitComplaint,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.deepOrange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isSubmitting
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          ),
                          SizedBox(width: 12),
                          Text(
                            'جاري الإرسال...',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      )
                    : const Text(
                        'إرسال الشكوى',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
              ),

              const SizedBox(height: 16),

              // Reset Button
              OutlinedButton(
                onPressed: _resetForm,
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: const BorderSide(color: Colors.deepOrange),
                ),
                child: const Text(
                  'إعادة تعيين النموذج',
                  style: TextStyle(
                    color: Colors.deepOrange,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _complaintController.dispose();
    super.dispose();
  }
}
