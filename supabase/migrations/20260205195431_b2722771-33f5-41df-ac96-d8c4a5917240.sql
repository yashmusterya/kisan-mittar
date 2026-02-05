-- Create rental_equipment table for location-based equipment search
CREATE TABLE public.rental_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  name_mr TEXT NOT NULL,
  description_en TEXT,
  description_hi TEXT,
  description_mr TEXT,
  category TEXT NOT NULL CHECK (category IN ('tractor', 'harvester', 'sprayer', 'tiller', 'seeder', 'irrigation', 'other')),
  daily_rate NUMERIC NOT NULL,
  weekly_rate NUMERIC,
  image_url TEXT,
  location TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  is_available BOOLEAN NOT NULL DEFAULT true,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create government_schemes table
CREATE TABLE public.government_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  name_mr TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_hi TEXT NOT NULL,
  description_mr TEXT NOT NULL,
  eligibility_en TEXT,
  eligibility_hi TEXT,
  eligibility_mr TEXT,
  benefits_en TEXT,
  benefits_hi TEXT,
  benefits_mr TEXT,
  how_to_apply_en TEXT,
  how_to_apply_hi TEXT,
  how_to_apply_mr TEXT,
  official_link TEXT,
  scheme_code TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('subsidy', 'insurance', 'credit', 'infrastructure', 'training', 'other')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rental_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;

-- Rental equipment policies
CREATE POLICY "Anyone can view available rental equipment"
ON public.rental_equipment FOR SELECT
USING (is_available = true);

CREATE POLICY "Users can manage their own rental equipment"
ON public.rental_equipment FOR ALL
USING (auth.uid() = owner_id);

-- Government schemes policies (public read)
CREATE POLICY "Anyone can view active government schemes"
ON public.government_schemes FOR SELECT
USING (is_active = true);

-- Insert sample government schemes
INSERT INTO public.government_schemes (name_en, name_hi, name_mr, description_en, description_hi, description_mr, eligibility_en, eligibility_hi, eligibility_mr, benefits_en, benefits_hi, benefits_mr, how_to_apply_en, how_to_apply_hi, how_to_apply_mr, official_link, scheme_code, category) VALUES
('PM-KISAN', 'पीएम-किसान', 'पीएम-किसान', 
 'Direct income support of ₹6,000 per year to farmer families in three equal installments of ₹2,000 each.',
 'किसान परिवारों को ₹2,000 प्रत्येक की तीन समान किस्तों में प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता।',
 'शेतकरी कुटुंबांना प्रत्येक ₹2,000 च्या तीन समान हप्त्यांमध्ये दरवर्षी ₹6,000 थेट उत्पन्न सहाय्य.',
 'All land-holding farmer families with cultivable land. Excludes institutional landholders and higher income groups.',
 'खेती योग्य भूमि वाले सभी भूमिधारक किसान परिवार। संस्थागत भूमिधारक और उच्च आय समूह शामिल नहीं हैं।',
 'लागवडीयोग्य जमीन असलेले सर्व जमीनधारक शेतकरी कुटुंब. संस्थात्मक जमीनधारक आणि उच्च उत्पन्न गट वगळले आहेत.',
 '₹6,000 per year in three installments. Direct bank transfer.',
 'तीन किस्तों में प्रति वर्ष ₹6,000। सीधे बैंक ट्रांसफर।',
 'तीन हप्त्यांमध्ये दरवर्षी ₹6,000. थेट बँक हस्तांतरण.',
 'Register at pmkisan.gov.in or visit Common Service Center with Aadhaar and land records.',
 'pmkisan.gov.in पर पंजीकरण करें या आधार और भूमि रिकॉर्ड के साथ कॉमन सर्विस सेंटर जाएं।',
 'pmkisan.gov.in वर नोंदणी करा किंवा आधार आणि जमीन नोंदींसह कॉमन सर्विस सेंटरला भेट द्या.',
 'https://pmkisan.gov.in', 'PM-KISAN', 'subsidy'),

('Pradhan Mantri Fasal Bima Yojana (PMFBY)', 'प्रधानमंत्री फसल बीमा योजना', 'प्रधानमंत्री पीक विमा योजना',
 'Crop insurance scheme providing financial support against crop loss due to natural calamities, pests and diseases.',
 'प्राकृतिक आपदाओं, कीटों और बीमारियों के कारण फसल हानि के खिलाफ वित्तीय सहायता प्रदान करने वाली फसल बीमा योजना।',
 'नैसर्गिक आपत्ती, कीटक आणि रोगांमुळे पीक नुकसानीसाठी आर्थिक सहाय्य प्रदान करणारी पीक विमा योजना.',
 'All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.',
 'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले साझेदारों और किरायेदार किसानों सहित सभी किसान।',
 'अधिसूचित क्षेत्रात अधिसूचित पिके घेणारे भागधारक आणि भाडेकरू शेतकऱ्यांसह सर्व शेतकरी.',
 'Low premium: 2% for Kharif, 1.5% for Rabi crops, 5% for commercial crops. Full sum insured coverage.',
 'कम प्रीमियम: खरीफ के लिए 2%, रबी फसलों के लिए 1.5%, वाणिज्यिक फसलों के लिए 5%। पूर्ण बीमित राशि कवरेज।',
 'कमी प्रीमियम: खरीफसाठी 2%, रब्बी पिकांसाठी 1.5%, व्यावसायिक पिकांसाठी 5%. पूर्ण विमा रक्कम कव्हरेज.',
 'Apply through your bank during crop sowing season with land documents.',
 'भूमि दस्तावेजों के साथ फसल बुवाई के मौसम में अपने बैंक के माध्यम से आवेदन करें।',
 'जमीन कागदपत्रांसह पीक पेरणी हंगामात तुमच्या बँकेमार्फत अर्ज करा.',
 'https://pmfby.gov.in', 'PMFBY', 'insurance'),

('Pradhan Mantri Krishi Sinchai Yojana (PMKSY)', 'प्रधानमंत्री कृषि सिंचाई योजना', 'प्रधानमंत्री कृषी सिंचन योजना',
 'Irrigation scheme to expand cultivable area under irrigation and improve water use efficiency through micro-irrigation.',
 'सूक्ष्म सिंचाई के माध्यम से सिंचाई के तहत कृषि योग्य क्षेत्र का विस्तार करने और जल उपयोग दक्षता में सुधार करने के लिए सिंचाई योजना।',
 'सूक्ष्म सिंचनाद्वारे सिंचनाखालील लागवडीयोग्य क्षेत्र वाढवण्यासाठी आणि पाणी वापर कार्यक्षमता सुधारण्यासाठी सिंचन योजना.',
 'All farmers with agricultural land. Priority to small and marginal farmers.',
 'कृषि भूमि वाले सभी किसान। छोटे और सीमांत किसानों को प्राथमिकता।',
 'शेतजमीन असलेले सर्व शेतकरी. लहान आणि सीमांत शेतकऱ्यांना प्राधान्य.',
 'Up to 55% subsidy for small farmers, 45% for others on drip and sprinkler systems.',
 'छोटे किसानों के लिए 55% तक सब्सिडी, ड्रिप और स्प्रिंकलर सिस्टम पर अन्य के लिए 45%।',
 'लहान शेतकऱ्यांसाठी 55% पर्यंत अनुदान, ठिबक आणि तुषार सिंचन प्रणालीवर इतरांसाठी 45%.',
 'Apply through District Agriculture Office or online at pmksy.gov.in.',
 'जिला कृषि कार्यालय के माध्यम से या pmksy.gov.in पर ऑनलाइन आवेदन करें।',
 'जिल्हा कृषी कार्यालयामार्फत किंवा pmksy.gov.in वर ऑनलाइन अर्ज करा.',
 'https://pmksy.gov.in', 'PMKSY', 'infrastructure'),

('Soil Health Card Scheme', 'मृदा स्वास्थ्य कार्ड योजना', 'मृदा आरोग्य कार्ड योजना',
 'Free soil testing and personalized recommendations for crop-wise fertilizer use to improve productivity.',
 'उत्पादकता में सुधार के लिए मुफ्त मिट्टी परीक्षण और फसल-वार उर्वरक उपयोग के लिए व्यक्तिगत सिफारिशें।',
 'उत्पादकता सुधारण्यासाठी मोफत माती चाचणी आणि पीक-निहाय खत वापरासाठी वैयक्तिक शिफारसी.',
 'All farmers can get their soil tested for free.',
 'सभी किसान अपनी मिट्टी की मुफ्त जांच करा सकते हैं।',
 'सर्व शेतकरी त्यांच्या मातीची मोफत चाचणी करू शकतात.',
 'Free soil analysis, nutrient recommendations, and crop-specific guidance.',
 'मुफ्त मिट्टी विश्लेषण, पोषक तत्व सिफारिशें, और फसल-विशिष्ट मार्गदर्शन।',
 'मोफत माती विश्लेषण, पोषक तत्व शिफारसी आणि पीक-विशिष्ट मार्गदर्शन.',
 'Contact your local Krishi Vigyan Kendra (KVK) or agriculture office for soil sample collection.',
 'मिट्टी के नमूने संग्रह के लिए अपने स्थानीय कृषि विज्ञान केंद्र (KVK) या कृषि कार्यालय से संपर्क करें।',
 'माती नमुना संकलनासाठी तुमच्या स्थानिक कृषी विज्ञान केंद्र (KVK) किंवा कृषी कार्यालयाशी संपर्क साधा.',
 'https://soilhealth.dac.gov.in', 'SHC', 'training'),

('Kisan Credit Card (KCC)', 'किसान क्रेडिट कार्ड', 'किसान क्रेडिट कार्ड',
 'Easy credit access for farmers to meet agricultural and consumption needs at low interest rates.',
 'कम ब्याज दरों पर कृषि और उपभोग जरूरतों को पूरा करने के लिए किसानों को आसान ऋण पहुंच।',
 'कमी व्याजदराने कृषी आणि उपभोग गरजा पूर्ण करण्यासाठी शेतकऱ्यांना सुलभ कर्ज उपलब्धता.',
 'All farmers, including tenant farmers, oral lessees and share croppers.',
 'किरायेदार किसानों, मौखिक पट्टेदारों और साझेदार किसानों सहित सभी किसान।',
 'भाडेकरू शेतकरी, तोंडी भाडेकरू आणि भागधारक शेतकऱ्यांसह सर्व शेतकरी.',
 '4% interest rate for loans up to ₹3 lakh. 3% additional subvention for timely repayment.',
 '₹3 लाख तक के ऋण के लिए 4% ब्याज दर। समय पर भुगतान के लिए 3% अतिरिक्त सब्वेंशन।',
 '₹3 लाख पर्यंतच्या कर्जासाठी 4% व्याजदर. वेळेवर परतफेडीसाठी 3% अतिरिक्त सबव्हेंशन.',
 'Apply at any bank branch with land documents, Aadhaar, and passport photo.',
 'भूमि दस्तावेजों, आधार और पासपोर्ट फोटो के साथ किसी भी बैंक शाखा में आवेदन करें।',
 'जमीन कागदपत्रे, आधार आणि पासपोर्ट फोटोसह कोणत्याही बँक शाखेत अर्ज करा.',
 'https://www.nabard.org', 'KCC', 'credit'),

('National Food Security Mission (NFSM)', 'राष्ट्रीय खाद्य सुरक्षा मिशन', 'राष्ट्रीय अन्न सुरक्षा मिशन',
 'Mission to increase production of rice, wheat, pulses, coarse cereals and commercial crops.',
 'चावल, गेहूं, दालें, मोटे अनाज और वाणिज्यिक फसलों का उत्पादन बढ़ाने का मिशन।',
 'तांदूळ, गहू, कडधान्ये, भरड धान्य आणि व्यावसायिक पिकांचे उत्पादन वाढवण्याचे मिशन.',
 'Farmers in identified districts growing rice, wheat, pulses and coarse cereals.',
 'चावल, गेहूं, दाल और मोटे अनाज उगाने वाले पहचाने गए जिलों के किसान।',
 'तांदूळ, गहू, कडधान्ये आणि भरड धान्य पिकवणाऱ्या ओळखलेल्या जिल्ह्यांतील शेतकरी.',
 'Subsidized seeds, integrated nutrient management, and farm mechanization support.',
 'सब्सिडी वाले बीज, एकीकृत पोषक प्रबंधन, और कृषि मशीनीकरण सहायता।',
 'अनुदानित बियाणे, एकात्मिक पोषक व्यवस्थापन आणि शेती यांत्रिकीकरण समर्थन.',
 'Contact District Agriculture Office for enrollment and benefits.',
 'नामांकन और लाभ के लिए जिला कृषि कार्यालय से संपर्क करें।',
 'नोंदणी आणि फायद्यांसाठी जिल्हा कृषी कार्यालयाशी संपर्क साधा.',
 'https://nfsm.gov.in', 'NFSM', 'subsidy');

-- Insert sample rental equipment
INSERT INTO public.rental_equipment (name_en, name_hi, name_mr, description_en, description_hi, description_mr, category, daily_rate, weekly_rate, location, latitude, longitude, is_available, contact_phone) VALUES
('John Deere Tractor 45HP', 'जॉन डीयर ट्रैक्टर 45HP', 'जॉन डीयर ट्रॅक्टर 45HP', 
 'Well-maintained tractor suitable for plowing and hauling. Includes operator if needed.',
 'जुताई और ढुलाई के लिए उपयुक्त अच्छी तरह से रखरखाव किया गया ट्रैक्टर। जरूरत पड़ने पर ऑपरेटर शामिल।',
 'नांगरणी आणि वाहतुकीसाठी योग्य चांगला ट्रॅक्टर. आवश्यक असल्यास ऑपरेटर समाविष्ट.',
 'tractor', 1500, 9000, 'Pune, Maharashtra', 18.5204, 73.8567, true, '9876543210'),

('Combine Harvester', 'कंबाइन हार्वेस्टर', 'कंबाइन हार्वेस्टर',
 'Modern combine harvester for wheat and rice. Includes trained operator.',
 'गेहूं और चावल के लिए आधुनिक कंबाइन हार्वेस्टर। प्रशिक्षित ऑपरेटर शामिल।',
 'गहू आणि तांदळासाठी आधुनिक कंबाइन हार्वेस्टर. प्रशिक्षित ऑपरेटर समाविष्ट.',
 'harvester', 5000, 30000, 'Nashik, Maharashtra', 19.9975, 73.7898, true, '9876543211'),

('Power Sprayer 16L', 'पावर स्प्रेयर 16L', 'पावर स्प्रेयर 16L',
 'Battery-operated backpack sprayer for pesticide and fertilizer application.',
 'कीटनाशक और उर्वरक आवेदन के लिए बैटरी संचालित बैकपैक स्प्रेयर।',
 'कीटकनाशक आणि खत वापरासाठी बॅटरी चालित बॅकपॅक स्प्रेयर.',
 'sprayer', 200, 1200, 'Nagpur, Maharashtra', 21.1458, 79.0882, true, '9876543212'),

('Rotavator', 'रोटावेटर', 'रोटावेटर',
 'Heavy-duty rotavator for soil preparation. Requires 35HP+ tractor.',
 'मिट्टी की तैयारी के लिए हैवी-ड्यूटी रोटावेटर। 35HP+ ट्रैक्टर की आवश्यकता।',
 'माती तयार करण्यासाठी हेवी-ड्यूटी रोटावेटर. 35HP+ ट्रॅक्टर आवश्यक.',
 'tiller', 1000, 6000, 'Aurangabad, Maharashtra', 19.8762, 75.3433, true, '9876543213'),

('Seed Drill Machine', 'सीड ड्रिल मशीन', 'बियाणे ड्रिल मशीन',
 '9-row seed drill for precise sowing. Saves seeds and improves germination.',
 'सटीक बुवाई के लिए 9-पंक्ति सीड ड्रिल। बीज बचाता है और अंकुरण में सुधार करता है।',
 'अचूक पेरणीसाठी 9-पंक्ती बियाणे ड्रिल. बियाणे वाचवते आणि उगवण सुधारते.',
 'seeder', 800, 5000, 'Kolhapur, Maharashtra', 16.7050, 74.2433, true, '9876543214'),

('Drip Irrigation Kit', 'ड्रिप इरिगेशन किट', 'ठिबक सिंचन किट',
 'Complete drip irrigation set for 1 acre. Easy installation.',
 '1 एकड़ के लिए पूर्ण ड्रिप सिंचाई सेट। आसान स्थापना।',
 '1 एकरसाठी पूर्ण ठिबक सिंचन सेट. सुलभ स्थापना.',
 'irrigation', 500, 3000, 'Sangli, Maharashtra', 16.8524, 74.5815, true, '9876543215');