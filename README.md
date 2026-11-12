# Hearth & Grain — cafe website with online ordering

![Hearth & Grain](src/app/opengraph-image.jpg)

**Live demo: [hearth-and-grain-cafe.vercel.app](https://hearth-and-grain-cafe.vercel.app)**

A website for a small cafe and bakery in Warsaw: menu, cart, ordering for delivery, pickup or at the table,
online payment, customer accounts and an admin panel for the cafe staff.

> This is a portfolio project. On the live demo no real order is placed and no payment is taken —
> after “Pay” you see a demo page instead. The full payment flow works in Stripe test mode.

Designed and built by [Iryna Kyrychenko](https://www.instagram.com/ivelensi_school).

## Features

- **Menu** with categories, dish pages and “sold out” dishes
- **Cart** that survives page reloads
- **Checkout** with three order types:
  - delivery — address check against the delivery zone (by postcode), 10 zł fee, 40 zł minimum
  - pickup — 30-minute time slots
  - at the table — table number
- **Time slots** in Warsaw time: opening hours, preparation time, up to 7 days ahead, “as soon as possible”
- **Online payment** with Stripe Checkout (card and BLIK, PLN), confirmed by a signed webhook
- **Sign-in without a password** — a magic link or a one-time code by email
- **Customer account**: profile, saved addresses, favourite dishes, order history and status
- **Admin panel**: change order status, dish prices and availability
- **Forms**: table booking for groups of 5+, contact form, newsletter sign-up
- **Contact page** with a map
- **Responsive** — designed mobile-first
- **SEO basics**: page titles and descriptions, link previews, sitemap, robots.txt

## Tech stack

| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions) + TypeScript |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Database & auth | [Supabase](https://supabase.com) — Postgres with Row Level Security, email sign-in |
| Payments | [Stripe Checkout](https://stripe.com) (test mode) |
| State | [Zustand](https://zustand.docs.pmnd.rs) (cart, favourites) |
| Hosting | [Vercel](https://vercel.com) |

## Security

- Order totals are always calculated on the server from database prices — the browser’s numbers are never trusted.
- An order is marked as paid only after Stripe confirms the payment.
- Row Level Security in the database: customers see only their own data; only the admin can change dishes and order statuses.
- Secret keys live only in environment variables, never in the repository.

## Project structure

```
src/
  app/              pages (menu, cart, checkout, account, admin, contacts…) and server actions
  components/       UI components grouped by page
  config/cafe.ts    cafe settings: address, opening hours, delivery fee, time slots
  lib/              Supabase and Stripe clients, time slots, menu, formatting
supabase/
  migrations/       database tables and access rules (SQL)
  seed.sql          demo menu
```

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your Supabase and Stripe test keys
npm run dev                  # http://localhost:3000
```

Test payment: card `4242 4242 4242 4242`, any future date and CVC; BLIK code `777123`.
