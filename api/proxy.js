import puppeteer from "puppeteer";

export default async function handler(req, res) {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: "Movie ID is required" });
        }

        const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;

        // Launch Puppeteer (headless browser)
        const browser = await puppeteer.launch({
            headless: "new", // Ensures headless mode works properly
            args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for some server environments
        });

        const page = await browser.newPage();
        await page.goto(vidSrcUrl, { waitUntil: "networkidle2" });

        // Wait for the M3U8 link to appear
        await page.waitForSelector("video source[src$='.m3u8']", { timeout: 10000 });

        // Extract the M3U8 URL
        const m3u8Url = await page.evaluate(() => {
            const videoSource = document.querySelector("video source[src$='.m3u8']");
            return videoSource ? videoSource.src : null;
        });

        await browser.close();

        if (!m3u8Url) {
            return res.status(404).json({ error: "M3U8 source not found" });
        }

        res.json({ m3u8: m3u8Url });
    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).json({ error: "Failed to fetch video source" });
    }
}
