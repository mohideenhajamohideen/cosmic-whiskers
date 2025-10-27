# 🚀 Cosmic Whiskers - Deployment Guide

## Prerequisites

- Reddit account
- Devvit CLI installed
- Node.js 18+ installed

## Step 1: Login to Devvit

```bash
npm run login
```

This will open a browser window to authenticate with Reddit.

## Step 2: Deploy to Reddit

```bash
npm run deploy
```

This will:
- Build your app
- Upload it to Reddit's Developer Platform
- Make it available for installation

## Step 3: Create Your Subreddit

1. Go to: https://www.reddit.com/subreddits/create
2. Fill in:
   - **Name:** `cosmic_whiskers`
   - **Title:** "Cosmic Whiskers - A Purr-fect Space Odyssey"
   - **Description:** "Guide Luna the space cat through cosmic rings!"
   - **Type:** Public
   - **18+ Content:** No

## Step 4: Install App in Subreddit

1. Go to: https://developers.reddit.com/apps
2. Find "cosmic-whiskers" (or your app name)
3. Click "Install"
4. Select your subreddit (`r/cosmic_whiskers`)
5. Confirm installation

## Step 5: Create Demo Post

The app should auto-create a post, or:

1. Go to your subreddit
2. Look for "Create Post" with Cosmic Whiskers option
3. Or use the app's menu to create a post

## Step 6: Test Your Game

1. Visit the post in your subreddit
2. Test on desktop and mobile
3. Verify all features work:
   - Tap to start
   - Flapping mechanics
   - Collision detection
   - Theme progression
   - Score tracking

## Step 7: Get Your Links

For hackathon submission, you need:

1. **App Listing URL:**
   - Format: `https://developers.reddit.com/apps/cosmic-whiskers`

2. **Demo Post URL:**
   - Format: `https://www.reddit.com/r/cosmic_whiskers/comments/[post_id]/`

3. **Subreddit URL:**
   - Format: `https://www.reddit.com/r/cosmic_whiskers/`

## Development Commands

```bash
# Start dev server with live reload
npm run dev

# Build only (no deploy)
npm run build

# Type check
npm run type-check

# Lint and fix
npm run lint:fix

# Full publish (build + deploy + publish)
npm run launch
```

## Troubleshooting

### "Not logged in" error
```bash
npm run login
```

### Build errors
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### App not showing in subreddit
- Make sure app is installed in the subreddit
- Check that subreddit is public
- Try refreshing the page

### Playtest not working
```bash
# Make sure dev server is running
npm run dev
# Then visit the playtest URL shown in terminal
```

## Important Notes

- **Subreddit must be public** for hackathon demo
- **Keep under 200 members** as per hackathon rules
- **Test on mobile** - most Reddit users are on mobile
- **Take screenshots** for your submission

## Next Steps After Deployment

1. ✅ Test the game thoroughly
2. ✅ Take screenshots for submission
3. ✅ Record demo video (< 3 minutes)
4. ✅ Update README with actual links
5. ✅ Submit to Devpost

---

**Need help?** Check the Devvit Discord: https://discord.com/invite/Cd43ExtEFS
