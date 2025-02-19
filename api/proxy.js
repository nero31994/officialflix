export default async function handler(req, res) {
    const { id } = req.query;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid Movie ID" });
    }

    const embedUrl = `https://www.2embed.stream/embed/movie/${id}`;

    try {
        const response = await fetch(embedUrl);
        let html = await response.text();

        // Remove scripts to prevent pop-ups and unwanted redirects
        html = html
            .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove all scripts
            .replace(/window\.open/g, 'console.log') // Disable pop-ups
            .replace(/location\.href/g, 'console.log'); // Disable redirects

        // Inject autoplay functionality
        html = html.replace("</head>", `
            <style>
                video { autoplay: true !important; }
            </style>
            </head>
        `);

        res.setHeader("Content-Type", "text/html");
        res.send(html);
    } catch (error) {
        res.status(500).json({ error: "Error fetching movie" });
    }
}
