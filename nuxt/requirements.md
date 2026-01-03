# Personal Finance Dashboard with Plaid API, NUXT, Convex, Shadcn-vue, BetterAuth

This is going to be my personal Finance Dashboard Using Plaid API. We already have sandbox keys for Plaid API they are in the .env file.
The products are
Balance, Investments, Liabilities, Transaction and Transaction Refresh.

The app already has a starter template. It lives in the nuxt directory and you can see how it works reading CLAUDE.md in the root.

# Goal

The Goal of this project is to make a Personal Finance Dashboard I can connect my bank accounts using Plaid API.

When I log into the site, all transactions from my accounts are automatically synced, giving me an at-a-glance view of my finances. I can instantly see how much money I have available, my outstanding credit card balances, and when payments are due. Most importantly, I can see exactly how much money I'll have remaining after accounting for all credit card payments due this month.
I left a little mockup in CleanShot 2026-01-03 at 23.05.47@2x.png where you can see how I want it.

## Main requirements

- Sync on mounted
- Save all transaction in DB and cache them to save api request
- Have a sync button on demand to sync transaction. When you sync from the Plaid it give you a token we can see if that transaction has changed or not.
- In the card where we are going to see the transaction use shadcn vue table with filtering, order, search, show all information. Ability to hide and show rows.

## Tech

- Convex for Database
- Better Auth for Auth

- Everything is type safe.
- Every piece of code is clean.
- Dry code
- Do not use too much clean code principals. Making everything a function is hard to debug and fallow.
