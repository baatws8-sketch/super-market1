import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from './ui/use-toast';
import { Calendar, Package, MapPin, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase'; // تأكد عندك إعداد supabase client

export default function ProductForm() {
  const { addProduct } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    production_date: '',
    expiry_date: '',
    quantity: '',
    storage_location: '',
    description: ''
  });

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  const [expiryDay, setExpiryDay] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');

  useEffect(() => {
    if (expiryDay && expiryMonth && expiryYear) {
      const formatted = `${expiryYear}-${expiryMonth}-${expiryDay}`;
      setFormData(prev => ({ ...prev, expiry_date: formatted }));
    }
  }, [expiryDay, expiryMonth, expiryYear]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('products').upload(fileName, file);

    if (error) {
      toast({ title: 'خطأ برفع الصورة', description: error.message, variant: 'destructive' });
      return;
    }

    const { publicUrl } = supabase.storage.from('products').getPublicUrl(fileName);
    setFormData(prev => ({ ...prev, image_url: publicUrl }));
    toast({ title: "تم رفع الصورة", description: "تم رفع صورة المنتج بنجاح" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.expiry_date) {
      toast({ title: "خطأ في البيانات", description: "يرجى إدخال اسم المنتج وتاريخ الانتهاء", variant: "destructive" });
      return;
    }

    if (formData.production_date && formData.expiry_date) {
      const productionDate = new Date(formData.production_date);
      const expiryDate = new Date(formData.expiry_date);
      if (expiryDate <= productionDate) {
        toast({ title: "خطأ في التواريخ", description: "تاريخ انتهاء الصلاحية يجب أن يكون بعد تاريخ الإنتاج", variant: "destructive" });
        return;
      }
    }

    setIsLoading(true);
    try {
      await addProduct({
        name: formData.name,
        image_url: formData.image_url || `https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80`,
        production_date: formData.production_date || new Date().toISOString().split('T')[0],
        expiry_date: formData.expiry_date,
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
        storage_location: formData.storage_location,
        description: formData.description
      });

      toast({ title: "تم إضافة المنتج", description: `تم إضافة ${formData.name} بنجاح` });

      setFormData({ name: '', image_url: '', production_date: '', expiry_date: '', quantity: '', storage_location: '', description: '' });
    } catch (error) {
      toast({ title: "خطأ في إضافة المنتج", description: "حدث خطأ أثناء إضافة المنتج، يرجى المحاولة مرة أخرى", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Package className="h-5 w-5" />
            <span>إضافة منتج جديد</span>
          </CardTitle>
          <CardDescription>أدخل بيانات المنتج الجديد لإضافته إلى النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اسم المنتج */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right">اسم المنتج *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="أدخل اسم المنتج" required className="text-right" />
            </div>

            {/* صورة المنتج */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-right">صورة المنتج</Label>
              <div className="flex items-center space-x-4 space-x-reverse">
                <label className="cursor-pointer">
                  <Input id="image-gallery" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  <span className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 border">من الاستديو</span>
                </label>
                <label className="cursor-pointer">
                  <Input id="image-camera" type="file" accept="image/*" capture="environment" onChange={handleImageUpload} style={{ display: 'none' }} />
                  <span className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 border">من الكاميرا</span>
                </label>
              </div>
              {formData.image_url && (
                <div className="mt-2 flex justify-center">
                  <img src={formData.image_url} alt="معاينة المنتج" className="w-24 h-24 object-cover rounded-lg border" />
                </div>
              )}
            </div>

            {/* التواريخ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-right flex items-center space-x-1 space-x-reverse">
                  <Calendar className="h-4 w-4" />
                  <span>تاريخ انتهاء الصلاحية *</span>
                </Label>
                <div className="flex space-x-2 space-x-reverse">
                  <select value={expiryDay} onChange={e => setExpiryDay(e.target.value)} className="border rounded px-2 py-1">
                    <option value="">اليوم</option>
                    {days.map(day => <option key={day} value={day.toString().padStart(2,'0')}>{day}</option>)}
                  </select>
                  <select value={expiryMonth} onChange={e => setExpiryMonth(e.target.value)} className="border rounded px-2 py-1">
                    <option value="">الشهر</option>
                    {months.map(month => <option key={month} value={month}>{month}</option>)}
                  </select>
                  <select value={expiryYear} onChange={e => setExpiryYear(e.target.value)} className="border rounded px-2 py-1">
                    <option value="">السنة</option>
                    {years.map(year => <option key={year} value={year.toString()}>{year}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* الكمية وموقع التخزين */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-right flex items-center space-x-1 space-x-reverse">
                  <Hash className="h-4 w-4" />
                  <span>الكمية (اختياري)</span>
                </Label>
                <Input id="quantity" name="quantity" type="number" min="1" value={formData.quantity} onChange={handleInputChange} className="text-right" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage_location"
