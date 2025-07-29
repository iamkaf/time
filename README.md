# TIME

> A professional time tracking application built with modern web technologies

TIME is a fully-featured time tracking application that combines elegant design with powerful functionality. Built for professionals who need precise time management with seamless user experience across all devices.

![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=flat-square&logo=tailwind-css)

## Features

### ⏱️ Advanced Timer System
- **Precision Timing**: High-accuracy timer with pause/resume functionality
- **Session Persistence**: Automatically saves progress across page refreshes and browser sessions
- **Custom Start Times**: Set specific start times for backdated or scheduled sessions
- **Smart Validation**: Prevents timing conflicts and ensures data integrity

### 📊 Real-Time Dashboard
- **Live Statistics**: Session counts, total time, and productivity metrics update in real-time
- **Visual Analytics**: Clean, intuitive charts and progress indicators
- **Session History**: Complete chronological view of all timing sessions
- **Performance Insights**: Track productivity patterns and trends

### 🏷️ Smart Session Management
- **Intelligent Tagging**: Auto-complete tag suggestions based on historical data
- **Session Editing**: Modify session names, tags, and timestamps post-completion
- **Flexible Organization**: Categorize work with custom tags and descriptive names
- **Search & Filter**: Quickly find sessions by name, tag, or date range

### 🎨 Modern User Experience
- **Dark/Light Theme**: System-aware theme switching with manual override
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Sound Effects**: Configurable audio feedback for timer events
- **Smooth Animations**: Polished transitions and micro-interactions

### 🔐 Secure Authentication
- **Discord OAuth**: Seamless login with Discord integration
- **Session Security**: Secure user sessions with automatic token refresh
- **Data Privacy**: User data is encrypted and securely stored

## Tech Stack

**Frontend Framework**
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - Latest React with concurrent features
- [TypeScript 5](https://www.typescriptlang.org/) - Type-safe development

**Styling & UI**
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful icon library
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management

**Backend & Database**
- [Supabase](https://supabase.com/) - PostgreSQL database with real-time features
- [Supabase Auth](https://supabase.com/auth) - Authentication with OAuth providers
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering) - Server-side rendering support

**State Management & Data Fetching**
- [TanStack Query](https://tanstack.com/query) - Server state management with caching
- React Hooks - Client state management with custom hooks

**Development Tools**
- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- [ESLint](https://eslint.org/) - Code linting and quality checks
- Supabase CLI - Database migrations and type generation

**Audio & Interactions**
- [Howler.js](https://howlerjs.com/) - Web audio library for sound effects
- [React Aria](https://react-spectrum.adobe.com/react-aria/) - Accessible date/time components

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.0 or higher)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Discord application for OAuth (optional, for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd time
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your Supabase project URL and keys in `.env.local`

4. **Set up the database**
   ```bash
   bun run db:setup
   ```
   This will link your Supabase project and run all migrations.

5. **Start the development server**
   ```bash
   ./.claude/start.sh
   ```
   
   Or for development with logs:
   ```bash
   ./.claude/start.sh --follow
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Scripts

| Command | Description |
|---------|-------------|
| `bun run db:setup` | Link Supabase project and run migrations |
| `bun run db:reset` | Reset database to clean state |
| `bun run db:types` | Generate TypeScript types from database schema |
| `./.claude/start.sh` | Start development server with process management |
| `./.claude/stop.sh` | Stop development server and cleanup |
| `bun run build` | Build for production |
| `bun run lint` | Run ESLint checks |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # Dashboard page
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable UI components
│   ├── timer/            # Timer-specific components
│   ├── dashboard/        # Dashboard components
│   ├── sessions/         # Session management UI
│   └── ui/              # Base UI components
├── hooks/                # Custom React hooks
│   ├── useTimer.ts       # Timer state management
│   ├── useSessions.ts    # Session CRUD operations
│   └── useSound.ts       # Audio management
├── lib/                  # Utility libraries
│   └── supabase/        # Database client configuration
├── providers/            # React context providers
└── types/               # TypeScript type definitions
```

## Key Features Deep Dive

### Timer Management
The timer system uses high-precision timing with Web Workers for accuracy, even when the browser tab is not active. Sessions are automatically saved to prevent data loss.

### Session Persistence
All timer data is immediately synchronized with Supabase, ensuring sessions persist across devices and browser sessions. Real-time subscriptions keep the UI synchronized.

### Smart Autocomplete
The tag system learns from your history, suggesting relevant tags as you type. This speeds up workflow and maintains consistency across sessions.

### Theme System
The application respects your system theme preference while allowing manual override. Theme state is persisted across sessions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using modern web technologies
