export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Movie ID is required" });

    const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;

    try {
        const response = await fetch(vidSrcUrl);
        let html = await response.text();

        // Remove all <script> tags except essential ones for the player
        html = html.replace(/<script(?![^>]*player)[^>]*>.*?<\/script>/gis, '');

        // Completely disable redirects
        html = html
            .replace(/window\.open\s*
