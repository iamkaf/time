# Changelog

All notable changes to the TIME app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - Major Session Management & Analytics Update

### Added
- Complete user preferences system in Settings page with time format (12h/24h), start of week (Sunday/Monday), and default tags
- Comprehensive session analytics with 5 interactive charts: time distribution, tag breakdown, productivity trends, peak hours, and duration patterns
- Advanced session management with search by name and tags, sorting by date/duration/name, and pagination
- Bulk selection and deletion of multiple sessions with keyboard shortcuts (Shift+click, Ctrl/Cmd+click)
- Professional data export in CSV, JSON, and PDF formats with field selection and date range filtering
- Export history tracking that logs all your data exports with full audit trail
- Smart URL state management that preserves your filters, sort preferences, and date ranges across page refreshes
- Real-time export preview showing exactly what data will be downloaded before export
- Quick date range presets for common time periods (7 days, 30 days, 90 days, 1 year)
- Tag-based filtering with expandable interface and search within tags
- Session selection with visual feedback and bulk action confirmation dialogs
- Cross-platform scrollbar consistency to prevent layout shifts on different operating systems

### Changed
- Session timestamps now respect your preferred time format (12h/24h) throughout the entire application
- Analytics calculations now use your chosen start of week preference for accurate weekly data
- Timer reset button now applies your default tags automatically for faster session setup
- Export functionality now formats all timestamps according to your time format preference
- Search functionality now includes debouncing for better performance and smoother typing experience
- Sessions page pagination increased from 10 to 20 items per page for more efficient browsing
- Enhanced session list with improved visual hierarchy and consistent spacing

### Removed
- "Coming soon" placeholders in Settings page replaced with fully functional controls

### Fixed
- URL parameter conflicts when switching between Sessions, Analytics, and Export tabs
- Sort button toggle state synchronization with URL parameters
- Windows scrollbar layout shifts that caused content to jump when scrollbars appeared
- Session name field behavior that incorrectly refilled after intentional clearing
- URL state serialization issues that caused some parameters to be lost
- Tag filtering interface consistency and interaction improvements

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