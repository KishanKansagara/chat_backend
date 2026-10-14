# Chat Backend

A practical-round chat backend built with Node.js, TypeScript (strict mode), Express, MySQL, Sequelize and Firebase Firestore. The code uses MVC plus a service layer to keep controllers thin and business logic testable.

## Features

- Create or retrieve a direct 1:1 chat
- Store users, chats and chat memberships in MySQL
- Store messages in Firestore with server timestamps
- Query messages in chronological order with a bounded limit
- Store per-user read receipts in a message subcollection
- Store each user's last-seen message separately
- List a user's chats and member details
- Input validation and centralized error responses

## Requirements

- Node.js 20+
- MySQL 8+
- A Firebase project with Firestore enabled
- Firebase Admin SDK credentials with access to Firestore

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a MySQL database:

   ```sql
   CREATE DATABASE chat_backend;
   ```

3. Copy `.env.example` to `.env` and fill in your MySQL and Firebase settings.
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of your Firebase service-account JSON file. Keep that file outside version control. Alternatively, use Application Default Credentials in your environment.
5. Start the development server:

   ```bash
   npm run dev
   ```

   The server authenticates to MySQL and runs `sequelize.sync()` to create tables. This is convenient for a practical demo; use Sequelize migrations for production deployments.

6. Create two users in MySQL before testing chat endpoints. Example:

   ```sql
   INSERT INTO users (name, email, created_at, updated_at)
   VALUES
     ('Aarav', 'aarav@example.com', NOW(), NOW()),
     ('Mira', 'mira@example.com', NOW(), NOW());
   ```

7. Verify the API: `GET http://localhost:3000/health`.

## API endpoints

All endpoints are prefixed with `/api`.

### 1. Create or get chat

`POST /api/chat/create`

```json
{ "userAId": 1, "userBId": 2 }
```

Returns `201` for a newly created chat or `200` for an existing chat. A normalized pair key and unique database constraint help prevent duplicate direct chats.

### 2. Send message

`POST /api/chat/:chatId/message/send`

```json
{ "senderId": 1, "text": "Hello!" }
```

### 3. Get messages

`GET /api/chat/:chatId/messages?userId=1&limit=50`

The assignment specifies `limit`; `userId` is also required here to verify that the caller belongs to the chat. The limit is capped at 100. Results are ordered oldest to newest. Cursor pagination can be added for larger histories.

### 4. Mark message read

`POST /api/chat/:chatId/message/:messageId/read`

```json
{ "userId": 2 }
```

Creates/updates `chats/{chatId}/messages/{messageId}/readReceipts/{userId}`.

### 5. Update last seen

`POST /api/chat/:chatId/lastseen`

```json
{ "userId": 2, "messageId": "FIRESTORE_MESSAGE_ID" }
```

Updates `chats/{chatId}/lastSeen/{userId}` and rejects a backward movement when both message timestamps are available.

### 6. List user chats

`GET /api/user/:userId/chats`

Returns the user's chats, member IDs and member details from MySQL.

## Firestore layout

```text
chats/{chatId}/messages/{messageId}
  id, chatId, senderId, text, timestamp, createdAt

chats/{chatId}/messages/{messageId}/readReceipts/{userId}
  userId, readAt

chats/{chatId}/lastSeen/{userId}
  userId, messageId, updatedAt
```

## Architecture

- `models/`: Sequelize models and associations
- `controllers/`: HTTP request/response handling
- `services/`: application logic and Firestore operations
- `routes/`: endpoint definitions
- `middlewares/`: async error forwarding and centralized errors
- `config/`: MySQL and Firebase setup

## Security notes / production improvements

- This assignment implementation accepts IDs in request bodies/paths. In production, add JWT authentication and derive the acting user ID from the authenticated request rather than trusting caller-supplied IDs.
- Add authorization rules and rate limiting at the API layer. Do not expose Firebase Admin credentials.
- Prefer Sequelize migrations to `sequelize.sync()` in production.
- Add cursor pagination for message history and automated tests for API edge cases.
- Firestore server timestamps can be unresolved in the immediate send response; the response uses an approximate ISO timestamp for convenience. Fetching the saved document returns the authoritative server timestamp.
