# GuruTech Production Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Git Repository**: Ensure your code is pushed to GitHub/GitLab/Bitbucket

## Environment Variables

The following environment variables need to be configured in Vercel:

### Required:
- `GEMINI_API_KEY`: Your Google Gemini API key for AI functionality

### Optional:
- `NODE_ENV`: Set to `production` (usually set automatically by Vercel)

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

1. **Connect Repository to Vercel:**
   ```bash
   # Install Vercel CLI if not already installed
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link your project
   vercel link
   ```

2. **Set Environment Variables:**
   ```bash
   # Set production environment variables
   vercel env add GEMINI_API_KEY production
   # Enter your actual Gemini API key when prompted
   ```

3. **Deploy:**
   ```bash
   # Deploy to production
   npm run deploy
   # or alternatively:
   vercel --prod
   ```

### Method 2: Vercel Dashboard Deployment

1. **Import Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Import Project"
   - Connect your Git repository

2. **Configure Build Settings:**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `apps/web/.next`
   - Install Command: `npm install`

3. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your actual API key
   - Set environment to "Production"

4. **Deploy:**
   - Click "Deploy" button
   - Vercel will automatically build and deploy your application

## Post-Deployment Verification

After deployment, verify these features work correctly:

### 1. Basic Chat Functionality
- [ ] Open the deployed application URL
- [ ] Send a test message to the AI assistant
- [ ] Verify you receive an AI response

### 2. Escalation Flow
- [ ] Start a chat session
- [ ] Click "End Session" button
- [ ] Test escalation modal functionality

### 3. Transcript Generation
- [ ] Complete an escalation flow by clicking "Yes"
- [ ] Verify transcript is generated and displayed
- [ ] Test copy-to-clipboard functionality

### 4. API Endpoints
- [ ] Test `/api/chat` endpoint
- [ ] Test `/api/generate-transcript` endpoint
- [ ] Verify error handling works correctly

## Monitoring and Maintenance

### Performance Monitoring
- Use Vercel Analytics for performance metrics
- Monitor API response times
- Check error rates in Vercel Functions logs

### Environment Management
- Keep API keys secure and rotate regularly
- Monitor API usage and rate limits
- Set up alerts for high error rates

### Updates and Maintenance
- Use `vercel --prod` for production deployments
- Test changes in preview deployments first
- Monitor deployment logs for any issues

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check TypeScript compilation errors
   - Verify all dependencies are installed
   - Review build logs in Vercel dashboard

2. **API Key Issues:**
   - Verify `GEMINI_API_KEY` is set correctly
   - Check API key permissions and quotas
   - Test API key with Google AI Studio

3. **Runtime Errors:**
   - Check Vercel Function logs
   - Verify environment variables are available
   - Test API endpoints individually

### Support Resources:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Google Gemini API Documentation](https://ai.google.dev/docs)

## Security Considerations

- Never commit API keys to version control
- Use Vercel's secure environment variable storage
- Enable Vercel's security headers
- Monitor for unusual API usage patterns
- Regularly update dependencies for security patches