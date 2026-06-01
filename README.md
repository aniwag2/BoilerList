# BoilerList

BoilerList is a campus marketplace web app for Purdue students to buy and sell items with one another. Users register with a Purdue email, post listings (with images, categories, pricing, and "Urgent" / "Best Offer" flags), browse and search the marketplace, favorite items, express interest to sellers over email, and report inappropriate listings. It also ships an AI FAQ chatbot that answers questions about how to use the app using a retrieval-augmented (RAG) knowledge base.

## Tech stack

- **Frontend:** React (Create React App)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas) via Mongoose
- **Auth:** JWT
- **Email:** Nodemailer (Gmail) for seller-interest and contact messages
- **Chatbot:** Chroma vector store + LangChain + Google Gemini (`gemini-embedding-001` embeddings, `gemini-2.5-flash` chat)
- **Deployment:** Docker Compose (client + server + chroma), fronted by nginx; hosted via a Cloudflare tunnel

## Repository layout

```
client/                 React SPA (CRA)
  src/pages/            Home, Listings, Login, Register, Profile, UploadItem, EditItem, Contact
  src/api/user.js       Central API helper (uses relative /api base URL)
  nginx.conf            Serves the built SPA and reverse-proxies /api + /test to the server
  client.Dockerfile
server/                 Express API
  app.js                Entry point; mongoose connect + route mounting
  routes/               auth, upload, listings, feedback, report, user, filtering, search, rag, chat, test
  controllers/          Business logic per route group
  models/               Mongoose schemas: User, Item, Report, Chat
  rag-documents.json    The 19 FAQ documents that power the chatbot
  seedRag.js            One-off script to embed the FAQ docs into Chroma
  server.Dockerfile
docker-compose.yml      Orchestrates client (8090), server (8080, internal), chroma (8000, internal)
```

## API overview

All routes are mounted under `/api` (except the health-check `/test`):

| Prefix            | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `/api/auth`       | Register / login (JWT)                          |
| `/api/upload`     | Create listings (with image upload)             |
| `/api/listings`   | Fetch / manage listings                         |
| `/api/search`     | Keyword search                                  |
| `/api/filtering`  | Category / attribute filtering                  |
| `/api/user`       | Profile, change password, delete account        |
| `/api/feedback`   | Contact-us messages                             |
| `/api/report`     | Report a listing                                |
| `/api/chat`       | Chat session history                            |
| `/api/rag`        | Chatbot query (RAG) + document ingestion        |
| `/test`           | Health check                                    |

## Environment variables

Create `server/.env` (gitignored — never commit it):

```
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<random secret>
GOOGLE_API_KEY=<Google Generative AI key>
GMAIL_USER=<gmail address for outgoing mail>
GMAIL_PASS=<gmail app password>
PORT=8080
CHROMA_URL=http://localhost:8000
```

When running under Docker Compose, `PORT` and `CHROMA_URL` are injected by the compose file; the rest come from `server/.env`.

## Local development

Run the backend and frontend separately:

```bash
# Backend (http://localhost:8080)
cd server
npm install
npm start

# Frontend (http://localhost:3000) — proxies /api to :8080
cd client
npm install
npm start
```

A Chroma instance must be reachable at `CHROMA_URL` for the chatbot to work:

```bash
docker run -d -p 8000:8000 chromadb/chroma:latest
```

## Running with Docker Compose

The compose file builds/pulls three services: `client` (nginx, published on host port **8090**), `server` (internal `8080`), and `chroma` (internal `8000`, persisted to `server/chroma-data`). The client's nginx serves the SPA and reverse-proxies `/api` and `/test` to the server, so everything is same-origin behind a single port.

```bash
docker compose up -d
```

Then seed the chatbot's knowledge base (one-time, after the containers are up):

```bash
docker compose run --rm server node seedRag.js
```

The app is served at `http://localhost:8090`. Re-run the seed command only if `server/rag-documents.json` changes.

## Chatbot (RAG) notes

The FAQ chatbot retrieves the most relevant documents from `server/rag-documents.json` (embedded into the Chroma collection `BoilerListOfficialV2`) and feeds them to Gemini to generate an answer. If the chatbot returns generic or incorrect answers, the collection is likely unseeded — run the `seedRag.js` step above. The embeddings model and the chat model must stay consistent between `seedRag.js` and `server/controllers/RAGController.js`.
