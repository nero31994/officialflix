export default async function handler(req, res) {
    const { id } = req.query;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid Movie ID" });
    }

    const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;

    try {
        const response = await fetch(vidSrcUrl);
        let html = await response.text();

        // Remove scripts, disable pop-ups & redirects
        html = html
            .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove scripts
            .replace(/window\.open/g, 'console.log') // Disable pop-ups
            .replace(/location\.href/g, 'console.log'); // Disable forced redirects

        // Prevent overlay click hijacking
        html = html.replace("</head>", `
            <style>
                body { background: #000 !important; margin: 0;
