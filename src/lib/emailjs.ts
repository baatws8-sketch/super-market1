import emailjs from 'emailjs-com';

export async function sendExpiryEmail(to: string, subject: string, message: string) {
  try {
    await emailjs.send(
      process.env.VITE_EMAILJS_SERVICE_ID!,
      process.env.VITE_EMAILJS_TEMPLATE_ID!,
      {
        to_email: to,
        subject,
        message,
      },
      process.env.VITE_EMAILJS_USER_ID!
    );
    console.log('تم إرسال البريد الإلكتروني بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في إرسال البريد الإلكتروني:', error);
    return false;
  }
}
