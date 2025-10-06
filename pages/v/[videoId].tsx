// pages/v/[videoId].tsx
// Deploy this to Vercel or Cloudflare Pages

import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';

interface VideoData {
  id: string;
  caption: string;
  thumbnailUrl: string;
  videoUrl: string;
  price: number;
  userName: string;
  formattedPrice: string;
}

export default function VideoPage() {
  const router = useRouter();
  const { videoId } = router.query;
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch video data on client side
  useEffect(() => {
    if (!videoId || typeof videoId !== 'string') return;

    async function fetchVideo() {
      try {
        // Replace with your actual backend API URL
        const response = await fetch(`https://api.weibao.africa/api/v1/videos/${videoId}`);
        
        if (!response.ok) {
          setError('Video not found');
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Format the data
        const formattedVideo: VideoData = {
          id: data.id,
          caption: data.caption || 'Product on TextGB',
          thumbnailUrl: data.thumbnailUrl || data.thumbnail_url || '',
          videoUrl: data.videoUrl || data.video_url || '',
          price: data.price || 0,
          userName: data.userName || data.user_name || 'Seller',
          formattedPrice: formatPrice(data.price || 0),
        };

        setVideo(formattedVideo);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video');
        setLoading(false);
      }
    }

    fetchVideo();
  }, [videoId]);
  // Deep link detection
  useEffect(() => {
    if (!video) return;

    const videoIdStr = video.id;
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Try to open the app
    const appScheme = `textgb://video/${videoIdStr}`;
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.textgb.app';
    const appStoreUrl = 'https://apps.apple.com/app/textgb/id123456789';

    // Attempt to open app
    window.location.href = appScheme;

    // Fallback to store if app does not open within 2 seconds
    const fallbackTimer = setTimeout(() => {
      if (isAndroid) {
        window.location.href = playStoreUrl;
      } else if (isIOS) {
        window.location.href = appStoreUrl;
      }
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [video]);

  // Show loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <Head>
          <title>Loading... - TextGB</title>
        </Head>
        <div style={styles.content}>
          <p style={styles.loading}>Loading product...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !video) {
    return (
      <div style={styles.container}>
        <Head>
          <title>Video Not Found - TextGB</title>
        </Head>
        <div style={styles.error}>
          <h1>Video Not Found</h1>
          <p>{error || 'This video may have been removed or is no longer available.'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        {/* Essential Meta Tags */}
        <title>{video.caption} - {video.formattedPrice} | TextGB</title>
        <meta name="description" content={`Buy ${video.caption} for ${video.formattedPrice} from ${video.userName} on TextGB`} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="video.other" />
        <meta property="og:url" content={`https://textgb.com/v/${video.id}`} />
        <meta property="og:title" content={`${video.caption} - ${video.formattedPrice}`} />
        <meta property="og:description" content={`Buy this product from ${video.userName} on TextGB`} />
        <meta property="og:image" content={video.thumbnailUrl} />
        <meta property="og:image:width" content="720" />
        <meta property="og:image:height" content="1280" />
        <meta property="og:video" content={video.videoUrl} />
        <meta property="og:video:secure_url" content={video.videoUrl} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="720" />
        <meta property="og:video:height" content="1280" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content={`${video.caption} - ${video.formattedPrice}`} />
        <meta name="twitter:description" content={`Buy this product from ${video.userName} on TextGB`} />
        <meta name="twitter:image" content={video.thumbnailUrl} />
        <meta name="twitter:player" content={video.videoUrl} />
        <meta name="twitter:player:width" content="720" />
        <meta name="twitter:player:height" content="1280" />

        {/* WhatsApp Specific */}
        <meta property="og:site_name" content="TextGB Marketplace" />

        {/* iOS Smart App Banner */}
        <meta name="apple-itunes-app" content="app-id=123456789" />

        {/* Android App Indexing */}
        <link rel="alternate" href={`android-app://com.textgb.app/textgb/video/${video.id}`} />
      </Head>

      <div style={styles.container}>
        <div style={styles.content}>
          <img 
            src={video.thumbnailUrl} 
            alt={video.caption}
            style={styles.thumbnail}
          />
          <h1 style={styles.title}>{video.caption}</h1>
          <p style={styles.price}>{video.formattedPrice}</p>
          <p style={styles.seller}>Sold by {video.userName}</p>
          
          <div style={styles.cta}>
            <p style={styles.loading}>Opening TextGB app...</p>
            <p style={styles.hint}>Don't have the app? You'll be redirected to download it.</p>
          </div>

          <div style={styles.links}>
            <a href={`textgb://video/${video.id}`} style={styles.button}>
              Open in App
            </a>
            <a href={video.videoUrl} style={styles.buttonSecondary}>
              View Video
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to format price
function formatPrice(price: number): string {
  if (price === 0) return 'KES 0';
  
  if (price < 1000000) {
    return `KES ${price.toLocaleString()}`;
  } else {
    const millions = price / 1000000;
    if (millions === Math.floor(millions)) {
      return `KES ${millions}M`;
    } else {
      return `KES ${millions.toFixed(1)}M`;
    }
  }
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
  },
  content: {
    maxWidth: '500px',
    textAlign: 'center' as const,
  },
  thumbnail: {
    width: '100%',
    maxWidth: '400px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '12px',
    lineHeight: '1.4',
  },
  price: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: '8px',
  },
  seller: {
    fontSize: '16px',
    color: '#aaa',
    marginBottom: '32px',
  },
  cta: {
    marginBottom: '24px',
  },
  loading: {
    fontSize: '18px',
    marginBottom: '8px',
  },
  hint: {
    fontSize: '14px',
    color: '#888',
  },
  links: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  button: {
    display: 'block',
    padding: '16px 32px',
    backgroundColor: '#FF6B6B',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  buttonSecondary: {
    display: 'block',
    padding: '16px 32px',
    backgroundColor: 'transparent',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: '2px solid #fff',
    transition: 'background-color 0.3s',
  },
  error: {
    textAlign: 'center' as const,
    padding: '40px',
  },
};