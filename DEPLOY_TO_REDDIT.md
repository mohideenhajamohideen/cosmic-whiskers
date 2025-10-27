# 🚀 Deploy Cosmic Whiskers to Reddit

## Your App Configuration

**App Name:** `cosmic-whiskrs`  
**App URL:** https://developers.reddit.com/apps/cosmic-whiskrs  
**Dev Subreddit:** r/cosmic_whskrs_dev

---

## Quick Deploy

```bash
# 1. Make sure you're logged in
npm run login

# 2. Build and deploy
npm run deploy
```

That's it! Your code will be uploaded to the "cosmic-whiskrs" app on Reddit.

---

## Step-by-Step Instructions

### 1. Login to Devvit

```bash
npm run login
```

This opens a browser to authenticate with Reddit.

### 2. Deploy Your App

```bash
npm run deploy
```

This will:
- Build your app (client + server)
- Upload to Reddit
- Update the "cosmic-whiskrs" app

### 3. Verify Deployment

Go to: https://developers.reddit.com/apps/cosmic-whiskrs

You should see your app with the latest version!

---

## Install in Subreddit

### Option 1: Create a New Subreddit

1. Go to: https://www.reddit.com/subreddits/create
2. Name: `cosmic_whskrs` (or any name you prefer)
3. Title: "Cosmic Whiskers - A Purr-fect Space Odyssey"
4. Type: Public
5. Create subreddit

### Option 2: Use Existing Subreddit

Use any subreddit where you're a moderator.

### Install the App

1. Go to: https://developers.reddit.com/apps/cosmic-whiskrs
2. Click "Install"
3. Select your subreddit
4. Confirm installation

---

## Create Demo Post

After installation, the app should auto-create a post. If not:

1. Go to your subreddit
2. Look for mod menu
3. Find "Create a new Cosmic Whiskers post"
4. Click to create

Or the app will create one automatically via the `onAppInstall` trigger.

---

## Testing During Development

```bash
# Start dev server with live reload
npm run dev
```

This gives you a playtest URL:
```
https://developers.reddit.com/r/cosmic_whskrs_dev/playtest/cosmic-whiskrs
```

---

## Troubleshooting

### "App not found" error

Make sure the name in `devvit.json` matches your Reddit app:
```json
{
  "name": "cosmic-whiskrs"
}
```

### Build errors

```bash
# Clean build
rm -rf dist
npm run build
```

### Not logged in

```bash
npm run login
```

### Changes not showing

1. Make sure you deployed: `npm run deploy`
2. Refresh the Reddit page
3. Try in incognito mode (clear cache)

---

## Update Workflow

When you make changes:

```bash
# 1. Make your code changes
# 2. Test locally
npm run dev

# 3. Deploy to Reddit
npm run deploy

# 4. Refresh your Reddit post to see changes
```

---

## Important Notes

- **App name:** Must match exactly: `cosmic-whiskrs`
- **Subreddit:** Can be any name, doesn't have to match app name
- **Public subreddit:** Required for hackathon demo (or use dr-admin-approve)
- **Under 200 members:** Hackathon requirement

---

## For Hackathon Submission

You'll need:

1. **App Listing URL:**
   - https://developers.reddit.com/apps/cosmic-whiskrs

2. **Demo Post URL:**
   - https://www.reddit.com/r/YOUR_SUBREDDIT/comments/POST_ID/

3. **Subreddit URL:**
   - https://www.reddit.com/r/YOUR_SUBREDDIT/

---

**Ready to deploy?**

```bash
npm run deploy
```

🚀😸✨
