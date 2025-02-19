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

        // Inject custom CSS for fullscreen video
        html = html.replace("</head>", `
            <style>
                body { background: #000 !important; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                iframe { width: 100vw !important; height: 100vh !important; border: none; }
            </style>
            </head>
        `);

        // Security headers (Allow only your domain)
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Access-Control-Allow-Origin", "https://officialflix.vercel.app"); // Allow CORS only from your site
        res.setHeader("Access-Control-Allow-Methods", "GET");
        res.setHeader("X-Frame-Options", "SAMEORIGIN"); // Allow embedding only on the same domain
        res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://officialflix.vercel.app; default-src 'self' https://vidsrc.me;");

        res.status(200).send(html);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch video" });
    }
}
