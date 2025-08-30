# Trip Planner & Expense Tracker

A beautiful, real-time trip planning and expense tracking application built with Next.js, Tailwind CSS, and Supabase.

## Features

✅ **Visual Trip Planning**
- Display trip plans from uploaded images
- Beautiful, mobile-responsive gallery
- Easy navigation through trip details

✅ **Real-time Expense Tracking**
- Add expected vs actual expenses
- Track by category (Accommodation, Transportation, Food, etc.)
- Live budget updates and remaining balance
- Edit expenses in real-time

✅ **Budget Visualization**
- Interactive pie charts and bar graphs
- Budget breakdown by category
- Clear visual indicators for over/under budget

✅ **Collaborative Features**
- Easy sharing via URL
- Multiple sharing options (Email, WhatsApp, SMS)
- Real-time updates for all companions
- Track who paid what

✅ **Mobile-Friendly Design**
- Responsive design for use while traveling
- Touch-friendly interface
- Fast loading and offline-ready

## Quick Start

1. **Clone and Install**
   ```bash
   cd trip-planner
   npm install
   ```

2. **Environment Setup** (Optional - for Supabase integration)
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   *Note: The app works without Supabase using local storage for now*

3. **Run the Application**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Visit [http://localhost:3000](http://localhost:3000)

## How to Use

### 1. View Trip Plans
- Your trip images are automatically displayed in the gallery
- Navigate through different aspects of your trip

### 2. Set Your Budget
- The default budget is $5,000 (you can modify this in the code)
- View budget breakdown in real-time

### 3. Track Expenses
- Click "Add Expense" to log new expenses
- Enter both expected and actual amounts
- Categorize expenses for better tracking
- Specify who paid for group expense tracking

### 4. Monitor Budget
- Watch real-time updates to your remaining budget
- View visual charts showing spending patterns
- Get alerts when approaching budget limits

### 5. Share with Companions
- Click "Share Trip" to get a shareable link
- Send via email, WhatsApp, or text message
- Everyone can view and add expenses in real-time

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

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Supabase (optional)
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

## Advanced Features (With Supabase)

When you set up Supabase, you get:
- Real-time collaboration between users
- Persistent data storage
- User authentication
- Cloud image storage
- Database backup

## Support

For questions or issues:
1. Check the console for any error messages
2. Ensure all dependencies are installed
3. Verify environment variables are set correctly
4. Test in incognito mode to rule out browser cache issues

## License

This project is open source and available under the MIT License.
