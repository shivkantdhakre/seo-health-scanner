# SEO Health Scanner

A comprehensive SEO analysis tool built with Next.js that provides detailed website audits, performance metrics, and AI-powered recommendations.

## Features

- **Complete SEO Analysis**: Analyze title tags, meta descriptions, H1 headings, and more
- **Performance Metrics**: Get Lighthouse performance and SEO scores
- **AI-Powered Recommendations**: Receive intelligent suggestions for improvement
- **Modern UI**: Beautiful, responsive design with dark mode support
- **Real-time Analysis**: Fast scanning powered by Google PageSpeed Insights

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd seo-health-scanner
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Get your API keys:
   - **Google PageSpeed Insights API**: Get from [Google Cloud Console](https://developers.google.com/speed/docs/insights/v5/get-started)
   - **Google Gemini API**: Get from [AI Studio](https://aistudio.google.com/app/apikey)

5. Add your API keys to `.env.local`:
```env
PAGESPEED_API_KEY=your_pagespeed_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

6. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. Enter a website URL (including http:// or https://)
2. Click "Analyze Website" 
3. Wait for the analysis to complete (usually 10-30 seconds)
4. Review the SEO metrics, performance scores, and AI recommendations

## API Endpoints

### POST /api/scan

Analyzes a website and returns SEO data.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "title": "Page Title",
  "meta": "Meta description",
  "h1": "Main heading",
  "performance": 85,
  "seo_score": 92,
  "ai_suggestions": "AI-generated recommendations..."
}
```

## Project Structure

```
├── app/
│   ├── api/scan/          # API route for website scanning
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── seo/              # SEO-specific components
│   └── ui/               # Reusable UI components
├── lib/
│   └── scan.ts           # Core scanning logic
├── types/
│   └── index.ts          # TypeScript type definitions
└── public/               # Static assets
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Google PageSpeed Insights API** - Website analysis
- **Google Gemini API** - AI recommendations
- **Lucide React** - Icons

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.