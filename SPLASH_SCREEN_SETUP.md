# Splash Screen Setup Guide

## Overview
The splash screen is the first thing users see when they open your Cosmic Whiskers game post on Reddit. It creates a great first impression!

## Current Configuration

The splash screen is configured in `src/server/core/post.ts`:

```typescript
splash: {
  appDisplayName: 'Cosmic Whiskers',
  backgroundUri: 'splash-background.png',
  buttonLabel: '🚀 Start Adventure',
  description: 'Help Luna the space cat find her family! Navigate through cosmic rings in this purr-fect space odyssey.',
  entryUri: 'index.html',
  heading: 'Cosmic Whiskers',
  appIconUri: 'app-icon.png',
}
```

## Required Images

### 1. Splash Background (`splash-background.png`)
- **Size:** 1200x1600px (portrait orientation)
- **Location:** `cosmic-whiskers/assets/splash-background.png`
- **Purpose:** Full-screen background image
- **Design:** Epic space scene with Luna floating in cosmos
- **Note:** Bottom 400px should be darker for text readability

### 2. App Icon (`app-icon.png`)
- **Size:** 512x512px (square)
- **Location:** `cosmic-whiskers/assets/app-icon.png`
- **Purpose:** App icon displayed on splash screen
- **Design:** Close-up of Luna in space helmet
- **Note:** Must be clear at small sizes

## How to Generate Images

1. Open `CHATGPT_IMAGE_PROMPTS.txt`
2. Copy the "SPLASH SCREEN BACKGROUND IMAGE PROMPT"
3. Paste into ChatGPT with DALL-E or another AI image generator
4. Download the generated image
5. Rename to `splash-background.png`
6. Repeat for "APP ICON IMAGE PROMPT" → `app-icon.png`
7. Place both images in the `assets/` folder

## Image Specifications

### Splash Background
- Format: PNG
- Dimensions: 1200x1600px
- Orientation: Portrait (vertical)
- Content: Cinematic space scene with Luna
- Text area: Bottom 400px should be less busy

### App Icon
- Format: PNG
- Dimensions: 512x512px
- Orientation: Square
- Content: Luna's face in space helmet
- Style: Bold, high contrast, recognizable at small sizes

## Testing

After adding the images:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Reddit:
   ```bash
   npm run deploy
   ```

3. Create a new post in your test subreddit
4. The splash screen should appear before the game loads

## Customization

You can customize the splash screen text in `src/server/core/post.ts`:

- `appDisplayName`: App name shown on splash
- `heading`: Main heading text
- `description`: Description text below heading
- `buttonLabel`: Text on the start button
- `backgroundUri`: Path to background image
- `appIconUri`: Path to app icon

## Tips

- Keep the description concise (1-2 sentences)
- Use emojis sparingly in button label
- Ensure images are optimized for web (compressed but high quality)
- Test on both mobile and desktop
- The splash screen appears while the game loads, so it should be engaging!

## Troubleshooting

**Images not showing:**
- Check that images are in the `assets/` folder
- Verify file names match exactly (case-sensitive)
- Rebuild and redeploy the app
- Check browser console for 404 errors

**Splash screen not appearing:**
- Ensure you're creating a new post (not opening an existing one)
- Check that the splash configuration is in the `submitCustomPost` call
- Verify the app is properly deployed

## Resources

- [Devvit Splash Screen Documentation](https://developers.reddit.com/docs/capabilities/server/splash-screen)
- Image generation prompts: `CHATGPT_IMAGE_PROMPTS.txt`
- Post creation code: `src/server/core/post.ts`
