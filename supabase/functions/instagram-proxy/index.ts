import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  // Let the browser read our filename / metadata headers
  'Access-Control-Expose-Headers': 'Content-Disposition, X-Original-Content-Type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaUrl } = await req.json();

    if (!mediaUrl) {
      return new Response(
        JSON.stringify({ error: 'Media URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Proxying media URL:', String(mediaUrl).substring(0, 100));

    const response = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.instagram.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status}`);
    }

    const originalContentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();

    console.log('Successfully fetched media, size:', arrayBuffer.byteLength);

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

    // IMPORTANT:
    // supabase-js Functions client treats video/* as text, which corrupts downloads.
    // Forcing octet-stream makes the client return a Blob.
    return new Response(new Uint8Array(arrayBuffer), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'X-Original-Content-Type': originalContentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
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
