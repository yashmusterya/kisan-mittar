 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useLanguage, Language } from '@/contexts/LanguageContext';
 import { Button } from '@/components/ui/button';
 import { Card } from '@/components/ui/card';
 import { Sprout, Sun, CloudRain, Users } from 'lucide-react';
 
 const languages: { code: Language; name: string; native: string }[] = [
   { code: 'en', name: 'English', native: 'English' },
   { code: 'hi', name: 'Hindi', native: 'हिंदी' },
   { code: 'mr', name: 'Marathi', native: 'मराठी' },
 ];
 
 const Welcome = () => {
   const navigate = useNavigate();
   const { language, setLanguage, t } = useLanguage();
   const [step, setStep] = useState<'language' | 'onboarding'>('language');
   const [slideIndex, setSlideIndex] = useState(0);
 
   const slides = [
     {
       icon: Sprout,
       title: t('onboarding.slide1.title'),
       description: t('onboarding.slide1.desc'),
       color: 'text-primary',
       bgColor: 'bg-primary/10',
     },
     {
       icon: CloudRain,
       title: t('onboarding.slide2.title'),
       description: t('onboarding.slide2.desc'),
       color: 'text-accent',
       bgColor: 'bg-accent/10',
     },
     {
       icon: Users,
       title: t('onboarding.slide3.title'),
       description: t('onboarding.slide3.desc'),
       color: 'text-secondary',
       bgColor: 'bg-secondary/10',
     },
   ];
 
   const handleLanguageSelect = (lang: Language) => {
     setLanguage(lang);
   };
 
   const handleContinue = () => {
     if (step === 'language') {
       setStep('onboarding');
     } else if (slideIndex < slides.length - 1) {
       setSlideIndex(slideIndex + 1);
     } else {
       localStorage.setItem('kisaanmitra-onboarded', 'true');
       navigate('/auth');
     }
   };
 
   const handleSkip = () => {
     localStorage.setItem('kisaanmitra-onboarded', 'true');
     navigate('/auth');
   };
 
   if (step === 'language') {
     return (
       <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center p-6">
         <div className="w-full max-w-md text-center">
           {/* Logo */}
           <div className="mb-8">
             <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
               <Sprout className="w-12 h-12 text-primary" />
             </div>
             <h1 className="text-3xl font-bold text-foreground mb-2">
               {t('welcome.title')}
             </h1>
             <p className="text-muted-foreground">
               {t('welcome.subtitle')}
             </p>
           </div>
 
           {/* Language Selection */}
           <p className="text-sm text-muted-foreground mb-4">
             {t('welcome.selectLanguage')}
           </p>
           <div className="space-y-3 mb-8">
             {languages.map((lang) => (
               <Card
                 key={lang.code}
                 className={`p-4 cursor-pointer transition-all ${
                   language === lang.code
                     ? 'border-primary bg-primary/5 ring-2 ring-primary'
                     : 'hover:border-primary/50'
                 }`}
                 onClick={() => handleLanguageSelect(lang.code)}
               >
                 <div className="flex items-center justify-between">
                   <span className="text-lg font-medium">{lang.native}</span>
                   <span className="text-sm text-muted-foreground">{lang.name}</span>
                 </div>
               </Card>
             ))}
           </div>
 
           <Button onClick={handleContinue} className="w-full" size="lg">
             {t('welcome.continue')}
           </Button>
         </div>
       </div>
     );
   }
 
   // Onboarding slides
   const currentSlide = slides[slideIndex];
   const IconComponent = currentSlide.icon;
 
   return (
     <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-between p-6">
       <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center text-center">
         {/* Slide Content */}
         <div className={`w-32 h-32 mx-auto mb-8 rounded-full ${currentSlide.bgColor} flex items-center justify-center`}>
           <IconComponent className={`w-16 h-16 ${currentSlide.color}`} />
         </div>
         
         <h2 className="text-2xl font-bold text-foreground mb-4">
           {currentSlide.title}
         </h2>
         <p className="text-muted-foreground text-lg">
           {currentSlide.description}
         </p>
 
         {/* Dots */}
         <div className="flex gap-2 mt-8">
           {slides.map((_, index) => (
             <div
               key={index}
               className={`w-2 h-2 rounded-full transition-all ${
                 index === slideIndex ? 'bg-primary w-6' : 'bg-muted'
               }`}
             />
           ))}
         </div>
       </div>
 
       {/* Actions */}
       <div className="w-full max-w-md space-y-3">
         <Button onClick={handleContinue} className="w-full" size="lg">
           {slideIndex === slides.length - 1
             ? t('onboarding.getStarted')
             : t('onboarding.next')}
         </Button>
         <Button variant="ghost" onClick={handleSkip} className="w-full">
           {t('onboarding.skip')}
         </Button>
       </div>
     </div>
   );
 };
 
 export default Welcome;