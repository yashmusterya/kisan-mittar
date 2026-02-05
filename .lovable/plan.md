

# Plan: AI-Powered Weather & Location-Based Shop Search

## Overview
This plan implements two features using the existing AI chatbot instead of external weather APIs:
1. **AI-Powered Weather Predictions** - Use the AI chatbot with user coordinates to get weather insights and farming recommendations
2. **Location-Based Seeds Search** - Add geographical filtering to the Shop page for seeds and products

---

## Feature 1: AI-Powered Weather

### Approach
Instead of calling an external weather API, we'll leverage the existing AI chatbot (`ai-chat` edge function) to provide weather-based farming guidance. When the user opens the Weather page, we'll:
1. Get their coordinates (from profile or browser geolocation)
2. Ask the AI chatbot for weather predictions and farming advice based on their location
3. Display the AI's response in a structured weather format

### Why This Works
- The AI model (Gemini) has access to general climate patterns for Indian regions
- It can provide seasonal farming recommendations based on the location and time of year
- No API key required - uses existing AI infrastructure
- More personalized advice tailored to farming context

### Implementation

**1. Create Weather Hook**
File: `src/hooks/useWeather.ts`
- Manages user location detection (browser or profile)
- Sends structured prompts to the AI chatbot with coordinates
- Parses AI responses into weather data format
- Caches results to avoid repeated AI calls

**2. Create Weather Edge Function (optional enhancement)**
File: `supabase/functions/weather-ai/index.ts`
- Specialized prompt for weather predictions
- Returns structured JSON with weather data
- Uses tool calling to ensure consistent format

**3. Update Weather Page**
File: `src/pages/Weather.tsx`
- Use the new weather hook instead of mock data
- Add loading states while AI processes
- Add location detection button
- Display AI farming recommendations prominently

**4. Update Weather Card Component**
File: `src/components/weather/WeatherCard.tsx`
- Accept props for dynamic weather data
- Show loading skeleton when fetching

### AI Prompt Strategy
The AI will receive a prompt like:
```
You are a weather and farming advisor for location: [lat, lng] near [city/district] in India.
Current date: [date]
Current season: [Rabi/Kharif/Zaid based on month]

Provide weather prediction and farming advice in this JSON format:
{
  current: { temp, humidity, wind, condition, icon, rainChance },
  forecast: [ { day, date, high, low, condition, icon, recommendation } ],
  alerts: [ { type, title, message, action } ]
}
```

---

## Feature 2: Location-Based Shop Search

### Database Changes
Add location columns to the `products` table:
- `latitude` (numeric, nullable)
- `longitude` (numeric, nullable)
- `seller_location` (text, nullable)

### Implementation

**1. Database Migration**
- Add location columns to products table
- Update existing seed products with sample locations

**2. Create Shared Location Utilities**
File: `src/lib/location.ts`
- Extract `calculateDistance` function from RentalEquipment
- Add geolocation helper function
- Reusable across Shop and RentalEquipment pages

**3. Update Shop Page**
File: `src/pages/Shop.tsx`
- Add location detection button (similar to RentalEquipment)
- Sort products by proximity when location available
- Add distance display for products with coordinates

**4. Update Product Card**
File: `src/components/shop/ProductCard.tsx`
- Accept optional `distance` prop
- Display distance badge when available

---

## Technical Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      Frontend                               │
├─────────────────────────────────────────────────────────────┤
│  Weather Page          │  Shop Page                         │
│  ├─ useWeather hook    │  ├─ User location state            │
│  ├─ AI chat prompt     │  ├─ calculateDistance()            │
│  └─ Structured display │  └─ Sort by proximity              │
└───────────┬─────────────────────────┬───────────────────────┘
            │                         │
            ▼                         ▼
┌───────────────────────┐   ┌─────────────────────────────────┐
│  ai-chat edge func    │   │  Database                       │
│  (existing)           │   │  products (+ lat/lng columns)   │
│  ├─ Gemini AI         │   │                                 │
│  └─ Weather prompt    │   │                                 │
└───────────────────────┘   └─────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Database Migration
Add location columns to products table

### Step 2: Create Shared Location Utilities
- `src/lib/location.ts` with distance calculation and geolocation helpers

### Step 3: Create Weather Hook
- `src/hooks/useWeather.ts` that calls AI chat with location-aware prompts

### Step 4: Update Weather Page
- Replace mock data with AI-powered predictions
- Add loading states and location detection

### Step 5: Update Shop Page
- Add location detection similar to RentalEquipment
- Display distances and sort by proximity

### Step 6: Update Product Card
- Show distance when available

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/location.ts` | Shared geolocation utilities (distance calc, detect location) |
| `src/hooks/useWeather.ts` | AI-powered weather hook |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Weather.tsx` | Use AI for weather, add loading states, location detection |
| `src/pages/Shop.tsx` | Add location detection, distance sorting |
| `src/components/shop/ProductCard.tsx` | Add optional distance display |
| `src/components/weather/WeatherCard.tsx` | Accept dynamic props |

## Database Changes

| Table | New Columns |
|-------|-------------|
| `products` | `latitude`, `longitude`, `seller_location` |

---

## Benefits of AI-Powered Weather

1. **No API key needed** - Uses existing Lovable AI infrastructure
2. **Farming-focused** - AI provides contextual advice, not just raw data
3. **Multi-language** - AI responds in user's preferred language
4. **Seasonal awareness** - Understands Rabi/Kharif/Zaid seasons
5. **Personalized** - Tailored to Indian farming conditions

## Sample AI Weather Response
The AI will provide responses like:
- "Based on your location near Pune, Maharashtra, expect partly cloudy conditions with temperatures around 28-32°C"
- "This is Rabi season - good time for wheat and chickpea sowing"
- Alerts for monsoon onset, heat waves, or frost warnings
