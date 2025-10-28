import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: 'Cosmic Whiskers',
      backgroundUri: 'splash-background.png', // Place your custom splash image in assets/
      buttonLabel: '🚀 Start Adventure',
      description: 'Help Luna the space cat find her family! Navigate through cosmic rings in this purr-fect space odyssey.',
      entryUri: 'index.html',
      heading: 'Cosmic Whiskers',
      appIconUri: 'app-icon.png', // Place your app icon in assets/
    },
    postData: {
      battleId: '',
      theme: 'Space Adventure',
    },
    subredditName: subredditName,
    title: '🐱 Cosmic Whiskers - Help Luna Find Her Family! 🌌',
  });
};
