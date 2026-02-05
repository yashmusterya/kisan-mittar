 // Mock weather data for demo (no API key required)
 
 export interface WeatherData {
   current: {
     temp: number;
     condition: string;
     icon: string;
     humidity: number;
     wind: number;
     rainChance: number;
   };
   forecast: Array<{
     day: string;
     date: string;
     high: number;
     low: number;
     condition: string;
     icon: string;
     recommendation: string;
   }>;
   alerts: Array<{
     id: string;
     type: 'warning' | 'info' | 'danger';
      title: {
        en: string;
        hi: string;
        mr: string;
        kn?: string;
      };
      message: {
        en: string;
        hi: string;
        mr: string;
        kn?: string;
      };
      action: {
        en: string;
        hi: string;
        mr: string;
        kn?: string;
      };
   }>;
 }
 
 export const getMockWeather = (): WeatherData => {
   return {
     current: {
       temp: 32,
       condition: 'Partly Cloudy',
       icon: '⛅',
       humidity: 65,
       wind: 12,
       rainChance: 40,
     },
     forecast: [
       {
         day: 'Today',
         date: 'Feb 5',
         high: 34,
         low: 22,
         condition: 'Partly Cloudy',
         icon: '⛅',
         recommendation: 'Good day for irrigation. Avoid spraying pesticides.',
       },
       {
         day: 'Tomorrow',
         date: 'Feb 6',
         high: 30,
         low: 20,
         condition: 'Rain Expected',
         icon: '🌧️',
         recommendation: 'Heavy rain expected. Delay pesticide spraying. Ensure drainage.',
       },
       {
         day: 'Friday',
         date: 'Feb 7',
         high: 28,
         low: 19,
         condition: 'Rainy',
         icon: '🌧️',
         recommendation: 'Continued rain. Check for waterlogging in fields.',
       },
       {
         day: 'Saturday',
         date: 'Feb 8',
         high: 31,
         low: 21,
         condition: 'Cloudy',
         icon: '☁️',
         recommendation: 'Good conditions for transplanting seedlings.',
       },
       {
         day: 'Sunday',
         date: 'Feb 9',
         high: 33,
         low: 22,
         condition: 'Sunny',
         icon: '☀️',
         recommendation: 'Hot weather. Water crops early morning or evening.',
       },
     ],
     alerts: [
       {
         id: '1',
         type: 'warning',
         title: {
           en: 'Heavy Rain Alert',
           hi: 'भारी बारिश चेतावनी',
           mr: 'अधिक पावसाचा इशारा',
         },
         message: {
           en: 'Heavy rainfall expected tomorrow. 40-60mm precipitation likely.',
           hi: 'कल भारी बारिश की संभावना। 40-60mm वर्षा संभव।',
           mr: 'उद्या जोरदार पावसाची शक्यता. 40-60mm पाऊस अपेक्षित.',
         },
         action: {
           en: 'Delay pesticide spraying. Ensure proper field drainage.',
           hi: 'कीटनाशक छिड़काव को टालें। खेत में उचित जल निकासी सुनिश्चित करें।',
           mr: 'कीटकनाशक फवारणी टाळा. शेतातील निचरा व्यवस्था तपासा.',
         },
       },
       {
         id: '2',
         type: 'info',
         title: {
           en: 'Good Sowing Conditions',
           hi: 'बुवाई के लिए अच्छी परिस्थितियां',
           mr: 'पेरणीसाठी चांगली परिस्थिती',
         },
         message: {
           en: 'Soil moisture levels are optimal after recent rains.',
           hi: 'हाल की बारिश के बाद मिट्टी की नमी का स्तर अनुकूल है।',
           mr: 'अलीकडील पावसानंतर मातीतील ओलावा पातळी चांगली आहे.',
         },
         action: {
           en: 'Consider sowing wheat or chickpeas this week.',
           hi: 'इस सप्ताह गेहूं या चना बोने पर विचार करें।',
           mr: 'या आठवड्यात गहू किंवा हरभरा पेरण्याचा विचार करा.',
         },
       },
     ],
   };
 };
 
export const getDailyTip = (language: 'en' | 'hi' | 'mr' | 'kn'): { title: string; tip: string } => {
  const tips = {
    en: {
      title: "Today's Farming Tip",
      tip: "February is ideal for wheat irrigation. Apply 2nd irrigation 40-45 days after sowing. Maintain soil moisture for better grain development.",
    },
    hi: {
      title: 'आज की खेती टिप',
      tip: 'फरवरी गेहूं की सिंचाई के लिए आदर्श है। बुवाई के 40-45 दिन बाद दूसरी सिंचाई करें। बेहतर दाने के विकास के लिए मिट्टी की नमी बनाए रखें।',
    },
    mr: {
      title: 'आजची शेती टिप',
      tip: 'फेब्रुवारी गव्हाच्या सिंचनासाठी आदर्श आहे. पेरणीनंतर 40-45 दिवसांनी दुसरे पाणी द्या. चांगल्या दाण्यांसाठी मातीतील ओलावा टिकवा.',
    },
    kn: {
      title: 'ಇಂದಿನ ಕೃಷಿ ಸಲಹೆ',
      tip: 'ಫೆಬ್ರವರಿ ಗೋಧಿ ನೀರಾವರಿಗೆ ಸೂಕ್ತ. ಬಿತ್ತನೆಯ 40-45 ದಿನಗಳ ನಂತರ 2ನೇ ನೀರಾವರಿ ನೀಡಿ. ಉತ್ತಮ ಧಾನ್ಯ ಬೆಳವಣಿಗೆಗೆ ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಾಪಾಡಿ.',
    },
  };
  return tips[language];
};