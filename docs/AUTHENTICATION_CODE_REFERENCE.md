# Authentication Code Reference - Reservaya Project

## Key Code Snippets

### 1. User Model Definition (types.ts)

```typescript
export interface User {
  tower: string;           // "A" or "B"
  floor: number;           // 1-16
  apartment: number;       // 1-9
  departmentCode: string;  // Format: "603A" (floor + "0" + apartment + tower)
}

export interface Reservation {
  id: string;
  grillId: string;
  grillName: string;
  date: string;
  departmentCode: string;  // Links to User.departmentCode
  userName?: string;
  notes?: string;
  status: "available" | "pending" | "approved" | "rejected";
  requestedAt: string;
}

export interface Grill {
  id: string;
  name: string;
  description: string;
  capacity: number;
  location: string;
  tower: "A" | "B";
}
```

**File Location:** `/home/rodrigo/proyectos/reservaya/src/app/types.ts`

---

### 2. Main App Component - State Management (App.tsx)

```typescript
import { useState } from "react";
import { LoginView } from "./components/LoginView";
import { User, Reservation } from "./types";

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Application State
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ date: Date; grill: Grill } | null>(null);

  // Login Handler - Called from LoginView
  const handleLogin = (userData: User) => {
    setCurrentUser(userData);
    toast.success("¡Bienvenido!", {
      description: `Departamento ${userData.departmentCode}`,
    });
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    toast.info("Sesión cerrada");
  };

  // Conditional Rendering - Authentication Gate
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  // Authenticated User View
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-semibold">Sistema de Reservas de Parrillas</h1>
              <p className="text-sm text-muted-foreground">
                Departamento: <span className="font-semibold text-indigo-600">
                  {currentUser.departmentCode}
                </span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Application Content */}
      </main>
    </div>
  );
}
```

**File Location:** `/home/rodrigo/proyectos/reservaya/src/app/App.tsx` (lines 125-180)

---

### 3. Login View Component (LoginView.tsx)

```typescript
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface LoginViewProps {
  onLogin: (userData: { 
    tower: string; 
    floor: number; 
    apartment: number; 
    departmentCode: string 
  }) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  // Form State
  const [tower, setTower] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");

  // Generate Department Code
  const getDepartmentCode = () => {
    if (!floor || !apartment || !tower) return "";
    return `${floor}0${apartment}${tower}`;
  };

  // Handle Login Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tower && floor && apartment) {
      // Call parent callback with user data
      onLogin({
        tower,
        floor: parseInt(floor),
        apartment: parseInt(apartment),
        departmentCode: getDepartmentCode(),
      });
    }
  };

  const isValid = tower && floor && apartment;
  const departmentCode = getDepartmentCode();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sistema de Reservas</CardTitle>
          <CardDescription>
            Bienvenido al sistema de reserva de parrillas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tower Selection */}
            <div className="space-y-2">
              <Label htmlFor="tower">Torre</Label>
              <Select value={tower} onValueChange={setTower}>
                <SelectTrigger id="tower">
                  <SelectValue placeholder="Selecciona tu torre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Torre A</SelectItem>
                  <SelectItem value="B">Torre B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Floor Selection */}
            <div className="space-y-2">
              <Label htmlFor="floor">Piso</Label>
              <Select value={floor} onValueChange={setFloor}>
                <SelectTrigger id="floor">
                  <SelectValue placeholder="Selecciona tu piso" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Piso {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Apartment Selection */}
            <div className="space-y-2">
              <Label htmlFor="apartment">Departamento</Label>
              <Select value={apartment} onValueChange={setApartment}>
                <SelectTrigger id="apartment">
                  <SelectValue placeholder="Selecciona tu departamento" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Depto {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Code Display */}
            {departmentCode && (
              <div className="bg-indigo-50 p-3 rounded-md text-center">
                <p className="text-sm text-indigo-600">Código de departamento</p>
                <p className="text-2xl font-bold text-indigo-900">{departmentCode}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={!isValid}>
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**File Location:** `/home/rodrigo/proyectos/reservaya/src/app/components/LoginView.tsx`

---

### 4. Reservation Creation with User Identity (App.tsx)

```typescript
const handleConfirmRequest = (notes: string) => {
  if (!selectedRequest || !currentUser) return;

  const newReservation: Reservation = {
    id: `res-${Date.now()}`,
    grillId: selectedRequest.grill.id,
    grillName: selectedRequest.grill.name,
    date: selectedRequest.date.toISOString(),
    // Uses current user's department code - NO VALIDATION
    departmentCode: currentUser.departmentCode,
    status: "pending",
    requestedAt: new Date().toISOString(),
    notes: notes || undefined,
  };

  setReservations([...reservations, newReservation]);
  toast.success("¡Solicitud enviada!", {
    description: "Tu solicitud está en proceso de revisión",
  });
};
```

**Vulnerability:** Department code is never verified against a server. User can change it by simply selecting different options in LoginView.

---

### 5. User Request Filtering (MyRequests.tsx)

```typescript
export function MyRequests({
  reservations,
  currentUser,
  onCancelRequest,
}: MyRequestsProps) {
  // Filter reservations by current user's department code
  const userRequests = reservations
    .filter((r) => r.departmentCode === currentUser.departmentCode)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  // Separate by status
  const pendingRequests = userRequests.filter((r) => r.status === "pending");
  const approvedRequests = userRequests.filter((r) => r.status === "approved");
  const otherRequests = userRequests.filter(
    (r) => r.status !== "pending" && r.status !== "approved"
  );

  return (
    <div className="space-y-6">
      {/* Pending Section */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Solicitudes en Proceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onCancel={onCancelRequest}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Approved Section */}
      {approvedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-blue-600" />
              Reservas Aprobadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvedRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onCancel={onCancelRequest}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {userRequests.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <Flame className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No tienes solicitudes</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Vulnerability:** Filtering is done client-side. User could modify requests for other department codes if this were connected to a backend.

**File Location:** `/home/rodrigo/proyectos/reservaya/src/app/components/MyRequests.tsx` (lines 26-182)

---

### 6. Protected Route Implementation (App.tsx)

```typescript
// Simple conditional rendering - NOT a real route guard
if (!currentUser) {
  return <LoginView onLogin={handleLogin} />;
}

// Only rendered if currentUser exists
return (
  <div className="min-h-screen bg-gray-50">
    <header>
      {/* Header with user info and logout */}
    </header>

    <main>
      {/* Protected content */}
    </main>
  </div>
);
```

**Note:** This is NOT a real route guard. It's just conditional rendering. No middleware or auth tokens are involved.

---

### 7. Department Code Validation (Currently Missing)

```typescript
// WHAT SHOULD EXIST (but doesn't):

// Backend validation
async function validateDepartmentCode(code: string): Promise<boolean> {
  const response = await fetch('/api/auth/validate-department', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ departmentCode: code })
  });
  return response.ok;
}

// Password verification
async function login(email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return data.user;
}

// Session verification
async function verifySession(token: string): Promise<User> {
  const response = await fetch('/api/auth/verify', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

**Status:** NOT IMPLEMENTED

---

## Component Hierarchy

```
App.tsx (State Management)
├── currentUser: User | null
├── reservations: Reservation[]
├── handleLogin(userData: User)
├── handleLogout()
└── Conditional Render:
    ├── IF NOT authenticated:
    │   └── LoginView
    │       ├── Tower Selector
    │       ├── Floor Selector
    │       ├── Apartment Selector
    │       └── Submit Button → handleLogin()
    │
    └── IF authenticated:
        ├── Header
        │   ├── User Display: {currentUser.departmentCode}
        │   └── Logout Button → handleLogout()
        │
        └── Main Content
            ├── Tabs
            │   ├── Calendar Tab
            │   │   └── GrillsCalendarView
            │   │       ├── Props: currentUser, grills, reservations
            │   │       └── onRequestReservation(date, grill)
            │   │
            │   └── Requests Tab
            │       └── MyRequests
            │           ├── Props: currentUser, reservations
            │           └── Filters by currentUser.departmentCode
            │
            └── RequestDialog
                ├── Shows: currentUser.departmentCode
                └── Creates: Reservation with departmentCode
```

---

## Data Flow Diagram

```
Browser ← React Application → Memory (No Persistence)
                    ↓
                   App.tsx
                    ↓
            ┌───────┼───────┐
            ↓       ↓       ↓
        Login   Calendar  MyRequests
        View    View      Component
        (null)  (auth)    (auth)
            ↓
    (No Backend API)
            ↓
    (No Database)
            ↓
    (All Data Hardcoded)
```

---

## Missing Authentication Flow

```
CURRENT (Non-functional):
User Input → Instant Login → Browser Memory → Lost on Refresh

SHOULD BE:
User Input → Validate Password → Create Session → Store Token → API Requests
     ↓            ↓                    ↓              ↓            ↓
  Email     Hash Check            Database        Secure         Backend
  Password                        Cookie/Token    Storage        Validation
```

---

## Environment & Build Configuration

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Missing Configurations:**
- No proxy for API calls
- No auth middleware
- No environment variables
- No secure header configuration

---

## Package Dependencies Relevant to Auth

```json
{
  "dependencies": {
    "react": "18.3.1",              // UI Framework
    "react-dom": "18.3.1",          // DOM Rendering
    "react-hook-form": "7.55.0",    // Form Handling (General, not auth-specific)
    "@radix-ui/react-dialog": "1.1.6", // Modal for forms
    "@radix-ui/react-select": "2.1.6", // Dropdowns
    "sonner": "2.0.3"               // Notifications
  }
}
```

**Missing Libraries:**
- jsonwebtoken
- bcryptjs
- axios or fetch wrapper
- auth0
- firebase/auth
- next-auth
- passport
- express
- jwt-decode

