export default async function handler(req, res) {
    const { id } = req.query;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid Movie ID" });
    }

    const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;

    try {
        const response = await fetch(vidSrcUrl);
        let html = await response.text();

        // Remove all JavaScript scripts (ads, trackers, pop-ups)
        html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

        // Disable onclick pop-ups & unwanted ads
        html = html.replace(/onclick\s*=\s*["'][^"']*["']/gi, "");
        html = html.replace(/onmouseover\s*=\s*["'][^"']*["']/gi, "");
        html = html.replace(/onmousedown\s*=\s*["'][^"']*["']/gi, "");
        html = html.replace(/target\s*=\s*["_blank"]+/gi, ""); // Prevent forced new tabs

        // Extract only the main video player iframe
        const match = html.match(/<iframe[^>]+src="([^"]+)"/);
        if (match && match[1]) {
            const embedUrl = match[1];

            return res.status(200).send(`
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { margin: 0; background: black; display: flex; justify-content: center; align-items: center; height: 100vh; }
                        iframe { width: 100%; height: 100vh; border: none; }
                    </style>
                </head>
                <body>
                    <iframe src="${embedUrl}" allowfullscreen></iframe>
                </body>
                </html>
            `);
        } else {
            return res.status(500).json({ error: "Failed to extract video player." });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error fetching video source." });
    }
}
