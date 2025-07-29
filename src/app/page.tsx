import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TIME',
    url: 'https://time.iamkaf.com',
    description: 'Free and open source time tracking app for productive people. Track work sessions, organize with tags, pause and resume timers, and view detailed productivity insights.',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Kaf',
      url: 'https://github.com/iamkaf',
      sameAs: [
        'https://twitter.com/iamkaffe',
        'https://github.com/iamkaf'
      ]
    },
    features: [
      'Session timing with pause/resume',
      'Smart tag organization',
      'Real-time productivity insights',
      'Session persistence across page refreshes',
      'Dark and light theme support',
      'Custom start time selection',
      'Session editing and management'
    ],
    screenshot: 'https://time.iamkaf.com/screenshots/dashboard.png',
    softwareVersion: '1.0',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-200/20 dark:bg-indigo-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-200/20 dark:bg-blue-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-16 h-16 bg-purple-200/20 dark:bg-purple-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 right-20 w-8 h-8 bg-indigo-300/30 dark:bg-indigo-500/20 rotate-45 animate-float"></div>
        <div className="absolute bottom-32 left-16 w-6 h-6 bg-blue-300/30 dark:bg-blue-500/20 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-purple-300/30 dark:bg-purple-500/20 animate-float-reverse"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 text-center relative z-10">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            TIME - Free Time Tracking App
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-2">
            Simple, focused time tracking for productive people
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Free & Open Source Software • No registration fees • Privacy-focused
          </p>
        </div>
        
        {/* Dashboard Preview */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <Image 
              src="/screenshots/dashboard.png" 
              alt="TIME Dashboard showing timer interface, session stats, and productivity metrics"
              width={1200}
              height={800}
              className="w-full h-auto"
              priority={true}
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 relative overflow-hidden group"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <a
            href="https://github.com/iamkaf/time"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-label="GitHub">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
        
        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8">
          <article className="text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>Clock icon</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Precision Timer with Pause/Resume
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Advanced timer with pause/resume functionality. Sessions persist across page refreshes automatically.
            </p>
          </article>
          
          <article className="text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>Tag icon</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Smart Tag Autocomplete
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Intelligent tag suggestions from your history. Organize sessions effortlessly with keyboard shortcuts.
            </p>
          </article>
          
          <article className="text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>Chart icon</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Real-time Productivity Insights
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Live dashboard with today, weekly, and total statistics. Track productivity trends in real-time.
            </p>
          </article>
        </section>
      </div>
      </div>
    </>
  )
}
