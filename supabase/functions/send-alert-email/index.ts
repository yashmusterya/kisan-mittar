import { Resend } from "https://esm.sh/resend@2.0.0";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  email: string;
  alertTitle: string;
  alertMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  language: 'en' | 'hi' | 'mr' | 'kn';
}

const severityColors = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

const severityLabels = {
  en: { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' },
  hi: { low: 'कम', medium: 'मध्यम', high: 'उच्च', critical: 'गंभीर' },
  mr: { low: 'कमी', medium: 'मध्यम', high: 'उच्च', critical: 'गंभीर' },
  kn: { low: 'ಕಡಿಮೆ', medium: 'ಮಧ್ಯಮ', high: 'ಹೆಚ್ಚಿನ', critical: 'ಗಂಭೀರ' },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured - email alerts disabled");
    return new Response(
      JSON.stringify({ error: "Email service not configured", skipped: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const resend = new Resend(resendApiKey);
    const { email, alertTitle, alertMessage, severity, location, language }: AlertEmailRequest = await req.json();

    if (!email || !alertTitle || !alertMessage) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sevLabel = severityLabels[language]?.[severity] || severityLabels.en[severity];
    const color = severityColors[severity];

    const subjectPrefix = {
      en: '⚠️ Weather Alert',
      hi: '⚠️ मौसम चेतावनी',
      mr: '⚠️ हवामान सूचना',
      kn: '⚠️ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ',
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #16a34a, #22c55e); padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🌾 KisaanMitra</h1>
          </div>
          
          <div style="padding: 24px;">
            <div style="display: inline-block; background: ${color}20; color: ${color}; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-bottom: 16px;">
              ${sevLabel} ${language === 'en' ? 'Priority' : language === 'hi' ? 'प्राथमिकता' : language === 'mr' ? 'प्राधान्य' : 'ಆದ್ಯತೆ'}
            </div>
            
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">
              ${alertTitle}
            </h2>
            
            ${location ? `<p style="color: #6b7280; margin: 0 0 16px 0; font-size: 14px;">📍 ${location}</p>` : ''}
            
            <p style="color: #374151; line-height: 1.6; margin: 0 0 24px 0;">
              ${alertMessage}
            </p>
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-top: 20px;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                ${language === 'en' ? 'This is an automated weather alert from KisaanMitra.' :
                  language === 'hi' ? 'यह किसानमित्र से एक स्वचालित मौसम चेतावनी है।' :
                  language === 'mr' ? 'ही किसानमित्र कडून स्वयंचलित हवामान सूचना आहे.' :
                  'ಇದು ಕಿಸಾನ್‌ಮಿತ್ರದಿಂದ ಸ್ವಯಂಚಾಲಿತ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಯಾಗಿದೆ.'}
              </p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              © 2026 KisaanMitra - ${language === 'en' ? 'Your AI Farming Companion' : 
                language === 'hi' ? 'आपका AI कृषि साथी' : 
                language === 'mr' ? 'तुमचा AI शेती साथीदार' :
                'ನಿಮ್ಮ AI ಕೃಷಿ ಸಂಗಾತಿ'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "KisaanMitra <onboarding@resend.dev>",
      to: [email],
      subject: `${subjectPrefix[language] || subjectPrefix.en}: ${alertTitle}`,
      html: emailHtml,
    });

    console.log("Alert email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending alert email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
