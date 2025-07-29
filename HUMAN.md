# TIME App - Living Documentation

This is a living document that tracks the current state and capabilities of the TIME app. All development is complete and the app is fully functional.

## Current Status

**✅ DEVELOPMENT COMPLETE - APP FULLY FUNCTIONAL**

The TIME app is production-ready and includes all planned features. Setup is complete, and the app is ready for daily use.

## What the App Can Do

### Core Timer Features
- **Precision timing** with pause, resume, and stop functionality
- **Session persistence** - timer state survives page refreshes and browser restarts
- **Custom start times** - backdate sessions to any time you choose
- **Accurate time tracking** with millisecond precision

### Session Management
- **Automatic session saving** to database with tags and notes
- **Full session editing** with timestamp validation and conflict detection
- **Smart tag autocomplete** based on your session history
- **Rich session notes** with Markdown-like formatting support

### Real-time Dashboard
- **Live session updates** via Supabase Realtime
- **Session statistics** with time summaries and analytics
- **Session history** with search and filtering capabilities
- **Tag-based organization** for easy session categorization

### User Experience
- **Dark/light theme support** with system preference detection
- **Optional sound effects** for timer actions (start, stop, notifications)
- **Responsive design** that works seamlessly on desktop and mobile
- **Discord authentication** with secure OAuth flow

## Development Scripts

### Server Management
- **Start development server**: `.claude/start.sh` (logs to `server.log`, prevents duplicates)
- **Start with live logs**: `.claude/start.sh --follow`
- **Stop server**: `.claude/stop.sh` (cleans up orphaned processes)
- **View logs**: `tail -f server.log`

### Database Operations
- **Set up database**: `bun run db:setup` (links project and runs migrations)
- **Reset database**: `bun run db:reset` (complete fresh start)
- **Update TypeScript types**: `bun run db:types` (regenerate from schema)

## Troubleshooting

### Common Issues

**Timer not persisting between page refreshes**
- Check browser's localStorage isn't being cleared
- Verify the timer component is properly mounted
- Check browser console for any React hydration errors

**Authentication failing**
- Verify Discord OAuth redirect URLs match exactly (including localhost:3000 for dev)
- Check `.env.local` has correct Supabase credentials
- Ensure Discord application is properly configured with correct Client ID/Secret

**Database connection errors**
- Run `bun run db:setup` to re-link the project
- Verify Supabase project is active and not paused
- Check environment variables are properly set

**Sound effects not playing**
- Verify sound files exist in `/public/sounds/` directory
- Check browser autoplay policies (some browsers block audio without user interaction)
- Confirm sound files are in supported formats (wav, mp3)

**Real-time updates not working**
- Check Supabase Realtime is enabled for your project
- Verify Row Level Security policies allow proper access
- Look for WebSocket connection errors in browser console

### File Structure Issues

**Import errors after file moves**
- Update relative import paths when moving files between directories
- Run TypeScript check: `bun run type-check` (if available)
- Verify all file paths are correctly updated

**Missing dependencies**
- Run `bun install` to ensure all packages are installed
- Check `package.json` for any missing or outdated dependencies

## Production Deployment Reference

When ready to deploy to production, these steps remain available:

### Vercel Deployment
- Create Vercel account and connect GitHub repository
- Add environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
  - `SUPABASE_SERVICE_ROLE_KEY`
- Deploy and test authentication flow

### OAuth Configuration Updates
- Add production redirect URL to Discord Developer Portal: `https://your-domain.vercel.app/auth/callback`
- Update Supabase Authentication settings with production domain
- Test OAuth flow thoroughly in production environment

### Optional Production Enhancements
- **Monitoring**: Enable Supabase metrics and Vercel Analytics
- **Backup strategy**: Configure Supabase point-in-time recovery
- **Custom domain**: Add custom domain in Vercel if desired
- **Error tracking**: Set up Sentry or similar service

## Security Considerations

- All API keys are properly secured in environment variables
- Row Level Security (RLS) is enabled on all database tables
- Discord OAuth provides secure authentication
- Production deployment requires HTTPS for OAuth callbacks

## Resource Limits (Free Tiers)

**Supabase Free Tier**
- 500MB database storage
- 2GB bandwidth per month
- 50,000 monthly active users

**Vercel Free Tier**
- 100GB bandwidth per month
- 100 hours build time per month

The app is designed to work well within these limits for personal and small team use.

## Future Maintenance

This document should be updated when:
- New features are added to the app
- Development scripts are modified
- Production deployment steps change
- New troubleshooting scenarios are discovered
- Resource limits or pricing tiers change

The app is currently feature-complete and production-ready. Any future updates will be enhancements rather than core functionality fixes.