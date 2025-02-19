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

        // Remove any hidden redirect links
        html = html.replace(/<a[^>]*href=["'][^"']*google.com[^"']*["'][^>]*>/gi, "");

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
                        .overlay {
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            top: 0;
                            left: 0;
                            background: transparent;
                            z-index: 9999;
                        }
                    </style>
                </head>
                <body>
                    <div class="overlay" onclick="event.stopPropagation();"></div>
                    <iframe id="vidsrc-frame" src="${embedUrl}" allowfullscreen></iframe>
                    <script>
                        document.querySelector(".overlay").addEventListener("click", (e) => {
                            e.stopPropagation();
                        });

                        // Disable ad-related scripts inside the iframe
                        setInterval(() => {
                            const iframe = document.getElementById("vidsrc-frame");
                            if (iframe) {
                                iframe.contentWindow.document.querySelectorAll("a, script").forEach(el => el.remove());
                            }
                        }, 1000);
                    </script>
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
