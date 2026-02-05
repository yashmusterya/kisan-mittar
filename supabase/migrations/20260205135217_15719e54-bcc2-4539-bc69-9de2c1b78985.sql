-- Create product_category enum
CREATE TYPE product_category AS ENUM ('seeds', 'fertilizers', 'pesticides', 'tools', 'irrigation');

-- Create alert_type enum
CREATE TYPE alert_type AS ENUM ('rain', 'heat_wave', 'storm', 'frost', 'drought', 'pest_outbreak');

-- Create alert_severity enum
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Create govt_offers table
CREATE TABLE public.govt_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  name_mr TEXT NOT NULL,
  description_en TEXT,
  description_hi TEXT,
  description_mr TEXT,
  scheme_code TEXT NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  eligibility TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  name_mr TEXT NOT NULL,
  description_en TEXT,
  description_hi TEXT,
  description_mr TEXT,
  category product_category NOT NULL,
  price NUMERIC NOT NULL,
  discounted_price NUMERIC,
  image_url TEXT,
  govt_offer_id UUID REFERENCES public.govt_offers(id),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create weather_alerts table
CREATE TABLE public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  alert_type alert_type NOT NULL,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  title_mr TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_hi TEXT NOT NULL,
  message_mr TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'medium',
  location TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.govt_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

-- Govt offers: Anyone can view
CREATE POLICY "Anyone can view govt offers" ON public.govt_offers
  FOR SELECT USING (true);

-- Products: Anyone can view
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

-- Cart items: Users can manage their own cart
CREATE POLICY "Users can view their cart" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to cart" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update cart quantity" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from cart" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Weather alerts: Users see their alerts or global alerts
CREATE POLICY "Users can view their alerts" ON public.weather_alerts
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can mark alerts as read" ON public.weather_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample govt offers
INSERT INTO public.govt_offers (name_en, name_hi, name_mr, description_en, description_hi, description_mr, scheme_code, discount_percent, eligibility) VALUES
('PM Krishi Sinchai Yojana', 'पीएम कृषि सिंचाई योजना', 'पीएम कृषी सिंचाई योजना', '50% subsidy on drip irrigation and sprinkler systems', 'ड्रिप सिंचाई और स्प्रिंकलर सिस्टम पर 50% सब्सिडी', 'ड्रिप सिंचाई आणि स्प्रिंकलर सिस्टमवर 50% सबसिडी', 'PMKSY', 50, 'All farmers with valid land documents'),
('Soil Health Card Scheme', 'मृदा स्वास्थ्य कार्ड योजना', 'मृदा आरोग्य कार्ड योजना', 'Subsidized fertilizers based on soil test', 'मिट्टी परीक्षण के आधार पर सब्सिडी वाले उर्वरक', 'माती चाचणीवर आधारित सबसिडी खते', 'SHCS', 30, 'Farmers with Soil Health Card'),
('National Food Security Mission', 'राष्ट्रीय खाद्य सुरक्षा मिशन', 'राष्ट्रीय अन्न सुरक्षा अभियान', 'Subsidized seeds for pulses and cereals', 'दालों और अनाज के लिए सब्सिडी वाले बीज', 'कडधान्य आणि तृणधान्यांसाठी सबसिडी बियाणे', 'NFSM', 40, 'Small and marginal farmers');

-- Insert sample products
INSERT INTO public.products (name_en, name_hi, name_mr, description_en, description_hi, description_mr, category, price, discounted_price, govt_offer_id, image_url) VALUES
('Hybrid Tomato Seeds (100g)', 'हाइब्रिड टमाटर बीज (100g)', 'हायब्रीड टोमॅटो बियाणे (100g)', 'High-yield disease resistant tomato seeds', 'उच्च उपज रोग प्रतिरोधी टमाटर बीज', 'उच्च उत्पादन रोग प्रतिरोधक टोमॅटो बियाणे', 'seeds', 150, NULL, NULL, 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=200'),
('Neem Oil Pesticide (1L)', 'नीम तेल कीटनाशक (1L)', 'कडुनिंब तेल कीटकनाशक (1L)', 'Organic neem-based pest control', 'जैविक नीम-आधारित कीट नियंत्रण', 'सेंद्रिय कडुनिंब-आधारित कीटक नियंत्रण', 'pesticides', 350, 250, (SELECT id FROM public.govt_offers WHERE scheme_code = 'PMKSY' LIMIT 1), 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200'),
('DAP Fertilizer (50kg)', 'डीएपी उर्वरक (50kg)', 'डीएपी खत (50kg)', 'Di-ammonium phosphate for soil nutrition', 'मिट्टी पोषण के लिए डाई-अमोनियम फॉस्फेट', 'माती पोषणासाठी डाय-अमोनियम फॉस्फेट', 'fertilizers', 1350, 1150, (SELECT id FROM public.govt_offers WHERE scheme_code = 'SHCS' LIMIT 1), 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200'),
('Drip Irrigation Kit', 'ड्रिप सिंचाई किट', 'ड्रिप सिंचाई किट', 'Complete drip system for 1 acre', 'एक एकड़ के लिए संपूर्ण ड्रिप सिस्टम', 'एक एकर साठी संपूर्ण ड्रिप सिस्टम', 'irrigation', 2500, 1250, (SELECT id FROM public.govt_offers WHERE scheme_code = 'PMKSY' LIMIT 1), 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=200'),
('Manual Sprayer (16L)', 'मैनुअल स्प्रेयर (16L)', 'मॅन्युअल स्प्रेअर (16L)', 'Backpack sprayer for pesticide application', 'कीटनाशक छिड़काव के लिए बैकपैक स्प्रेयर', 'कीटकनाशक फवारणीसाठी बॅकपॅक स्प्रेअर', 'tools', 800, NULL, NULL, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200'),
('Wheat Seeds HI-1544 (10kg)', 'गेहूं बीज HI-1544 (10kg)', 'गहू बियाणे HI-1544 (10kg)', 'High-yielding wheat variety for Rabi season', 'रबी सीजन के लिए उच्च उपज गेहूं किस्म', 'रब्बी हंगामासाठी उच्च उत्पादक गहू वाण', 'seeds', 450, 270, (SELECT id FROM public.govt_offers WHERE scheme_code = 'NFSM' LIMIT 1), 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200'),
('Vermicompost (25kg)', 'वर्मीकम्पोस्ट (25kg)', 'गांडूळ खत (25kg)', 'Organic earthworm compost fertilizer', 'जैविक केंचुआ खाद उर्वरक', 'सेंद्रिय गांडूळ खत', 'fertilizers', 280, NULL, NULL, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200'),
('Hand Weeder Tool', 'हाथ वीडर टूल', 'हाताने गवत काढणी साधन', 'Manual weeding tool for small farms', 'छोटे खेतों के लिए मैनुअल निराई उपकरण', 'लहान शेतांसाठी हाताने तण काढणी साधन', 'tools', 120, NULL, NULL, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200');

-- Insert sample weather alerts
INSERT INTO public.weather_alerts (alert_type, title_en, title_hi, title_mr, message_en, message_hi, message_mr, severity, location, expires_at) VALUES
('rain', 'Heavy Rainfall Expected', 'भारी बारिश की संभावना', 'जोरदार पावसाची शक्यता', 'Heavy rainfall expected in next 24 hours. Avoid pesticide spraying. Ensure proper drainage in fields.', 'अगले 24 घंटों में भारी बारिश की संभावना। कीटनाशक छिड़काव से बचें। खेतों में उचित जल निकासी सुनिश्चित करें।', 'पुढील 24 तासांत जोरदार पावसाची शक्यता. कीटकनाशक फवारणी टाळा. शेतात योग्य पाण्याचा निचरा सुनिश्चित करा.', 'high', 'Maharashtra', now() + interval '24 hours'),
('heat_wave', 'Heat Wave Warning', 'लू की चेतावनी', 'उष्णतेची लाट चेतावणी', 'Temperature expected to rise above 42°C. Increase irrigation frequency. Avoid fieldwork during afternoon.', 'तापमान 42°C से ऊपर जाने की संभावना। सिंचाई की आवृत्ति बढ़ाएं। दोपहर में खेत का काम टालें।', 'तापमान 42°C पेक्षा जास्त वाढण्याची शक्यता. सिंचनाची वारंवारता वाढवा. दुपारी शेतकाम टाळा.', 'critical', 'Maharashtra', now() + interval '48 hours');