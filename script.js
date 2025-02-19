export default async function handler(req, res) {
    const { id } = req.query;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid Movie ID" });
    }

    const embedUrl = `https://www.2embed.stream/embed/movie/${id}`;

    try {
        const response = await fetch(embedUrl);
        let html = await response.text();

        // Remove scripts, popups, and forced redirects
        html = html
            .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove scripts
            .replace(/window\.open/g, 'console.log') // Disable pop-ups
            .replace(/location\.href/g, 'console.log'); // Disable redirects

        // Prevent overlay click hijacking
        html = html.replace("</head>", `
            <style>
                body { background: #000 !important; margin: 0; }
                .overlay { display: none !important; }
            </style>
        </head>`);

        res.setHeader("Content-Type", "text/html");
        res.status(200).send(html);
    } catch (error) {
        res.status(500).json({ error: "Error fetching movie embed." });
    }
}
