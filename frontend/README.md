# FlowServe AI - Frontend

Multi-business automation PWA built with Next.js, Supabase, and WhatsApp integration.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **State Management:** React Context API
- **PWA:** next-pwa

## Brand Colors

- Primary: `#20C997` (Teal/Green)
- Secondary: `#4A90E2` (Blue)
- Accent: `#50E3C2` (Light Teal)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- Paystack account
- Cloudinary account
- WhatsApp Business API access

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your credentials

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── features/         # Feature-specific components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase clients
│   └── utils/            # Helper functions
└── types/                 # TypeScript type definitions
```

## Environment Variables

See `.env.local.example` for required environment variables.

## Currency

All monetary values are displayed in Nigerian Naira (₦).

## PWA Features

- Offline support
- Install prompt
- Service worker caching
- Mobile-first design

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Proprietary
