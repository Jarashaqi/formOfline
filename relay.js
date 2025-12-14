import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const TARGET_URL = 'https://dev.sekolahsampah.id/api/sync.php';
const API_KEY = 'DEV_SAMPAH_123';

console.log(`🚀 RELAY (CURL MODE) starting on port ${PORT}`);

app.post('/sync', (req, res) => {
    console.log('📥 Forwarding via CURL...');

    // Write body to temp file to handle large payloads safely
    const tmpFile = path.resolve(__dirname, `temp_${Date.now()}.json`);
    fs.writeFileSync(tmpFile, JSON.stringify(req.body));

    // Construct curl command
    // Using simple quotes for Windows compatibility in the exec shell usually requires double quotes for the command, 
    // but the file argument @filename handles the body complexity.
    // We assume 'curl' is in the PATH (Git Bash or System32)
    const cmd = `curl -X POST -H "Content-Type: application/json" -H "X-API-KEY: ${API_KEY}" --data @${tmpFile} ${TARGET_URL}`;

    console.log('Running:', cmd);

    exec(cmd, (error, stdout, stderr) => {
        // cleanup
        try { fs.unlinkSync(tmpFile); } catch (e) { console.error('Cleanup error', e); }

        if (error) {
            console.error('❌ Curl execution error:', error);
            console.error('Stderr:', stderr);
            return res.status(500).json({ success: false, message: 'Curl failed', details: stderr });
        }

        console.log('📤 Curl Output:', stdout.substring(0, 200)); // Log first 200 chars

        try {
            const json = JSON.parse(stdout);
            res.status(200).json(json);
        } catch (e) {
            console.error('Invalid JSON from curl response');
            res.status(502).json({ success: false, message: 'Invalid JSON from server', raw: stdout });
        }
    });
});

app.listen(PORT, () => {
    console.log(`✅ Relay listening on http://localhost:${PORT}`);
});
