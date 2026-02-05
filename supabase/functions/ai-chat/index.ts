 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 Deno.serve(async (req) => {
   // Handle CORS preflight requests
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { message, language, context } = await req.json();
 
     if (!message) {
       return new Response(
         JSON.stringify({ error: 'Message is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Use Lovable AI Gateway
     const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
     
     if (!LOVABLE_API_KEY) {
       throw new Error('LOVABLE_API_KEY not configured');
     }
 
     const languageInstructions = {
       en: 'Respond in English. Use simple, farmer-friendly language.',
       hi: 'Respond in Hindi (हिंदी). Use simple language that Indian farmers understand. Use Devanagari script.',
       mr: 'Respond in Marathi (मराठी). Use simple language that Maharashtrian farmers understand. Use Devanagari script.',
     };
 
     const systemPrompt = `You are KisaanMitra, an AI agricultural assistant for Indian farmers. 
 
 Your role:
 - Help farmers with crop planning, pest control, soil management, irrigation, and seasonal farming advice
 - Provide practical, actionable advice that works for small-scale Indian farming
 - Consider local conditions in India (monsoons, Rabi/Kharif seasons, common crops like wheat, rice, cotton, sugarcane)
 - When discussing diseases or pests, provide both organic/traditional remedies and modern solutions
 - Always include preventive measures along with treatments
 - Be encouraging and supportive
 
 Response style:
 - Keep responses concise but complete (max 200 words unless detailed explanation is needed)
 - Use bullet points for action items
 - Highlight urgent warnings with ⚠️ emoji
 - Include relevant emojis for friendliness (🌾, 🌱, 💧, ☀️, etc.)
 - If unsure, recommend consulting local Krishi Vigyan Kendra (KVK) or agriculture officer
 
 ${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en}
 
 Important: You are an AI assistant. For critical decisions about expensive inputs or serious crop diseases, always advise farmers to consult local experts.`;
 
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${LOVABLE_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
         messages: [
           { role: 'system', content: systemPrompt },
           { role: 'user', content: message },
         ],
         max_tokens: 1024,
         temperature: 0.7,
       }),
     });
 
      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', response: 'Too many requests. Please wait a moment.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Payment required.', response: 'AI service temporarily unavailable.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
       const errorText = await response.text();
       console.error('AI API error:', errorText);
       throw new Error(`AI API error: ${response.status}`);
     }
 
     const data = await response.json();
     const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';
 
     return new Response(
       JSON.stringify({ response: aiResponse }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
 
   } catch (error) {
     console.error('Error in ai-chat function:', error);
     return new Response(
       JSON.stringify({ 
         error: 'Failed to get AI response',
        response: 'Sorry, something went wrong. Please try again.'
       }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });