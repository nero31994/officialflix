export default async function handler(req, res) {
    const { id, source } = req.query;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid Movie ID" });
    }

    // ✅ Define source URLs dynamically
    let embedUrl;
    switch (source) {
        case "hdtoday":
            embedUrl = `https://hdtoday.to/embed/movie/${id}`;
            break;
        case "vidsrc":
        default:
            embedUrl = `https://vidsrc.xyz/embed/movie/${id}`;
            break;
    }

    try {
        const response = await fetch(embedUrl);
        let html = await response.text();

        // ✅ Remove ad-related scripts while keeping player scripts
        html = html.replace(/<script[^>]*(ads|popunder|googletag|analytics|tracking)[^>]*>[\s\S]*?<\/script>/gi, ""); 
        html = html.replace(/window\.open/g, "console.log"); // Disable pop-ups
        html = html.replace(/location\.href/g, "console.log"); // Disable forced redirects
        html = html.replace(/<a[^>]+target=["']_blank["'][^>]*>/gi, ""); // Remove forced new tabs

        // ✅ Extract the main video player iframe
        const match = html.match(/<iframe[^>]+src="([^"]+)"/);
        if (match && match[1]) {
            const iframeUrl = match[1];

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
                    <iframe id="stream-frame" src="${iframeUrl}" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
                    <script>
                        setInterval(() => {
                            try {
                                const iframe = document.getElementById("stream-frame");
                                if (iframe && iframe.contentWindow) {
                                    const iframeDoc = iframe.contentWindow.document;
                                    iframeDoc.querySelectorAll("a, script[src*='ads'], div[class*='ad'], iframe[src*='ads']").forEach(el => el.remove());
                                }
                            } catch (err) {
                                console.warn("Ad removal error:", err);
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
