# Cosmic Whiskers - Project About

## Inspiration

Reddit is all about community—those moments when everyone rallies around something simple but delightful. We wanted to capture that feeling in a game.

The idea of a space cat searching for her family just clicked. It's whimsical, universal, and honestly, who doesn't love cats? Everyone understands wanting to find your way home. We took the classic tap-to-flap mechanic and wrapped it in Luna's story, adding progression and unlockable themes to keep it fresh. The goal was simple: make something easy to pick up but emotionally rewarding to complete, built specifically for Reddit's community-first culture.

## What it does

You guide Luna, a space cat (😸), through glowing cosmic rings across five unique environments. Tap to flap, avoid obstacles, unlock new themes. Simple mechanics, but there's a story underneath—Luna's searching for her family across the cosmos.

What makes it Reddit-y: real-time leaderboards show how you stack up against your subreddit, community milestones track everyone's collective progress, and your Reddit username is front and center. Beat a high score? Confetti celebration and instant sharing to Reddit. The whole thing runs in Reddit posts via Devvit Web—no downloads, no external links.

Five themes tell Luna's journey: from Nebula Drift's mystical purples to Home World where she finally reunites with her family. Each has unique visuals, particle effects, planets, satellites, and story cutscenes. The progression system works for casual players and competitive ones alike.

## How we built it

We went all-in on Kiro AI's spec-driven workflow. Started with detailed requirements (using EARS patterns for clarity), then design docs, then granular tasks. This upfront work paid off massively—Kiro generated about 80% of our boilerplate code. Game engine, rendering pipeline, physics, API integrations... stuff that normally takes weeks was done in days.

Tech stack: React 19, TypeScript, Canvas API for rendering, Web Audio API for sound. The architecture is modular—separate systems for physics, collisions, rings, themes, input. We built it so these patterns could be reused for any 2D game on Devvit.

The Kiro workflow kept everything organized. Each task built on the previous one, no orphaned code, always had working builds. The AI understood our project context and maintained consistent patterns throughout. Honestly, it changed how we think about development.

Reddit integration uses Devvit's Redis API for storage, context API for user data, and custom post handlers. Backend Express server handles leaderboards and stats, frontend React delivers 60 FPS gameplay with all the visual polish.

## Challenges we ran into

**Making it feel like a Reddit game:** Early versions were just a single-player game that happened to run on Reddit. We needed real community hooks. Adding leaderboards, community milestones, and Reddit usernames helped, but the breakthrough was confetti celebrations and instant sharing. Suddenly it felt like a community event.

**Mobile responsiveness:** Touch controls are hard. Too sensitive and it's unplayable, too sluggish and it feels broken. We iterated a lot on touch handling, canvas scaling, and UI layout to work across devices and orientations.

**Performance:** Rendering particles, parallax backgrounds, planets, and smooth animations at 60 FPS inside a Reddit post is demanding. Object pooling, efficient canvas operations, and careful state management got us there. Now it runs smoothly even on mid-range phones.

**Progression balance:** Finding the right unlock thresholds took playtesting. Too easy and themes feel meaningless, too hard and people quit. We landed on 10, 20, 30, 40, 50 rings—feels achievable but rewarding.

**Learning Kiro:** There was a learning curve. We figured out that detailed specs upfront = better code generation, granular tasks = higher accuracy, and maintaining context = crucial. By the end, we were generating complex features in minutes.

## Accomplishments that we're proud of

**The Kiro workflow actually works:** We built a production-ready game using spec-driven development that cut our dev time by 86%. The `.kiro/specs/` directory has everything—requirements, design docs, task breakdowns—and it all served as living documentation. This feels like the future of development.

**It's genuinely community-focused:** We turned a simple arcade game into a Reddit experience. Leaderboards, community milestones, username integration, social sharing—when someone beats a high score, the whole subreddit sees it. When the community hits 10,000 rings together, everyone celebrates.

**Technical polish:** Consistent 60 FPS with particle effects, spatial audio, parallax scrolling, smooth animations. Multiple visual layers (stars, nebulas, planets, satellites, rings, particles) without performance hits. The physics feel natural, controls are responsive, effects are satisfying.

**The story matters:** Luna's journey from lost in space to reuniting with her family creates real emotional investment. People tell us they unlock themes not just for variety, but to see what happens next.

**Built to be reused:** The architecture is modular. Any developer could take our game engine and build something different with it. That's the power of Kiro-assisted development—high-quality, maintainable code that becomes a foundation.

**Works for everyone:** Seamless across devices, input methods, and skill levels. Casual players can experience the full story, competitive players can chase leaderboards.

## What we learned

**AI development is different:** Kiro didn't just speed things up—it changed how we build software. Starting with detailed specs and letting AI handle boilerplate meant we spent time on creative decisions instead of repetitive coding. That 80% reduction freed us to focus on game feel and polish.

**Specs aren't busywork:** The requirements and design docs became our source of truth. Need to understand a feature? Check the specs. Want to add something new? Update specs first. This discipline made the code better and more maintainable.

**Community features are everything:** Our first version was technically solid but soulless. Leaderboards, milestones, and Reddit integration transformed it from "a game on Reddit" to "a Reddit game." Social features aren't optional—they're the point.

**Small tasks = less risk:** Breaking features into small chunks meant we always had working code. No "big bang integration" disasters. Each task built on the last, and we could playtest constantly.

**Performance = engagement:** Players forgive bugs, but not lag. Smooth 60 FPS gameplay is why people keep coming back. The optimization work was worth it.

**Story elevates mechanics:** Tap-to-flap is ancient, but Luna's journey makes it feel fresh. Players aren't chasing scores—they're helping a lost cat find her family. Context transforms repetition into meaning.

**Devvit Web is powerful:** Building in Reddit posts opens wild possibilities. Redis, user context, post handlers—everything you need for multiplayer. The constraints actually forced better design.

## What's next for Cosmic Whiskers

**Multiplayer races:** Real-time competition on the same seed with ghost trails and live position updates. Perfect for community events.

**Daily challenges:** New challenge every 24 hours with special modifiers. Compete for daily leaderboard spots and create daily discussion threads.

**Custom skins:** Unlock different cats, jetpacks, and ring styles. Reddit-themed options like Snoo cat and upvote rings. Let subreddit mods create custom skins for their communities.

**Tournaments:** Structured competitions with brackets and prizes. Subreddits could host weekly tournaments with special flairs for winners.

**Power-ups:** Shields, magnets, slow-motion. Add strategic depth while keeping the core simple.

**More story:** Expand beyond five themes with Luna's family adventures. Let the community vote on new environments.

**Global leaderboards:** Cross-subreddit rankings alongside local ones. Platform-wide competition.

**Better accessibility:** Colorblind modes, adjustable difficulty, assist features. Make sure everyone can enjoy Luna's journey.

**Community rewards:** When a subreddit hits major milestones (100k rings, 1k players), unlock exclusive themes for that community.

---

Luna's journey is just beginning. We're excited to see where the Reddit community takes it. 🚀😸✨
