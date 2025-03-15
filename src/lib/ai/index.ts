// src/lib/ai/index.ts
import express from 'express';
import cors from 'cors';
import getUsernameSuggestions from './suggestUsername.ts';

const app = express();
const PORT = process.env.PORT || 3001; // define PORT here

app.use(cors());
app.use(express.json());

app.post('/api/suggest-usernames', async (req, res) => {
    try {
        const { fullName } = req.body;
        console.log("Received fullName:", fullName); //  log input
        const suggestions = await getUsernameSuggestions(fullName);
        console.log("Generated suggestions:", suggestions); //  log output
        res.json({ suggestions });
    } catch (err) {
        console.error("Error generating suggestions:", err); //  log errors
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

app.listen(PORT, () => {
    console.log(` Server listening on http://localhost:${PORT}`);
});
