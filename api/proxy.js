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

        // Extract the iFrame URL
        const iframeRegex = /<iframe[^>]+src="([^"]+)"/;
        const match = html.match(iframeRegex);

        if (match && match[1]) {
            const iframeUrl = match[1];

            // Return the iFrame URL (no ads)
            res.json({ iframeUrl });
        } else {
            res.status(500).json({ error: "Failed to extract video iframe" });
        }
    } catch (error) {
        console.error("Error fetching VidSrc:", error);
        res.status(500).json({ error: "Failed to fetch video" });
    }
};
