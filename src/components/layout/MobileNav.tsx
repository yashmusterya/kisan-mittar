 import { Link, useLocation } from 'react-router-dom';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useAuth } from '@/contexts/AuthContext';
 import { Home, MessageCircle, CloudSun, HelpCircle, User } from 'lucide-react';
 
 const MobileNav = () => {
   const location = useLocation();
   const { t } = useLanguage();
   const { profile } = useAuth();
 
   const isExpert = profile?.role === 'expert';
 
   const navItems = [
     { path: '/dashboard', icon: Home, label: t('nav.home') },
     { path: '/chat', icon: MessageCircle, label: t('nav.chat') },
     { path: '/weather', icon: CloudSun, label: t('nav.weather') },
     { path: '/faq', icon: HelpCircle, label: t('nav.faq') },
     { path: isExpert ? '/expert' : '/profile', icon: User, label: t('nav.profile') },
   ];
 
   return (
     <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
       <div className="flex items-center justify-around py-2">
         {navItems.map((item) => {
           const isActive = location.pathname === item.path;
           const Icon = item.icon;
           
           return (
             <Link
               key={item.path}
               to={item.path}
               className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${
                 isActive
                   ? 'text-primary'
                   : 'text-muted-foreground hover:text-foreground'
               }`}
             >
               <Icon className="w-6 h-6" />
               <span className="text-xs mt-1">{item.label}</span>
             </Link>
           );
         })}
       </div>
     </nav>
   );
 };
 
 export default MobileNav;