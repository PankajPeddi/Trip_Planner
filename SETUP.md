# Trip Planner - Setup Guide

This guide will help you set up the collaborative trip planner with Supabase authentication and database.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- Git (to clone the repository)

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd trip-planner
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Choose your organization and enter project details:
   - **Name**: `trip-planner` (or any name you prefer)
   - **Database Password**: Generate a secure password
   - **Region**: Choose the closest region to your users
4. Wait for the project to be created (usually takes 2-3 minutes)

### 3. Set Up Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the entire contents of `database-schema.sql` from your project root
3. Paste it into the SQL Editor and click **Run**
4. This will create all necessary tables, policies, and functions

### 4. Configure Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

3. Create a `.env.local` file in your project root:

```bash
# Replace with your actual Supabase values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 5. Enable Authentication Providers

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Configure email authentication (enabled by default)
3. Optionally enable social providers:
   - **Google**: Follow Supabase guide for Google OAuth setup
   - **GitHub**: Follow Supabase guide for GitHub OAuth setup

### 6. Configure Row Level Security (RLS)

The database schema automatically sets up RLS policies, but verify they're enabled:

1. Go to **Database** → **Tables**
2. Check that RLS is enabled for all tables:
   - `profiles`
   - `trips`
   - `trip_members`
   - `expenses`
   - `trip_activity_log`

### 7. Test the Setup

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and:

1. **Create an account** - Click "Sign In" and then "Sign up"
2. **Check your email** - Verify your account (check spam folder)
3. **Create a trip** - Test the trip creation flow
4. **Add expenses** - Test expense tracking
5. **Share a trip** - Invite another email address

## Features Overview

### Authentication
- **Email/Password**: Users can register and login
- **Email Verification**: Required for new accounts
- **Profile Management**: Users can update their profile information

### Trip Management
- **Create Trips**: Plan new adventures with destinations, dates, and budgets
- **Collaborative Editing**: Multiple users can edit trip details simultaneously
- **Real-time Updates**: Changes sync across all connected devices
- **Offline Support**: Basic functionality works without internet

### Sharing & Collaboration
- **Invite Members**: Share trips via email invitation
- **Role-based Access**: Owner, Editor, and Viewer permissions
- **Trip URLs**: Shareable links for easy access
- **Member Management**: Add/remove members and change roles

### Data Migration
- **Local to Cloud**: Automatically migrate existing local trips to the database
- **Backup/Restore**: Export and import trip data
- **Sync**: Keep local and cloud data in sync

### Security Features
- **Row Level Security**: Database-level security ensures users only see their data
- **JWT Authentication**: Secure session management
- **Email Verification**: Prevents spam and ensures valid users
- **Invitation System**: Secure trip sharing without exposing user data

## Troubleshooting

### Common Issues

#### 1. "Supabase not configured" Error
- Check that your `.env.local` file exists and has the correct values
- Restart the development server after adding environment variables
- Verify the Supabase URL and key are correct

#### 2. Database Connection Issues
- Ensure your Supabase project is active (not paused)
- Check that the database schema has been applied
- Verify RLS policies are enabled

#### 3. Authentication Problems
- Check email verification requirements
- Ensure email provider settings are correct in Supabase
- Verify the site URL is configured correctly

#### 4. Permission Errors
- Check RLS policies are properly configured
- Ensure users have the correct roles in trip_members table
- Verify the user is authenticated

### Development Tips

#### Database Changes
After modifying the database schema:
1. Update the SQL file
2. Apply changes in Supabase SQL Editor
3. Update TypeScript types in `src/lib/supabase.ts`

#### Local Development
- The app works offline with local storage fallback
- Authentication requires internet connection
- Use browser dev tools to simulate offline mode

#### Testing
- Create multiple user accounts to test collaboration
- Use browser incognito mode for different users
- Test on mobile devices for responsive design

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Update Supabase Auth settings:
   - Add your Vercel domain to "Site URL"
   - Add your domain to "Redirect URLs"

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

Make sure to:
1. Set environment variables
2. Update Supabase Auth settings
3. Configure custom domains if needed

## Security Considerations

### Production Checklist

- [ ] Change default database passwords
- [ ] Enable email verification
- [ ] Configure proper CORS settings
- [ ] Set up database backups
- [ ] Monitor authentication logs
- [ ] Review and test RLS policies
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Enable HTTPS (handled by most platforms)
- [ ] Review API usage and quotas

### Best Practices

1. **Environment Variables**: Never expose sensitive keys in client code
2. **Database Security**: Always use RLS policies for data access
3. **Input Validation**: Validate all user inputs on both client and server
4. **Error Handling**: Don't expose internal errors to users
5. **Monitoring**: Set up logging and monitoring for production

## Support

### Getting Help

1. **Documentation**: Check Supabase documentation for detailed guides
2. **GitHub Issues**: Report bugs and feature requests
3. **Community**: Join the Supabase Discord community
4. **Stack Overflow**: Search for similar issues

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source. See LICENSE file for details.
