<div align="center">
<img width="1200" height="475" alt="E-Guard AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# E-Guard AI - Intelligent Safety System

> **An AI-powered emergency safety application providing real-time threat detection, evidence preservation, and intelligent response coordination.**

## 📋 Project Overview

**E-Guard AI** is a comprehensive safety application designed to protect users in emergency situations. It combines AI-powered monitoring, real-time location tracking, secure evidence capture, and intelligent emergency response coordination into a single, user-friendly platform.

### 🎯 Mission
To empower individuals with technology that enhances their personal safety through intelligent detection, secure documentation, and rapid response coordination.

---

## ✨ Core Features

### 🚨 Emergency Response
- **SOS Alert System**: One-tap emergency activation with automatic responder notification
- **Real-time Location Tracking**: GPS-enabled location sharing with emergency contacts
- **24/7 Active Monitoring**: Continuous biological monitoring and spatial threat detection
- **< 5 Second Response Time**: Rapid emergency coordination system

### 🤖 AI-Powered Safety
- **Gemini AI Assistant**: Conversational AI providing safety advice and threat assessment
- **Threat Detection**: Spatial analysis and intelligent threat detection
- **Smart Recommendations**: AI-driven safety suggestions based on location and context
- **Pattern Recognition**: Machine learning analysis of safety patterns

### 📸 Secure Evidence Vault
- **Photo Capture**: Instant snapshot capture with automatic timestamping
- **Video Recording**: Up to 60-second video documentation
- **Audio Recording**: Ambient sound recording for threat documentation
- **End-to-End Encryption**: Military-grade encryption for all evidence
- **Cloudinary Integration**: Secure cloud backup across multiple locations
- **Immutable Records**: Evidence cannot be tampered with after capture

### 📞 Fake Call Feature
- **Emergency Escape Tool**: Generate a fake incoming call to escape dangerous situations
- **Customizable Caller**: Set caller name and number
- **Automatic Call Triggering**: Quick access from dashboard
- **Silent Mode Support**: Operates silently when needed

### 👥 Emergency Contacts
- **Contact Management**: Add and manage primary emergency contacts
- **Quick Notification**: Instantly notify contacts during SOS activation
- **Relationship Tracking**: Store relationship details with contacts
- **Contact-Specific Settings**: Customize notification preferences per contact

### 🔐 Security & Privacy
- **End-to-End Encryption**: All communications encrypted
- **Secure Authentication**: User authentication with secure token management
- **Privacy Settings**: Granular control over data sharing
- **3-Point Cloud Backup**: Redundant backup across secure servers
- **Tamper-Proof Logging**: All actions timestamped and immutable

### 📊 Dashboard
- **System Status Overview**: Real-time monitoring of all safety systems
- **Active Monitoring Indicator**: 24/7 operational status
- **Risk Analysis**: Environmental, network, and data integrity metrics
- **Quick Access**: One-tap access to all safety features

### 📱 Mobile-First Design
- **Fully Responsive**: Optimized for mobile, tablet, and desktop
- **Intuitive UI**: Easy-to-use interface in high-stress situations
- **Dark Mode**: Eye-friendly interface suitable for all lighting conditions
- **Accessibility**: WCAG compliant design

---

## 🛠️ Tech Stack

### **Frontend (Client)**
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Real-time**: WebSocket support
- **API**: Axios with custom API client
- **Authentication**: JWT token-based
- **Deployment**: Vercel-ready

### **Backend (Server)**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **File Storage**: Cloudinary
- **AI Integration**: Google Gemini API
- **Real-time**: Socket.io (ready)
- **Email**: Nodemailer (ready)
- **Validation**: Input validation middleware
- **CORS**: Enabled for secure cross-origin requests

### **External Services**
- **Google Gemini API**: AI-powered safety insights and threat assessment
- **Cloudinary**: Secure media storage and CDN
- **MongoDB Atlas**: Cloud database (production)
- **Vercel**: Frontend deployment (production)
- **Render/Railway**: Backend deployment (production)

---

## 📁 Project Structure

```
E-Guard-AI/
├── client/                          # Next.js Frontend Application
│   ├── app/                         # App Router pages
│   │   ├── page.tsx                 # Dashboard
│   │   ├── login/
│   │   │   ├── page.tsx             # Login/Landing page
│   │   │   └── layout.tsx
│   │   ├── register/
│   │   │   ├── page.tsx             # Registration page
│   │   │   └── layout.tsx
│   │   ├── sos/
│   │   │   ├── page.tsx             # SOS alert interface
│   │   │   └── details/
│   │   │       ├── page.tsx         # SOS details
│   │   │       └── layout.tsx
│   │   ├── assistant/               # AI Chat page
│   │   │   └── page.tsx
│   │   ├── contacts/                # Contacts management
│   │   │   └── page.tsx
│   │   ├── evidence/                # Evidence vault
│   │   │   └── page.tsx
│   │   ├── fake-call/               # Fake call interface
│   │   │   └── page.tsx
│   │   ├── live/                    # Live tracking
│   │   │   └── page.tsx
│   │   ├── settings/                # User settings
│   │   │   └── page.tsx
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   │
│   ├── components/                  # Reusable React components
│   │   ├── AuthGuard.tsx            # Protected route wrapper
│   │   ├── BottomNav.tsx            # Mobile bottom navigation
│   │   ├── GlobalVoiceAssistant.tsx # AI voice assistant
│   │   ├── LayoutContent.tsx        # Main layout wrapper
│   │   ├── MapView.tsx              # Location map display
│   │   ├── Sidebar.tsx              # Desktop sidebar navigation
│   │   ├── SilentModeManager.tsx    # Silent mode controller
│   │   ├── TopBar.tsx               # Header navigation
│   │   └── TopBarNew.tsx            # Alternative header
│   │
│   ├── api/                         # API integration layer
│   │   ├── alerts.ts                # Alerts API
│   │   ├── apiClient.ts             # Base API client
│   │   ├── auth.ts                  # Authentication API
│   │   ├── chat.ts                  # Chat/AI API
│   │   ├── contacts.ts              # Contacts API
│   │   ├── fakeCall.ts              # Fake call API
│   │   ├── sos.ts                   # SOS API
│   │   └── upload.ts                # File upload API
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── use-mobile.ts            # Mobile detection hook
│   │
│   ├── lib/                         # Utility functions
│   │   └── utils.ts                 # Helper utilities
│   │
│   ├── services/                    # Service layer
│   │   └── api.ts                   # API service wrapper
│   │
│   ├── store/                       # Zustand stores
│   │   ├── useAuthStore.ts          # Authentication state
│   │   ├── useFreeCall.ts           # Fake call state
│   │   ├── useSOSStore.ts           # SOS state
│   │   └── useStore.ts              # Global app state
│   │
│   ├── package.json                 # Dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── next.config.ts               # Next.js config
│   ├── tailwind.config.js           # Tailwind config
│   ├── postcss.config.mjs           # PostCSS config
│   └── eslint.config.mjs            # ESLint config
│
├── server/                          # Express Backend Application
│   ├── index.js                     # Application entry point
│   ├── package.json                 # Dependencies
│   │
│   ├── config/                      # Configuration files
│   │   ├── cloudinary.js            # Cloudinary setup
│   │   └── database.js              # MongoDB connection
│   │
│   ├── controllers/                 # Request handlers
│   │   ├── alertsController.js      # Alerts logic
│   │   ├── authController.js        # Authentication logic
│   │   ├── chatController.js        # AI chat logic
│   │   ├── contactsController.js    # Contacts logic
│   │   ├── fakeCallController.js    # Fake call logic
│   │   ├── sosController.js         # SOS logic
│   │   └── uploadController.js      # File upload logic
│   │
│   ├── middleware/                  # Express middleware
│   │   └── authMiddleware.js        # JWT authentication
│   │
│   ├── models/                      # MongoDB schemas
│   │   ├── Alert.js                 # Alert model
│   │   ├── Chat.js                  # Chat message model
│   │   ├── Contact.js               # Contact model
│   │   ├── Evidence.js              # Evidence model
│   │   ├── FakeCall.js              # Fake call model
│   │   ├── SOS.js                   # SOS alert model
│   │   └── User.js                  # User model
│   │
│   ├── routes/                      # API route definitions
│   │   ├── alerts.js                # Alerts routes
│   │   ├── auth.js                  # Auth routes
│   │   ├── chat.js                  # Chat routes
│   │   ├── contacts.js              # Contacts routes
│   │   ├── fakeCall.js              # Fake call routes
│   │   ├── sos.js                   # SOS routes
│   │   └── upload.js                # Upload routes
│   │
│   └── services/                    # Business logic
│       └── gemini.services.js       # Gemini AI integration
│
└── README.md                        # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (Download from [nodejs.org](https://nodejs.org/))
- **npm** or **yarn**: v9+
- **MongoDB Atlas**: Cloud database account
- **Cloudinary**: Media storage account
- **Google Gemini API**: API key from Google AI Studio
- **Git**: For version control

### Environment Variables

#### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

#### **Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/e-guard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Installation & Setup

#### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/E-Guard-AI.git
cd E-Guard-AI
```

#### **2. Setup Backend Server**
```bash
cd server
npm install

# Create .env file with variables above
echo "PORT=5000
MONGODB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development" > .env

# Start the server
npm run dev
# Server runs on http://localhost:5000
```

#### **3. Setup Frontend Client**
```bash
cd ../client
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key" > .env.local

# Start the development server
npm run dev
# App runs on http://localhost:3000
```

#### **4. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Login**: Use credentials from registration

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### SOS Alert
- `POST /api/sos` - Create SOS alert
- `GET /api/sos/:id` - Get SOS details
- `PUT /api/sos/:id` - Update SOS status
- `DELETE /api/sos/:id` - Cancel SOS alert

### Evidence
- `POST /api/upload/evidence` - Upload photo/video/audio
- `GET /api/evidence` - List all evidence
- `GET /api/evidence/:id` - Get evidence details
- `DELETE /api/evidence/:id` - Delete evidence

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Add new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Chat/AI
- `POST /api/chat` - Send message to AI assistant
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history` - Clear chat history

### Fake Call
- `POST /api/fake-call` - Initiate fake call
- `PUT /api/fake-call/:id` - Stop fake call
- `GET /api/fake-call/history` - Get fake call history

### Alerts
- `GET /api/alerts` - Get system alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert status

---

## 🔑 Key Features Deep Dive

### Emergency Response Flow
1. User taps SOS button
2. Location captured automatically
3. Gemini AI assesses threat level
4. Emergency contacts notified immediately
5. Real-time location shared
6. System logs all interactions
7. Evidence automatically preserved

### Evidence Preservation
1. User selects capture type (photo/video/audio)
2. Device camera/microphone opens
3. Media captured locally
4. Encrypted before transmission
5. Uploaded to Cloudinary
6. Timestamped and logged
7. Backed up to 3 secure locations
8. Immutable record created

### AI Safety Assistant
1. User asks safety question
2. Request sent to Gemini API
3. AI analyzes context and location
4. Provides personalized recommendations
5. Suggests emergency contacts
6. Offers threat assessment
7. Stores interaction for analysis

---

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Bcrypt Hashing**: Password encryption with bcrypt
- **HTTPS Ready**: SSL/TLS support for production
- **CORS Protection**: Cross-origin requests validation
- **Input Validation**: Server-side validation of all inputs
- **Rate Limiting**: API rate limiting middleware
- **Environment Variables**: Sensitive data in .env files
- **Immutable Records**: Tamper-proof evidence logging
- **Encryption**: End-to-end encryption for evidence

---

## 📊 Database Schema

### User Model
- `_id`: MongoDB ID
- `email`: User email (unique)
- `password`: Hashed password
- `name`: Full name
- `phone`: Phone number
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### SOS Model
- `_id`: MongoDB ID
- `userId`: User reference
- `latitude`: GPS latitude
- `longitude`: GPS longitude
- `status`: active/resolved
- `threatLevel`: low/medium/high
- `contactsNotified`: Array of contact IDs
- `createdAt`: Alert timestamp

### Evidence Model
- `_id`: MongoDB ID
- `userId`: User reference
- `sosId`: Associated SOS ID
- `type`: photo/video/audio
- `fileUrl`: Cloudinary URL
- `encryption`: Encryption status
- `timestamp`: Capture timestamp
- `metadata`: Device/location info

### Contact Model
- `_id`: MongoDB ID
- `userId`: User reference
- `name`: Contact name
- `phone`: Phone number
- `relationship`: Relationship type
- `isPrimary`: Primary contact flag
- `createdAt`: Creation timestamp

---

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm run test          # Run tests
npm run test:watch   # Watch mode
npm run lint         # ESLint
```

### Backend Testing
```bash
cd server
npm run test         # Run tests
npm run test:watch  # Watch mode
```

---

## 📦 Deployment

### Deploy Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### Deploy Backend (Railway/Render)
1. Create account on Railway/Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy from main branch

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Configure IP whitelist
3. Create database user
4. Set `MONGODB_URI` in backend .env

### Media Storage (Cloudinary)
1. Sign up for Cloudinary
2. Get cloud name and API keys
3. Configure upload presets
4. Set environment variables

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Team

**E-Guard AI Development Team**
- Full Stack Development
- AI Integration
- Security & Privacy

---

## 📧 Support & Contact

- **Email**: support@e-guard.ai
- **Issues**: GitHub Issues
- **Documentation**: [Wiki](https://github.com/yourusername/E-Guard-AI/wiki)

---

## 🗺️ Roadmap

- [ ] Push notifications
- [ ] Video call with emergency responders
- [ ] Multi-language support
- [ ] ML-based threat detection
- [ ] Wearable device integration
- [ ] IoT home security integration
- [ ] Blockchain evidence verification
- [ ] Community safety mapping

---

## ⭐ Show Your Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Made with ❤️ for your safety** | Last Updated: March 2026
