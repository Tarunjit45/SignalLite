# SignalLite - Real Backend Setup

To make this app work with **Real Users**, you must run a Node.js backend.

## 1. Quick Start (Mock Mode)
By default, `config.ts` has `USE_MOCK_SERVICE = true`. This runs entirely in the browser for demonstration.

## 2. Real Mode Setup

### Step A: Configure Frontend
1. Open `config.ts`.
2. Set `export const USE_MOCK_SERVICE = false;`.

### Step B: Create Backend Server
Create a new folder `server/` on your computer and add this `index.js` file:

```javascript
/**
 * SignalLite Backend (Minimal)
 * Run with: node index.js
 * Install deps: npm install fastify @fastify/websocket @fastify/cors pg
 */
const fastify = require('fastify')({ logger: true });
const { Client } = require('pg');

// 1. Database Setup
const db = new Client({ connectionString: 'postgres://user:pass@localhost:5432/signallite' });
// db.connect(); // Uncomment when you have Postgres running

// 2. Plugins
fastify.register(require('@fastify/cors'));
fastify.register(require('@fastify/websocket'));

// 3. In-Memory Store (Replace with DB for production)
const users = new Map(); // phone -> { id, phone }
const tokens = new Map(); // token -> user
const sockets = new Map(); // userId -> socket

// 4. Routes
fastify.post('/auth/request-otp', async (req, reply) => {
  const { phoneNumber } = req.body;
  // TODO: Call Twilio API here
  console.log(`OTP for ${phoneNumber}: 123456`);
  return { success: true };
});

fastify.post('/auth/verify-otp', async (req, reply) => {
  const { phoneNumber, code } = req.body;
  
  if (code !== '123456') { // Hardcoded for demo, replace with Redis check
    return reply.code(401).send({ error: 'Invalid Code' });
  }

  const userId = 'user-' + Math.random().toString(36).substr(2, 9);
  const token = 'jwt-' + Math.random().toString(36).substr(2, 9);
  
  const user = { id: userId, phoneNumber, isOnline: true };
  users.set(phoneNumber, user);
  tokens.set(token, user);
  
  return { token, user };
});

fastify.get('/chats', async (req, reply) => {
  // Return dummy chats for now
  return []; 
});

// 5. WebSocket (Real-time)
fastify.register(async function (f) {
  f.get('/', { websocket: true }, (connection, req) => {
    const token = req.query.token;
    const user = tokens.get(token);
    
    if (!user) {
      connection.socket.close();
      return;
    }

    sockets.set(user.id, connection.socket);
    console.log(`User ${user.id} connected`);

    connection.socket.on('message', message => {
      // Handle incoming encrypted messages
      // Forward to recipient
    });
    
    connection.socket.on('close', () => {
        sockets.delete(user.id);
    });
  });
});

// 6. Start
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
```

### Step C: Database Schema
Run these SQL commands in your PostgreSQL database:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL
);
-- Add other tables from the Engineering Plan in the app
```
