# AI Script Splitter — Light (Next.js App Router)

This project is a ready-to-deploy Next.js (App Router) app that splits long scripts into scenes using OpenAI.

## Quick deploy (Vercel)
1. Create a GitHub repo and push this project (or use Vercel's Import from GitHub).  
2. On Vercel, add Environment Variable `OPENAI_API_KEY` with your OpenAI API key.  
3. Deploy — Vercel will detect Next.js and build the project.

## Run locally (optional)
1. Install Node.js (LTS).  
2. `npm install`  
3. Create `.env.local` with `OPENAI_API_KEY=sk-...`  
4. `npm run dev` → open http://localhost:3000

## Notes
- Keep your OpenAI API key secret.
- For long scripts, the app sends the full script to the model; you may want to add chunking later to reduce cost.
