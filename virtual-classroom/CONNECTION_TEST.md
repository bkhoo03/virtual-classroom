# Connection Test Guide

## Issue
Cannot login - "Cannot connect to server" error

## Diagnosis

### 1. Check Backend Status
Backend is running on: **http://localhost:3003**
Frontend is running on: **http://localhost:5174**

### 2. Environment Variable Issue
The `.env` file has `VITE_BACKEND_URL=http://localhost:3003` but the frontend might not have picked it up.

### 3. Solution

**Option A: Restart Frontend (Recommended)**
```bash
# Stop the frontend process (Ctrl+C in the terminal)
# Then restart:
cd virtual-classroom
npm run dev
```

**Option B: Test Backend Directly**
Open your browser and go to:
```
http://localhost:3003/api/auth/login
```
You should see a response (even if it's an error, it means the backend is reachable)

**Option C: Check Browser Console**
1. Open the login page: http://localhost:5174/login
2. Open browser DevTools (F12)
3. Go to Console tab
4. Try to login with:
   - Email: `tutor@example.com`
   - Password: `password`
5. Look for the actual error message

### 4. Quick Test with curl
```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tutor@example.com\",\"password\":\"password\"}"
```

If this works, the backend is fine and it's a frontend configuration issue.

### 5. Verify Environment Variables
Check if the frontend is reading the correct backend URL:
1. Open browser console on http://localhost:5174
2. Type: `import.meta.env.VITE_BACKEND_URL`
3. It should show: `http://localhost:3003`

If it shows `undefined` or `http://localhost:3001`, the frontend needs to be restarted.

## Demo Credentials
- **Email**: tutor@example.com
- **Password**: password

OR

- **Email**: student@example.com  
- **Password**: password
