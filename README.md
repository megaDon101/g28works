# G28 Works — CNC Tooling Advisor

AI-powered CNC tooling recommendation engine. Input your machine, material, operation and parameters — get ranked recommendations from top manufacturers including Sandvik, Kennametal, Iscar, Walter, Seco and more.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Claude AI (claude-sonnet) for recommendations
- Deployed on Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file:

```
# No API key needed - handled server-side via Vercel
```

## Deploy

Deploy via Vercel — connect this GitHub repo and deploy. The Anthropic API is called server-side via the `/api/recommend` route.
