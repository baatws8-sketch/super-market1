import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from './ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Package, Calendar, MapPin, Hash } from 'lucide-react';

export default function ProductForm() {
  const { addProduct } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    production_date: '',
    expiry_date: '',
    quantity: 1,
    storage_location: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) || 1 : value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) {
      toast({ title: 'خطأ في رفع الصورة', description: error.message, variant: 'destructive' });
      return;
    }

    const { publicUrl } = supabase.storage.from('product-images').getPublicUrl(fileName);
    setFormData(prev => ({ ...prev, image_url: publicUrl }));
    toast({ title: 'تم رفع الصورة', description: 'صورة المنتج تم رفعها بنجاح' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiry_date) {
      toast({ title: 'خطأ', description: 'يرجى إدخال الاسم وتاريخ الانتهاء', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await addProduct(formData); // تأكد إن addProduct يحفظ البيانات في Supabase
      toast({ title: 'تم إضافة المنتج', description: `${formData.name} تمت إضافته` });
      setFormData({ name: '', image_url: '', production_date: '', expiry_date: '', quantity: 1, storage_location: '' });
    } catch (err) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء إضافة المنتج', variant: 'destructive' });
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
          <CardDescription>أدخل بيانات المنتج الجديد</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">اسم المنتج *</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="image">صورة المنتج</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {formData.image_url && (
                <img src={formData.image_url} alt="معاينة" className="w-24 h-24 mt-2 object-cover rounded" />
              )}
            </div>

            <div>
              <Label htmlFor="expiry_date">تاريخ الانتهاء *</Label>
              <Input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="quantity">الكمية</Label>
              <Input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min={1} />
            </div>

            <div>
              <Label htmlFor="storage_location">موقع التخزين</Label>
              <Input name="storage_location" value={formData.storage_location} onChange={handleInputChange} />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'جاري الإضافة...' : 'إضافة المنتج'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
