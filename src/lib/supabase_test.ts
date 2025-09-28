import { supabase } from './supabase';

// دالة اختبار الاتصال بقاعدة البيانات وجلب المنتجات
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.error('خطأ في الاتصال بقاعدة البيانات:', error.message);
      return false;
    }
    if (data && data.length > 0) {
      console.log('تم الاتصال بنجاح. أول منتج:', data[0]);
      return true;
    } else {
      console.log('تم الاتصال بنجاح، لكن لا توجد منتجات في الجدول.');
      return true;
    }
  } catch (err) {
    console.error('خطأ غير متوقع في الاتصال:', err);
    return false;
  }
}

// يمكنك استدعاء testSupabaseConnection() من أي مكان في التطبيق أو من وحدة اختبار منفصلة.