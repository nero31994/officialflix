export default async function handler(req, res) {  
    const { id } = req.query;  
    if (!id) return res.status(400).json({ error: "Movie ID is required" });  

    const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;  

    try {  
        const response = await fetch(vidSrcUrl);  
        let html = await response.text();  

        // Extract direct video URL
        const regex = /file:"(https:\/\/[^"]+\.m3u8)"/;
        const match = html.match(regex);
        if (!match) return res.status(500).json({ error: "Failed to extract video URL" });

        const videoUrl = match[1];  

        res.json({ videoUrl });  
    } catch (error) {  
        res.status(500).json({ error: "Failed to fetch video" });  
    }  
}
