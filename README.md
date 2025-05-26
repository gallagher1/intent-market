# Intent Marketplace Platform

A dynamic marketplace platform connecting companies with consumer purchase intent through an intelligent, user-centric offer management system.

## Features

- **Consumer Portal**: Create purchase intents for large physical items with budget, timeframe, and feature preferences
- **Company Portal**: View market research data and create strategic offers based on consumer demand
- **Authentication System**: Secure user registration and login for both consumers and companies
- **Database Integration**: PostgreSQL database with Drizzle ORM for data persistence
- **Responsive Design**: Modern React interface with Tailwind CSS styling

## Tech Stack

- Frontend: React with TypeScript, Vite, Tailwind CSS
- Backend: Express.js with TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication: Passport.js with session management
- UI Components: Shadcn/ui components with Radix UI

## Getting Started

1. Install dependencies: `npm install`
2. Set up PostgreSQL database and configure DATABASE_URL
3. Push database schema: `npm run db:push`
4. Start development server: `npm run dev`

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session management

## Deployment

This platform is ready for deployment on Azure with PostgreSQL database support.