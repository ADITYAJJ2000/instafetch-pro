import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate Instagram URL to prevent SSRF attacks
function isValidInstagramUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // Only allow instagram.com and www.instagram.com
    const allowedHosts = ['instagram.com', 'www.instagram.com'];
    if (!allowedHosts.includes(url.hostname.toLowerCase())) {
      return false;
    }
    
    // Only allow HTTPS
    if (url.protocol !== 'https:') {
      return false;
    }
    
    // Validate path patterns (posts, reels, stories, tv)
    const validPathPatterns = [
      /^\/p\/[\w-]+\/?/,       // Posts
      /^\/reel\/[\w-]+\/?/,    // Reels
      /^\/stories\/[\w-]+\/?/, // Stories
      /^\/tv\/[\w-]+\/?/       // IGTV
    ];
    
    return validPathPatterns.some(pattern => pattern.test(url.pathname));
  } catch {
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid Instagram URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL format and domain to prevent SSRF
    if (!isValidInstagramUrl(url)) {
      console.error('Invalid Instagram URL rejected:', url.substring(0, 100));
      return new Response(
        JSON.stringify({ error: 'Invalid Instagram URL format. Please provide a valid Instagram post, reel, or story URL.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing Instagram URL:', url);

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiUrl = `https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/convert?url=${encodeURIComponent(url)}`;
    
    console.log('Calling RapidAPI');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com'
      }
    });

    const data = await response.json();
    console.log('API Response received');

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from Instagram', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in instagram-download function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});