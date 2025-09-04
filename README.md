# Auruauth - South African Orthopedics Prior Authorization

A production-ready SaaS MVP for South African orthopedics prior authorization, built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **AI-Powered Workflow**: Upload consultation files or record audio → Transcribe → Summarize → Generate Prior Auth Draft
- **Medical-Grade UI**: Clean, responsive interface with light/dark mode support
- **Smart Field Detection**: Missing info rail with confidence badges and auto-fill capabilities
- **Document Generation**: Generate DOCX packets for medical aid submission
- **Chat Interface**: Scoped Q&A with citation tracking
- **Admin Panel**: Configure payer rules and organization settings
- **Analytics & Reports**: KPI tracking and CSV export
- **POPIA Compliance**: Audit logging and data retention settings

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Edge Runtime
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Link)
- **UI Components**: Radix UI, Framer Motion
- **File Processing**: React Dropzone, MediaRecorder API
- **Document Generation**: DOCX library

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd auruauth
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Get your project URL and anon key

3. **Configure environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_database_url
   OPENAI_API_KEY=your_openai_key  # Optional, for real transcription
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
auruauth/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/             # Authentication
│   │   ├── dashboard/         # Main dashboard
│   │   ├── requests/          # Request management
│   │   ├── admin/             # Admin panel
│   │   ├── reports/           # Analytics
│   │   └── api/               # API endpoints
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utilities and configurations
│   └── types/                 # TypeScript type definitions
├── rules/                     # Payer rules configuration
├── demo/                      # Demo data and cases
└── public/                    # Static assets
```

## Key Pages & Features

### Authentication
- **`/login`**: Magic link authentication with Supabase
- Minimal branding, medical-grade design

### Dashboard
- **`/dashboard`**: Request overview with filtering and KPI cards
- Quick stats: requests this week, avg turnaround, first-pass clean rate
- Empty state with "New Prior Auth" CTA

### Request Management
- **`/requests/new`**: File upload and audio recording
  - Drag-drop for PDF/audio files (max 50MB)
  - Browser MediaRecorder for audio capture
  - Supported formats: .pdf, .mp3, .m4a, .wav, .webm

- **`/requests/[id]`**: Request detail with 3 tabs
  - **Transcript**: Original consultation transcription
  - **Summary**: SOAP note format
  - **Prior-Auth Draft**: AI-generated draft with missing info rail
  - **Missing Info Rail**: Sticky sidebar with confidence badges
  - **Packet Generation**: DOCX download functionality

### Admin Panel
- **`/admin/rules`**: JSON editor for payer rules configuration
- **`/admin/settings`**: Organization settings, retention policies, logo upload

### Reports
- **`/reports`**: KPI dashboard with CSV export
- Metrics: request volume, turnaround times, time savings

## API Endpoints

### Core Workflow
- `POST /api/transcribe` - File transcription (OpenAI Whisper or mock)
- `POST /api/summarize` - Generate SOAP notes
- `POST /api/prepare-pa` - Create prior auth draft with rules engine
- `POST /api/generate-packet` - Generate DOCX packet
- `POST /api/chat` - Scoped Q&A with citations

### Data Management
- `GET/POST /api/requests` - Request CRUD operations
- `GET /api/requests/[id]/materials` - Request materials
- `POST /api/upload` - File upload handling

### Admin
- `GET/POST /api/admin/rules` - Payer rules management
- `GET/POST /api/admin/settings` - Organization settings

### Reports
- `GET /api/reports` - Analytics data
- `GET /api/reports/export` - CSV export

## Data Model

### Core Tables
- **organizations**: Practice information, retention settings
- **users**: User accounts with role-based access
- **requests**: Prior authorization requests
- **materials**: Transcripts, summaries, drafts, packets
- **audits**: Compliance tracking and audit logs
- **chat_messages**: Q&A history with citations

### Demo Data
- 3 de-identified orthopedic cases
- South African payer rules (Discovery, Bonitas, Momentum)
- Common procedures: TKR, THR, ACL reconstruction, etc.

## Configuration

### Payer Rules
Located in `rules/sa_orthopedics_rules.json`:
- Procedure-specific requirements
- Required attachments
- Approval criteria
- Confidence scoring rules

### Demo Cases
Located in `demo/orthopedics/cases.json`:
- Realistic consultation transcripts
- SOAP note examples
- Various payer scenarios

## Compliance & Security

### POPIA Alignment
- No PHI in application logs
- Automatic prompt redaction
- AES-256 encryption at rest (Supabase)
- TLS encryption in transit
- Configurable data retention

### Audit Trail
- Request view/edit tracking
- Status change logging
- Packet generation/download logs
- IP address tracking
- User action attribution

## Development

### Adding New Payers
1. Update `rules/sa_orthopedics_rules.json`
2. Add procedure requirements and criteria
3. Test with sample requests

### Customizing UI
- Medical-grade color scheme in `globals.css`
- Responsive design with Tailwind
- Dark mode support throughout
- Accessibility considerations

### API Development
- All endpoints return JSON
- 4xx errors for bad input
- No PHI in error logs
- Edge runtime where possible

## Deployment

### Environment Setup
1. Deploy to Vercel, Netlify, or similar
2. Set up Supabase production instance
3. Configure environment variables
4. Run database migrations

### Production Considerations
- Enable Supabase RLS policies
- Set up proper user authentication
- Configure file storage (Supabase Storage)
- Implement proper error monitoring
- Set up backup procedures

## License

This project is for demonstration purposes. Please ensure compliance with local healthcare regulations before production use.

## Support

For questions or issues, please refer to the documentation or create an issue in the repository.
