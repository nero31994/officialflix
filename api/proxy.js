export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Movie ID is required" });

    const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;

    try {
        const response = await fetch(vidSrcUrl);
        let html = await response.text();

        // Remove all scripts (including dynamically loaded ads)
        html = html.replace(/<script[^>]*>.*?<\/script>/gis, '');

        // Block pop-ups and redirects
        html = html
            .replace(/window\.open/g, 'console.log')  // Disable pop-ups
            .replace(/location\.href/g, 'console.log') // Disable forced redirects
            .replace(/target="_blank"/g, 'target="_self"'); // Prevent new tabs

        // Inject CSS + JavaScript to block overlay hijacking
        html = html.replace("</head>", `
            <style>
                body { background: #000 !important; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                iframe { width: 100vw !important; height: 100vh !important; border: none; }
                
                /* Block invisible click hijacking layers */
                [onclick], [onmousedown], [onmouseup] {
                    pointer-events: none !important;
                }

                /* Remove hidden iframes (used for ads) */
                iframe:not([src*="vidsrc"]) { display: none !important; }
            </style>
            <script>
                // Block additional pop-ups injected dynamically
                document.addEventListener('DOMContentLoaded', () => {
                    setInterval(() => {
                        const popups = document.querySelectorAll('iframe[src*="ads"], iframe[src*="pop"]');
                        popups.forEach(el => el.remove()); // Remove ad iframes
                    }, 500);
                });
            </script>
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
