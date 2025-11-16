# Supabase Setup Guide

This guide will help you set up Supabase for your HomeHarmony application.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard

## Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Your Supabase project URL
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

# Your Supabase anon/public key
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

You can find these values in your Supabase dashboard under:
- **Project Settings** → **API**
- Copy the "Project URL" and "anon public" key

## Database Setup

### Option 1: Automated Migration (Recommended)

Run the automated migration script:

```bash
# Using npm/bun
npm run migrate
# or
bun run migrate
```

This script will:
- Check if Supabase CLI is installed
- Initialize your local Supabase project
- Guide you through linking to your remote Supabase project
- Run all migrations and seed data

### Option 2: Manual Setup

If you prefer to set up manually:

1. **Link your project:**
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   Get your project ref from the Supabase dashboard URL.

2. **Push migrations:**
   ```bash
   npx supabase db push
   ```

3. **Reset database (optional - this will clear all data):**
   ```bash
   npx supabase db reset
   ```

## Available Scripts

After setup, you can use these commands:

```bash
# Check Supabase status
npm run supabase:status

# Link to a different Supabase project
npm run supabase:link

# Push database changes
npm run supabase:db:push

# See database differences
npm run supabase:db:diff

# Reset database (⚠️ clears all data)
npm run supabase:db:reset

# Start local Supabase (for development)
npm run supabase:start

# Stop local Supabase
npm run supabase:stop
```

## Database Schema

The migrations create the following tables:

- **`members`** - User/member information
- **`tasks`** - Household tasks with assignments
- **`items`** - Inventory items with quantities

All tables include:
- UUID primary keys
- Automatic timestamps (`created_at`, `updated_at`)
- Row Level Security (RLS) policies
- Proper indexes for performance

## Security Notes

⚠️ **Important Security Issue**: The current schema stores passwords in plain text. This is for compatibility with your existing code, but you should migrate to Supabase Auth for proper authentication.

## Testing the Setup

After running migrations:

1. Check your Supabase dashboard to verify tables were created
2. The seed data should populate sample members, tasks, and items
3. Test your application with the new database connection

## Troubleshooting

### "Cannot find project ref"
- Make sure you've linked your project: `supabase link --project-ref YOUR_PROJECT_REF`

### Migration fails
- Check your internet connection
- Verify your Supabase project is active
- Check the Supabase dashboard for any errors

### Environment variables not working
- Make sure your `.env` file is in the project root
- Restart your development server after adding environment variables
- Check that variable names match exactly (case-sensitive)

## Next Steps

1. **Migrate Authentication**: Move from plain text passwords to Supabase Auth
2. **Update API Functions**: Your existing `memberApi.ts` should work with the new schema
3. **Test Application**: Verify all features work with the database
4. **Add Features**: Consider adding more advanced features like notifications, categories, etc.
