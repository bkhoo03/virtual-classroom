# Virtual Classroom - Multimodal Language Learning Platform

A comprehensive virtual classroom application for language tutoring with real-time video communication, interactive whiteboard, presentation sharing, and AI-powered assistance.

## 🚀 Quick Start

### Option 1: Automated Start (Recommended)

**Windows:**
```bash
start-dev.bat
```

**Mac/Linux:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

Then open: **http://localhost:5173**

### 🔑 Demo Login
- **Email:** `tutor@example.com`
- **Password:** `password`

---

## ⚠️ Important: Backend Must Be Running

The backend server **must be running** for login to work. If you see "Cannot connect to server" error:

1. Open a terminal
2. Run: `cd backend && npm run dev`
3. Keep terminal open
4. Refresh your browser

See **[START_HERE.md](START_HERE.md)** for detailed setup instructions.

---

## Features

- **Video Call Module**: Real-time video and audio communication between tutor and student
- **Presentation Panel**: Support for PDF textbooks, screen sharing, and whiteboard
- **Interactive Whiteboard**: Collaborative drawing with annotations and tools
- **AI Assistant**: Multimodal AI powered by Doubao API for learning support
- **Modern UI**: Minimalistic design with brand colors and smooth animations

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Video/Whiteboard**: Agora SDK (RTC + Interactive Whiteboard)
- **AI**: Doubao API
- **State Management**: React Context + Hooks
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Agora account and App ID ([Sign up](https://console.agora.io/))
- Agora Whiteboard App ID ([Sign up](https://sso.shengwang.cn/signup))
- OpenAI API key (for ChatGPT, DALL-E, and multimodal features)
- (Optional) Ngrok for remote testing and collaboration

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your credentials:
   - `VITE_AGORA_APP_ID`: Your Agora RTC App ID
   - `VITE_AGORA_WHITEBOARD_APP_ID`: Your Agora Whiteboard App ID
   - `VITE_DOUBAO_API_KEY`: Your Doubao API key

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Remote Testing with Ngrok

To test your application remotely or collaborate with others:

1. **Install ngrok:**
   ```bash
   brew install ngrok/ngrok/ngrok
   ngrok config add-authtoken YOUR_TOKEN
   ```

2. **Start backend tunnel:**
   ```bash
   ./start-ngrok-backend.sh
   ```
   Copy the HTTPS URL and add it to `.env` as `VITE_BACKEND_URL`

3. **Start frontend tunnel:**
   ```bash
   ./start-ngrok-frontend.sh
   ```
   Share the HTTPS URL with colleagues!

See **[NGROK_QUICK_START.md](NGROK_QUICK_START.md)** for detailed instructions.

## Project Structure

```
src/
├── components/     # React components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API and SDK services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── main.tsx        # Application entry point
```

## Brand Colors

- Primary: `#5C0099` (Deep Purple)
- Secondary: `#C86BFA` (Light Purple)
- Accent: `#FDC500` (Golden Yellow)
- Accent Light: `#FFD500` (Bright Yellow)
- Highlight: `#FFEE32` (Light Yellow)
- Background: `#03071E` (Dark Navy)

## License

Proprietary - All rights reserved
