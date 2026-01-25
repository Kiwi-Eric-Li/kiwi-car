# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KiwiCar is New Zealand's AI-powered used car trading platform. The project consists of three main components:

- **landing-page/**: Next.js 16 marketing site (currently implemented)
- **kiwicar-frontend/**: React SPA for the main application (planned, not yet implemented)
- **kiwicar-backend/**: Node.js/Express API server (planned, not yet implemented)

## Development Commands

### Landing Page (landing-page/)

```bash
cd landing-page
npm install       # Install dependencies
npm run dev       # Start dev server with Turbopack
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Architecture

### Landing Page Structure

The landing page is a Next.js 16 application using React 19 with the App Router:

- **app/layout.js**: Root layout with Poppins font, ThemeContext provider, and Lenis smooth scroll
- **app/(publicPages)/**: Route group for public-facing pages
- **components/**: Reusable UI components (Navbar, Footer, SectionTitle, ThemeToggle)
- **context/ThemeContext.jsx**: Dark/light theme state management
- **data/**: Static content configuration files (navLinks, featuresData, pricingData, faqsData)
- **sections/**: Page section components (FaqSection, Pricing)

### Key Technologies (Landing Page)

- Next.js 16 with Turbopack
- Tailwind CSS 4 (via @tailwindcss/postcss)
- Lenis for smooth scrolling
- Lucide React for icons
- react-fast-marquee for logo carousel

### Content Configuration

To modify landing page content, edit these data files:
- `data/navLinks.js` - Navigation menu
- `data/featuresData.js` - Feature cards
- `data/pricingData.js` - Pricing tiers
- `data/faqsData.js` - FAQ questions and answers
- `data/companiesLogo.js` - Partner logo marquee

## PRD Documentation

Detailed specifications are in `docs/prd/`:
- **landing-page.md**: Copy modifications and content guide for KiwiCar branding
- **frontend.md**: Full React SPA specification (Vite, TypeScript, TanStack Query, Zustand)
- **backend.md**: Node.js/Express API specification (Prisma, MySQL, Redis, JWT auth)

## Planned Architecture (From PRDs)

### Frontend (kiwicar-frontend/)
- React 18+ with TypeScript and Vite
- TanStack Query for server state, Zustand for client state
- React Hook Form + Zod for validation
- Routes: /buy, /sell, /lookup, /login, /register, /account/*

### Backend (kiwicar-backend/)
- Express.js with TypeScript
- Prisma ORM with MySQL
- Redis for caching and rate limiting
- JWT authentication with refresh tokens
- NZTA API integration for vehicle data
- OpenAI GPT-4 for AI features (descriptions, pricing)
- SendGrid for emails, S3/R2 for image storage
