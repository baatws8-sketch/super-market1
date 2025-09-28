import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui';
import { toast } from './ui/use-toast';
import { Package, Calendar, MapPin, Hash } from 'lucide-react';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) || 0 : value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('products-images')
      .upload(fileName, file);

    if (error) {
      toast({ title: 'خطأ في رفع الصورة', description: error.message, variant: 'destructive' });
      return;
    }

    // احصل على رابط الصورة
    const { publicUrl, error: urlError } = supabase.storage
      .from('products-images')
      .getPublicUrl(fileName);

    if (urlError) {
      toast({ title: 'خطأ في الحصول على رابط الصورة', description: urlError.message, variant: 'destructive' });
      return;
    }

    setFormData(prev => ({ ...prev, image_url: publicUrl }));
    toast({ title: 'تم رفع الصورة', description: 'تم رفع صورة المنتج بنجاح' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiry_date) {
      toast({ title: 'خطأ في البيانات', description: 'يرجى إدخال اسم المنتج وتاريخ الانتهاء', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          image_url: formData.image_url,
          production_date: formData.production_date || null,
          expiry_date: formData.expiry_date,
          quantity: formData.quantity || null,
          storage_location: formData.storage_location || null,
          description: formData.description || null
        }]);

      if (error) throw error;

      toast({ title: 'تم إضافة المنتج', description: `تم إضافة ${formData.name} بنجاح` });
      setFormData({ name: '', image_url: '', production_date: '', expiry_date: '', quantity: '', storage_location: '', description: '' });
    } catch (err: any) {
      toast({ title: 'خطأ في إضافة المنتج', description: err.message, variant: 'destructive' });
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
            <div className="space-y-2">
              <Label htmlFor="name">اسم المنتج *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">صورة المنتج</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {formData.image_url && <img src={formData.image_url} alt="معاينة المنتج" className="w-24 h-24 object-cover rounded-lg mt-2" />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">تاريخ انتهاء الصلاحية *</Label>
              <Input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="production_date">تاريخ الإنتاج</Label>
              <Input type="date" name="production_date" value={formData.production_date} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">الكمية</Label>
              <Input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage_location">موقع التخزين</Label>
              <Input name="storage_location" value={formData.storage_location} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف إضافي</Label>
              <Textarea name="description" value={formData.description} onChange={handleInputChange} />
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button type="submit" disabled={isLoading}>{isLoading ? 'جاري الإضافة...' : 'إضافة المنتج'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
