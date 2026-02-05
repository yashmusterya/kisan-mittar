
# Plan: Live Weather Data & Location-Based Search for Seeds

## Overview
This plan adds two major features:
1. **Live Weather Data** - Replace mock weather with real-time data from OpenWeatherMap API
2. **Location-Based Seeds Search** - Add geographical filtering to the Shop page for seeds and products

---

## Feature 1: Live Weather Data

### Current State
- Weather uses hardcoded mock data in `src/data/mockWeather.ts`
- The Weather page (`src/pages/Weather.tsx`) displays static information
- User profiles already store `latitude` and `longitude` fields

### Implementation Approach
Create a backend function to fetch weather data securely (API key stays server-side), then update the frontend to use real data.

### Changes Required

**1. Create Weather Edge Function**
- New file: `supabase/functions/weather/index.ts`
- Accepts user's latitude/longitude as parameters
- Calls OpenWeatherMap API for current weather and 5-day forecast
- Returns data in a format compatible with existing UI components
- Uses Lovable AI to generate farming recommendations based on weather conditions

**2. Add OpenWeatherMap API Key**
- Request user to add `OPENWEATHERMAP_API_KEY` secret
- Free tier provides 60 calls/minute, sufficient for this use case

**3. Create Weather Hook**
- New file: `src/hooks/useWeather.ts`
- Manages weather data fetching with loading/error states
- Caches data to avoid excessive API calls
- Uses user's profile location or browser geolocation

**4. Update Weather Page**
- Modify `src/pages/Weather.tsx` to use live data
- Add loading skeleton and error states
- Add location detection button if no location saved

**5. Update Weather Components**
- Update `src/components/weather/WeatherCard.tsx` for live data
- Update `src/components/weather/WeatherAlert.tsx` for real alerts

---

## Feature 2: Location-Based Search for Seeds/Products

### Current State
- Shop page (`src/pages/Shop.tsx`) has no location filtering
- Products table has no location fields
- Rental equipment already has location-based search (good reference)

### Implementation Approach
Add location fields to products table, then implement distance-based filtering similar to the rental equipment page.

### Database Changes Required
Add location columns to products table:
- `latitude` (nullable)
- `longitude` (nullable) 
- `seller_location` (text, nullable) - readable location name

### Frontend Changes

**1. Update Shop Page**
- Add location detection button (similar to RentalEquipment page)
- Add distance display next to products
- Sort products by proximity when location is available
- Add "Nearby Seeds" filter option

**2. Create Shared Location Utilities**
- New file: `src/lib/location.ts`
- Extract `calculateDistance` function from RentalEquipment
- Add geocoding helpers if needed

---

## Technical Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      Frontend                               │
├─────────────────────────────────────────────────────────────┤
│  Weather Page          │  Shop Page                         │
│  ├─ useWeather hook    │  ├─ useLocation hook               │
│  ├─ WeatherCard        │  ├─ ProductCard (+ distance)       │
│  └─ WeatherAlert       │  └─ CategoryFilter (+ nearby)      │
└───────────┬─────────────────────────┬───────────────────────┘
            │                         │
            ▼                         ▼
┌───────────────────────┐   ┌─────────────────────────────────┐
│  weather edge func    │   │  Supabase Database              │
│  ├─ OpenWeatherMap    │   │  ├─ products (+ lat/lng)        │
│  └─ AI recommendations│   │  └─ profiles (lat/lng exists)   │
└───────────────────────┘   └─────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Add API Key Secret
Request user to configure OpenWeatherMap API key

### Step 2: Create Weather Edge Function
Build the backend function to fetch and process weather data

### Step 3: Database Migration
Add location columns to products table with seed data updates

### Step 4: Create Shared Utilities
- `src/lib/location.ts` - distance calculation and geolocation
- `src/hooks/useWeather.ts` - weather data management

### Step 5: Update Weather UI
- Modify Weather page for live data with loading states
- Update WeatherCard and WeatherAlert components

### Step 6: Update Shop UI
- Add location detection to Shop page
- Display distance for products with location
- Add sorting by proximity

---

## Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/weather/index.ts` | Fetch live weather from OpenWeatherMap |
| `src/hooks/useWeather.ts` | Weather data hook with caching |
| `src/lib/location.ts` | Shared geolocation utilities |

## Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Weather.tsx` | Use live data, add loading states |
| `src/pages/Shop.tsx` | Add location filtering and distance display |
| `src/components/weather/WeatherCard.tsx` | Accept props for live data |
| `src/components/weather/WeatherAlert.tsx` | Accept props for live alerts |
| `src/components/shop/ProductCard.tsx` | Display distance if available |

## Database Changes
| Table | New Columns |
|-------|-------------|
| `products` | `latitude`, `longitude`, `seller_location` |

---

## User Action Required
You'll need to provide an **OpenWeatherMap API key** for live weather data. You can get a free key at [openweathermap.org](https://openweathermap.org/api) (free tier: 60 calls/minute).
