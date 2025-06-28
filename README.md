# Tutorial Workflow Manager

A modern web application to streamline your video tutorial creation process. Manage clients, track documentation scraping, and organize AI-generated scripts all in one place.

## Features

- **Client Management**: Keep track of all your SaaS clients
- **Project Organization**: Manage tutorial projects with status tracking
- **Documentation Tracking**: Store and organize documentation URLs for AI crawling
- **Script Generation**: Manage AI-generated tutorial scripts based on documentation
- **Dashboard Overview**: Get insights into your workflow with stats and quick actions

## Getting Started

### Prerequisites

- Node.js 18+ installed on your system
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Deploy with one click - Vercel will automatically detect it's a Next.js app

## Project Structure

- `app/` - Next.js app directory with pages and layout
- `lib/` - Utility functions and data types
- `components/` - Reusable React components (to be added)
- `public/` - Static assets

## Current Status

✅ Basic project setup and configuration  
✅ Main dashboard with client and project overview  
🔄 Client management functionality (next step)  
🔄 Project creation and management  
🔄 Documentation URL management  
🔄 AI script generation integration  

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Local Storage (browser-based)
- **Deployment**: Vercel-ready

## Next Steps

1. Add client management forms
2. Create project management interface
3. Build documentation scraping interface
4. Integrate AI script generation
5. Add export/import functionality
6. Implement search and filtering 