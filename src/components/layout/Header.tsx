import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const [userLocation, setUserLocation] = useState<string>('Detecting...');

    const showBackButton = location.pathname !== '/dashboard' &&
        location.pathname !== '/chat' &&
        location.pathname !== '/weather' &&
        location.pathname !== '/faq' &&
        location.pathname !== '/profile' &&
        location.pathname !== '/expert';

    useEffect(() => {
        // Simple mock location or browser API
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => setUserLocation('Mumbai, IN'), // Mock for prototype consistency or use real API
                () => setUserLocation('Location Off')
            );
        } else {
            setUserLocation('Unsupported');
        }
    }, []);

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

                    <img src="/logo.png" alt="Kisan Mitra" className="w-8 h-8 rounded-full bg-white" />
                    <span className="font-bold text-lg">Kisan Mitra</span>
                </div>

                <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                    <MapPin className="w-3 h-3" />
                    <span>{userLocation}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
