# GuruTech Production Deployment - Step-by-Step Guide

## Prerequisites ✅ COMPLETED
- [x] Application fully implemented with all features
- [x] All tests passing (52 tests)
- [x] Code committed and pushed to GitHub
- [x] Vercel CLI installed
- [x] Deployment configuration files ready

## Production Deployment Steps

### Step 1: Vercel Account Setup
1. **Create/Login to Vercel Account:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or log in (recommended: use GitHub for seamless integration)

### Step 2: Get Production API Key
1. **Obtain Gemini API Key:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key (keep this secure!)

### Step 3: Deploy via Vercel Dashboard (Recommended)

#### Option A: Import from GitHub
1. **Import Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Import Project" or "Add New..."
   - Select "Import Git Repository"
   - Connect to your GitHub account if not already connected
   - Import the `shreeve1/GuruChat` repository

2. **Configure Project Settings:**
   - **Project Name:** `gurutech` (or your preferred name)
   - **Framework Preset:** Next.js (should be auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** `apps/web/.next` (or leave default)
   - **Install Command:** `npm install` (or leave default)

3. **Set Environment Variables:**
   - In project settings, go to "Environment Variables"
   - Add the following variable:
     - **Name:** `GEMINI_API_KEY`
     - **Value:** [paste your actual Gemini API key]
     - **Environment:** Production (and optionally Preview)
   - Click "Save"

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (typically 2-3 minutes)

#### Option B: CLI Deployment
1. **Login to Vercel:**
   ```bash
   vercel login
   # Follow the prompts to authenticate
   ```

2. **Initialize Project:**
   ```bash
   cd /Users/james/Documents/AI/GuruTech
   vercel
   # Answer the setup questions:
   # - Set up and deploy? Yes
   # - Which scope? [your account]
   # - Link to existing project? No
   # - Project name: gurutech
   # - In which directory is your code located? ./
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add GEMINI_API_KEY production
   # Enter your actual Gemini API key when prompted
   ```

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Step 4: Verify Deployment

Once deployed, you'll receive a production URL (e.g., `https://gurutech.vercel.app`). Test the following:

#### Basic Functionality Test:
1. **Open the deployed URL**
2. **Test Chat Interface:**
   - Enter a test message like "My computer is running slowly"
   - Verify you receive an AI-generated response
   - Check that the UI is properly styled and responsive

3. **Test Escalation Flow:**
   - Send a few messages to start a conversation
   - Click the "End Session" button
   - Verify the escalation modal appears
   - Click "Yes, Escalate Issue"
   - Verify the transcript is generated and displayed
   - Test the "Copy to Clipboard" functionality

4. **Test API Endpoints:**
   - Visit `[your-url]/api/hello-world` - should return JSON response
   - Visit `[your-url]/api/echo` with a POST request - should echo data

#### Error Testing:
- Test with various message types
- Test escalation without messages
- Test clipboard functionality in different browsers

### Step 5: Production Configuration

#### Security Headers (Optional but Recommended):
Add these to your `next.config.js` if needed:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

#### Domain Configuration (Optional):
- Add custom domain in Vercel dashboard if desired
- Configure DNS settings as instructed by Vercel

### Step 6: Monitoring and Maintenance

1. **Set up Vercel Analytics:**
   - Enable in project settings for performance monitoring

2. **Monitor API Usage:**
   - Check Google AI Studio for API usage and quotas
   - Set up billing alerts if necessary

3. **Regular Updates:**
   - Monitor for dependency updates
   - Test new features in preview deployments before promoting to production

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Vercel build logs
   - Ensure all dependencies are in package.json
   - Verify TypeScript compilation passes

2. **API Key Issues:**
   - Verify GEMINI_API_KEY is set correctly in environment variables
   - Test API key in Google AI Studio
   - Check for billing account setup in Google Cloud

3. **Runtime Errors:**
   - Check Vercel Function logs
   - Verify API endpoints work individually
   - Test with mock data vs real AI responses

### Success Criteria:
- ✅ Application loads without errors
- ✅ Chat functionality works with AI responses
- ✅ Escalation flow completes successfully
- ✅ Transcript generation works
- ✅ Copy-to-clipboard functions properly
- ✅ All pages and API endpoints accessible
- ✅ Responsive design works on mobile/desktop

## Production URLs:
After deployment, you'll have:
- **Production URL:** `https://[project-name].vercel.app`
- **API Base:** `https://[project-name].vercel.app/api/`
- **Specific Endpoints:**
  - `/api/chat` - Main chat functionality
  - `/api/generate-transcript` - Transcript generation
  - `/api/hello-world` - Health check
  - `/api/echo` - Echo test endpoint

## Next Steps After Successful Deployment:
1. Share the production URL with stakeholders
2. Conduct user acceptance testing
3. Gather feedback from technical support team
4. Monitor performance and error rates
5. Plan for any additional features or improvements

---

**Status:** Ready for production deployment
**Estimated Time:** 15-30 minutes for complete setup
**Prerequisites:** ✅ All completed