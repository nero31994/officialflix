export default async function handler(req, res) {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: "Movie ID is required" });
        }

        const vidSrcUrl = `https://vidsrc.me/embed/movie/${id}`;
        const response = await fetch(vidSrcUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }

        let html = await response.text();

        // Remove pop-ups, redirects, and scripts
        html = html
            .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove all scripts
            .replace(/window\.open/g, 'console.log') // Disable pop-ups
            .replace(/location\.href/g, 'console.log'); // Disable forced redirects

        // Inject CSS & JS to allow Play/Pause & Seeking
        html = html.replace("</head>", `
            <style>
                body {
                    background: #000 !important;
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    overflow: hidden;
                    touch-action: none;
                    user-select: none;
                }

                iframe {
                    width: 100vw !important;
                    height: 100vh !important;
                    border: none;
                    pointer-events: auto; /* Allow interactions */
                }

                video {
                    pointer-events: auto !important;
                }

                /* Block unwanted ad overlays */
                iframe *[id*="ad"], iframe *[class*="ad"], iframe *[onclick*="ad"] {
                    display: none !important;
                    pointer-events: none !important;
                }
            </style>

            <script>
                document.addEventListener("DOMContentLoaded", () => {
                    const iframe = document.querySelector("iframe");

                    // Wait for the iframe to load and access its content
                    iframe.onload = () => {
                        try {
                            const player = iframe.contentWindow.document.querySelector("video");

                            if (player) {
                                // Enable Play/Pause
                                document.addEventListener("keydown", (event) => {
                                    if (event.code === "Space") {
                                        event.preventDefault();
                                        player.paused ? player.play() : player.pause();
                                    }
                                });

                                // Enable Seeking (Arrow Keys)
                                document.addEventListener("keydown", (event) => {
                                    if (event.code === "ArrowRight") {
                                        player.currentTime += 10; // Forward 10 sec
                                    } else if (event.code === "ArrowLeft") {
                                        player.currentTime -= 10; // Rewind 10 sec
                                    }
                                });
                            }
                        } catch (err) {
                            console.error("Error accessing video controls:", err);
                        }
                    };
                });
            </script>
            </head>
        `);

        res.setHeader("Content-Type", "text/html");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET");

        res.status(200).send(html);
    } catch (error) {
        console.error("Video Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to load the video. Please try again later." });
    }
}
