import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'mr' | 'kn';

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
    'welcome.kannada': 'ಕನ್ನಡ',
    
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
    'auth.dealer': 'Seed/Fertilizer Dealer',
    'auth.fpo': 'FPO/Cooperative',
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
    'dashboard.community': 'Community',
    
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
    'chat.uploadImage': 'Upload crop image for diagnosis',
    'chat.disclaimer': 'AI suggestions - consult experts for critical decisions',
    'chat.newChat': 'New Chat',
    'chat.analyzing': 'Analyzing image...',
    
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
    'nav.shop': 'Shop',
    'nav.alerts': 'Alerts',
    'nav.weather': 'Weather',
    'nav.faq': 'FAQs',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.community': 'Community',
    
    // Shop
    'shop.title': 'Shop',
    'shop.search': 'Search products...',
    'shop.addToCart': 'Add',
    'shop.cart': 'Cart',
    'shop.emptyCart': 'Your cart is empty',
    'shop.emptyCartDesc': 'Add some products to get started',
    'shop.continueShopping': 'Continue Shopping',
    'shop.orderSummary': 'Order Summary',
    'shop.items': 'Items',
    'shop.total': 'Total',
    'shop.checkout': 'Proceed to Checkout',
    'shop.clearCart': 'Clear Cart',
    'shop.outOfStock': 'Out of Stock',
    'shop.noProducts': 'No products found',
    'shop.tryDifferentSearch': 'Try a different search or category',
    'shop.category.all': 'All',
    'shop.category.seeds': 'Seeds',
    'shop.category.fertilizers': 'Fertilizers',
    'shop.category.pesticides': 'Pesticides',
    'shop.category.tools': 'Tools',
    'shop.category.irrigation': 'Irrigation',
    
    // Voice
    'voice.tapToSpeak': 'Tap to speak',
    'voice.listening': 'Listening...',
    'voice.speaking': 'Speaking...',
    'voice.speakNow': 'Speak now',
    
    // Alerts
    'alerts.title': 'Weather Alerts',
    'alerts.noAlerts': 'No active alerts',
    'alerts.noAlertsDesc': 'You will be notified when there are weather alerts for your area',
    'alerts.severity.low': 'Low',
    'alerts.severity.medium': 'Medium',
    'alerts.severity.high': 'High',
    'alerts.severity.critical': 'Critical',
    'alerts.emailSubscribe': 'Get email alerts',
    'alerts.emailUnsubscribe': 'Stop email alerts',
    
    // Community
    'community.title': 'Farmer Community',
    'community.dealers': 'Local Dealers',
    'community.fpos': 'FPOs & Cooperatives',
    'community.experts': 'Agricultural Experts',
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
    'welcome.kannada': 'ಕನ್ನಡ',
    
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
    'auth.dealer': 'बीज/उर्वरक विक्रेता',
    'auth.fpo': 'FPO/सहकारी',
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
    'dashboard.community': 'समुदाय',
    
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
    'chat.uploadImage': 'रोग पहचान के लिए फसल की फोटो अपलोड करें',
    'chat.disclaimer': 'AI सुझाव - महत्वपूर्ण निर्णयों के लिए विशेषज्ञों से परामर्श करें',
    'chat.newChat': 'नई चैट',
    'chat.analyzing': 'फोटो का विश्लेषण हो रहा है...',
    
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
    'nav.shop': 'दुकान',
    'nav.alerts': 'अलर्ट',
    'nav.weather': 'मौसम',
    'nav.faq': 'FAQs',
    'nav.profile': 'प्रोफाइल',
    'nav.logout': 'लॉग आउट',
    'nav.community': 'समुदाय',
    
    // Shop
    'shop.title': 'दुकान',
    'shop.search': 'उत्पाद खोजें...',
    'shop.addToCart': 'जोड़ें',
    'shop.cart': 'कार्ट',
    'shop.emptyCart': 'आपका कार्ट खाली है',
    'shop.emptyCartDesc': 'शुरू करने के लिए कुछ उत्पाद जोड़ें',
    'shop.continueShopping': 'खरीदारी जारी रखें',
    'shop.orderSummary': 'ऑर्डर सारांश',
    'shop.items': 'आइटम',
    'shop.total': 'कुल',
    'shop.checkout': 'चेकआउट करें',
    'shop.clearCart': 'कार्ट खाली करें',
    'shop.outOfStock': 'स्टॉक में नहीं',
    'shop.noProducts': 'कोई उत्पाद नहीं मिला',
    'shop.tryDifferentSearch': 'कोई अलग खोज या श्रेणी आज़माएं',
    'shop.category.all': 'सभी',
    'shop.category.seeds': 'बीज',
    'shop.category.fertilizers': 'उर्वरक',
    'shop.category.pesticides': 'कीटनाशक',
    'shop.category.tools': 'उपकरण',
    'shop.category.irrigation': 'सिंचाई',
    
    // Voice
    'voice.tapToSpeak': 'बोलने के लिए टैप करें',
    'voice.listening': 'सुन रहे हैं...',
    'voice.speaking': 'बोल रहे हैं...',
    'voice.speakNow': 'अब बोलें',
    
    // Alerts
    'alerts.title': 'मौसम अलर्ट',
    'alerts.noAlerts': 'कोई सक्रिय अलर्ट नहीं',
    'alerts.noAlertsDesc': 'जब आपके क्षेत्र में मौसम अलर्ट होंगे तब आपको सूचित किया जाएगा',
    'alerts.severity.low': 'कम',
    'alerts.severity.medium': 'मध्यम',
    'alerts.severity.high': 'उच्च',
    'alerts.severity.critical': 'गंभीर',
    'alerts.emailSubscribe': 'ईमेल अलर्ट पाएं',
    'alerts.emailUnsubscribe': 'ईमेल अलर्ट बंद करें',
    
    // Community
    'community.title': 'किसान समुदाय',
    'community.dealers': 'स्थानीय विक्रेता',
    'community.fpos': 'FPOs और सहकारी',
    'community.experts': 'कृषि विशेषज्ञ',
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
    'welcome.kannada': 'ಕನ್ನಡ',
    
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
    'auth.dealer': 'बियाणे/खत विक्रेता',
    'auth.fpo': 'FPO/सहकारी',
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
    'dashboard.community': 'समुदाय',
    
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
    'chat.uploadImage': 'रोग ओळखण्यासाठी पिकाचा फोटो अपलोड करा',
    'chat.disclaimer': 'AI सूचना - महत्त्वाच्या निर्णयांसाठी तज्ञांचा सल्ला घ्या',
    'chat.newChat': 'नवीन चॅट',
    'chat.analyzing': 'फोटोचे विश्लेषण होत आहे...',
    
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
    'nav.shop': 'दुकान',
    'nav.alerts': 'अलर्ट',
    'nav.weather': 'हवामान',
    'nav.faq': 'FAQs',
    'nav.profile': 'प्रोफाइल',
    'nav.logout': 'लॉग आउट',
    'nav.community': 'समुदाय',
    
    // Shop
    'shop.title': 'दुकान',
    'shop.search': 'उत्पादने शोधा...',
    'shop.addToCart': 'जोडा',
    'shop.cart': 'कार्ट',
    'shop.emptyCart': 'तुमची कार्ट रिकामी आहे',
    'shop.emptyCartDesc': 'सुरू करण्यासाठी काही उत्पादने जोडा',
    'shop.continueShopping': 'खरेदी सुरू ठेवा',
    'shop.orderSummary': 'ऑर्डर सारांश',
    'shop.items': 'आयटम',
    'shop.total': 'एकूण',
    'shop.checkout': 'चेकआउट करा',
    'shop.clearCart': 'कार्ट रिकामी करा',
    'shop.outOfStock': 'स्टॉकमध्ये नाही',
    'shop.noProducts': 'कोणतीही उत्पादने सापडली नाहीत',
    'shop.tryDifferentSearch': 'वेगळी शोध किंवा श्रेणी वापरून पहा',
    'shop.category.all': 'सर्व',
    'shop.category.seeds': 'बियाणे',
    'shop.category.fertilizers': 'खते',
    'shop.category.pesticides': 'कीटकनाशके',
    'shop.category.tools': 'साधने',
    'shop.category.irrigation': 'सिंचन',
    
    // Voice
    'voice.tapToSpeak': 'बोलण्यासाठी टॅप करा',
    'voice.listening': 'ऐकत आहे...',
    'voice.speaking': 'बोलत आहे...',
    'voice.speakNow': 'आता बोला',
    
    // Alerts
    'alerts.title': 'हवामान अलर्ट',
    'alerts.noAlerts': 'कोणतेही सक्रिय अलर्ट नाहीत',
    'alerts.noAlertsDesc': 'तुमच्या क्षेत्रात हवामान अलर्ट असतील तेव्हा तुम्हाला सूचित केले जाईल',
    'alerts.severity.low': 'कमी',
    'alerts.severity.medium': 'मध्यम',
    'alerts.severity.high': 'उच्च',
    'alerts.severity.critical': 'गंभीर',
    'alerts.emailSubscribe': 'ईमेल अलर्ट मिळवा',
    'alerts.emailUnsubscribe': 'ईमेल अलर्ट थांबवा',
    
    // Community
    'community.title': 'शेतकरी समुदाय',
    'community.dealers': 'स्थानिक विक्रेते',
    'community.fpos': 'FPOs आणि सहकारी',
    'community.experts': 'कृषी तज्ञ',
  },
  kn: {
    // Onboarding
    'welcome.title': 'ಕಿಸಾನ್‌ಮಿತ್ರಕ್ಕೆ ಸ್ವಾಗತ',
    'welcome.subtitle': 'ನಿಮ್ಮ AI-ಚಾಲಿತ ಕೃಷಿ ಸಂಗಾತಿ',
    'welcome.selectLanguage': 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'welcome.continue': 'ಮುಂದುವರಿಸಿ',
    'welcome.english': 'English',
    'welcome.hindi': 'हिंदी',
    'welcome.marathi': 'मराठी',
    'welcome.kannada': 'ಕನ್ನಡ',
    
    // Onboarding slides
    'onboarding.slide1.title': 'AI ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ',
    'onboarding.slide1.desc': 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ತಕ್ಷಣ ಉತ್ತರ ಪಡೆಯಿರಿ',
    'onboarding.slide2.title': 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು',
    'onboarding.slide2.desc': 'ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಲು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಿರಿ',
    'onboarding.slide3.title': 'ತಜ್ಞ ಪರಿಶೀಲಿತ',
    'onboarding.slide3.desc': 'ಎಲ್ಲಾ AI ಉತ್ತರಗಳನ್ನು ಕೃಷಿ ತಜ್ಞರು ಪರಿಶೀಲಿಸಿದ್ದಾರೆ',
    'onboarding.getStarted': 'ಪ್ರಾರಂಭಿಸಿ',
    'onboarding.next': 'ಮುಂದೆ',
    'onboarding.skip': 'ಬಿಟ್ಟುಬಿಡಿ',
    
    // Auth
    'auth.login': 'ಲಾಗಿನ್',
    'auth.signup': 'ಸೈನ್ ಅಪ್',
    'auth.email': 'ಇಮೇಲ್',
    'auth.password': 'ಪಾಸ್‌ವರ್ಡ್',
    'auth.fullName': 'ಪೂರ್ಣ ಹೆಸರು',
    'auth.selectRole': 'ನಾನು...',
    'auth.farmer': 'ರೈತ',
    'auth.expert': 'ಕೃಷಿ ತಜ್ಞ',
    'auth.dealer': 'ಬೀಜ/ಗೊಬ್ಬರ ವ್ಯಾಪಾರಿ',
    'auth.fpo': 'FPO/ಸಹಕಾರಿ',
    'auth.location': 'ಸ್ಥಳ (ಹಳ್ಳಿ/ಜಿಲ್ಲೆ)',
    'auth.primaryCrop': 'ಮುಖ್ಯ ಬೆಳೆ',
    'auth.noAccount': 'ಖಾತೆ ಇಲ್ಲವೇ?',
    'auth.hasAccount': 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
    'auth.verifyEmail': 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ',
    
    // Dashboard
    'dashboard.greeting': 'ನಮಸ್ಕಾರ',
    'dashboard.todayTip': 'ಇಂದಿನ ಕೃಷಿ ಸಲಹೆ',
    'dashboard.askAI': 'AI ಗೆ ಕೇಳಿ',
    'dashboard.faqs': 'FAQs ನೋಡಿ',
    'dashboard.myQuestions': 'ನನ್ನ ಪ್ರಶ್ನೆಗಳು',
    'dashboard.weather': 'ಹವಾಮಾನ',
    'dashboard.recentChats': 'ಇತ್ತೀಚಿನ ಸಂಭಾಷಣೆಗಳು',
    'dashboard.viewAll': 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
    'dashboard.community': 'ಸಮುದಾಯ',
    
    // Weather
    'weather.today': 'ಇಂದು',
    'weather.forecast': '5-ದಿನ ಮುನ್ಸೂಚನೆ',
    'weather.alerts': 'ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು',
    'weather.recommendation': 'ಕೃಷಿ ಶಿಫಾರಸು',
    'weather.humidity': 'ತೇವಾಂಶ',
    'weather.wind': 'ಗಾಳಿ',
    'weather.rain': 'ಮಳೆ ಸಾಧ್ಯತೆ',
    
    // AI Chat
    'chat.title': 'ಕಿಸಾನ್‌ಮಿತ್ರಗೆ ಕೇಳಿ',
    'chat.placeholder': 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ...',
    'chat.uploadImage': 'ರೋಗ ಗುರುತಿಸಲು ಬೆಳೆ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    'chat.disclaimer': 'AI ಸಲಹೆಗಳು - ಮುಖ್ಯ ನಿರ್ಧಾರಗಳಿಗೆ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ',
    'chat.newChat': 'ಹೊಸ ಚಾಟ್',
    'chat.analyzing': 'ಚಿತ್ರ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    
    // FAQs
    'faq.title': 'ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು',
    'faq.search': 'ಪ್ರಶ್ನೆಗಳನ್ನು ಹುಡುಕಿ...',
    'faq.askAI': 'ಇದರ ಬಗ್ಗೆ AI ಗೆ ಕೇಳಿ',
    'faq.crops': 'ಬೆಳೆಗಳು',
    'faq.soil': 'ಮಣ್ಣು',
    'faq.pests': 'ಕೀಟಗಳು',
    'faq.seasons': 'ಋತುಗಳು',
    'faq.water': 'ನೀರು',
    
    // My Questions
    'questions.title': 'ನನ್ನ ಪ್ರಶ್ನೆಗಳು',
    'questions.pending': 'ಬಾಕಿ ಇದೆ',
    'questions.aiAnswered': 'AI ಉತ್ತರಿಸಿದೆ',
    'questions.expertVerified': 'ತಜ್ಞ ಪರಿಶೀಲಿತ',
    'questions.noQuestions': 'ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿಲ್ಲ',
    
    // Expert Dashboard
    'expert.title': 'ತಜ್ಞ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'expert.pendingReview': 'ಪರಿಶೀಲನೆ ಬಾಕಿ',
    'expert.verified': 'ಪರಿಶೀಲಿತ ಉತ್ತರಗಳು',
    'expert.flagged': 'ಫ್ಲ್ಯಾಗ್ ಮಾಡಲಾಗಿದೆ',
    'expert.verify': 'ಉತ್ತರ ಪರಿಶೀಲಿಸಿ',
    'expert.addAnswer': 'ತಜ್ಞ ಉತ್ತರ ಸೇರಿಸಿ',
    'expert.flag': 'ತಪ್ಪು ಎಂದು ಫ್ಲ್ಯಾಗ್ ಮಾಡಿ',
    
    // Navigation
    'nav.home': 'ಮನೆ',
    'nav.chat': 'AI ಚಾಟ್',
    'nav.shop': 'ಅಂಗಡಿ',
    'nav.alerts': 'ಎಚ್ಚರಿಕೆಗಳು',
    'nav.weather': 'ಹವಾಮಾನ',
    'nav.faq': 'FAQs',
    'nav.profile': 'ಪ್ರೊಫೈಲ್',
    'nav.logout': 'ಲಾಗ್ ಔಟ್',
    'nav.community': 'ಸಮುದಾಯ',
    
    // Shop
    'shop.title': 'ಅಂಗಡಿ',
    'shop.search': 'ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ...',
    'shop.addToCart': 'ಸೇರಿಸಿ',
    'shop.cart': 'ಕಾರ್ಟ್',
    'shop.emptyCart': 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ',
    'shop.emptyCartDesc': 'ಪ್ರಾರಂಭಿಸಲು ಕೆಲವು ಉತ್ಪನ್ನಗಳನ್ನು ಸೇರಿಸಿ',
    'shop.continueShopping': 'ಶಾಪಿಂಗ್ ಮುಂದುವರಿಸಿ',
    'shop.orderSummary': 'ಆರ್ಡರ್ ಸಾರಾಂಶ',
    'shop.items': 'ಐಟಂಗಳು',
    'shop.total': 'ಒಟ್ಟು',
    'shop.checkout': 'ಚೆಕ್‌ಔಟ್ ಮಾಡಿ',
    'shop.clearCart': 'ಕಾರ್ಟ್ ಖಾಲಿ ಮಾಡಿ',
    'shop.outOfStock': 'ಸ್ಟಾಕ್‌ನಲ್ಲಿ ಇಲ್ಲ',
    'shop.noProducts': 'ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    'shop.tryDifferentSearch': 'ಬೇರೆ ಹುಡುಕಾಟ ಅಥವಾ ವರ್ಗ ಪ್ರಯತ್ನಿಸಿ',
    'shop.category.all': 'ಎಲ್ಲಾ',
    'shop.category.seeds': 'ಬೀಜಗಳು',
    'shop.category.fertilizers': 'ಗೊಬ್ಬರಗಳು',
    'shop.category.pesticides': 'ಕೀಟನಾಶಕಗಳು',
    'shop.category.tools': 'ಉಪಕರಣಗಳು',
    'shop.category.irrigation': 'ನೀರಾವರಿ',
    
    // Voice
    'voice.tapToSpeak': 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    'voice.listening': 'ಕೇಳುತ್ತಿದೆ...',
    'voice.speaking': 'ಮಾತನಾಡುತ್ತಿದೆ...',
    'voice.speakNow': 'ಈಗ ಮಾತನಾಡಿ',
    
    // Alerts
    'alerts.title': 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು',
    'alerts.noAlerts': 'ಯಾವುದೇ ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ',
    'alerts.noAlertsDesc': 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಇದ್ದಾಗ ನಿಮಗೆ ತಿಳಿಸಲಾಗುವುದು',
    'alerts.severity.low': 'ಕಡಿಮೆ',
    'alerts.severity.medium': 'ಮಧ್ಯಮ',
    'alerts.severity.high': 'ಹೆಚ್ಚಿನ',
    'alerts.severity.critical': 'ಗಂಭೀರ',
    'alerts.emailSubscribe': 'ಇಮೇಲ್ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಿರಿ',
    'alerts.emailUnsubscribe': 'ಇಮೇಲ್ ಎಚ್ಚರಿಕೆಗಳನ್ನು ನಿಲ್ಲಿಸಿ',
    
    // Community
    'community.title': 'ರೈತ ಸಮುದಾಯ',
    'community.dealers': 'ಸ್ಥಳೀಯ ವ್ಯಾಪಾರಿಗಳು',
    'community.fpos': 'FPOs ಮತ್ತು ಸಹಕಾರಿಗಳು',
    'community.experts': 'ಕೃಷಿ ತಜ್ಞರು',
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
