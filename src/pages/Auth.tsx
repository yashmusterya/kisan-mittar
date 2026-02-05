import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sprout, User, GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { signUp, signIn, user, loading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'farmer' | 'expert'>('farmer');
  const [location, setLocation] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, {
          full_name: fullName,
          role,
          language: language as 'en' | 'hi' | 'mr' | 'kn',
          location: location || undefined,
          primary_crop: primaryCrop || undefined,
        });

        if (error) {
          toast.error(error.message);
          setLoading(false);
        } else {
          toast.success(t('auth.verifyEmail'));
          setMode('login');
          setLoading(false);
        }
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          toast.error(error.message);
          setLoading(false);
        }
        // Don't setLoading(false) on success - let the redirect happen
      }
    } catch (error) {
      toast.error('An error occurred');
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Sprout className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {mode === 'login' ? t('auth.login') : t('auth.signup')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('auth.selectRole')}</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value) => setRole(value as 'farmer' | 'expert')}
                    className="grid grid-cols-2 gap-4"
                    disabled={loading}
                  >
                    <Label
                      htmlFor="farmer"
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        role === 'farmer'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <RadioGroupItem value="farmer" id="farmer" className="sr-only" />
                      <User className="w-8 h-8 mb-2 text-primary" />
                      <span className="font-medium">{t('auth.farmer')}</span>
                    </Label>
                    <Label
                      htmlFor="expert"
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        role === 'expert'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <RadioGroupItem value="expert" id="expert" className="sr-only" />
                      <GraduationCap className="w-8 h-8 mb-2 text-secondary" />
                      <span className="font-medium">{t('auth.expert')}</span>
                    </Label>
                  </RadioGroup>
                </div>

                {role === 'farmer' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="location">{t('auth.location')}</Label>
                      <Input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Nashik, Maharashtra"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryCrop">{t('auth.primaryCrop')}</Label>
                      <Input
                        id="primaryCrop"
                        type="text"
                        value={primaryCrop}
                        onChange={(e) => setPrimaryCrop(e.target.value)}
                        placeholder="e.g., Wheat, Rice, Cotton"
                        disabled={loading}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'login' ? t('auth.login') : t('auth.signup')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <span className="font-semibold">
                {mode === 'login' ? t('auth.signup') : t('auth.login')}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
