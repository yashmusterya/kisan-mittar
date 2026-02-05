 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useLanguage, Language } from '@/contexts/LanguageContext';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { User, MapPin, Sprout, Globe, LogOut, Loader2 } from 'lucide-react';
 import { toast } from 'sonner';
 
 const Profile = () => {
   const navigate = useNavigate();
   const { language, setLanguage, t } = useLanguage();
   const { profile, signOut, refreshProfile } = useAuth();
   
   const [editing, setEditing] = useState(false);
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
     full_name: profile?.full_name || '',
     location: profile?.location || '',
     primary_crop: profile?.primary_crop || '',
   });
 
   const handleSave = async () => {
     if (!profile) return;
     
     setLoading(true);
     const { error } = await supabase
       .from('profiles')
       .update({
         full_name: formData.full_name,
         location: formData.location,
         primary_crop: formData.primary_crop,
         language,
       })
       .eq('id', profile.id);
 
     if (error) {
       toast.error('Failed to update profile');
     } else {
       toast.success(language === 'en' ? 'Profile updated!' : language === 'hi' ? 'प्रोफ़ाइल अपडेट हुई!' : 'प्रोफाइल अपडेट झाले!');
       await refreshProfile();
       setEditing(false);
     }
     setLoading(false);
   };
 
   const handleLogout = async () => {
     await signOut();
     navigate('/');
   };
 
   const languages: { code: Language; native: string }[] = [
     { code: 'en', native: 'English' },
     { code: 'hi', native: 'हिंदी' },
     { code: 'mr', native: 'मराठी' },
   ];
 
   return (
     <div className="p-4 space-y-4">
       {/* Header */}
       <div className="pt-2">
         <h1 className="text-2xl font-bold text-foreground">{t('nav.profile')} 👤</h1>
       </div>
 
       {/* Profile Card */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <User className="w-5 h-5 text-primary" />
             {editing 
               ? (language === 'en' ? 'Edit Profile' : language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'प्रोफाइल संपादित करा')
               : (language === 'en' ? 'My Profile' : language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'माझी प्रोफाइल')
             }
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           {editing ? (
             <>
               <div className="space-y-2">
                 <Label htmlFor="name">{t('auth.fullName')}</Label>
                 <Input
                   id="name"
                   value={formData.full_name}
                   onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="location">{t('auth.location')}</Label>
                 <Input
                   id="location"
                   value={formData.location}
                   onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="crop">{t('auth.primaryCrop')}</Label>
                 <Input
                   id="crop"
                   value={formData.primary_crop}
                   onChange={(e) => setFormData({ ...formData, primary_crop: e.target.value })}
                 />
               </div>
               <div className="flex gap-2">
                 <Button onClick={handleSave} disabled={loading} className="flex-1">
                   {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                   {language === 'en' ? 'Save' : language === 'hi' ? 'सेव करें' : 'जतन करा'}
                 </Button>
                 <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                   {language === 'en' ? 'Cancel' : language === 'hi' ? 'रद्द करें' : 'रद्द करा'}
                 </Button>
               </div>
             </>
           ) : (
             <>
               <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                 <User className="w-5 h-5 text-muted-foreground" />
                 <div>
                   <p className="text-sm text-muted-foreground">{t('auth.fullName')}</p>
                   <p className="font-medium">{profile?.full_name}</p>
                 </div>
               </div>
               
               {profile?.location && (
                 <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                   <MapPin className="w-5 h-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm text-muted-foreground">{t('auth.location')}</p>
                     <p className="font-medium">{profile.location}</p>
                   </div>
                 </div>
               )}
               
               {profile?.primary_crop && (
                 <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                   <Sprout className="w-5 h-5 text-muted-foreground" />
                   <div>
                     <p className="text-sm text-muted-foreground">{t('auth.primaryCrop')}</p>
                     <p className="font-medium">{profile.primary_crop}</p>
                   </div>
                 </div>
               )}
               
               <Button variant="outline" onClick={() => setEditing(true)} className="w-full">
                 {language === 'en' ? 'Edit Profile' : language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'प्रोफाइल संपादित करा'}
               </Button>
             </>
           )}
         </CardContent>
       </Card>
 
       {/* Language Selection */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Globe className="w-5 h-5 text-primary" />
             {language === 'en' ? 'Language' : language === 'hi' ? 'भाषा' : 'भाषा'}
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-3 gap-2">
             {languages.map((lang) => (
               <Button
                 key={lang.code}
                 variant={language === lang.code ? 'default' : 'outline'}
                 onClick={() => setLanguage(lang.code)}
                 className="w-full"
               >
                 {lang.native}
               </Button>
             ))}
           </div>
         </CardContent>
       </Card>
 
       {/* Logout */}
       <Button variant="destructive" onClick={handleLogout} className="w-full">
         <LogOut className="w-4 h-4 mr-2" />
         {t('nav.logout')}
       </Button>
     </div>
   );
 };
 
 export default Profile;