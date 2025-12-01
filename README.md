# Ziply - Secure File Sharing

Ziply is a secure, ephemeral file and text sharing application.

## Features
- **Share Files**: Upload files up to 75MB.
- **Share Text/Links**: Securely share sensitive text or URLs.
- **Burn on Read**: Optional self-destruct after one view.
- **Expiration**: Set custom expiry times (1 hour, 1 day, etc.).
- **Secure**: Files are stored in Supabase Storage and metadata in MongoDB.

## Tech Stack
- **Frontend**: HTML, Tailwind CSS, Vanilla JS (No framework).
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Metadata), Supabase (File Storage).

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    ```

3.  **Run Locally**:
    ```bash
    npm start
    ```
    The backend runs on `http://localhost:3000`.
    Open `ziply/index.html` in your browser (or use Live Server).

## Deployment

### Option 1: Render / Railway (Recommended for 75MB Limit)
Since Vercel Serverless Functions have a 4.5MB payload limit, it is recommended to host this on a platform that supports full Node.js servers like **Render** or **Railway** to support the 75MB file upload limit.

1.  Push code to GitHub.
2.  Connect repository to Render/Railway.
3.  Set the Environment Variables in the dashboard.
4.  Build Command: `npm install`
5.  Start Command: `npm start`

### Option 2: Vercel (Limit 4.5MB)
If you deploy to Vercel, file uploads will be limited to 4.5MB due to AWS Lambda constraints.

1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` to deploy.
3.  Set Environment Variables in Vercel Project Settings.
