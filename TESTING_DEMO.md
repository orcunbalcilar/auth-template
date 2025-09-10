# 🧪 **Testing Demo: Session-Based Token Refresh System**

## 🎯 **What You're Testing**

This demo showcases Next.js middleware-based **session-controlled token refresh**:

- **2-minute fixed session lifetime** (user must re-login after 2 minutes total)
- **30-second token refresh intervals** (tokens refresh during the session)
- **Session tracking** (original login time preserved across token refreshes)
- **Forced re-authentication** (after 2 minutes, regardless of token refreshes)

---

## 🚀 **How to Test**

### **1. Start the Server**
```bash
npm run dev
```
Server runs at **http://localhost:3002**

### **2. Login and Watch Both Timers**
- Visit `http://localhost:3002`
- Login with any email/password
- **What happens**: You get a 30-second initial token with a 2-minute session

### **3. Observe the Dual-Timer System** ⏰⏰
- Go to the dashboard
- **Token Timer**: Shows current token expiration (~30 seconds)
- **Session Timer**: Shows total session time remaining (~2 minutes)
- **Key Behavior**: Token refreshes every 30 seconds, but session countdown continues

### **4. Test Scenarios**

#### **Scenario A: Normal Token Refresh During Session**
1. Login and go to dashboard
2. Wait for token timer to reach ~5 seconds
3. Navigate to `/profile` or refresh page
4. **Expected**: Token timer resets to ~30s, session timer continues counting down

#### **Scenario B: Multiple Token Refreshes**
1. Stay logged in and keep using the app
2. Watch tokens refresh 3-4 times (every 30 seconds)
3. **Expected**: Token keeps refreshing, session timer keeps decreasing

#### **Scenario C: Session Expiration (The Key Test!)**
1. Login and wait for the full 2 minutes
2. Try to navigate or refresh when session timer hits 0
3. **Expected**: Forced redirect to login, regardless of token status

#### **Scenario D: Check Browser Console**
1. Open Developer Tools → Console
2. Watch for middleware logs:
   - `Session time remaining: Xs, Token expires in: Ys`
   - `Token needs refresh, generating new token with same session start time...`
   - `Session expired! Duration: 120s >= 120s`

---

## 🔍 **What to Look For**

### 🎥 **Expected User Experience**

1. **Dual Awareness**: Users see both token refresh and session progress
2. **Predictable Sessions**: Clear 2-minute session limit regardless of activity  
3. **Smooth Token Refresh**: No interruptions during the 2-minute session
4. **Forced Re-authentication**: Must login again after exactly 2 minutes

### 🛠️ **Developer Benefits**

- **Session Control**: Absolute session limits for security
- **Token Efficiency**: Regular refresh without extending session inappropriately
- **Real-world Simulation**: Mimics production patterns with shorter timescales
- **Visual Debugging**: See both token and session lifecycles clearly

---

## 🚀 Ready to Test!

The server is running at **http://localhost:3002**

**Pro Tip**: Open browser dev tools to see middleware logs and watch both the token refresh cycles AND the session expiration enforcement!
