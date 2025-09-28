// دوال إدارة عناوين البريد الإلكتروني للتنبيهات
export const getNotificationEmails = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('notification_emails').select('email');
  if (error) {
    console.error('Error fetching notification emails:', error);
    return [];
  }
  return data.map((row: { email: string }) => row.email);
};

export const addNotificationEmail = async (email: string): Promise<boolean> => {
  const { error } = await supabase.from('notification_emails').insert([{ email }]);
  if (error) {
    // طباعة نص الخطأ في الـ console
    console.error('Error adding notification email:', error.message || error);
    // إرجاع نص الخطأ ليظهر في الواجهة
    throw new Error(error.message || 'حدث خطأ أثناء الإضافة');
  }
  return true;
};

export const updateNotificationEmail = async (oldEmail: string, newEmail: string): Promise<boolean> => {
  const { error } = await supabase.from('notification_emails').update({ email: newEmail }).eq('email', oldEmail);
  if (error) {
    console.error('Error updating notification email:', error);
    return false;
  }
  return true;
};

export const deleteNotificationEmail = async (email: string): Promise<boolean> => {
  const { error } = await supabase.from('notification_emails').delete().eq('email', email);
  if (error) {
    console.error('Error deleting notification email:', error);
    return false;
  }
  return true;
};
import { createClient } from '@supabase/supabase-js';

// إعدادات Supabase - يمكن تخصيصها من متغيرات البيئة
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// دالة لإنشاء الجداول المطلوبة
export const initializeDatabase = async () => {
  try {
    // إنشاء جدول المنتجات
    const { error: productsError } = await supabase.rpc('create_products_table', {});
    if (productsError && !productsError.message.includes('already exists')) {
      console.error('Error creating products table:', productsError);
    }

    // إنشاء جدول التنبيهات
    const { error: notificationsError } = await supabase.rpc('create_notifications_table', {});
    if (notificationsError && !notificationsError.message.includes('already exists')) {
      console.error('Error creating notifications table:', notificationsError);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// دالة لطلب إذن الإشعارات
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// دالة لإرسال إشعار محلي
export const sendLocalNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/vite.svg',
      badge: '/vite.svg',
      tag: 'product-expiry',
      requireInteraction: true,
    });
  }
};

// دالة لإرسال إشعار عبر البريد الإلكتروني (يتطلب إعداد خدمة البريد)
export const sendEmailNotification = async (email: string, subject: string, message: string) => {
  try {
    // استخدم EmailJS لإرسال البريد الإلكتروني
    // يجب إنشاء حساب مجاني في https://www.emailjs.com/ والحصول على serviceId وtemplateId وuserId
  const serviceId = 'service_8r9wz47';
  const templateId = 'template_4l6042m';
  const userId = '4fqeeq4eP3CHW-MPU';
    const templateParams = {
      to_email: email,
      subject,
      message,
    };
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
        template_params: templateParams,
      }),
    });
    if (response.ok) {
      console.log('Email sent successfully');
      return true;
    } else {
      console.error('EmailJS error:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};