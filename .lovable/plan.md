
# KisaanMitra 2.0 - Comprehensive Enhancement Plan

## Overview
This plan transforms KisaanMitra into a complete, production-ready mobile-first agricultural assistant with voice AI, farmer marketplace, enhanced UI/UX, and performance optimizations. The implementation is structured into 8 phases for systematic development.

---

## Phase 1: Database Schema Extension

### New Tables Required

```text
+-------------------+     +-------------------+     +-------------------+
|     products      |     |   govt_offers     |     | weather_alerts    |
+-------------------+     +-------------------+     +-------------------+
| id (uuid)         |     | id (uuid)         |     | id (uuid)         |
| name_en/hi/mr     |     | name_en/hi/mr     |     | user_id (uuid)    |
| description       |     | description       |     | alert_type        |
| category          |     | scheme_code       |     | title/message     |
| price             |     | discount_percent  |     | severity          |
| discounted_price  |     | eligibility       |     | location          |
| image_url         |     | valid_until       |     | is_read           |
| govt_offer_id     |     | created_at        |     | created_at        |
| in_stock          |     +-------------------+     +-------------------+
| created_at        |
+-------------------+

+-------------------+
|   cart_items      |
+-------------------+
| id (uuid)         |
| user_id           |
| product_id        |
| quantity          |
| created_at        |
+-------------------+
```

### Product Categories (Enum)
- seeds
- fertilizers
- pesticides
- tools
- irrigation

### Sample Data
Products with government subsidies (e.g., "Neem Oil Pesticide - Rs. 350, Discounted: Rs. 250, 50% subsidy under PMKSY")

---

## Phase 2: Voice AI Integration

### Technology Approach
Use Web Speech API (native browser support) for voice input/output:
- **SpeechRecognition API** for voice-to-text
- **SpeechSynthesis API** for text-to-speech

### New Component: VoiceButton
```text
+------------------------+
|   VoiceButton.tsx      |
+------------------------+
| - Microphone icon      |
| - Pulse animation      |
| - Language detection   |
| - Auto-stop on silence |
+------------------------+
```

### Voice Features
1. **Voice Input** - Tap microphone, speak question
2. **Voice Output** - AI reads response aloud
3. **Language Support**:
   - English: en-IN
   - Hindi: hi-IN
   - Marathi: mr-IN
4. **Slow, clear speech** rate for farmer-friendly output

### Implementation
- Create `src/hooks/useVoiceInput.ts` - Custom hook for speech recognition
- Create `src/hooks/useVoiceOutput.ts` - Custom hook for text-to-speech
- Create `src/components/voice/VoiceButton.tsx` - Animated voice input button
- Create `src/components/voice/VoiceSettings.tsx` - Voice speed/enable toggle

---

## Phase 3: Farmer Marketplace (Shop)

### New Page: Shop.tsx
```text
+--------------------------------+
|  [Search Bar]           [Cart] |
+--------------------------------+
| Categories:                    |
| [Seeds][Fertilizers][Tools]... |
+--------------------------------+
| Product Grid:                  |
| +--------+ +--------+          |
| | Image  | | Image  |          |
| | Name   | | Name   |          |
| | Rs.350 | | Rs.250 |          |
| | -30%   | | PMKSY  |          |
| [Add]    | [Add]    |          |
| +--------+ +--------+          |
+--------------------------------+
```

### New Pages
1. **Shop.tsx** - Product listing with filters
2. **ProductDetail.tsx** - Individual product page
3. **Cart.tsx** - Shopping cart with totals
4. **GovtSchemes.tsx** - Government schemes info

### Components
- `src/components/shop/ProductCard.tsx`
- `src/components/shop/CategoryFilter.tsx`
- `src/components/shop/CartButton.tsx`
- `src/components/shop/GovtBadge.tsx`

### Sample Products (Mock Data)
```
1. Hybrid Tomato Seeds - Rs. 150
2. Neem Oil Pesticide - Rs. 350 → Rs. 250 (PMKSY subsidy)
3. DAP Fertilizer 50kg - Rs. 1350 → Rs. 1150 (Govt. subsidy)
4. Drip Irrigation Kit - Rs. 2500 → Rs. 1250 (50% PMKSY)
5. Manual Sprayer 16L - Rs. 800
```

---

## Phase 4: UI/UX Redesign

### Updated Footer Navigation
```text
+--------------------------------------------------+
|  [Home]  [AI Chat]  [Shop]  [Alerts]  [Profile]  |
+--------------------------------------------------+
   🏠        💬        🛒       🔔        👤
```

### Design Improvements
1. **Large Touch Targets** - Minimum 48x48px for all buttons
2. **High Contrast** - Dark text on light backgrounds for sunlight visibility
3. **Icon-First Design** - Visual icons for low-literacy users
4. **Loading States** - Skeleton loaders for content > 1.5s

### New Components
- `src/components/ui/IconButton.tsx` - Large touchable icon buttons
- `src/components/ui/LoadingSkeleton.tsx` - Content placeholders
- `src/components/common/EmptyState.tsx` - Friendly empty states

### Updated MobileNav
- 5 tabs: Home, AI Chat, Shop, Alerts (Weather), Profile
- Active state highlighting
- Badge for unread alerts

---

## Phase 5: Performance Optimization

### Target: All interactions ≤ 2 seconds

### Strategies
1. **AI Response Caching**
   - Cache common questions in localStorage
   - Check cache before API call
   - Cache TTL: 24 hours

2. **Optimistic UI Updates**
   - Show user message immediately
   - Display loading indicator
   - Stream AI response when available

3. **Lazy Loading**
   - React.lazy() for route-level code splitting
   - Intersection Observer for images
   - Skeleton components during load

4. **API Optimization**
   - Debounce search inputs (300ms)
   - Limit AI context to last 6 messages
   - Compress requests

### Loading States
```text
+------------------------+
|  ○○○○○○○○○○○○○○○○○    | <- Skeleton
|  ○○○○○○○○○○           |
|  ○○○○○○○○○○○○○○       |
+------------------------+
Shown when response > 1.5s
```

---

## Phase 6: Enhanced AI Chatbot

### Updated Edge Function
- Add FAQ caching layer
- Include voice output flag
- Add response time tracking
- Implement prompt injection protection

### New AI Capabilities
1. **Government Scheme Awareness** - Information about PM-KISAN, PMFBY, etc.
2. **Product Recommendations** - Suggest relevant products from shop
3. **Cached FAQ Responses** - Instant answers for common questions

### AI Response Structure
```
{
  response: string,
  voiceResponse?: string,  // Simplified for TTS
  suggestedProducts?: string[],
  relatedFAQs?: string[],
  responseTime: number
}
```

---

## Phase 7: Security Enhancements

### Implemented Protections

| Risk | Mitigation |
|------|------------|
| API Abuse | Rate limiting (10 req/min per user) |
| Prompt Injection | Input sanitization + system prompt hardening |
| Role Bypass | Server-side role verification |
| Data Exposure | RLS policies on all tables |
| XSS | Input sanitization |

### Rate Limiting
Add to ai-chat edge function:
- Track requests per user_id
- Return 429 after 10 requests/minute
- Graceful error messages

### Input Validation
- Max message length: 1000 characters
- Sanitize HTML/scripts
- Block SQL-like patterns

---

## Phase 8: Translation Updates

### New Translation Keys
```text
// Shop
'shop.title': 'Shop / दुकान / दुकान'
'shop.addToCart': 'Add / जोड़ें / जोडा'
'shop.govtOffer': 'Govt. Subsidy / सरकारी छूट / सरकारी सवलत'
'shop.cart': 'Cart / कार्ट / कार्ट'

// Voice
'voice.tapToSpeak': 'Tap to speak / बोलने के लिए टैप करें / बोलण्यासाठी टॅप करा'
'voice.listening': 'Listening... / सुन रहे हैं... / ऐकत आहे...'
'voice.speakNow': 'Speak now / अब बोलें / आता बोला'

// Alerts
'alerts.title': 'Alerts / अलर्ट / इशारे'
'alerts.noAlerts': 'No active alerts / कोई अलर्ट नहीं / कोणतेही इशारे नाहीत'
```

---

## File Changes Summary

### New Files to Create
| File | Purpose |
|------|---------|
| `src/pages/Shop.tsx` | Farmer marketplace |
| `src/pages/ProductDetail.tsx` | Product details |
| `src/pages/Cart.tsx` | Shopping cart |
| `src/pages/GovtSchemes.tsx` | Government schemes |
| `src/hooks/useVoiceInput.ts` | Speech recognition hook |
| `src/hooks/useVoiceOutput.ts` | Text-to-speech hook |
| `src/hooks/useAICache.ts` | Response caching |
| `src/components/voice/VoiceButton.tsx` | Voice input UI |
| `src/components/shop/ProductCard.tsx` | Product display |
| `src/components/shop/CategoryFilter.tsx` | Category tabs |
| `src/components/shop/CartButton.tsx` | Cart icon with badge |
| `src/components/shop/GovtBadge.tsx` | Subsidy indicator |
| `src/data/mockProducts.ts` | Sample product data |
| `src/data/mockSchemes.ts` | Government schemes |

### Files to Modify
| File | Changes |
|------|---------|
| `src/App.tsx` | Add Shop, Cart, Schemes routes |
| `src/components/layout/MobileNav.tsx` | Update to 5-tab footer |
| `src/pages/Chat.tsx` | Add voice input/output, caching |
| `src/contexts/LanguageContext.tsx` | Add shop/voice translations |
| `supabase/functions/ai-chat/index.ts` | Rate limiting, caching |

### Database Migration
Add tables: products, govt_offers, cart_items, weather_alerts

---

## Demo Flow Script

```text
1. Open app → Welcome screen with KisaanMitra logo
2. Select Hindi language → "हिंदी चुनें"
3. Sign up as farmer → Quick profile setup
4. Dashboard shows → Weather alert banner + daily tip
5. Tap microphone → "मेरी टमाटर की पत्तियां पीली हो रही हैं"
6. AI responds → Voice reads solution aloud
7. Get product suggestion → "Neem oil recommended"
8. Navigate to Shop → Browse products with subsidies
9. Add to cart → See government discount applied
10. Check weather alerts → Rain warning visible
11. View expert verification → Badge on verified answers
```

---

## Pitch Line (Judge-Ready)

> "KisaanMitra is an AI-powered, voice-enabled agricultural assistant with multilingual support, weather alerts, affordable tool shopping with government subsidies, and expert verification - built for speed, simplicity, and real farmer needs."

---

## Technical Details

### Voice Recognition Languages
```typescript
const langCodes = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN'
};
```

### Performance Targets
- Initial load: < 3s on 3G
- AI response: < 2s (cached: instant)
- Page transitions: < 300ms
- Image lazy load: on scroll

### Security Headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'X-RateLimit-Limit': '10',
  'X-Content-Type-Options': 'nosniff'
};
```

This plan covers all requirements for a hackathon-winning, production-ready agricultural assistant optimized for Indian farmers.
