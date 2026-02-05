import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { profile } = useAuth();
    const [userLocation, setUserLocation] = useState<string>(profile?.location || 'Detecting...');

    // Show back button on all internal pages except dashboard
    const showBackButton = location.pathname !== '/dashboard';

    useEffect(() => {
        // Use profile location if available, otherwise try geolocation
        if (profile?.location) {
            setUserLocation(profile.location);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Use coordinates to show a general location
                    setUserLocation(`${position.coords.latitude.toFixed(2)}°N, ${position.coords.longitude.toFixed(2)}°E`);
                },
                () => setUserLocation('Location Off')
            );
        } else {
            setUserLocation('Unsupported');
        }
    }, [profile?.location]);

    return (
        <header className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground z-50 p-3 shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {showBackButton && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-primary-foreground hover:bg-primary/80 -ml-2"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    )}

                    <img src={logo} alt="Kisaan Mitra" className="w-8 h-8 rounded-full bg-background object-cover" />
                    <span className="font-bold text-lg">Kisaan Mitra</span>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-1 text-xs bg-background/20 px-2 py-1 rounded-full hover:bg-background/30"
                    >
                        <MapPin className="w-3 h-3" />
                        <span>{userLocation}</span>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;
