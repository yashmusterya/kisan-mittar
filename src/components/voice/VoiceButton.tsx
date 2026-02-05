import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceButtonProps {
  isListening: boolean;
  isSpeaking?: boolean;
  isSupported: boolean;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VoiceButton = ({
  isListening,
  isSpeaking = false,
  isSupported,
  onPress,
  size = 'md',
  className,
}: VoiceButtonProps) => {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className={cn(sizeClasses[size], 'rounded-full', className)}
        title="Voice not supported"
      >
        <MicOff className={iconSizes[size]} />
      </Button>
    );
  }

  if (isSpeaking) {
    return (
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          sizeClasses[size],
          'rounded-full relative',
          'animate-pulse',
          className
        )}
        title={t('voice.speaking')}
      >
        <Volume2 className={cn(iconSizes[size], 'text-primary')} />
      </Button>
    );
  }

  return (
    <Button
      variant={isListening ? 'destructive' : 'default'}
      size="icon"
      onClick={onPress}
      className={cn(
        sizeClasses[size],
        'rounded-full relative transition-all duration-200',
        isListening && 'ring-4 ring-destructive/30',
        className
      )}
      title={isListening ? t('voice.listening') : t('voice.tapToSpeak')}
    >
      {/* Pulse animation when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
          <span className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse" />
        </>
      )}
      
      <Mic className={cn(iconSizes[size], 'relative z-10')} />
    </Button>
  );
};

export default VoiceButton;
