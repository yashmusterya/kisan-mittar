 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { Card } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
 import { Search, MessageCircle, Sprout, Droplets, Bug, Sun, CloudRain } from 'lucide-react';
 
 type Category = 'crops' | 'soil' | 'pests' | 'seasons' | 'water';
 
 interface FAQItem {
   id: string;
   category: Category;
   question: { en: string; hi: string; mr: string };
   answer: { en: string; hi: string; mr: string };
 }
 
 const mockFAQs: FAQItem[] = [
   {
     id: '1',
     category: 'crops',
     question: {
       en: 'When is the best time to sow wheat?',
       hi: 'गेहूं बोने का सबसे अच्छा समय कब है?',
       mr: 'गहू पेरण्याची सर्वोत्तम वेळ कधी आहे?',
     },
     answer: {
       en: 'The best time to sow wheat in North India is from October 15 to November 15. In Central India, sowing can be done until November 30. Late sowing after this reduces yield.',
       hi: 'उत्तर भारत में गेहूं बोने का सबसे अच्छा समय 15 अक्टूबर से 15 नवंबर तक है। मध्य भारत में 30 नवंबर तक बुवाई की जा सकती है। इसके बाद देरी से बुवाई करने पर उपज कम होती है।',
       mr: 'उत्तर भारतात गहू पेरण्याची सर्वोत्तम वेळ 15 ऑक्टोबर ते 15 नोव्हेंबर आहे. मध्य भारतात 30 नोव्हेंबरपर्यंत पेरणी करता येते. यानंतर उशिरा पेरणी केल्यास उत्पादन कमी होते.',
     },
   },
   {
     id: '2',
     category: 'soil',
     question: {
       en: 'How can I test soil health at home?',
       hi: 'घर पर मिट्टी की सेहत कैसे जांचें?',
       mr: 'घरी मातीचे आरोग्य कसे तपासावे?',
     },
     answer: {
       en: 'Simple tests: 1) Squeeze test - good soil forms a ball but crumbles easily. 2) Worm count - dig 1 foot, count earthworms (10+ is good). 3) Water infiltration - pour water, it should absorb in 30 mins. Contact your local Krishi Vigyan Kendra for detailed soil testing.',
       hi: 'सरल परीक्षण: 1) निचोड़ परीक्षण - अच्छी मिट्टी गेंद बनाती है लेकिन आसानी से टूट जाती है। 2) केंचुआ गिनती - 1 फुट खोदें, केंचुए गिनें (10+ अच्छा है)। 3) पानी सोखना - पानी डालें, 30 मिनट में सोखना चाहिए। विस्तृत जांच के लिए अपने स्थानीय कृषि विज्ञान केंद्र से संपर्क करें।',
       mr: 'साधी चाचणी: 1) पिळणे - चांगली माती गोळा बनते पण सहज तुटते. 2) गांडूळ मोजणी - 1 फूट खणा, गांडुळे मोजा (10+ चांगले). 3) पाणी शोषण - पाणी घाला, 30 मिनिटात शोषले जावे. तपशीलवार चाचणीसाठी तुमच्या स्थानिक कृषी विज्ञान केंद्राशी संपर्क साधा.',
     },
   },
   {
     id: '3',
     category: 'pests',
     question: {
       en: 'How to identify and control aphids in crops?',
       hi: 'फसलों में एफिड्स को कैसे पहचानें और नियंत्रित करें?',
       mr: 'पिकांमधील माव्याची ओळख आणि नियंत्रण कसे करावे?',
     },
     answer: {
       en: 'Aphids are small soft-bodied insects (green/black/yellow) that suck plant sap. Signs: curled leaves, sticky honeydew. Control: 1) Spray neem oil (5ml/liter). 2) Use yellow sticky traps. 3) Encourage ladybugs. 4) For severe cases, use imidacloprid as per label instructions.',
       hi: 'एफिड्स छोटे नरम शरीर वाले कीड़े (हरे/काले/पीले) हैं जो पौधे का रस चूसते हैं। लक्षण: मुड़ी पत्तियां, चिपचिपा हनीड्यू। नियंत्रण: 1) नीम तेल स्प्रे करें (5ml/लीटर)। 2) पीले चिपचिपे ट्रैप लगाएं। 3) लेडीबग को प्रोत्साहित करें। 4) गंभीर मामलों में, लेबल निर्देशों के अनुसार इमिडाक्लोप्रिड का उपयोग करें।',
       mr: 'माव्या हे लहान मऊ शरीराचे कीटक (हिरवे/काळे/पिवळे) आहेत जे वनस्पतीचा रस शोषतात. लक्षणे: वळलेली पाने, चिकट मधुबिंदू. नियंत्रण: 1) कडुलिंब तेल फवारणी (5ml/लिटर). 2) पिवळे चिकट सापळे वापरा. 3) लेडीबग्सना प्रोत्साहन द्या. 4) गंभीर प्रकरणांसाठी, लेबलनुसार इमिडाक्लोप्रिड वापरा.',
     },
   },
   {
     id: '4',
     category: 'seasons',
     question: {
       en: 'What crops to grow in Rabi season?',
       hi: 'रबी सीजन में कौन सी फसलें उगाएं?',
       mr: 'रब्बी हंगामात कोणती पिके घ्यावीत?',
     },
     answer: {
       en: 'Rabi crops (October-March): Wheat, Barley, Mustard, Chickpea (Chana), Peas, Lentils, Potato. These crops need cool weather and are harvested in spring. Irrigation is important as rainfall is less in winter.',
       hi: 'रबी फसलें (अक्टूबर-मार्च): गेहूं, जौ, सरसों, चना, मटर, मसूर, आलू। इन फसलों को ठंडे मौसम की जरूरत होती है और वसंत में काटी जाती हैं। सर्दियों में बारिश कम होने के कारण सिंचाई महत्वपूर्ण है।',
       mr: 'रब्बी पिके (ऑक्टोबर-मार्च): गहू, जव, मोहरी, हरभरा, वाटाणे, मसूर, बटाटा. या पिकांना थंड हवामान लागते आणि वसंत ऋतूत कापणी होते. हिवाळ्यात पाऊस कमी असल्याने सिंचन महत्त्वाचे आहे.',
     },
   },
   {
     id: '5',
     category: 'water',
     question: {
       en: 'How to save water while irrigating crops?',
       hi: 'फसलों की सिंचाई करते समय पानी कैसे बचाएं?',
       mr: 'पिकांना पाणी देताना पाणी कसे वाचवावे?',
     },
     answer: {
       en: 'Water-saving methods: 1) Drip irrigation - saves 30-50% water. 2) Mulching - reduces evaporation. 3) Irrigate early morning/evening. 4) Level your field for even distribution. 5) Use soil moisture sensors. 6) Alternate furrow irrigation. Contact agriculture department for drip irrigation subsidies.',
       hi: 'पानी बचाने के तरीके: 1) ड्रिप सिंचाई - 30-50% पानी बचाता है। 2) मल्चिंग - वाष्पीकरण कम करता है। 3) सुबह जल्दी/शाम को सिंचाई करें। 4) समान वितरण के लिए खेत को समतल करें। 5) मिट्टी नमी सेंसर का उपयोग करें। 6) वैकल्पिक नाली सिंचाई। ड्रिप सिंचाई सब्सिडी के लिए कृषि विभाग से संपर्क करें।',
       mr: 'पाणी बचतीचे मार्ग: 1) ठिबक सिंचन - 30-50% पाणी वाचते. 2) आच्छादन - बाष्पीभवन कमी करते. 3) सकाळी लवकर/संध्याकाळी पाणी द्या. 4) समान वितरणासाठी शेत सपाट करा. 5) माती आर्द्रता सेन्सर वापरा. 6) पर्यायी सरी सिंचन. ठिबक सिंचन अनुदानासाठी कृषी विभागाशी संपर्क साधा.',
     },
   },
 ];
 
 const categories: { key: Category; icon: React.ElementType }[] = [
   { key: 'crops', icon: Sprout },
   { key: 'soil', icon: Droplets },
   { key: 'pests', icon: Bug },
   { key: 'seasons', icon: Sun },
   { key: 'water', icon: CloudRain },
 ];
 
 const FAQ = () => {
   const navigate = useNavigate();
   const { language, t } = useLanguage();
   const [search, setSearch] = useState('');
   const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
 
   const filteredFAQs = mockFAQs.filter((faq) => {
     const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
     const matchesSearch =
       search === '' ||
       faq.question[language as keyof typeof faq.question].toLowerCase().includes(search.toLowerCase());
     return matchesCategory && matchesSearch;
   });
 
   const handleAskAI = (question: string) => {
     navigate('/chat', { state: { prefillQuestion: question } });
   };
 
   return (
     <div className="p-4 space-y-4">
       {/* Header */}
       <div className="pt-2">
         <h1 className="text-2xl font-bold text-foreground">{t('faq.title')} 📚</h1>
       </div>
 
       {/* Search */}
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
         <Input
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           placeholder={t('faq.search')}
           className="pl-10"
         />
       </div>
 
       {/* Categories */}
       <div className="flex gap-2 overflow-x-auto pb-2">
         <Button
           variant={activeCategory === 'all' ? 'default' : 'outline'}
           size="sm"
           onClick={() => setActiveCategory('all')}
         >
           {language === 'en' ? 'All' : language === 'hi' ? 'सभी' : 'सर्व'}
         </Button>
         {categories.map((cat) => {
           const Icon = cat.icon;
           return (
             <Button
               key={cat.key}
               variant={activeCategory === cat.key ? 'default' : 'outline'}
               size="sm"
               onClick={() => setActiveCategory(cat.key)}
               className="flex items-center gap-1"
             >
               <Icon className="w-4 h-4" />
               {t(`faq.${cat.key}`)}
             </Button>
           );
         })}
       </div>
 
       {/* FAQs */}
       <Accordion type="single" collapsible className="space-y-2">
         {filteredFAQs.map((faq) => (
           <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
             <AccordionTrigger className="text-left hover:no-underline">
               <span className="text-sm font-medium">
                 {faq.question[language as keyof typeof faq.question]}
               </span>
             </AccordionTrigger>
             <AccordionContent>
               <p className="text-sm text-muted-foreground mb-3">
                 {faq.answer[language as keyof typeof faq.answer]}
               </p>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => handleAskAI(faq.question[language as keyof typeof faq.question])}
                 className="flex items-center gap-2"
               >
                 <MessageCircle className="w-4 h-4" />
                 {t('faq.askAI')}
               </Button>
             </AccordionContent>
           </AccordionItem>
         ))}
       </Accordion>
 
       {filteredFAQs.length === 0 && (
         <Card className="p-8 text-center">
           <p className="text-muted-foreground">
             {language === 'en' && 'No FAQs found. Try a different search.'}
             {language === 'hi' && 'कोई FAQ नहीं मिला। अलग खोज आज़माएं।'}
             {language === 'mr' && 'FAQ सापडले नाहीत. वेगळी शोध वापरून पहा.'}
           </p>
         </Card>
       )}
     </div>
   );
 };
 
 export default FAQ;