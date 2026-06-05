# QREventix API Documentation

## Base URL
```
http://localhost:1998
```

---

## Authentication Endpoints

### 1. User Registration
**Endpoint**: `POST /register`

**Request**:
```json
{
  "name": "Nandu",
  "email": "john@example.com",
  "password": "password123",
  "mobileNumber": "9876543210",
  "companyName": "My Company",
  "isAgency": false
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Nandu registered successfully.",
  "userID": "507f1f77bcf86cd799439011"
}
```

**Error Response** (422):
```json
{
  "success": false,
  "message": "Email already exists."
}
```

---

### 2. User Login
**Endpoint**: `POST /login`

**Request**:
```json
{
  "email": "attendee@qreventix.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Jane Attendee Login Successful",
  "user": {
    "ID": "507f1f77bcf86cd799439011",
    "name": "Jane Attendee",
    "email": "attendee@qreventix.com",
    "role": "User"
  },
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Get Current User Profile
**Endpoint**: `GET /me`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "User details fetched successfully",
  "user": {
    "ID": "507f1f77bcf86cd799439011",
    "name": "Jane Attendee",
    "email": "attendee@qreventix.com",
    "role": "User",
    "companyName": "",
    "mobileNumber": "9876543212",
    "isAgency": false,
    "status": "Active",
    "authProvider": "local",
    "createdDate": "2026-06-03 10:30:00"
  }
}
```

---

### 4. Google OAuth Login
**Endpoint**: `GET /auth/google`

Redirects to Google login consent screen.

**Callback**: `GET /auth/google/callback`

Returns redirect with authentication token and user info.

---

## Event Endpoints

### 5. Get All Events (Public)
**Endpoint**: `GET /events`

**Query Parameters**:
```
?search=tech&type=Conference&city=Bangalore&status=Active&limit=10&page=1
```

**Response** (200):
```json
{
  "success": true,
  "message": "Events details fetched successfully",
  "data": {
    "events": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Global Tech Summit 2026",
        "type": "Conference",
        "city": "Bangalore",
        "date": "2026-06-15",
        "time": "09:00 AM",
        "location": "KTPO Convention Centre",
        "price": 1499,
        "priceLabel": "₹1,499",
        "capacity": 1000,
        "registered": 250,
        "status": "Active",
        "image": "https://...",
        "organizerName": "John Organizer",
        "views": 450
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 10
  }
}
```

---

### 6. Get Event Details
**Endpoint**: `GET /events/:id`

**Response** (200):
```json
{
  "success": true,
  "message": "Event details fetched successfully",
  "event": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Global Tech Summit 2026",
    "type": "Conference",
    "city": "Bangalore",
    "location": "KTPO Convention Centre",
    "venue": "KTPO",
    "address": "Whitefield, Bangalore",
    "pincode": "560066",
    "date": "2026-06-15",
    "time": "09:00 AM",
    "endTime": "05:00 PM",
    "price": 1499,
    "capacity": 1000,
    "registered": 250,
    "description": "Join the biggest tech conference...",
    "amenities": ["Wi-Fi", "Lunch", "Certificate"],
    "tiers": [
      { "label": "Standard", "price": 1499 },
      { "label": "VIP", "price": 2999 }
    ],
    "image": "https://...",
    "gallery": ["https://...", "https://..."],
    "organizerName": "John Organizer",
    "organizerContact": {
      "name": "John Organizer",
      "mobile": "9876543211",
      "email": "organizer@qreventix.com"
    },
    "status": "Active",
    "views": 451,
    "createdDate": "2026-06-01 14:20:00"
  }
}
```

---

### 7. Create Event
**Endpoint**: `POST /events`

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "title": "New Tech Meetup",
  "type": "Tech",
  "tag": "New",
  "city": "Bangalore",
  "location": "Tech Park",
  "venue": "Conference Hall A",
  "address": "123 Tech Street",
  "pincode": "560001",
  "date": "2026-07-15",
  "time": "02:00 PM",
  "endTime": "05:00 PM",
  "price": 500,
  "capacity": 200,
  "description": "Join us for an amazing tech meetup...",
  "amenities": ["Wi-Fi", "Snacks"],
  "tiers": [
    { "label": "Early Bird", "price": 500 },
    { "label": "Regular", "price": 799 }
  ]
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Event created successfully",
  "eventId": "507f1f77bcf86cd799439011",
  "status": "Under Review"
}
```

---

### 8. Update Event
**Endpoint**: `PUT /events/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Request** (same fields as create, but optional):
```json
{
  "title": "Updated Tech Meetup",
  "price": 599
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Event details updated successfully.",
  "event": { /* full event object */ }
}
```

---

### 9. Delete Event
**Endpoint**: `DELETE /events/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### 10. Get Organizer's Events
**Endpoint**: `GET /organizer/events`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "My Events details fetched successfully",
  "events": [
    { /* event objects */ }
  ]
}
```

---

### 11. Update Event Status (Admin)
**Endpoint**: `PATCH /events/:id/status`

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "status": "Active"
}
```

Valid statuses: `Active`, `Under Review`, `Rejected`, `Completed`

**Response** (200):
```json
{
  "success": true,
  "message": "Event status updated successfully",
  "event": { /* full event object */ }
}
```

---

## Ticket Endpoints

### 12. Book Ticket
**Endpoint**: `POST /tickets`

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "eventId": "507f1f77bcf86cd799439011",
  "tier": "Standard",
  "price": 1499
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Ticket booked successfully! Your QR ticket is ready.",
  "ticketId": "TKT-1717421400000-5234",
  "_id": "507f1f77bcf86cd799439011",
  "tier": "Standard",
  "priceLabel": "₹1,499",
  "status": "Registered",
  "eventTitle": "Global Tech Summit 2026",
  "eventDate": "2026-06-15",
  "eventVenue": "KTPO Convention Centre"
}
```

---

### 13. Get My Tickets
**Endpoint**: `GET /tickets/my`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "My Tickets details fetched successfully",
  "tickets": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "ticketId": "TKT-1717421400000-5234",
      "eventId": "507f1f77bcf86cd799439011",
      "eventTitle": "Global Tech Summit 2026",
      "eventDate": "2026-06-15",
      "eventTime": "09:00 AM",
      "eventVenue": "KTPO Convention Centre",
      "tier": "Standard",
      "price": 1499,
      "priceLabel": "₹1,499",
      "status": "Registered",
      "userName": "Jane Attendee",
      "userEmail": "attendee@qreventix.com",
      "createdDate": "2026-06-03 10:35:00"
    }
  ]
}
```

---

### 14. Check In Ticket (QR Scan)
**Endpoint**: `PATCH /tickets/:ticketId/checkin`

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameter**: ticketId (from QR code)

**Response** (200):
```json
{
  "success": true,
  "message": "Jane Attendee checked in successfully!",
  "ticket": {
    "_id": "507f1f77bcf86cd799439011",
    "ticketId": "TKT-1717421400000-5234",
    "status": "Checked-In",
    "checkedInAt": "2026-06-15 09:30:00",
    "userName": "Jane Attendee"
  }
}
```

---

### 15. Get Event Tickets (Organizer)
**Endpoint**: `GET /events/:id/tickets`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Event Tickets details fetched successfully",
  "data": {
    "tickets": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "ticketId": "TKT-1717421400000-5234",
        "eventTitle": "Global Tech Summit 2026",
        "userName": "Jane Attendee",
        "userEmail": "attendee@qreventix.com",
        "tier": "Standard",
        "price": 1499,
        "status": "Registered"
      }
    ],
    "total": 250,
    "checkedInCount": 120
  }
}
```

---

## User Management Endpoints (Admin Only)

### 16. Get All Users
**Endpoint**: `GET /admin/users`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
?search=john&role=Organizer&status=Active
```

**Response** (200):
```json
{
  "success": true,
  "message": "Users details fetched successfully",
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Organizer",
      "email": "organizer@qreventix.com",
      "role": "Organizer",
      "mobileNumber": "9876543211",
      "companyName": "Grand Events Ltd",
      "status": "Active",
      "createdDate": "2026-06-01 10:00:00"
    }
  ]
}
```

---

### 17. Update User Status (Admin)
**Endpoint**: `PATCH /admin/users/:id/status`

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "status": "Suspended"
}
```

Valid statuses: `Active`, `Suspended`

**Response** (200):
```json
{
  "success": true,
  "message": "User status updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Organizer",
    "status": "Suspended"
  }
}
```

---

## Error Responses

### Bad Request (400)
```json
{
  "success": false,
  "message": "Invalid request format"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "You don't have permission to perform this action."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Event details not found."
}
```

### Unprocessable Entity (422)
```json
{
  "success": false,
  "message": "The following fields are required: title, date, capacity"
}
```

### Internal Server Error (500)
```json
{
  "success": false,
  "message": "An unexpected error occurred"
}
```

---

## Authentication Flow

1. User registers with email/password → Token stored
2. User logs in → JWT token returned
3. Token sent in `Authorization: Bearer <token>` header
4. Middleware verifies token
5. If valid → Access granted
6. If expired → User must re-login

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Header**: `X-RateLimit-Remaining`

---

## Pagination

Use `limit` and `page` parameters:
```
GET /events?limit=10&page=1
```

- Default limit: 100
- Offset calculation: `(page - 1) * limit`

---

## Filtering

### By Status
```
GET /events?status=Active
```

### By Category
```
GET /events?type=Conference
```

### By City
```
GET /events?city=Bangalore
```

### Combined Filters
```
GET /events?type=Tech&city=Bangalore&status=Active
```

---

## Search

Full text search on events:
```
GET /events?search=tech
```

Searches: title, location, city, type

---

## Date Format

All dates use ISO 8601 format:
```
"2026-06-15T09:00:00Z"
```

Display format in responses:
```
"createdDate": "2026-06-03 10:30:00"  (IST)
```

---

## Currency

All prices in Indian Rupees (₹):
```
"price": 1499,
"priceLabel": "₹1,499"
```

---

**Last Updated**: 2026-06-03  
**Version**: 1.0.0  
**Status**: Complete ✅
