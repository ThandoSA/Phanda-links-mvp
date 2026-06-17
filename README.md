# Phanda Links

Connecting hustle to opportunity.

Phanda Links is a South African marketplace platform that helps skilled workers connect with clients looking for trusted local services.

The platform was created to address a common challenge faced by many workers across South Africa: finding opportunities often depends on referrals and word-of-mouth networks. Phanda Links provides a digital platform where workers can showcase their skills and clients can discover local talent.

---

## Mission

We believe that talent should be visible.

Many hardworking people have the skills, experience, and determination to succeed but lack access to opportunities.

Phanda Links aims to bridge that gap by making it easier for workers to be discovered and hired.

---

## Features

### Worker Features

- Create and manage worker profiles
- Upload profile images
- Showcase skills and experience
- Set availability status
- Receive job requests
- Accept or reject jobs
- Real-time messaging with clients
- Track active jobs

### Client Features

- Browse workers
- View worker profiles
- Hire workers
- Post jobs
- Manage job requests
- Real-time messaging
- Track job progress

### Platform Features

- Authentication
- Role-based dashboards
- Worker profiles
- Job marketplace
- Messaging system
- Image uploads
- Responsive design
- Real-time updates

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage
- Supabase Realtime

### Deployment

- Vercel

---

## Project Structure

```bash
src/
├── app/
│   ├── dashboard/
│   ├── workers/
│   ├── login/
│   ├── signup/
│   └── messages/
│
├── components/
│   ├── layout/
│   ├── ui/
│   └── forms/
│
├── lib/
│   └── supabaseClient.ts
│
├── types/
│   └── index.ts
│
└── public/
````

---

## Database Overview

### profiles

Stores user information.

### worker_profiles

Stores worker-specific details:

* Skills
* Bio
* Availability
* Profile image
* Ratings
* Jobs completed

### jobs

Stores job requests between clients and workers.

### messages

Stores conversations related to jobs.

---

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Local Development

Clone the repository:

```bash
git clone https://github.com/yourusername/phanda-links.git
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## Current Status

🚧 MVP In Development

Current focus areas:

* Platform UX/UI
* Worker onboarding
* Job marketplace
* Messaging experience
* Ratings and reviews
* Mobile optimization

---

## Roadmap

### Phase 1

* Authentication
* Worker profiles
* Job requests
* Messaging

### Phase 2

* Ratings and reviews
* Worker verification
* Advanced search
* Notifications

### Phase 3

* Payments
* Escrow system
* Mobile application
* AI-powered recommendations

---

## Vision

Our vision is to become South Africa's most trusted platform for connecting skilled workers with opportunities.

We want to create a future where talent is discovered based on ability rather than access to networks.

---

## Techinal Founder

**Thando**

Co-Founder/CTO of Phanda Links

Building technology that connects communities, creates opportunities, and empowers local talent.

---

## License

This project is currently proprietary and under active development.

All rights reserved.

````

---

A startup-specific improvement would be to also create these files in your repository:

```text
README.md
LICENSE
CONTRIBUTING.md
SECURITY.md
CHANGELOG.md
````
