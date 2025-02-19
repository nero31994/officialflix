export default async function handler(req, res) {
    const { id } = req.query;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid Movie ID" });
    }

    const embedUrl = `https://www.2embed.stream/embed/movie/${id}`;

    try {
        const response = await fetch(embedUrl);
        let html = await response.text();

        // Remove unwanted scripts and prevent popups/redirects
        html = html
            .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove all <script> tags
            .replace(/window\.open/g, 'console.log') // Block pop-ups
            .replace(/location\.href/g, 'console.log'); // Prevent forced redirects

        // Inject custom styles to hide unwanted elements
        html = html.replace("</head>", `
            <style>
                body { background: #000 !important; margin: 0; }
                iframe { width: 100% !important; height: 100vh !important; border: none; }
            </style>
        </head>`);

        res.setHeader("Content-Type", "text/html");
        return res.status(200).send(html);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch movie" });
    }
}
