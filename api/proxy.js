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
            .replace(/window\.open/g, 'console.log') // Disable pop-ups
            .replace(/location\.href/g, 'console.log'); // Disable forced redirects

        // Inject CSS to prevent overlay click hijacking
        html = html.replace("</head>", `
            <style>
                body { background: #000 !important; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                iframe { width: 100vw !important; height: 100vh !important; border: none; }

                /* Block invisible ad overlays */
                [onclick], [onmousedown], [onmouseup] {
                    pointer-events: none !important;
                }
            </style>
            </head>
        `);

        res.setHeader("Content-Type", "text/html");
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
        res.setHeader("Access-Control-Allow-Methods", "GET");

        res.status(200).send(html);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch video" });
    }
}
