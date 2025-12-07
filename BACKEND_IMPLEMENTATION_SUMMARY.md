# Backend Implementation Summary - Admin Dashboard News & Events Management

## Overview

This document outlines the complete backend API implementation for creating, editing, and deleting News articles and Events within the Athletix Admin Dashboard.

---

## News Management API

### Base URL

`http://localhost:5000/api/news`

### Endpoints

#### 1. **Create News Article** ✓

- **Route:** `POST /api/news/publish`
- **Description:** Publish a new news article
- **Request Body:**
  ```json
  {
    "user_id": "string",
    "title": "string",
    "category": "string",
    "event_date": "string (ISO) or null",
    "location": "string or null",
    "content": "string"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Article published successfully",
    "news_id": "string"
  }
  ```
- **Frontend Component:** `NewsCreationModal.tsx`
- **Database Table:** `newsPublished`

---

#### 2. **Fetch All News Articles** ✓

- **Route:** `GET /api/news`
- **Description:** Retrieve all published news articles ordered by most recent first
- **Response (200):**
  ```json
  {
    "success": true,
    "articles": [
      {
        "news_id": "string",
        "user_id": "string",
        "author_name": "string",
        "title": "string",
        "content": "string",
        "category": "string",
        "publish_date": "timestamp",
        "event_date": "timestamp or null",
        "location": "string or null"
      }
    ]
  }
  ```

---

#### 3. **Fetch News Article by ID** ✓

- **Route:** `GET /api/news/:newsId`
- **Description:** Retrieve a specific news article by its ID
- **Parameters:**
  - `newsId` (path parameter)
- **Response (200):**
  ```json
  {
    "success": true,
    "article": {
      "news_id": "string",
      "title": "string",
      "content": "string",
      "category": "string",
      "author_name": "string",
      "publish_date": "timestamp",
      "event_date": "timestamp or null",
      "location": "string or null"
    }
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Article not found"
  }
  ```
- **Frontend Component:** `NewsEditModal.tsx`

---

#### 4. **Update News Article** ✓

- **Route:** `PUT /api/news/:newsId`
- **Description:** Update an existing news article
- **Parameters:**
  - `newsId` (path parameter)
- **Request Body:**
  ```json
  {
    "title": "string",
    "category": "string",
    "event_date": "string (ISO) or null",
    "location": "string or null",
    "content": "string"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Article updated successfully",
    "article": {
      "news_id": "string",
      "title": "string",
      "content": "string",
      "category": "string",
      "author_name": "string",
      "publish_date": "timestamp",
      "event_date": "timestamp or null",
      "location": "string or null"
    }
  }
  ```
- **Frontend Component:** `NewsEditModal.tsx`

---

#### 5. **Delete News Article** ✓ (NEW)

- **Route:** `DELETE /api/news/:newsId`
- **Description:** Delete a published news article
- **Parameters:**
  - `newsId` (path parameter)
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "News article deleted successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Article not found"
  }
  ```
- **Frontend Component:** `AdminDashboard.tsx` (handleDeleteNews)

---

#### 6. **Save News Draft** ✓

- **Route:** `POST /api/news-drafts/drafts/save`
- **Description:** Create or update a news draft
- **Request Body:**
  ```json
  {
    "draft_id": "string or null",
    "user_id": "string",
    "title": "string",
    "event_date": "string or null",
    "location": "string or null",
    "content": "string",
    "category": "string"
  }
  ```
- **Response (200/201):**
  ```json
  {
    "success": true,
    "message": "Draft saved successfully",
    "draft_id": "string"
  }
  ```

---

#### 7. **Delete News Draft** ✓

- **Route:** `DELETE /api/news-drafts/drafts/:draftId`
- **Description:** Delete a news draft
- **Parameters:**
  - `draftId` (path parameter)
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Draft deleted successfully"
  }
  ```

---

#### 8. **Fetch News Drafts** ✓

- **Route:** `GET /api/news-drafts/drafts/:userId`
- **Description:** Retrieve all drafts for a specific user
- **Parameters:**
  - `userId` (path parameter)
- **Response (200):**
  ```json
  {
    "success": true,
    "drafts": [
      {
        "draft_id": "string",
        "user_id": "string",
        "title": "string",
        "content": "string",
        "category": "string",
        "event_date": "timestamp or null",
        "location": "string or null",
        "last_modified": "timestamp"
      }
    ]
  }
  ```

---

## Events Management API

### Base URL

`http://localhost:5000/api/events` and `http://localhost:5000/create-events`

### Endpoints

#### 1. **Create Event** ✓

- **Route:** `POST /create-events`
- **Description:** Create a new event
- **Request Body:**
  ```json
  {
    "organizer_id": "string",
    "title": "string",
    "type": "string (lowercase)",
    "sport_name": "string",
    "start_datetime": "string (ISO format)",
    "end_datetime": "string (ISO format)",
    "location": "string",
    "entry_fee": "number or null",
    "description": "string"
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "Event created successfully.",
    "event": {
      "event_id": "number",
      "organizer_id": "string",
      "title": "string",
      "type": "string",
      "sport_name": "string",
      "start_datetime": "timestamp",
      "end_datetime": "timestamp",
      "location": "string",
      "entry_fee": "number or null",
      "description": "string"
    }
  }
  ```
- **Frontend Component:** `EventCreationForm.tsx`
- **Database Table:** `events`

---

#### 2. **Fetch All Events** ✓

- **Route:** `GET /create-events`
- **Description:** Retrieve all events ordered by start date
- **Response (200):**
  ```json
  {
    "message": "Events fetched successfully.",
    "events": [
      {
        "event_id": "number",
        "organizer_id": "string",
        "title": "string",
        "type": "string",
        "sport_name": "string",
        "start_datetime": "timestamp",
        "end_datetime": "timestamp",
        "location": "string",
        "entry_fee": "number or null",
        "description": "string"
      }
    ]
  }
  ```

---

#### 3. **Fetch Event Details** ✓

- **Route:** `GET /api/events/:id`
- **Description:** Retrieve complete event details including organizer info, categories, and sponsors
- **Parameters:**
  - `id` (path parameter - event_id)
- **Response (200):**
  ```json
  {
    "event_id": "number",
    "organizer_id": "string",
    "title": "string",
    "type": "string",
    "sport_name": "string",
    "start_datetime": "timestamp",
    "end_datetime": "timestamp",
    "location": "string",
    "entry_fee": "number or null",
    "description": "string",
    "date": "Date object",
    "endDate": "Date object",
    "organizer_name": "string",
    "organizer_email": "string",
    "organizer_phone": "string",
    "categories": ["string"],
    "sponsors": ["string"],
    "participantCount": "number"
  }
  ```
- **Frontend Component:** `AdminDashboard.tsx`, `EventDetails.tsx`

---

#### 4. **Update Event (Simple)** ✓

- **Route:** `PUT /api/edit-event/:id/simple`
- **Description:** Update basic event fields only
- **Parameters:**
  - `id` (path parameter - event_id)
- **Request Body:**
  ```json
  {
    "title": "string (optional)",
    "type": "string (optional)",
    "sport": "string (optional)",
    "start_datetime": "string ISO (optional)",
    "end_datetime": "string ISO (optional)",
    "participants": "number (optional)",
    "status": "string (optional)",
    "description": "string (optional)"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Event updated successfully.",
    "event": { "event_id": "...", "..." }
  }
  ```

---

#### 5. **Update Event (Complex)** ✓

- **Route:** `PUT /api/edit-event/:id`
- **Description:** Update event with categories and sponsors
- **Parameters:**
  - `id` (path parameter - event_id)
- **Request Body:**
  ```json
  {
    "title": "string (optional)",
    "type": "string (optional)",
    "sport_name": "string (optional)",
    "start_datetime": "string ISO (optional)",
    "end_datetime": "string ISO (optional)",
    "location": "string (optional)",
    "description": "string (optional)",
    "category_ids": ["string"],
    "new_categories": ["string"],
    "sponsor_ids": ["string"],
    "new_sponsors": ["string"]
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Event updated successfully.",
    "event": {
      "event_id": "...",
      "categories": ["string"],
      "sponsors": ["string"]
    }
  }
  ```
- **Frontend Component:** `EventEditModal.tsx`

---

#### 6. **Fetch Event Details with Relations** ✓

- **Route:** `GET /api/edit-event/:id/details`
- **Description:** Retrieve complete event details for editing (with categories and sponsors)
- **Parameters:**
  - `id` (path parameter - event_id)
- **Response (200):**
  ```json
  {
    "event_id": "number",
    "title": "string",
    "type": "string",
    "sport_name": "string",
    "start_datetime": "timestamp",
    "end_datetime": "timestamp",
    "location": "string",
    "description": "string",
    "categories": [{ "category_id": "string", "name": "string" }],
    "sponsors": [{ "sponsor_id": "string", "name": "string" }]
  }
  ```
- **Frontend Component:** `EventEditModal.tsx`

---

#### 7. **Delete Event (Organizer)** ✓

- **Route:** `DELETE /api/events/:id`
- **Description:** Delete an event (requires organizer verification)
- **Parameters:**
  - `id` (path parameter - event_id)
- **Request Body:**
  ```json
  {
    "organizerId": "string"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Event deleted successfully"
  }
  ```
- **Error Response (403):**
  ```json
  {
    "error": "Unauthorized"
  }
  ```

---

#### 8. **Delete Event (Admin)** ✓ (NEW)

- **Route:** `DELETE /api/events/delete/:id`
- **Description:** Delete an event (admin version without organizer check)
- **Parameters:**
  - `id` (path parameter - event_id)
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Event deleted successfully"
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "message": "Event not found"
  }
  ```
- **Frontend Component:** `AdminDashboard.tsx` (handleDeleteEvent)

---

#### 9. **Fetch Categories** ✓

- **Route:** `GET /api/edit-event/categories`
- **Description:** Retrieve all available event categories
- **Response (200):**
  ```json
  [
    { "category_id": "string", "name": "string" },
    ...
  ]
  ```

---

#### 10. **Fetch Sponsors** ✓

- **Route:** `GET /api/edit-event/sponsors`
- **Description:** Retrieve all available sponsors
- **Response (200):**
  ```json
  [
    { "sponsor_id": "string", "name": "string" },
    ...
  ]
  ```

---

## Backend Route Registration

All routes are properly registered in `server/server.js`:

```javascript
app.use("/api/events", eventsRouter); // eventDetails.js
app.use("/api/edit-event", editEvent); // editEvent.js
app.use("/api/news-drafts", newsRoutes); // newsRoutes.js
app.use("/api/news", newsRoutes); // newsRoutes.js
app.use("/create-events", eventCreationRouter); // createEvent.js
```

---

## Database Tables

### newsPublished

- `news_id` (Primary Key)
- `user_id`
- `author_name`
- `title`
- `content`
- `category`
- `publish_date` (auto timestamp)
- `event_date`
- `location`

### events

- `event_id` (Primary Key)
- `organizer_id`
- `title`
- `type`
- `sport_name`
- `start_datetime`
- `end_datetime`
- `location`
- `entry_fee`
- `description`

### event_category_mapping

- `event_id` (Foreign Key)
- `category_id` (Foreign Key)

### event_sponsor_mapping

- `event_id` (Foreign Key)
- `sponsor_id` (Foreign Key)

### event_categories

- `category_id` (Primary Key)
- `name`

### sponsors

- `sponsor_id` (Primary Key)
- `name`

---

## Frontend Components Integration

### News Management

- **Create:** `NewsCreationModal.tsx` → `POST /api/news/publish`
- **Read:** `AdminDashboard.tsx` → `GET /api/news`
- **Update:** `NewsEditModal.tsx` → `GET /api/news/:id` + `PUT /api/news/:id`
- **Delete:** `AdminDashboard.tsx` → `DELETE /api/news/:id` ✓ (NEW)

### Events Management

- **Create:** `EventCreationForm.tsx` → `POST /create-events`
- **Read:** `AdminDashboard.tsx` → `GET /create-events`
- **Read Details:** `EventEditModal.tsx` → `GET /api/edit-event/:id/details`
- **Update:** `EventEditModal.tsx` → `PUT /api/edit-event/:id`
- **Delete:** `AdminDashboard.tsx` → `DELETE /api/events/delete/:id` ✓ (NEW)

---

## Testing Checklist

- [x] News creation endpoint (`POST /api/news/publish`)
- [x] News fetching endpoints (`GET /api/news`, `GET /api/news/:id`)
- [x] News update endpoint (`PUT /api/news/:id`)
- [x] News deletion endpoint (`DELETE /api/news/:id`) ✓ NEW
- [x] Event creation endpoint (`POST /create-events`)
- [x] Event fetching endpoints (`GET /create-events`, `GET /api/events/:id`)
- [x] Event details with relations (`GET /api/edit-event/:id/details`)
- [x] Event update endpoints (`PUT /api/edit-event/:id/simple`, `PUT /api/edit-event/:id`)
- [x] Event deletion endpoint (`DELETE /api/events/delete/:id`) ✓ NEW
- [x] Category/Sponsor fetching endpoints (`GET /api/edit-event/categories`, `GET /api/edit-event/sponsors`)
- [x] All routes properly registered in server.js
- [x] All JavaScript files have valid syntax

---

## Summary

✅ **Complete Implementation**

All backend logic for creating, reading, updating, and deleting News articles and Events has been successfully implemented. The two new endpoints added are:

1. **DELETE /api/news/:newsId** - Delete published news articles
2. **DELETE /api/events/delete/:id** - Delete events (admin version)

These endpoints support the admin dashboard functionality and are ready for use by the frontend components.

---

_Last Updated: 2025-12-08_
_Implementation Status: COMPLETE_
