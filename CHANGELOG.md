# Changelog

All notable changes to the TIME app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-07-30

### Added
- Complete time tracking functionality with start/stop/pause/resume
- Session management with name and tag editing
- Real-time dashboard with productivity statistics (today, week, total)
- Dark mode theme support with system preference detection
- Discord OAuth authentication with Supabase
- Sound effects for timer start/stop feedback
- Responsive design optimized for mobile and desktop
- Multi-page navigation with collapsible sidebar
- Tag autocomplete based on session history
- Session editing modal with full CRUD operations
- Session deletion with confirmation dialog
- Real-time updates using Supabase subscriptions
- Active session persistence across page refreshes
- Manual start time picker for backdated sessions

### Fixed
- Theme switcher now properly cycles through system → light → dark modes
- Tailwind CSS v4 dark mode compatibility with next-themes
- Production build warnings and linting issues
- Mobile responsive navigation and layout issues

### Technical
- Built with Next.js 15 (App Router) and Bun runtime
- Database powered by Supabase (PostgreSQL)
- Styling with Tailwind CSS v4
- State management with TanStack Query
- SSR-safe theming with next-themes
- Audio feedback with Howler.js