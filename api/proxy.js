export default async function handler(req, res) {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: "Movie ID is required" });
        }

        const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;
        const response = await fetch(vidSrcUrl);
        if (!response.ok) throw new Error("Failed to fetch video page");

        let html = await response.text();

        // Extract M3U8 link from VidSrc
        const m3u8Match = html.match(/(https?:\/\/.*?\.m3u8)/);
        if (!m3u8Match) throw new Error("M3U8 source not found");

        const m3u8Url = m3u8Match[1];

        res.json({ m3u8: m3u8Url });
    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).json({ error: "Failed to fetch video source" });
    }
}
