/**
 * YouTube Search Service
 * Supports official YouTube Data API v3 and fallback to public Piped API instances.
 */

// List of public Piped API instances to fallback
export const PIPED_INSTANCES = [
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
async function searchWithPiped(query, attempt = 0) {
  if (attempt >= PIPED_INSTANCES.length) {
    throw new Error('All Piped instances failed to respond.');
  }

  const currentInstance = PIPED_INSTANCES[activeInstanceIndex];
  const url = `${currentInstance}/search?q=${encodeURIComponent(query)}&filter=videos`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for fast failure

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const mapped = mapPipedResults(data);
    
    if (mapped.length === 0) {
      // Sometimes instances return empty or error objects inside 200 OK
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
export async function searchYouTube({ query, apiKey = null, searchPipedOnly = false }) {
  const trimmed = query.trim();
  if (!trimmed) return [];

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
export async function getSearchSuggestions(query, attempt = 0) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const currentInstance = PIPED_INSTANCES[activeInstanceIndex];
  const url = `${currentInstance}/suggestions?query=${encodeURIComponent(trimmed)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Piped suggestions failed on ${currentInstance}:`, error.message);
    // Silent fail, just return empty list to not block the input UI
    return [];
  }
}
