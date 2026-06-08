const express = require('express');
const cors = require('cors');
const ytSearch = require('yt-search');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for the frontend deployed on GitHub Pages or local development
app.use(cors({
  origin: '*', // Allow all origins for simplicity, or change to specific domain
  methods: ['GET', 'OPTIONS']
}));

app.use(express.json());

// Status endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'BoraeBang proxy server is running' });
});

/**
 * YouTube Video Search Endpoint
 * GET /api/search?q=query
 */
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  console.log(`[Search] Query: "${query}"`);

  try {
    const searchResult = await ytSearch(query);
    
    // Map yt-search results into standard schema:
    // { videoId, title, thumbnail, author }
    const videos = (searchResult.videos || []).slice(0, 15).map(video => ({
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail || video.image || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
      author: video.author ? video.author.name : 'YouTube'
    }));

    res.json({ items: videos });
  } catch (error) {
    console.error('[Search Error]:', error);
    res.status(500).json({ error: 'Failed to search YouTube', details: error.message });
  }
});

/**
 * YouTube Autocomplete Suggestions Endpoint
 * GET /api/suggestions?q=query
 */
app.get('/api/suggestions', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.json([]);
  }

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`;
    
    // Fetch suggestions from Google suggest query endpoint
    const response = await fetch(url);
    const text = await response.text();
    
    // Google suggest returns a string: window.google.ac.h(["query",[["suggestion1",0],["suggestion2",0]],...])
    // We can parse the JSON array from within the parenthesis
    const matches = text.match(/window\.google\.ac\.h\((.*)\)/);
    if (matches && matches[1]) {
      const parsed = JSON.parse(matches[1]);
      if (Array.isArray(parsed) && parsed[1]) {
        const suggestions = parsed[1].map(item => item[0]);
        return res.json(suggestions);
      }
    }
    
    res.json([]);
  } catch (error) {
    console.error('[Suggestions Error]:', error);
    res.json([]); // Fail silently to not break client UI
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` BoraeBang Proxy Server is running on port ${PORT} `);
  console.log(` Endpoint: http://localhost:${PORT}/api/search   `);
  console.log(`=================================================`);
});
