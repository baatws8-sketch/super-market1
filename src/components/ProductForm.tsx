import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from './ui/use-toast';
import { Calendar, Package, Hash, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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

    setIsLoading(true);
    try {
      await addProduct(formData); // يحفظ المنتج مع رابط الصورة في DB
      toast({ title: "تم إضافة المنتج", description: `تم إضافة ${formData.name} بنجاح` });
      setFormData({ name: '', image_url: '', production_date: '', expiry_date: '', quantity: '', storage_location: '', description: '' });
    } catch (error: any) {
      toast({ title: "خطأ في إضافة المنتج", description: error.message || "حدث خطأ أثناء الإضافة", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Package className="h-5 w-5" />
          <span>إضافة منتج جديد</span>
        </CardTitle>
        <CardDescription>أدخل بيانات المنتج الجديد لإضافته إلى النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المنتج *</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">صورة المنتج</Label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
            {formData.image_url && <img src={formData.image_url} alt="معاينة المنتج" className="w-24 h-24 object-cover rounded mt-2 border" />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry_date" className="flex items-center space-x-1 space-x-reverse">
              <Calendar className="h-4 w-4" /> <span>تاريخ انتهاء الصلاحية *</span>
            </Label>
            <Input type="date" id="expiry_date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center space-x-1 space-x-reverse">
              <Hash className="h-4 w-4" /> <span>الكمية</span>
            </Label>
            <Input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage_location" className="flex items-center space-x-1 space-x-reverse">
              <MapPin className="h-4 w-4" /> <span>موقع التخزين</span>
            </Label>
            <Input type="text" id="storage_location" name="storage_location" value={formData.storage_location} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف إضافي</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button type="submit" disabled={isLoading}>{isLoading ? "جاري الإضافة..." : "إضافة المنتج"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
