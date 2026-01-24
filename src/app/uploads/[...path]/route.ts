import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Backend URLs to try in order
const BACKEND_URLS = [
  // Internal Docker network (if containers are on same network)
  process.env.INTERNAL_BACKEND_URL,
  // External URL
  'https://apis.movortech.com',
];

/**
 * Proxy route for uploads - forwards requests to the backend server.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const uploadPath = path.join('/');
  
  let lastError: Error | null = null;
  
  for (const baseUrl of BACKEND_URLS) {
    if (!baseUrl) continue;
    
    const targetUrl = `${baseUrl}/uploads/${uploadPath}`;
    
    try {
      console.log(`[Upload Proxy] Trying: ${targetUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': request.headers.get('accept') || '*/*',
        },
        signal: controller.signal,
        cache: 'no-store',
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log(`[Upload Proxy] ${targetUrl} returned ${response.status}`);
        continue; // Try next URL
      }
      
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const body = await response.arrayBuffer();
      
      console.log(`[Upload Proxy] Success: ${targetUrl} (${body.byteLength} bytes)`);
      
      return new NextResponse(body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (error) {
      lastError = error as Error;
      console.log(`[Upload Proxy] Failed ${targetUrl}: ${lastError.message}`);
      // Continue to next URL
    }
  }
  
  // All URLs failed
  console.error(`[Upload Proxy] All backends failed for /uploads/${uploadPath}`);
  return new NextResponse(
    JSON.stringify({ 
      error: 'All backend URLs failed',
      path: uploadPath,
      lastError: lastError?.message,
    }),
    { 
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
