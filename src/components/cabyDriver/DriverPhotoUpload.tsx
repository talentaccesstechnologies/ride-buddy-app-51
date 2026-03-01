import React, { useRef, useState } from 'react';
import { Camera, Loader2, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const DriverPhotoUpload: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo)');
      return;
    }

    setUploading(true);

    try {
      // Create square crop via canvas
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      await new Promise((resolve) => { img.onload = resolve; });

      const size = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        img,
        (img.width - size) / 2, (img.height - size) / 2, size, size,
        0, 0, 400, 400
      );

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85)
      );

      const filePath = `${user.id}/avatar.jpg`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache-busting
      const url = `${publicUrl}?t=${Date.now()}`;

      // Update profile
      await updateProfile({ avatar_url: url });
      setPreviewUrl(url);

      URL.revokeObjectURL(objectUrl);
      toast.success('Photo mise à jour !');
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const currentUrl = previewUrl || profile?.avatar_url;

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
      <div className="relative">
        <Avatar className="w-16 h-16 border-2 border-border">
          <AvatarImage src={currentUrl || undefined} />
          <AvatarFallback className="text-lg font-bold bg-muted">
            {profile?.full_name?.[0] || 'C'}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">Photo de profil</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Visible par vos clients et dans le Club
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-2 text-xs"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="w-3 h-3 mr-1.5" />
          {currentUrl ? 'Changer la photo' : 'Ajouter ma photo'}
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default DriverPhotoUpload;
