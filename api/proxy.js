export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Movie ID is required" });

    const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;

    try {
        const response = await fetch(vidSrcUrl);
        let html = await response.text();

        // Remove pop-ups, redirects, and unwanted scripts
        html = html
            .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove scripts
            .replace(/window\.open/g, '') // Block pop-ups
            .replace(/location\.href/g, ''); // Block redirects

        // Inject custom CSS to fix fullscreen video player
        html = html.replace("</head>", `
            <style>
                body { background: #000 !important; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                iframe { width: 100vw !important; height: 100vh !important; border: none; }
            </style>
            </head>
        `);

        res.setHeader("Content-Type", "text/html");
        res.status(200).send(html);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch video" });
    }
}
