import { list } from '@vercel/blob';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function downloadAllBlobs() {
    try {
        const { blobs } = await list({
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        const filteredBlobs = blobs.filter(blob => blob.pathname.includes("post_"))

        if (!blobs || filteredBlobs.length === 0) {
            console.log("No blobs found.");
            return;
        }

        for (const blob of filteredBlobs) {
            console.log(`Downloading: ${blob.pathname}`);

            // Fetch file
            const response = await fetch(blob.url);
            const fileContent = await response.buffer();

            // Ensure directory exists
            const savePath = path.join("pictures", blob.pathname);
            const dir = path.dirname(savePath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Save file locally
            fs.writeFileSync(savePath, fileContent);

            console.log(`Saved: ${savePath}`);
        }

        console.log("✅ All files downloaded.");
    } catch (error) {
        console.error("Error:", error);
    }
}

downloadAllBlobs();
