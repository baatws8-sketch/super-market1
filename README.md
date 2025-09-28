# نظام إدارة صلاحيات المنتجات

تطبيق ويب عربي (RTL) لإدارة منتجات السوبرماركت وتتبع تواريخ الصلاحية، مع نظام تنبيهات ذكي لإشعار المستخدمين بالمنتجات التي تقترب من انتهاء صلاحيتها.

## الميزات الرئيسية

### 🏠 لوحة التحكم الرئيسية
- عرض إحصائيات المنتجات (الكلية، المنتهية قريباً، المنتهية)
- رسومات بيانية تفاعلية
- قائمة التنبيهات الحالية
- المنتجات المضافة حديثاً
- المنتجات التي تحتاج انتباه

### ➕ إضافة المنتجات
- نموذج شامل لإدخال بيانات المنتج
- رفع صور المنتجات
- تحديد تواريخ الإنتاج والانتهاء
- تحديد الكمية وموقع التخزين
- التحقق من صحة البيانات

### 📋 إدارة المنتجات
- جدول تفاعلي لعرض جميع المنتجات
- البحث والفلترة المتقدمة
- ترتيب حسب معايير مختلفة
- تعديل وحذف المنتجات
- تصدير البيانات بصيغة CSV

### 🔔 نظام التنبيهات
- تنبيهات تلقائية قبل انتهاء الصلاحية
- إشعارات المتصفح (Push Notifications)
- إشعارات البريد الإلكتروني
- تصنيف التنبيهات حسب الأولوية
- إدارة حالة قراءة التنبيهات

### 🔐 نظام المصادقة
- تسجيل دخول آمن
- إدارة جلسات المستخدمين
- حماية البيانات

## بيانات تسجيل الدخول الافتراضية

```
اسم المستخدم: admin
كلمة المرور: admin
```

## التقنيات المستخدمة

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: Browser Push API + Toast

## إعداد المشروع

### 1. تثبيت التبعيات
```bash
npm install
```

### 2. إعداد قاعدة البيانات (Supabase)

#### الطريقة الأولى: استخدام Supabase Cloud
1. إنشاء حساب على [Supabase](https://supabase.com)
2. إنشاء مشروع جديد
3. نسخ URL و API Key من إعدادات المشروع
4. إضافة متغيرات البيئة:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. تشغيل migration لإنشاء الجداول:
```bash
npx supabase migration up
```

#### الطريقة الثانية: استخدام Supabase محلياً
```bash
# تثبيت Supabase CLI
npm install -g @supabase/cli

# تسجيل الدخول
npx supabase login

# بدء Supabase محلياً
npx supabase start

# تشغيل migrations
npx supabase migration up
```

### 3. تشغيل التطبيق
```bash
npm run dev
```

## هيكل المشروع

```
src/
├── components/           # مكونات React
│   ├── ui/              # مكونات UI الأساسية (shadcn)
│   ├── Dashboard.tsx    # لوحة التحكم
│   ├── ProductForm.tsx  # نموذج إضافة المنتجات
│   ├── ProductsTable.tsx # جدول المنتجات
│   ├── NotificationsList.tsx # قائمة التنبيهات
│   ├── Login.tsx        # صفحة تسجيل الدخول
│   └── home.tsx         # الصفحة الرئيسية
├── contexts/            # React Contexts
│   └── AppContext.tsx   # السياق الرئيسي للتطبيق
├── lib/                 # المكتبات والأدوات
│   ├── supabase.ts      # إعداد Supabase
│   └── utils.ts         # دوال مساعدة
├── types/               # تعريفات TypeScript
│   └── supabase.ts      # أنواع قاعدة البيانات
└── stories/             # Storybook stories
```

## قاعدة البيانات

### جدول المنتجات (products)
- `id`: معرف فريد
- `name`: اسم المنتج
- `image_url`: رابط صورة المنتج
- `production_date`: تاريخ الإنتاج
- `expiry_date`: تاريخ انتهاء الصلاحية
- `quantity`: الكمية
- `storage_location`: موقع التخزين
- `status`: حالة المنتج (active, expiring_soon, expired)
- `created_at`: تاريخ الإضافة
- `updated_at`: تاريخ آخر تحديث

### جدول التنبيهات (notifications)
- `id`: معرف فريد
- `product_id`: معرف المنتج المرتبط
- `product_name`: اسم المنتج
- `message`: نص التنبيه
- `type`: نوع التنبيه (info, warning, danger)
- `is_read`: حالة القراءة
- `created_at`: تاريخ الإنشاء

## الميزات المتقدمة

### التنبيهات التلقائية
- يتم إنشاء تنبيهات تلقائياً عند:
  - إضافة منتج جديد قارب على الانتهاء
  - وصول منتج لحالة "قارب على الانتهاء" (7 أيام)
  - انتهاء صلاحية منتج

### إشعارات المتصفح
- طلب إذن الإشعارات عند تحميل التطبيق
- إرسال إشعارات للمنتجات المنتهية أو القاربة على الانتهاء
- إشعارات تفاعلية مع إمكانية الإجراء

### تصدير البيانات
- تصدير قائمة المنتجات بصيغة CSV
- تصدير التقارير للمنتجات المنتهية أو القاربة على الانتهاء
- إمكانية طباعة التقارير

## الأمان

- Row Level Security (RLS) مفعل على جميع الجداول
- تشفير البيانات الحساسة
- التحقق من صحة البيانات على مستوى العميل والخادم
- حماية من هجمات XSS و SQL Injection

## التطوير

### إضافة ميزات جديدة
1. إنشاء مكون جديد في `src/components/`
2. إضافة الأنواع المطلوبة في `src/types/`
3. تحديث السياق في `src/contexts/AppContext.tsx`
4. إضافة migration إذا لزم الأمر

### اختبار التطبيق
```bash
# تشغيل الاختبارات
npm test

# تشغيل Storybook
npm run storybook
```

## النشر

### نشر على Vercel
```bash
npm run build
vercel --prod
```

### نشر على Netlify
```bash
npm run build
# رفع مجلد dist إلى Netlify
```

## المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

إذا واجهت أي مشاكل أو لديك اقتراحات، يرجى فتح issue في GitHub أو التواصل معنا.

---

تم تطوير هذا المشروع بـ ❤️ لمساعدة أصحاب المتاجر والسوبرماركت في إدارة منتجاتهم بكفاءة أكبر.