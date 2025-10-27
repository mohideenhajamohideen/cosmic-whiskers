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
      backgroundUri: 'default-splash.png',
      buttonLabel: '🚀 START ADVENTURE 🚀',
      description: 'A purr-fect space odyssey! Guide Luna the space cat through cosmic rings.',
      entryUri: 'index.html',
      heading: '😸✨ COSMIC WHISKERS - Space Adventure! ✨😸',
      appIconUri: 'default-icon.png',
    },
    postData: {
      battleId: '',
      theme: 'Space Adventure',
    },
    subredditName: subredditName,
    title: '🚀 COSMIC WHISKERS - A Purr-fect Space Odyssey! Guide Luna through the cosmos! 😸✨',
  });
};
