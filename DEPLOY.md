# Deployment Guide

## 1. Supabase Configuration
Since the "Extra CORS origins" setting might be moved or named differently in the new UI:

1.  Go to **Authentication** (under the `Configuration` section in the left sidebar).
2.  Click on **URL Configuration**.
3.  In **Site URL**, enter your Vercel website URL (e.g., `https://your-project.vercel.app`).
4.  In **Redirect URLs**, add the same URL.
    *   *Tip: While developing, you can add `http://localhost:3000` or `*` if allowed.*

## 2. Vercel Deployment
1.  Go to your Vercel Dashboard.
2.  Import the `Ziply` repository.
3.  In the **Environment Variables** section, add:
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `SUPABASE_URL`: Your Supabase Project URL.
    *   `SUPABASE_KEY`: Your Supabase Service Role Key (or Anon Key if using client-side, but backend uses Service Role).
        *   *Note: Our backend uses `SUPABASE_KEY` to sign URLs. Use the **Service Role Key** (secret) for the backend env var.*
4.  Deploy!

## 3. Verify
1.  Open your Vercel site.
2.  Try uploading a file.
3.  Check if it appears in your Supabase Storage bucket.
