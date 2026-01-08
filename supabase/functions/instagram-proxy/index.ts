import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Expose-Headers': 'Content-Disposition, X-Original-Content-Type',
};

// Validate media URL to prevent SSRF - only allow Instagram CDN domains
function isValidMediaUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // Only allow Instagram/Facebook CDN domains
    const allowedDomains = [
      'cdninstagram.com',
      'instagram.com',
      'fbcdn.net'
    ];
    
    // Only allow HTTPS
    if (url.protocol !== 'https:') {
      return false;
    }
    
    return allowedDomains.some(domain => url.hostname.endsWith(domain));
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaUrl } = await req.json();

    if (!mediaUrl || typeof mediaUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid media URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate media URL to prevent SSRF attacks
    if (!isValidMediaUrl(mediaUrl)) {
      console.error('Invalid media URL rejected:', mediaUrl.substring(0, 100));
      return new Response(
        JSON.stringify({ error: 'Invalid media URL. Only Instagram CDN URLs are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Proxying media URL:', String(mediaUrl).substring(0, 100));

    // Use streaming fetch for faster response
    const response = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Referer': 'https://www.instagram.com/',
        'Connection': 'keep-alive',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status}`);
    }

    const originalContentType = response.headers.get('content-type') || 'application/octet-stream';
    
    const ext = originalContentType.includes('mp4')
      ? 'mp4'
      : originalContentType.includes('jpeg')
        ? 'jpg'
        : originalContentType.includes('png')
          ? 'png'
          : originalContentType.includes('webp')
            ? 'webp'
            : 'bin';

    const filename = `instagram-media.${ext}`;

    console.log('Streaming media, content-type:', originalContentType);

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'X-Original-Content-Type': originalContentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Proxy error:', error);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});