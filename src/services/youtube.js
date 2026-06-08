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

// Keywords that strongly indicate this is a KARAOKE / MR / instrumental track
// NOTE: Company names (TJ미디어, 금영, KY) are excluded from positive keywords
//       because their official videos are embed-blocked and cannot play outside YouTube.
const KARAOKE_POSITIVE_KEYWORDS = [
  '노래방', '반주', 'mr', 'karaoke', '가라오케', 'instrumental',
  'ar ver', 'mr ver', '반주ver', '노래방버전', '코러스', '반주음악',
  'minus one', '마이너스원'
];

// Keywords that strongly indicate this is a COVER / vocal performance (not wanted)
const KARAOKE_NEGATIVE_KEYWORDS = [
  '커버', 'cover', 'cover by', 'covered by', '부른', '직접',
  '노래해', '노래함', '가창', '翻唱', '歌ってみた', 'uta',
  '남성ver', '여성ver', '남자ver', '여자ver', '라이브', 'live',
  '리액션', 'reaction', '오디션', 'audition', '경연',
  '직캠', 'fancam', 'fan cam', 'mv', 'm/v', '뮤직비디오',
  'music video', '풀버전 보컬', '보컬ver'
];

/**
 * Score a video title for karaoke/MR relevance.
 * Higher = more likely to be a backing track, lower = likely a cover.
 * @param {string} title
 * @param {string} author
 * @returns {number} score (can be negative)
 */
export function scoreKaraokeRelevance(title, author = '') {
  const combined = (title + ' ' + author).toLowerCase();
  let score = 0;

  for (const kw of KARAOKE_POSITIVE_KEYWORDS) {
    if (combined.includes(kw.toLowerCase())) score += 10;
  }
  for (const kw of KARAOKE_NEGATIVE_KEYWORDS) {
    if (combined.includes(kw.toLowerCase())) score -= 20;
  }

  // Official TJ / KY / 금영 karaoke company channels are always embed-blocked
  // (cannot play outside YouTube), so penalize them heavily to exclude from results
  const authorLower = author.toLowerCase();
  if (
    authorLower.includes('tj미디어') || authorLower.includes('tj media') ||
    authorLower.includes('tj karaoke') || authorLower.includes('tj노래방') ||
    authorLower === 'tj' || authorLower === 'tj media' ||
    authorLower.includes('금영') || authorLower.includes('kumyoung') ||
    authorLower.includes('ky노래방') || authorLower.includes('ky karaoke')
  ) {
    score -= 100;
  }

  return score;
}

/**
 * Filter and sort a video list to prefer karaoke/MR tracks over covers.
 * Videos with very negative scores (clearly covers) are removed entirely.
 * @param {Array} videos
 * @returns {Array}
 */
export function filterAndRankKaraoke(videos) {
  return videos
    .map(v => ({ ...v, _score: scoreKaraokeRelevance(v.title, v.author) }))
    .filter(v => v._score > -20)  // Remove strong cover matches
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...v }) => v); // Strip internal score field
}

/**
 * Clean search results into standard schema:
 * { videoId, title, thumbnail, author }
 */
function mapPipedResults(data) {
  const items = data.items || data.results || (Array.isArray(data) ? data : []);
  if (!Array.isArray(items)) return [];
  
  const results = items
    .filter(item => item && (item.type === 'video' || item.type === 'stream'))
    .map(item => {
      let videoId = item.videoId;
      if (!videoId && item.url) {
        const match = item.url.match(/[?&]v=([^&]+)/);
        if (match) {
          videoId = match[1];
        } else if (item.url.startsWith('/watch?v=')) {
          videoId = item.url.substring('/watch?v='.length);
        } else if (item.url.includes('/watch/')) {
          videoId = item.url.split('/watch/')[1];
        }
      }
      
      return {
        videoId: videoId || '',
        title: item.title || '',
        thumbnail: item.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : ''),
        author: item.author || item.uploaderName || 'YouTube'
      };
    })
    .filter(item => item.videoId);

  return filterAndRankKaraoke(results);
}

/**
 * Check if a YouTube video allows embedding.
 * Uses YouTube's oEmbed endpoint - returns false if embedding is disabled.
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<boolean>}
 */
export async function checkEmbeddable(videoId) {
  if (!videoId) return false;
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(url, { method: 'GET' });
    // 401 = embedding disabled, 404 = not found, 200 = OK (embeddable)
    return response.ok;
  } catch (e) {
    // Network error or blocked - assume it's embeddable (fail open)
    return true;
  }
}

/**
 * From a list of candidate videos, find the first one that allows embedding.
 * @param {Array} videos - Array of video objects with videoId
 * @returns {Promise<object|null>} - First embeddable video or null
 */
export async function findEmbeddableVideo(videos) {
  for (const video of videos) {
    if (!video.videoId) continue;
    const embeddable = await checkEmbeddable(video.videoId);
    if (embeddable) {
      return video;
    }
    console.warn(`[BoraeBang] Video ${video.videoId} is embed-blocked, trying next...`);
  }
  return null;
}


function mapYoutubeApiResults(data) {
  if (!data || !Array.isArray(data.items)) return [];

  const results = data.items
    .filter(item => item && item.id && item.id.videoId)
    .map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
      author: item.snippet.channelTitle || 'YouTube'
    }));

  return filterAndRankKaraoke(results);
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
