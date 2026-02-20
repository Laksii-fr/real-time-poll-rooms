# CrowdSnap - Real-Time Poll Rooms

A full-stack web application designed for creating, sharing, and voting on polls with real-time result updates. Built with a focus on seamless user experience, fairness, and instant data synchronization.

## 🚀 Public Deployment
**[[CrowdSnap](https://real-time-poll-rooms-eight.vercel.app/)]**

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: FastAPI (Python), WebSockets, SQLAlchemy (Async)
- **Database**: PostgreSQL
- **Real-time**: WebSocket connections for instant vote broadcasting

## ✨ Key Features
1.  **Poll Creation**: Users can create polls with a question and multiple options. AI-assisted creation: describe a topic in text to get a suggested question and options to edit before creating. **AI-assisted creation**: describe a topic in plain text and get a suggested question and options to edit before creating the poll.
2.  **Instant Sharing**: Generates a unique, shareable link immediately after creation.
3.  **Real-Time Ops**: utilizing WebSockets to push vote updates to all connected clients instantly without page refreshes.
4.  **Smart Fairness**: Anti-abuse systems to prevent duplicate voting (see below).
5.  **Persistence**: Data is persisted in PostgreSQL, ensuring polls and votes survive server restarts.

## 🛡️ Fairness & Anti-Abuse Mechanisms
To ensure the integrity of poll results, CrowdSnap implements a dual-layer protection system:

### 1. Cookie-Based Identification (`voter_token`)
- **Mechanism**: When a user visits a poll, the server checks for a signed `voter_token` cookie. If none exists, a unique UUID is generated and set as a secure, HTTP-only cookie.
- **Prevention**: This prevents the most common form of abuse: simple page refreshes or opening the link in a new tab to vote again.
- **Limitation**: Savvy users can clear their cookies or use incognito mode to bypass this.

### 2. IP Address Rate Limiting & Tracking
- **Mechanism**: The backend records the IP address of every voter. The database enforces a strict `UniqueConstraint` on the compound key `(poll_id, ip_address)`.
- **Prevention**: This prevents users from bypassing the cookie check by using incognito mode or different browsers on the same device.
- **Limitation**: Users behind a carrier-grade NAT (e.g., public Wi-Fi, corporate networks) might be blocked if someone else on the same network has already voted.

## 🧪 Edge Cases Handled
- **Concurrent Voting**: Database transactions ensure that vote counts remain accurate even when multiple users vote simultaneously.
- **Invalid Polls/Options**: Strict validation ensures votes can only be cast for existing options on existing polls.
- **Network Disconnection**: The WebSocket connection automatically attempts to reconnect, and the UI handles connection states gracefully.
- **Duplicate Voting**: Users attempting to vote twice receive a user-friendly "You have already voted" message without disrupting the viewing experience.

## 🏃‍♂️ Running Locally

### Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Set up your `.env` file with `DATABASE_URL`. For **AI poll generation**, add `OPENAI_API_KEY=your-key` (optional; without it, the create-poll page still works with manual entry only).
4.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```
    *Server runs at `http://localhost:8000`*

### Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    *Client runs at `http://localhost:3000`*

## 🔮 Future Improvements
- **Fingerprinting**: Implementing browser fingerprinting for a third layer of fairness.
- **Expiry**: Adding poll expiration dates.
- **Results View**: A dedicated view for poll creators to see detailed analytics.