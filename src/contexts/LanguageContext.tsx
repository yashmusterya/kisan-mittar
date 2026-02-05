 import React, { createContext, useContext, useState, useEffect } from 'react';
 
 export type Language = 'en' | 'hi' | 'mr';
 
 interface LanguageContextType {
   language: Language;
   setLanguage: (lang: Language) => void;
   t: (key: string) => string;
 }
 
 const translations: Record<Language, Record<string, string>> = {
   en: {
     // Onboarding
     'welcome.title': 'Welcome to KisaanMitra',
     'welcome.subtitle': 'Your AI-powered farming companion',
     'welcome.selectLanguage': 'Select your preferred language',
     'welcome.continue': 'Continue',
     'welcome.english': 'English',
     'welcome.hindi': 'हिंदी',
     'welcome.marathi': 'मराठी',
     
     // Onboarding slides
     'onboarding.slide1.title': 'Ask AI Anything',
     'onboarding.slide1.desc': 'Get instant answers to your farming questions in your language',
     'onboarding.slide2.title': 'Weather Alerts',
     'onboarding.slide2.desc': 'Receive timely alerts to protect your crops',
     'onboarding.slide3.title': 'Expert Verified',
     'onboarding.slide3.desc': 'All AI responses are reviewed by agricultural experts',
     'onboarding.getStarted': 'Get Started',
     'onboarding.next': 'Next',
     'onboarding.skip': 'Skip',
     
     // Auth
     'auth.login': 'Login',
     'auth.signup': 'Sign Up',
     'auth.email': 'Email',
     'auth.password': 'Password',
     'auth.fullName': 'Full Name',
     'auth.selectRole': 'I am a...',
     'auth.farmer': 'Farmer',
     'auth.expert': 'Agricultural Expert',
     'auth.location': 'Location (Village/District)',
     'auth.primaryCrop': 'Primary Crop',
     'auth.noAccount': "Don't have an account?",
     'auth.hasAccount': 'Already have an account?',
     'auth.verifyEmail': 'Please check your email to verify your account',
     
     // Dashboard
     'dashboard.greeting': 'Namaste',
     'dashboard.todayTip': "Today's Farming Tip",
     'dashboard.askAI': 'Ask AI',
     'dashboard.faqs': 'Browse FAQs',
     'dashboard.myQuestions': 'My Questions',
     'dashboard.weather': 'Weather',
     'dashboard.recentChats': 'Recent Conversations',
     'dashboard.viewAll': 'View All',
     
     // Weather
     'weather.today': 'Today',
     'weather.forecast': '5-Day Forecast',
     'weather.alerts': 'Active Alerts',
     'weather.recommendation': 'Farming Recommendation',
     'weather.humidity': 'Humidity',
     'weather.wind': 'Wind',
     'weather.rain': 'Rain Chance',
     
     // AI Chat
     'chat.title': 'Ask KisaanMitra',
     'chat.placeholder': 'Type your farming question...',
     'chat.uploadImage': 'Upload crop image',
     'chat.disclaimer': 'AI suggestions - consult experts for critical decisions',
     'chat.newChat': 'New Chat',
     
     // FAQs
     'faq.title': 'Frequently Asked Questions',
     'faq.search': 'Search questions...',
     'faq.askAI': 'Ask AI about this',
     'faq.crops': 'Crops',
     'faq.soil': 'Soil',
     'faq.pests': 'Pests',
     'faq.seasons': 'Seasons',
     'faq.water': 'Water',
     
     // My Questions
     'questions.title': 'My Questions',
     'questions.pending': 'Pending',
     'questions.aiAnswered': 'AI Answered',
     'questions.expertVerified': 'Expert Verified',
     'questions.noQuestions': 'No questions yet',
     
     // Expert Dashboard
     'expert.title': 'Expert Dashboard',
     'expert.pendingReview': 'Pending Review',
     'expert.verified': 'Verified Answers',
     'expert.flagged': 'Flagged',
     'expert.verify': 'Verify Answer',
     'expert.addAnswer': 'Add Expert Answer',
     'expert.flag': 'Flag as Incorrect',
     
     // Navigation
     'nav.home': 'Home',
     'nav.chat': 'AI Chat',
     'nav.weather': 'Weather',
     'nav.faq': 'FAQs',
     'nav.profile': 'Profile',
     'nav.logout': 'Logout',
   },
   hi: {
     // Onboarding
     'welcome.title': 'किसानमित्र में आपका स्वागत है',
     'welcome.subtitle': 'आपका AI-संचालित कृषि साथी',
     'welcome.selectLanguage': 'अपनी पसंदीदा भाषा चुनें',
     'welcome.continue': 'जारी रखें',
     'welcome.english': 'English',
     'welcome.hindi': 'हिंदी',
     'welcome.marathi': 'मराठी',
     
     // Onboarding slides
     'onboarding.slide1.title': 'AI से कुछ भी पूछें',
     'onboarding.slide1.desc': 'अपनी भाषा में खेती के सवालों के तुरंत जवाब पाएं',
     'onboarding.slide2.title': 'मौसम अलर्ट',
     'onboarding.slide2.desc': 'अपनी फसलों की सुरक्षा के लिए समय पर अलर्ट पाएं',
     'onboarding.slide3.title': 'विशेषज्ञ सत्यापित',
     'onboarding.slide3.desc': 'सभी AI उत्तर कृषि विशेषज्ञों द्वारा समीक्षित हैं',
     'onboarding.getStarted': 'शुरू करें',
     'onboarding.next': 'अगला',
     'onboarding.skip': 'छोड़ें',
     
     // Auth
     'auth.login': 'लॉग इन करें',
     'auth.signup': 'साइन अप करें',
     'auth.email': 'ईमेल',
     'auth.password': 'पासवर्ड',
     'auth.fullName': 'पूरा नाम',
     'auth.selectRole': 'मैं हूं...',
     'auth.farmer': 'किसान',
     'auth.expert': 'कृषि विशेषज्ञ',
     'auth.location': 'स्थान (गांव/जिला)',
     'auth.primaryCrop': 'मुख्य फसल',
     'auth.noAccount': 'खाता नहीं है?',
     'auth.hasAccount': 'पहले से खाता है?',
     'auth.verifyEmail': 'कृपया अपना खाता सत्यापित करने के लिए अपना ईमेल देखें',
     
     // Dashboard
     'dashboard.greeting': 'नमस्ते',
     'dashboard.todayTip': 'आज की खेती टिप',
     'dashboard.askAI': 'AI से पूछें',
     'dashboard.faqs': 'FAQs देखें',
     'dashboard.myQuestions': 'मेरे सवाल',
     'dashboard.weather': 'मौसम',
     'dashboard.recentChats': 'हाल की बातचीत',
     'dashboard.viewAll': 'सभी देखें',
     
     // Weather
     'weather.today': 'आज',
     'weather.forecast': '5-दिन का पूर्वानुमान',
     'weather.alerts': 'सक्रिय अलर्ट',
     'weather.recommendation': 'खेती की सिफारिश',
     'weather.humidity': 'नमी',
     'weather.wind': 'हवा',
     'weather.rain': 'बारिश की संभावना',
     
     // AI Chat
     'chat.title': 'किसानमित्र से पूछें',
     'chat.placeholder': 'अपना खेती का सवाल लिखें...',
     'chat.uploadImage': 'फसल की तस्वीर अपलोड करें',
     'chat.disclaimer': 'AI सुझाव - महत्वपूर्ण निर्णयों के लिए विशेषज्ञों से परामर्श करें',
     'chat.newChat': 'नई चैट',
     
     // FAQs
     'faq.title': 'अक्सर पूछे जाने वाले प्रश्न',
     'faq.search': 'प्रश्न खोजें...',
     'faq.askAI': 'इसके बारे में AI से पूछें',
     'faq.crops': 'फसलें',
     'faq.soil': 'मिट्टी',
     'faq.pests': 'कीट',
     'faq.seasons': 'मौसम',
     'faq.water': 'पानी',
     
     // My Questions
     'questions.title': 'मेरे सवाल',
     'questions.pending': 'लंबित',
     'questions.aiAnswered': 'AI उत्तर',
     'questions.expertVerified': 'विशेषज्ञ सत्यापित',
     'questions.noQuestions': 'अभी तक कोई सवाल नहीं',
     
     // Expert Dashboard
     'expert.title': 'विशेषज्ञ डैशबोर्ड',
     'expert.pendingReview': 'समीक्षा लंबित',
     'expert.verified': 'सत्यापित उत्तर',
     'expert.flagged': 'चिह्नित',
     'expert.verify': 'उत्तर सत्यापित करें',
     'expert.addAnswer': 'विशेषज्ञ उत्तर जोड़ें',
     'expert.flag': 'गलत के रूप में चिह्नित करें',
     
     // Navigation
     'nav.home': 'होम',
     'nav.chat': 'AI चैट',
     'nav.weather': 'मौसम',
     'nav.faq': 'FAQs',
     'nav.profile': 'प्रोफाइल',
     'nav.logout': 'लॉग आउट',
   },
   mr: {
     // Onboarding
     'welcome.title': 'किसानमित्र मध्ये आपले स्वागत आहे',
     'welcome.subtitle': 'तुमचा AI-चालित शेती साथीदार',
     'welcome.selectLanguage': 'तुमची आवडती भाषा निवडा',
     'welcome.continue': 'पुढे जा',
     'welcome.english': 'English',
     'welcome.hindi': 'हिंदी',
     'welcome.marathi': 'मराठी',
     
     // Onboarding slides
     'onboarding.slide1.title': 'AI ला काहीही विचारा',
     'onboarding.slide1.desc': 'तुमच्या भाषेत शेतीच्या प्रश्नांची तात्काळ उत्तरे मिळवा',
     'onboarding.slide2.title': 'हवामान अलर्ट',
     'onboarding.slide2.desc': 'तुमच्या पिकांचे संरक्षण करण्यासाठी वेळेवर अलर्ट मिळवा',
     'onboarding.slide3.title': 'तज्ञ सत्यापित',
     'onboarding.slide3.desc': 'सर्व AI उत्तरे कृषी तज्ञांनी तपासली आहेत',
     'onboarding.getStarted': 'सुरू करा',
     'onboarding.next': 'पुढे',
     'onboarding.skip': 'वगळा',
     
     // Auth
     'auth.login': 'लॉग इन करा',
     'auth.signup': 'साइन अप करा',
     'auth.email': 'ईमेल',
     'auth.password': 'पासवर्ड',
     'auth.fullName': 'पूर्ण नाव',
     'auth.selectRole': 'मी आहे...',
     'auth.farmer': 'शेतकरी',
     'auth.expert': 'कृषी तज्ञ',
     'auth.location': 'स्थान (गाव/जिल्हा)',
     'auth.primaryCrop': 'मुख्य पीक',
     'auth.noAccount': 'खाते नाही?',
     'auth.hasAccount': 'आधीच खाते आहे?',
     'auth.verifyEmail': 'कृपया तुमचे खाते सत्यापित करण्यासाठी तुमचे ईमेल तपासा',
     
     // Dashboard
     'dashboard.greeting': 'नमस्कार',
     'dashboard.todayTip': 'आजची शेती टिप',
     'dashboard.askAI': 'AI ला विचारा',
     'dashboard.faqs': 'FAQs पहा',
     'dashboard.myQuestions': 'माझे प्रश्न',
     'dashboard.weather': 'हवामान',
     'dashboard.recentChats': 'अलीकडील संभाषणे',
     'dashboard.viewAll': 'सर्व पहा',
     
     // Weather
     'weather.today': 'आज',
     'weather.forecast': '5-दिवसांचा अंदाज',
     'weather.alerts': 'सक्रिय अलर्ट',
     'weather.recommendation': 'शेती शिफारस',
     'weather.humidity': 'आर्द्रता',
     'weather.wind': 'वारा',
     'weather.rain': 'पावसाची शक्यता',
     
     // AI Chat
     'chat.title': 'किसानमित्र ला विचारा',
     'chat.placeholder': 'तुमचा शेतीचा प्रश्न लिहा...',
     'chat.uploadImage': 'पिकाचा फोटो अपलोड करा',
     'chat.disclaimer': 'AI सूचना - महत्त्वाच्या निर्णयांसाठी तज्ञांचा सल्ला घ्या',
     'chat.newChat': 'नवीन चॅट',
     
     // FAQs
     'faq.title': 'वारंवार विचारले जाणारे प्रश्न',
     'faq.search': 'प्रश्न शोधा...',
     'faq.askAI': 'याबद्दल AI ला विचारा',
     'faq.crops': 'पिके',
     'faq.soil': 'माती',
     'faq.pests': 'कीटक',
     'faq.seasons': 'ऋतू',
     'faq.water': 'पाणी',
     
     // My Questions
     'questions.title': 'माझे प्रश्न',
     'questions.pending': 'प्रलंबित',
     'questions.aiAnswered': 'AI उत्तर',
     'questions.expertVerified': 'तज्ञ सत्यापित',
     'questions.noQuestions': 'अजून कोणतेही प्रश्न नाहीत',
     
     // Expert Dashboard
     'expert.title': 'तज्ञ डॅशबोर्ड',
     'expert.pendingReview': 'समीक्षा प्रलंबित',
     'expert.verified': 'सत्यापित उत्तरे',
     'expert.flagged': 'चिन्हांकित',
     'expert.verify': 'उत्तर सत्यापित करा',
     'expert.addAnswer': 'तज्ञ उत्तर जोडा',
     'expert.flag': 'चुकीचे म्हणून चिन्हांकित करा',
     
     // Navigation
     'nav.home': 'होम',
     'nav.chat': 'AI चॅट',
     'nav.weather': 'हवामान',
     'nav.faq': 'FAQs',
     'nav.profile': 'प्रोफाइल',
     'nav.logout': 'लॉग आउट',
   },
 };
 
 const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
 
 export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [language, setLanguageState] = useState<Language>(() => {
     const saved = localStorage.getItem('kisaanmitra-language');
     return (saved as Language) || 'en';
   });
 
   const setLanguage = (lang: Language) => {
     setLanguageState(lang);
     localStorage.setItem('kisaanmitra-language', lang);
   };
 
   const t = (key: string): string => {
     return translations[language][key] || key;
   };
 
   return (
     <LanguageContext.Provider value={{ language, setLanguage, t }}>
       {children}
     </LanguageContext.Provider>
   );
 };
 
 export const useLanguage = () => {
   const context = useContext(LanguageContext);
   if (context === undefined) {
     throw new Error('useLanguage must be used within a LanguageProvider');
   }
   return context;
 };