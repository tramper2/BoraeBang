/**
 * Manana Karaoke API Service
 * Endpoint details:
 * - Title search: https://api.manana.kr/karaoke/song/{title}.json?brand={brand}
 * - Singer search: https://api.manana.kr/karaoke/singer/{singer}.json?brand={brand}
 * - Number search: https://api.manana.kr/karaoke/no/{number}.json?brand={brand}
 */

const BASE_URL = 'https://api.manana.kr/karaoke';

/**
 * Clean search results (ensure fields are standard and valid)
 */
function cleanResults(data, brandFilter) {
  if (!Array.isArray(data)) return [];
  
  return data
    .filter(item => item && item.no && item.title)
    .map(item => ({
      brand: (item.brand || 'tj').toLowerCase(),
      no: item.no,
      title: item.title,
      singer: item.singer || 'Unknown',
      composer: item.composer || '',
      lyricist: item.lyricist || '',
      release: item.release || ''
    }))
    .filter(item => {
      if (brandFilter && brandFilter !== 'all') {
        return item.brand === brandFilter.toLowerCase();
      }
      return true;
    });
}

/**
 * Fetch helper with CORS and JSON parse
 */
async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    return [];
  }
}

export async function searchKaraoke({ query, brand = 'all' }) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // 1. If the query is a number, search by number
  if (/^\d+$/.test(trimmed)) {
    const brandParam = brand !== 'all' ? `?brand=${brand}` : '';
    const data = await fetchJson(`${BASE_URL}/no/${trimmed}.json${brandParam}`);
    return cleanResults(data, brand);
  }

  // 2. Multi-word query fallback strategy
  // If user searches "아이유 밤편지", they want the song "밤편지" by "아이유".
  // The manana API matches exact substrings. So `/song/아이유 밤편지` will likely fail.
  // We split the query. We'll search by the components.
  const words = trimmed.split(/\s+/);
  
  if (words.length > 1) {
    // Strategy: Search for the last word as a song title (likely "밤편지")
    // and search for the first word as a singer (likely "아이유")
    // then merge or filter.
    const titleWord = words[words.length - 1];
    const singerWord = words[0];
    
    const brandParam = brand !== 'all' ? `?brand=${brand}` : '';
    const [titleResults, singerResults] = await Promise.all([
      fetchJson(`${BASE_URL}/song/${encodeURIComponent(titleWord)}.json${brandParam}`),
      fetchJson(`${BASE_URL}/singer/${encodeURIComponent(singerWord)}.json${brandParam}`)
    ]);

    const cleanTitle = cleanResults(titleResults, brand);
    const cleanSinger = cleanResults(singerResults, brand);

    // Find intersection where song numbers match
    const intersection = cleanTitle.filter(t => 
      cleanSinger.some(s => s.no === t.no && s.brand === t.brand)
    );

    if (intersection.length > 0) {
      return intersection;
    }

    // If no intersection, union them and filter by search terms in title/singer
    const combined = [...cleanTitle, ...cleanSinger];
    const seen = new Set();
    const unique = [];
    
    for (const item of combined) {
      const key = `${item.brand}-${item.no}`;
      if (!seen.has(key)) {
        seen.add(key);
        // Check if all search words are present in title or singer
        const matchesAll = words.every(word => 
          item.title.toLowerCase().includes(word.toLowerCase()) || 
          item.singer.toLowerCase().includes(word.toLowerCase())
        );
        if (matchesAll) {
          unique.push(item);
        }
      }
    }
    
    if (unique.length > 0) {
      return unique;
    }
  }

  // 3. Default: Search title and singer in parallel using the full query
  const brandParam = brand !== 'all' ? `?brand=${brand}` : '';
  const [titleData, singerData] = await Promise.all([
    fetchJson(`${BASE_URL}/song/${encodeURIComponent(trimmed)}.json${brandParam}`),
    fetchJson(`${BASE_URL}/singer/${encodeURIComponent(trimmed)}.json${brandParam}`)
  ]);

  const combined = [...cleanResults(titleData, brand), ...cleanResults(singerData, brand)];
  
  // Deduplicate
  const seen = new Set();
  const unique = [];
  for (const item of combined) {
    const key = `${item.brand}-${item.no}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }
  
  return unique;
}
