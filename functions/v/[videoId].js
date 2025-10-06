export async function onRequest(context) {
  const { videoId } = context.params;
  
  try {
    // Fetch video data from your API
    const response = await fetch(`https://api.weibao.africa/api/v1/videos/${videoId}`);
    
    if (!response.ok) {
      return new Response(notFoundHTML(), {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    const video = await response.json();
    
    // Generate HTML with Open Graph tags
    const html = generateHTML(video, videoId);
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    return new Response(errorHTML(error.message), {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

function generateHTML(video, videoId) {
  const price = formatPrice(video.price);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(video.caption)} - ${price} | WeiBao</title>
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="video.other" />
  <meta property="og:url" content="https://weibao.africa/v/${videoId}" />
  <meta property="og:title" content="${escapeHtml(video.caption)} - ${price}" />
  <meta property="og:description" content="Buy this product from ${escapeHtml(video.userName)} on WeiBao" />
  <meta property="og:image" content="${video.thumbnailUrl}" />
  <meta property="og:image:width" content="720" />
  <meta property="og:image:height" content="1280" />
  <meta property="og:video" content="${video.videoUrl}" />
  <meta property="og:video:secure_url" content="${video.videoUrl}" />
  <meta property="og:video:type" content="video/mp4" />
  <meta property="og:site_name" content="WeiBao Marketplace" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="player" />
  <meta name="twitter:title" content="${escapeHtml(video.caption)} - ${price}" />
  <meta name="twitter:description" content="Buy this product from ${escapeHtml(video.userName)} on WeiBao" />
  <meta name="twitter:image" content="${video.thumbnailUrl}" />
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #000; 
      color: #fff; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; 
      align-items: center; 
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 500px; text-align: center; width: 100%; }
    .thumbnail { 
      width: 100%; 
      max-width: 400px; 
      border-radius: 12px; 
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    h1 { font-size: 24px; font-weight: bold; margin-bottom: 12px; line-height: 1.4; }
    .price { 
      color: #4CAF50; 
      font-size: 28px; 
      font-weight: bold; 
      margin-bottom: 8px; 
    }
    .seller { color: #aaa; font-size: 16px; margin-bottom: 32px; }
    .status { font-size: 18px; margin-bottom: 8px; }
    .hint { font-size: 14px; color: #888; margin-bottom: 24px; }
    .button { 
      display: inline-block; 
      padding: 16px 32px; 
      background: #FF6B6B; 
      color: #fff; 
      text-decoration: none; 
      border-radius: 8px; 
      font-size: 16px;
      font-weight: bold;
      margin: 6px;
      transition: background 0.3s;
    }
    .button:hover { background: #E55353; }
    .button-secondary { 
      background: transparent; 
      border: 2px solid #fff; 
    }
    .button-secondary:hover { background: rgba(255,255,255,0.1); }
  </style>
  
  <script>
    // Deep link logic
    setTimeout(function() {
      window.location.href = 'weibao://video/${videoId}';
      
      // Fallback to store after 2 seconds
      setTimeout(function() {
        var isAndroid = /Android/i.test(navigator.userAgent);
        var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        if (isAndroid) {
          window.location.href = 'https://app.weibao.africa/weibao.apk';
        } else if (isIOS) {
          window.location.href = 'https://app.weibao.africa/weibao.apk';
        }
      }, 2000);
    }, 100);
  </script>
</head>
<body>
  <div class="container">
    ${video.thumbnailUrl ? `<img src="${video.thumbnailUrl}" alt="${escapeHtml(video.caption)}" class="thumbnail">` : ''}
    <h1>${escapeHtml(video.caption)}</h1>
    <p class="price">${price}</p>
    <p class="seller">Sold by ${escapeHtml(video.userName)}</p>
    <div>
      <p class="status">Opening WeiBao app...</p>
      <p class="hint">Don't have the app? You'll be redirected to download it.</p>
    </div>
    <div>
      <a href="weibao://video/${videoId}" class="button">Open in App</a>
      <a href="${video.videoUrl}" class="button button-secondary">View Video</a>
    </div>
  </div>
</body>
</html>`;
}

function notFoundHTML() {
  return `<!DOCTYPE html>
<html><head><title>Video Not Found</title><style>
body{background:#000;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}
</style></head><body><div><h1>Video Not Found</h1><p>This video may have been removed or is no longer available.</p></div></body></html>`;
}

function errorHTML(message) {
  return `<!DOCTYPE html>
<html><head><title>Error</title><style>
body{background:#000;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}
</style></head><body><div><h1>Error Loading Video</h1><p>${escapeHtml(message)}</p></div></body></html>`;
}

function formatPrice(price) {
  if (!price || price === 0) return 'KES 0';
  if (price < 1000000) return `KES ${price.toLocaleString()}`;
  const millions = price / 1000000;
  return millions % 1 === 0 ? `KES ${millions}M` : `KES ${millions.toFixed(1)}M`;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}