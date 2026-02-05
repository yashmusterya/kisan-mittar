import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploadProps {
  onImageSelect: (base64: string, mimeType: string) => void;
  disabled?: boolean;
}

const ImageUpload = ({ onImageSelect, disabled }: ImageUploadProps) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setLoading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        setPreview(base64);
        onImageSelect(base64Data, file.type);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      setLoading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelect('', '');
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Selected crop"
            className="w-12 h-12 rounded-lg object-cover border-2 border-primary"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full"
            onClick={clearImage}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={handleClick}
          disabled={disabled || loading}
          className="flex-shrink-0"
          title={t('chat.uploadImage')}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
