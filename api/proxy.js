export default async function handler(req, res) {
    const { id } = req.query;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid Movie ID" });
    }

    const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;

    try {
        const response = await fetch(vidSrcUrl);
        let html = await response.text();

        // Remove only ad-related scripts (keeping player scripts intact)
        html = html.replace(/<script[^>]*ads[^>]*>[\s\S]*?<\/script>/gi, ""); // Remove ad scripts
        html = html.replace(/<script[^>]*popunder[^>]*>[\s\S]*?<\/script>/gi, ""); // Remove pop-ups
        html = html.replace(/<a[^>]*href=["'][^"']*google.com[^"']*["'][^>]*>/gi, ""); // Remove Google Play redirects

        // Extract video player iframe
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
                        .blocker {
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
                    <div class="blocker" onclick="event.stopPropagation();"></div>
                    <iframe id="vidsrc-frame" src="${embedUrl}" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
                    <script>
                        document.querySelector(".blocker").addEventListener("click", (e) => {
                            e.stopPropagation();
                        });

                        // Remove overlay ads dynamically
                        setInterval(() => {
                            const iframe = document.getElementById("vidsrc-frame");
                            if (iframe && iframe.contentWindow) {
                                try {
                                    const iframeDoc = iframe.contentWindow.document;
                                    iframeDoc.querySelectorAll("a, .overlay, .ads").forEach(el => el.remove());
                                } catch (err) {
                                    console.warn("Unable to modify iframe:", err);
                                }
                            }
                        }, 2000);
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
