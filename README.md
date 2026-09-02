# LabelLens

AI-assisted compliance scanner for India's Legal Metrology (Packaged Commodities) Rules, 2011. Scans a packaged product label, extracts the mandatory declarations, and checks each one against the rule set with a compliance score, risk rating, and cited rule references.

## Setup

1. Copy .env.example to .env and add your Gemini API key.
2. Install dependencies: npm install
3. Run the app: npm run dev
4. Open https://labellens-h0km.onrender.com

## Architecture

- React + TypeScript frontend (src/)
- Express server (server.ts) handling Gemini API calls server-side so the key is never exposed to the browser
- Components: label upload/capture, declaration cards with verdicts and rule citations, compliance summary, history, and a rules handbook reference
