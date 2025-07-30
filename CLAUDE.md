
## Project Philosophy

**No Timeline Pressure**: This project does not work with timelines or time estimates. Implementation progresses through logical phases and checkpoints, focusing on quality and correctness rather than arbitrary deadlines. Each phase should be completed and validated before moving to the next, without time-based pressure.

## Development Scripts

### Database Setup
- **Set up database**: `bun run db:setup` (links project and runs migrations)
- **Reset database**: `bun run db:reset` (if you need to start over)
- **Update types**: `bun run db:types` (regenerate TypeScript types from schema)

### Server Management
- **Start server**: `.claude/start.sh` (logs to `server.log`, prevents duplicates)
- **Start with logs**: `.claude/start.sh --follow` 
- **Stop server**: `.claude/stop.sh` (cleans up orphaned processes)
- **View logs**: `tail -f server.log`

Both server scripts handle PID tracking, graceful shutdown, and port 3000 cleanup to prevent orphaned processes.

## Important Files & Structure

### Core Configuration
- `package.json` - Dependencies and scripts (includes db:setup, db:reset, db:types)
- `.env.local` - Environment variables (never commit)
- `.env.example` - Environment variables template
- `supabase/config.toml` - Supabase CLI configuration
- `supabase/migrations/` - Database migration files
- `middleware.ts` - Auth middleware for route protection

### Environment Variables
Required environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side)
- `SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_ID` - Discord OAuth client ID
- `SUPABASE_AUTH_EXTERNAL_DISCORD_SECRET` - Discord OAuth client secret
- `NEXT_PUBLIC_SITE_URL` - Site URL for OAuth callbacks
  - Development: `http://localhost:3000`
  - Production: `https://time.iamkaf.com`

### Authentication & Database
- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client (async)
- `src/types/supabase.ts` - Generated TypeScript types from database schema
- `src/app/auth/` - Authentication pages (login, callback, logout)

### Timer & Session Management
- `src/hooks/useTimer.ts` - Timer logic and state management
- `src/hooks/useSessions.ts` - Session CRUD operations with TanStack Query
- `src/hooks/useSound.ts` - Sound effects management
- `src/components/timer/timer.tsx` - Main timer component
- `src/components/dashboard/dashboard-client.tsx` - Dashboard with stats

### UI & Theme
- `src/providers/theme-provider.tsx` - Dark/light theme context
- `src/providers/query-provider.tsx` - TanStack Query setup
- `src/components/theme/theme-toggle.tsx` - SSR-safe theme switcher
- `src/app/layout.tsx` - Root layout with providers

### Development Files
- `.claude/start.sh` / `.claude/stop.sh` - Server management scripts
- `server.log` - Development server logs
- `TODO.md` - Implementation progress tracking
- `HUMAN.md` - Manual setup tasks checklist

## Common Pitfalls to Avoid

1. **Never assume directories exist** - Always verify with `LS` first
2. **Don't import from dist folders** in workspace packages
3. **Update relative imports** when moving files to different directory levels
4. **Check diagnostics** before committing changes
5. **Verify routing works** after any file structure changes
6. **Using bun run dev & will 100% make you hang on an infinite process, don't use it** - Use the scripts instead
7. **Always await createClient() on server-side** - Required for Next.js 15 cookie API

## Commit Message Guidelines

- **Noise Reduction**: 
  - Don't mention changes to markdown files in your commit messages, that's noise.
