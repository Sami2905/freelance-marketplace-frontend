# Freelance Marketplace Frontend

A modern, responsive freelance marketplace built with Next.js 14, React, and TypeScript.

## 🚀 Features

- **Modern UI/UX**: Built with Tailwind CSS and shadcn/ui components
- **Authentication**: Secure login/register with JWT tokens
- **Role-based Access**: Separate dashboards for freelancers, clients, and admins
- **Gig Management**: Create, edit, and manage freelance gigs
- **Real-time Messaging**: Chat system for communication
- **File Upload**: Image upload for gigs and profiles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Tour Guide**: Interactive onboarding for new users

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Authentication**: JWT with HTTP-only cookies
- **File Upload**: Multer with image processing
- **Real-time**: WebSocket for messaging

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/freelance-marketplace-frontend.git
   cd freelance-marketplace-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_WS_URL=ws://localhost:5000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
client/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Dashboard pages
│   │   ├── admin/          # Admin pages
│   │   └── api/            # API routes
│   ├── components/         # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── dashboard/     # Dashboard components
│   │   └── messaging/     # Messaging components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── components/            # Legacy components (moved to src/)
```

## 🔐 Authentication

The app supports three user roles:
- **Freelancers**: Can create and manage gigs
- **Clients**: Can browse and order gigs
- **Admins**: Can manage the platform

## 🎨 UI Components

Built with shadcn/ui for consistent, accessible components:
- Buttons, forms, and inputs
- Data tables with sorting/filtering
- Modals and dialogs
- Navigation and layout components

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🔄 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🌐 API Integration

The frontend communicates with the backend API:
- RESTful API endpoints
- WebSocket for real-time features
- File upload handling
- Error handling and validation

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Backend Repository](https://github.com/yourusername/freelance-marketplace-backend)
- [Live Demo](https://your-demo-url.com)
- [Documentation](https://your-docs-url.com)

## 📞 Support

For support, email support@yourdomain.com or create an issue in this repository.
