/**
 * YouTube Search Service
 * Supports official YouTube Data API v3 and fallback to public Piped API instances.
 */

// List of public Piped API instances to fallback
export const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.moomoo.me',
  'https://pipedapi.tokhmi.xyz',
  'https://piapi.ggtyler.dev',
  'https://pipedapi.lunar.icu',
  'https://piped-api.garudalinux.org'
];

// Active Piped instance index
let activeInstanceIndex = 0;

/**
 * Get active Piped instance URL
 */
export function getActivePipedInstance() {
  return PIPED_INSTANCES[activeInstanceIndex];
}

/**
 * Switch to next Piped instance in case of failure
 */
function rotatePipedInstance() {
  activeInstanceIndex = (activeInstanceIndex + 1) % PIPED_INSTANCES.length;
  console.warn(`Rotating Piped instance to: ${PIPED_INSTANCES[activeInstanceIndex]}`);
  return PIPED_INSTANCES[activeInstanceIndex];
}

/**
 * Clean search results into standard schema:
 * { videoId, title, thumbnail, author }
 */
function mapPipedResults(data) {
  if (!data || !Array.isArray(data.items)) return [];
  
  return data.items
    .filter(item => item && item.type === 'video' && item.videoId)
    .map(item => ({
      videoId: item.videoId,
      title: item.title,
      thumbnail: item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`,
      author: item.author || 'YouTube'
    }));
}

function mapYoutubeApiResults(data) {
  if (!data || !Array.isArray(data.items)) return [];
  
  return data.items
    .filter(item => item && item.id && item.id.videoId)
    .map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
      author: item.snippet.channelTitle || 'YouTube'
    }));
}

/**
 * Search YouTube using Piped API (with rotation fallback)
 */
/**
 * Helper to fetch data by bypassing CORS using public CORS proxies.
 */
async function fetchWithCorsProxy(targetUrl, options = {}) {
  const proxies = [
    // Option 0: Direct fetch (fastest)
    (url) => url,
    // Option 1: corsproxy.io (Very fast, stable)
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    // Option 2: allorigins.win (Reliable fallback)
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  ];

  let lastError = null;

  for (let i = 0; i < proxies.length; i++) {
    const proxiedUrl = proxies[i](targetUrl);
    try {
      const response = await fetch(proxiedUrl, options);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP status ${response.status}`);
    } catch (err) {
      lastError = err;
      console.warn(`Fetch failed with proxy option ${i} (${proxiedUrl}):`, err.message);
      // Continue loop to try next proxy
    }
  }

  throw lastError || new Error('All CORS proxy options failed');
}

/**
 * Search YouTube using Piped API (with rotation fallback and CORS proxies)
 */
async function searchWithPiped(query, attempt = 0) {
  if (attempt >= PIPED_INSTANCES.length) {
    throw new Error('All Piped instances failed to respond.');
  }

  const currentInstance = PIPED_INSTANCES[activeInstanceIndex];
  const url = `${currentInstance}/search?q=${encodeURIComponent(query)}&filter=videos`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for proxy chains

    const data = await fetchWithCorsProxy(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const mapped = mapPipedResults(data);
    
    if (mapped.length === 0) {
      throw new Error('Empty results or invalid response format');
    }
    return mapped;
  } catch (error) {
    console.error(`Piped search failed on ${currentInstance}:`, error.message);
    rotatePipedInstance();
    return searchWithPiped(query, attempt + 1);
  }
}

/**
 * Search YouTube using official API
 */
async function searchWithOfficialApi(query, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Official YouTube API error');
  }
  const data = await response.json();
  return mapYoutubeApiResults(data);
}

/**
 * Main Search Endpoint
 */
export async function searchYouTube({ query, apiKey = null, searchPipedOnly = false, customBackendUrl = null }) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // If custom backend proxy is set, use it!
  if (customBackendUrl) {
    try {
      const cleanUrl = customBackendUrl.replace(/\/$/, ''); // strip trailing slash
      const url = `${cleanUrl}/api/search?q=${encodeURIComponent(trimmed)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.items)) {
          return data.items;
        }
      }
      console.warn('Custom backend failed, falling back to Piped...');
    } catch (error) {
      console.error('Custom backend error, falling back to Piped:', error.message);
    }
  }

  // Use official API if key is provided and not forced to use Piped
  if (apiKey && !searchPipedOnly) {
    try {
      return await searchWithOfficialApi(trimmed, apiKey);
    } catch (error) {
      console.warn('Official YouTube API failed, falling back to Piped:', error.message);
      // Fallback to Piped
    }
  }

  return await searchWithPiped(trimmed);
}

/**
 * Get Autocomplete suggestions (from Piped or fallback to YouTube mock)
 */
export async function getSearchSuggestions(query, attempt = 0, customBackendUrl = null) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Use custom backend if provided
  if (customBackendUrl) {
    try {
      const cleanUrl = customBackendUrl.replace(/\/$/, '');
      const url = `${cleanUrl}/api/suggestions?q=${encodeURIComponent(trimmed)}`;
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // fallback to Piped
    }
  }

  const currentInstance = PIPED_INSTANCES[activeInstanceIndex];
  const url = `${currentInstance}/suggestions?query=${encodeURIComponent(trimmed)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const data = await fetchWithCorsProxy(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Piped suggestions failed on ${currentInstance}:`, error.message);
    // Silent fail, just return empty list to not block the input UI
    return [];
  }
}
