```markdown
# ShareShelf

A peer-to-peer lending marketplace for VIT students — borrow and lend items like calculators, lab coats, and textbooks within campus. Built as a final-year project to explore full-stack authentication, a real state-machine-driven workflow, and in-app negotiation via chat.

**Status:** Ongoing — core features complete, AWS deployment in progress.

## What it does

- Students list items they own with a suggested price and max loan duration
- Other students browse, search, and send borrow requests
- Owners approve or reject requests
- Both sides confirm handover (and later, return) before a loan is marked active — a two-sided attestation model, since the app doesn't process real payments
- Borrower and owner can chat directly on each request to negotiate price and coordinate pickup

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS v4, React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose) — MongoDB Atlas
- **Auth:** JWT (JSON Web Tokens), bcrypt password hashing
- **Deployment (in progress):** AWS

## Core features

- **Authentication:** signup/login with JWT, protected routes via middleware, passwords hashed with bcrypt
- **Items:** create, browse, search (case-insensitive partial match), view detail
- **Loan lifecycle:** a five-state state machine — `requested → approved → pending_pickup → active → returned` (or `rejected`) — enforced on the backend, not just the UI
- **Two-sided confirmation:** both borrower and owner must independently confirm handover and return before the loan state advances
- **Chat:** messaging scoped to each loan request, restricted to the two people involved, with polling-based updates
- **Business rules enforced server-side:** can't request your own item, no duplicate active requests per item/borrower pair, approving one request auto-rejects other pending requests on the same item

## Project structure

```
ShareShelf/
  server/
    models/       # User, Item, LoanRequest, Message (Mongoose schemas)
    routes/        # auth, items, requests, messages
    middleware/     # JWT auth middleware
    index.js
  client/
    src/
      pages/       # Home, Login, Signup, ItemDetail, CreateItem, MyRequests, IncomingRequests, Chat
      components/   # Navbar
      context/      # AuthContext (JWT + user state, persisted to localStorage)
      api/         # shared axios instance
```

## Running locally

**Backend:**
```
cd server
npm install
npm run dev
```
Requires a `.env` file with `MONGO_URI`, `JWT_SECRET`, and `PORT`.

**Frontend:**
```
cd client
npm install
npm run dev
```
Requires a `.env` file with `VITE_API_URL` pointing to the backend.

## Known limitations (v1)

- No real payment integration — cost is agreed between users and settled outside the app; the two-sided confirmation buttons are an attestation, not payment verification
- Chat updates via polling (every 3s), not WebSockets — acceptable for current scale, a reasonable v2 improvement
- No image upload yet — items currently list without photos
- No cross-app notifications — users only see new activity when they visit the relevant page
```

