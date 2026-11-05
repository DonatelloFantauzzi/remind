# Re:Mind

Re:Mind trasforma appunti, dispense e PDF in una mappa di concetti esplorabile, con un assistente che risponde solo dai tuoi documenti e cita sempre le fonti.

> Progetto in costruzione. Stato attuale: fase 1 completata (setup e deploy a vuoto).

## Cosa farà

- **Upload dei documenti:** PDF, DOCX, TXT e Markdown, con una barra di avanzamento per ogni file.
- **Knowledge Graph:** i concetti estratti dai documenti diventano nodi collegati, da esplorare un concetto alla volta.
- **Assistente con le fonti:** ogni risposta cita i passaggi usati, e ogni citazione apre il documento nel punto esatto.
- **Ricerca semantica:** con Cmd+K trova concetti e passaggi per significato, non solo per parola.
- **Timeline:** il grafo si riavvolge e si riproduce, per rivedere come è cresciuto il sapere.

## Stack

| Parte    | Tecnologie                                        |
| -------- | ------------------------------------------------- |
| Frontend | React, Vite, React Router, Zustand, Tailwind CSS  |
| Backend  | Node.js, Express 5                                |
| Database | PostgreSQL su Neon, con pgvector                  |
| AI       | Ollama in sviluppo, provider cloud in produzione  |
| Deploy   | Vercel (client), Render (server), Neon (database) |

## Struttura

```
remind/
├── client/   frontend React, pubblicato su Vercel
└── server/   API Express e migrazioni, pubblicato su Render
```

In produzione il browser parla solo con Vercel, che inoltra le chiamate `/api` a Render. In locale lo stesso ruolo lo fa il proxy di Vite.

## Avvio in locale

**Prerequisiti:** Node.js 20.6 o successivo e un database PostgreSQL con l'estensione pgvector disponibile (per esempio un progetto gratuito su Neon).

### Server

```bash
cd server
npm install
cp .env.example .env     # poi inserisci la stringa di connessione in DATABASE_URL
npm run migrate          # applica le migrazioni al database
npm run dev              # API su http://localhost:3000
```

### Client

In un secondo terminale:

```bash
cd client
npm install
npm run dev              # app su http://localhost:5173
```

Per controllare che tutta la catena funzioni, apri `http://localhost:5173`: la pagina chiama `/api/health`, che interroga il database e risponde "ok".

## Roadmap

- [x] 0. Design e architettura
- [x] 1. Setup e deploy a vuoto
- [ ] 2. Autenticazione (Google, GitHub, email e password)
- [ ] 3. Upload, estrazione del testo e job
- [ ] 4. Embeddings e ricerca semantica
- [ ] 5. Assistente con le fonti
- [ ] 6. Concetti e grafo
- [ ] 7. Timeline
- [ ] 8. Rifiniture e account demo
