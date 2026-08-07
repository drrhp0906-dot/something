# Contributing to JARVIS / F.R.I.D.A.Y

Thank you for your interest in contributing! This project is open source and we welcome all contributions.

## Development Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd jarvis-friday

# Install dependencies
npm install

# Run development server
npm run dev

# Lint check
npm run lint
```

## Project Principles

1. **Free-first** — Every feature must work without paid APIs
2. **No API keys required for basic operation** — The app must be functional on first load
3. **Modular design** — AI providers, tools, and UI components are swappable
4. **Type safety** — All code must be TypeScript with proper types
5. **Responsive** — Every UI must work on mobile and desktop

## Code Structure

- **`src/components/jarvis/`** — All JARVIS-specific UI components
- **`src/hooks/`** — Custom React hooks (voice, chat, TTS)
- **`src/lib/`** — Business logic (AI, tools, routing)
- **`src/types/`** — TypeScript type definitions
- **`src/app/api/`** — Server-side API routes

## Adding Features

### New AI Provider
1. Add the provider type to `src/types/jarvis.ts`
2. Implement in `src/lib/free-llm.ts`
3. Add to the `getLLMResponse` router function
4. Add UI option in StatusBar settings

### New Tool
1. Implement in `src/lib/tools/`
2. Add detection patterns in `src/lib/command-router.ts`
3. Handle results in `src/lib/free-llm.ts` builtin responses
4. Test via chat: "search for X", "read URL", etc.

### New UI Component
1. Create in `src/components/jarvis/`
2. Use `HolographicPanel` as the base wrapper for consistent styling
3. Use Framer Motion for animations
4. Make it responsive (mobile-first)

## Style Guidelines

- **Colors**: Use the HUD palette:
  - Primary: `#00e5ff` (cyan)
  - Secondary: `#7b61ff` (purple)
  - Alert: `#ff3d71` (pink/red)
  - Success: `#00e096` (green)
  - Background: `#0a0a1a` (deep black)
- **Panels**: Always use `HolographicPanel` for containers
- **Animations**: Use Framer Motion, not CSS animations (except in globals.css)
- **Icons**: Use Lucide React icons
- **Types**: Every prop must be typed

## Commit Messages

Use conventional commits:
- `feat: add weather search tool`
- `fix: resolve chat scroll issue on mobile`
- `docs: update architecture diagram`
- `refactor: modularize AI provider system`
- `style: adjust arc reactor glow intensity`

## Testing

Currently we rely on:
- `npm run lint` — ESLint for code quality
- Manual browser testing via agent-browser
- Visual inspection of the HUD interface

## Questions?

Open an issue on GitHub or start a discussion. We're happy to help!
