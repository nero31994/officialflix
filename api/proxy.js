const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: "Movie ID is required" });
    }

    const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;

    try {
        const response = await fetch(vidSrcUrl);
        const html = await response.text();

        // Extract the direct video URL from the HTML
        const regex = /file: "(https:\/\/[^"]+\.m3u8)"/;
        const match = html.match(regex);

        if (match && match[1]) {
            const videoUrl = match[1];
            res.json({ videoUrl });
        } else {
            res.status0
