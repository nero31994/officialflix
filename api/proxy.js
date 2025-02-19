const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/proxy', async (req, res) => {
    const { id, type } = req.query;

    if (!id || !type) {
        return res.status(400).json({ error: "Missing parameters (id or type)" });
    }

    const embedURL = type === 'movie' 
        ? `https://www.2embed.stream/embed/movie/${id}` 
        : `https://www.2embed.stream/embed/tv/${id}`;

    try {
        const response = await fetch(embedURL);
        let html = await response.text();

        // Remove all scripts (to block pop-ups & ads)
        html = html.replace(/<script[^>]*>.*?<\/script>/gis, '');

        // Prevent forced redirects
        html = html.replace(/window\.open/g, 'console.log');
        html = html.replace(/location\.href/g, 'console.log');

        res.send(html);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch the stream" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));
