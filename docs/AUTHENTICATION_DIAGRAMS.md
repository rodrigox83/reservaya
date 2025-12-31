# Authentication System Diagrams - Reservaya Project

## 1. Current Authentication Flow (Client-Side Only)

```
User Opens Application
        ↓
   App.tsx mounts
        ↓
   currentUser state = null
        ↓
   Conditional Render: if (!currentUser)
        ↓
   Display LoginView Component
        ↓
   ┌─────────────────────────────┐
   │ LoginView Form              │
   │ ┌─────────────────────────┐ │
   │ │ Select Tower (A/B)       │ │
   │ │ Select Floor (1-16)      │ │
   │ │ Select Apartment (1-9)   │ │
   │ └─────────────────────────┘ │
   │ Department Code Display:    │
   │ "603B" (auto-generated)     │
   │ ┌─────────────────────────┐ │
   │ │ [Ingresar] Button       │ │
   │ └─────────────────────────┘ │
   └─────────────────────────────┘
        ↓
   User clicks "Ingresar"
        ↓
   handleSubmit() triggered
        ↓
   onLogin(userData) callback fires
        ↓
   App.tsx: setCurrentUser(userData)
        ↓
   NO VALIDATION - INSTANT LOGIN
        ↓
   React re-renders
        ↓
   Conditional Render: if (currentUser)
        ↓
   ┌────────────────────────────────────────────┐
   │ Main Application (Authenticated)           │
   │                                            │
   │ ┌──────────────────────────────────────┐  │
   │ │ Header                               │  │
   │ │ Departamento: 603B [Salir Button]   │  │
   │ └──────────────────────────────────────┘  │
   │                                            │
   │ ┌──────────────────────────────────────┐  │
   │ │ Tabs: Calendario | Mis Solicitudes  │  │
   │ │                                     │  │
   │ │ Calendar Tab:                       │  │
   │ │ - Calendar component               │  │
   │ │ - Grill list for selected date    │  │
   │ │                                     │  │
   │ │ MyRequests Tab:                     │  │
   │ │ - Pending requests                 │  │
   │ │ - Approved requests                │  │
   │ │ - History                          │  │
   │ └──────────────────────────────────────┘  │
   └────────────────────────────────────────────┘
        ↓
   User interacts (views calendar, makes requests)
        ↓
   User clicks "Salir" (Logout)
        ↓
   handleLogout() triggered
        ↓
   setCurrentUser(null)
        ↓
   React re-renders
        ↓
   Back to LoginView
        ↓
   User logged out
```

## 2. State Management Architecture

```
App.tsx (Main Component)
│
├── State Variables (useState hooks):
│   │
│   ├── currentUser: User | null
│   │   └── Stores: { tower, floor, apartment, departmentCode }
│   │   └── Initial: null
│   │   └── Set by: handleLogin()
│   │   └── Reset by: handleLogout()
│   │
│   ├── reservations: Reservation[]
│   │   └── Stores: Mock reservation data
│   │   └── Modified by: handleConfirmRequest(), handleCancelRequest()
│   │
│   ├── dialogOpen: boolean
│   │   └── Controls: RequestDialog visibility
│   │
│   └── selectedRequest: { date: Date; grill: Grill } | null
│       └── Stores: Selected date and grill for request dialog
│
├── Event Handlers:
│   │
│   ├── handleLogin(userData: User)
│   │   └── Called by: LoginView onLogin callback
│   │   └── Action: setCurrentUser(userData)
│   │   └── Result: Render main app
│   │
│   ├── handleLogout()
│   │   └── Called by: Logout button click
│   │   └── Action: setCurrentUser(null)
│   │   └── Result: Render LoginView
│   │
│   ├── handleRequestReservation(date, grill)
│   │   └── Called by: GrillsCalendarView "Solicitar" button
│   │   └── Action: Open RequestDialog
│   │
│   ├── handleConfirmRequest(notes)
│   │   └── Called by: RequestDialog submit
│   │   └── Action: Create new reservation, add to state
│   │   └── Uses: currentUser.departmentCode
│   │
│   └── handleCancelRequest(reservationId)
│       └── Called by: MyRequests cancel button
│       └── Action: Remove reservation from state
│
└── Data Flow:
    │
    ├── LoginView
    │   └── Receives: onLogin callback
    │   └── Sends: User data to handleLogin()
    │
    ├── GrillsCalendarView
    │   └── Receives: grills, reservations, currentUser
    │   └── Sends: Selected date & grill to handleRequestReservation()
    │
    ├── MyRequests
    │   └── Receives: reservations, currentUser
    │   └── Filters: By currentUser.departmentCode
    │   └── Sends: Reservation ID to handleCancelRequest()
    │
    └── RequestDialog
        └── Receives: date, grill, currentUser
        └── Displays: currentUser.departmentCode
        └── Sends: Notes to handleConfirmRequest()
```

## 3. Authentication vs Non-Authentication (Current)

```
CURRENT (Non-Functional Authentication):

┌─────────────────────────────────────────────────────┐
│ FRONTEND (React)                                    │
│                                                     │
│ LoginView → App.tsx (setState) → Protected UI      │
│                                                     │
│ No HTTP requests made                              │
│ No backend communication                           │
│ No validation                                      │
│ No token/session                                   │
│ No persistence                                     │
│                                                     │
│ Data Storage: Memory (React state)                 │
│ Lost on: Page refresh, browser close               │
└─────────────────────────────────────────────────────┘


WHAT SHOULD EXIST (Production Authentication):

┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                    │
│                                                                     │
│ LoginView → POST /api/auth/login → Receive token/session           │
│                ↓                                                    │
│        Validate credentials                                        │
│                ↓                                                    │
│        App.tsx (setState) → Protected UI                           │
│                ↓                                                    │
│        All API requests include auth headers                       │
│                                                                     │
│ Data Storage: localStorage/sessionStorage (token)                  │
│ Token used: In Authorization headers for API calls                 │
│ Persistence: Survives page refresh                                 │
└─────────────────────────────────────────────────────────────────────┘
        ↕ (HTTP Requests)
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND (Node.js, Python, Go, etc.)                                 │
│                                                                     │
│ POST /api/auth/login                                               │
│   ├─ Receive email & password                                      │
│   ├─ Query database for user                                       │
│   ├─ Compare password hash with bcrypt.compare()                   │
│   ├─ If valid: Create JWT token                                    │
│   └─ Return token to client                                        │
│                                                                     │
│ GET /api/auth/verify                                               │
│   ├─ Receive JWT token in header                                   │
│   ├─ Verify token signature                                        │
│   ├─ Return user data if valid                                     │
│   └─ Return 401 if invalid                                         │
│                                                                     │
│ Database: User table with hashed passwords, sessions, etc.         │
└─────────────────────────────────────────────────────────────────────┘
```

## 4. Component Hierarchy & Authentication

```
App.tsx (Authentication Gate)
│
├── if (!currentUser) ─────────────────────┐
│                                          ↓
│                            ┌──────────────────────┐
│                            │ LoginView            │
│                            │ (Not Authenticated)  │
│                            │                      │
│                            │ - Tower Selector     │
│                            │ - Floor Selector     │
│                            │ - Apt Selector       │
│                            │ - Submit Button      │
│                            │                      │
│                            │ onLogin callback ───┐
│                            └──────────────────────┘│
│                                                    │
└────────────────────────────────────────────────────┘
                                                      ↓
                                        setCurrentUser(userData)
                                                      ↓
                                        Re-render App.tsx
                                                      ↓
├── if (currentUser) ──────────────────────────────┐
│                                                  ↓
│                            ┌─────────────────────────────────────┐
│                            │ Protected Content                   │
│                            │ (Authenticated)                     │
│                            │                                     │
│                            │ ┌─────────────────────────────────┐│
│                            │ │ Header                          ││
│                            │ │ - "Departamento: {code}"        ││
│                            │ │ - Logout Button → handleLogout  ││
│                            │ └─────────────────────────────────┘│
│                            │                                     │
│                            │ ┌─────────────────────────────────┐│
│                            │ │ Tabs Component                  ││
│                            │ │                                 ││
│                            │ │ Tab 1: Calendar                 ││
│                            │ │ ┌──────────────────────────────┐││
│                            │ │ │ GrillsCalendarView           │││
│                            │ │ │ - Receives: currentUser      │││
│                            │ │ │ - Calendar display           │││
│                            │ │ │ - Grill list                 │││
│                            │ │ │ - [Solicitar] buttons        │││
│                            │ │ └──────────────────────────────┘││
│                            │ │                                 ││
│                            │ │ Tab 2: Mis Solicitudes          ││
│                            │ │ ┌──────────────────────────────┐││
│                            │ │ │ MyRequests                   │││
│                            │ │ │ - Receives: currentUser      │││
│                            │ │ │ - Filter by departmentCode   │││
│                            │ │ │ - Show pending/approved      │││
│                            │ │ │ - [Cancelar] buttons         │││
│                            │ │ └──────────────────────────────┘││
│                            │ └─────────────────────────────────┘│
│                            │                                     │
│                            │ ┌─────────────────────────────────┐│
│                            │ │ RequestDialog (Modal)           ││
│                            │ │ - Receives: date, grill, user   ││
│                            │ │ - Shows: departmentCode         ││
│                            │ │ - Notes textarea                ││
│                            │ │ - [Enviar Solicitud] button    ││
│                            │ └─────────────────────────────────┘│
│                            │                                     │
│                            └─────────────────────────────────────┘
│
```

## 5. Data Identity Tracking

```
Department Code Format: "{floor}0{apartment}{tower}"
Example: "603B" = Floor 6, Apartment 3, Tower B

User Identification Flow:
┌──────────────┐
│ User Inputs  │
├──────────────┤
│ Tower: B     │
│ Floor: 6     │
│ Apt: 3       │
└──────────────┘
        ↓
┌──────────────────────────┐
│ getDepartmentCode()      │
│ `${6}0${3}${B}`          │
└──────────────────────────┘
        ↓
┌──────────────────────────┐
│ Result: "603B"           │
└──────────────────────────┘
        ↓
┌───────────────────────────────────┐
│ Stored in:                        │
│ User object: departmentCode       │
│ App state: currentUser            │
│ Header display                    │
│ Reservation objects               │
│ Filtering logic                   │
└───────────────────────────────────┘

No Validation:
- No server check if apartment exists
- No verification of ownership
- No check if user is real
- No password verification
- User can select ANY combination

Filtering (Client-Side Only):
- MyRequests filters by: departmentCode === currentUser.departmentCode
- If user changes login → Different department code
- Can see all public reservations
- Cannot see other users' private data (except in reservation list)
```

## 6. Missing Authentication Infrastructure

```
CURRENT STATE:
┌─────────────┐
│ React App   │
│ (Frontend)  │
└─────────────┘
       ↓
    (void)

NO CONNECTION TO:
- Backend API
- Database
- Authentication Server
- Session Manager
- Token Manager
- User Directory


WHAT SHOULD EXIST:

┌─────────────┐         HTTP         ┌──────────────┐        ┌─────────────┐
│ React App   │◄────Requests────────►│ Backend API  │◄──────►│ Database    │
│ (Frontend)  │         &            │ (Auth Server)│        │ (User Data) │
└─────────────┘       Responses       └──────────────┘        └─────────────┘
                                            ↓
                                      Authorization
                                      Validation
                                      Token Creation/Verify
                                      Session Management


Key Missing Components:

1. Authentication Server
   - Handle login requests
   - Verify passwords
   - Create sessions/tokens
   - Handle logout
   - Verify tokens
   - Refresh tokens

2. Database
   - User accounts table
   - Password hashes
   - Session/token table
   - Reservation data
   - User roles/permissions

3. Frontend Integration
   - Auth service module
   - Token storage (localStorage)
   - Request interceptors
   - Auth context provider
   - Protected routes
   - Error handling
   - Loading states
```

## 7. Security Risk Matrix

```
THREAT                          SEVERITY    CURRENT STATUS    MITIGATION
──────────────────────────────────────────────────────────────────────────
Impersonation                   CRITICAL    VULNERABLE        Backend validation
No password                     CRITICAL    VULNERABLE        Password system
No token system                 CRITICAL    VULNERABLE        JWT/Session tokens
Client-side only               CRITICAL    VULNERABLE        Backend API
No user verification           CRITICAL    VULNERABLE        Database + auth
No session expiry              HIGH        VULNERABLE        Token expiration
No rate limiting               HIGH        VULNERABLE        Rate limiter
No audit logging               HIGH        VULNERABLE        Audit trail system
No HTTPS                       HIGH        VULNERABLE        HTTPS enforcement
No CSRF protection             MEDIUM      VULNERABLE        CSRF tokens
No input validation            MEDIUM      VULNERABLE        Server-side validation
No XSS prevention              LOW         VULNERABLE        React escaping (partial)


RISK SCORE: 9.8/10 (CRITICAL)

NOT SUITABLE FOR PRODUCTION USE
```

## 8. Implementation Timeline

```
WEEK 1-2: Backend Setup
  Day 1-2: Choose technology stack
  Day 3-4: Set up project structure
  Day 5-6: Create database schema
  Day 7-10: Implement user authentication endpoints
  Day 11-14: Set up security (CORS, rate limiting, etc.)

WEEK 3: API Integration
  Day 1-3: Create auth service module in React
  Day 4-5: Update LoginView component
  Day 6-7: Implement token storage

WEEK 4: Testing & Hardening
  Day 1-3: Unit tests
  Day 4-5: Integration tests
  Day 6-7: Security audit

WEEK 5+: Advanced Features
  - Password reset
  - Email verification
  - Multi-factor auth
  - Social login
  - Account management


ESTIMATED EFFORT: 300-400 developer hours (2-3 person-months)
```

---

## Summary

The current Reservaya application uses **simple client-side state management** with **NO actual authentication**. Users select a department code from dropdowns, which is instantly accepted without any validation or verification.

For production use, this must be replaced with:
1. Backend authentication server
2. Real password verification
3. Token/session management
4. Database integration
5. Security measures (HTTPS, CORS, rate limiting, etc.)

The diagrams above show both the current (non-functional) state and what a proper authentication system should look like.
