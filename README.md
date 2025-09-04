# Trip Planner - Collaborative Travel Planning

A comprehensive, real-time trip planning and expense tracking application built with Next.js, Tailwind CSS, and Supabase. Plan trips with friends, share expenses, and keep everyone in sync!

## 🌟 Features

### 🔐 **Multi-User Authentication**
- Email/password registration and login
- Email verification for security
- Profile management with avatars
- Secure JWT-based sessions

### 🤝 **Collaborative Trip Planning**
- Share trips with fellow travelers
- Role-based permissions (Owner, Editor, Viewer)
- Real-time synchronization across devices
- Invite members via email
- Activity tracking and notifications

### 💰 **Smart Expense Management**
- Track expected vs actual expenses
- Categorize spending (Transportation, Food, Activities, etc.)
- Real-time budget monitoring
- See who paid what and when
- Visual budget charts and analytics

### 📱 **Mobile-First Design**
- Responsive design for all devices
- Touch-friendly interface
- Offline support with local storage fallback
- Progressive Web App (PWA) capabilities

### 🚀 **Advanced Features**
- Automatic data migration from local storage
- Real-time updates via WebSocket connections
- Comprehensive trip itinerary management
- Photo gallery with trip memories
- Packing list management
- Emergency contacts and documents

## 🚀 Quick Start

### Option A: Try Without Setup (Local Mode)
```bash
git clone <your-repo-url>
cd trip-planner
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) and start planning! Data will be stored locally.

### Option B: Full Setup with Collaboration (Recommended)
For the complete experience with user accounts and sharing:

1. **Follow the detailed setup guide**: See `SETUP.md` for complete instructions
2. **Create a Supabase project** (free tier available)
3. **Set up environment variables**
4. **Deploy the database schema**

**Quick Setup Summary:**
```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase project at supabase.com
# 3. Create .env.local with your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 4. Run the database schema from database-schema.sql
# 5. Start the app
npm run dev
```

## 📖 How to Use

### 🔑 **Getting Started**
1. **Create an Account** - Sign up with your email (verification required)
2. **Create Your First Trip** - Set destination, dates, and budget
3. **Invite Travelers** - Share with friends via email invitations

### 👥 **Collaboration**
1. **Share Your Trip** - Click the "Share" button to invite others
2. **Set Permissions** - Choose Editor (can modify) or Viewer (read-only) access
3. **Real-time Updates** - All changes sync instantly across devices
4. **Activity Feed** - See who made what changes and when

### 💰 **Expense Management**
1. **Add Expenses** - Log costs with expected vs actual amounts
2. **Categorize Spending** - Organize by type (food, transport, activities)
3. **Track Payments** - Note who paid for each expense
4. **Monitor Budget** - Visual charts show spending patterns and remaining budget

### 📋 **Trip Planning**
1. **Build Itinerary** - Add daily activities and locations
2. **Manage Accommodation** - Track bookings and confirmations
3. **Plan Transportation** - Record flights, trains, and local transport
4. **Packing Lists** - Create and share packing checklists
5. **Important Documents** - Store passport, ticket, and booking info

### 📱 **Mobile Experience**
- **Offline Mode** - Basic functionality works without internet
- **PWA Support** - Install as an app on your phone
- **Touch Optimized** - Designed for mobile use while traveling

## Customization

### Trip Information
Edit the trip details in `src/app/page.tsx`:
```javascript
const tripInfo = {
  title: "Your Trip Name",
  description: "Your trip description",
  startDate: "2024-02-15",
  endDate: "2024-02-22",
  members: ["You", "Companion 1", "Companion 2"]
}
```

### Budget Amount
Change the default budget:
```javascript
const [totalBudget, setTotalBudget] = useState(5000) // Change this value
```

### Trip Images
- Place your trip planning images in the `public/` folder
- Update the image paths in the gallery section

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RLS
- **Real-time**: Supabase Realtime
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Vercel (recommended)

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Deploy to Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Digital Ocean App Platform

## 🔧 Architecture

### Security
- **Row Level Security (RLS)** - Database-level security ensures users only see their data
- **JWT Authentication** - Secure session management
- **Email Verification** - Prevents spam and ensures valid users
- **Role-based Access** - Granular permissions for trip collaboration

### Data Flow
- **Local First** - Changes are applied locally first for instant feedback
- **Background Sync** - Data syncs to the cloud when online
- **Conflict Resolution** - Last-write-wins with activity logging
- **Offline Support** - Core functionality works without internet

### Real-time Features
- **Live Updates** - See changes from other users instantly
- **Typing Indicators** - Know when others are editing
- **Activity Feed** - Track all changes with user attribution
- **Push Notifications** - Get notified of important updates

## Support

For questions or issues:
1. Check the console for any error messages
2. Ensure all dependencies are installed
3. Verify environment variables are set correctly
4. Test in incognito mode to rule out browser cache issues

## License

This project is open source and available under the MIT License.
