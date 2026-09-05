import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ArticleDetail from '../components/wiki/ArticleDetail';
import { Search, BookOpen, Brain, Zap, Shield, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'adhd', label: 'ADHD', icon: Brain },
  { id: 'autism', label: 'Autism', icon: Sparkles },
  { id: 'executive', label: 'Executive Function', icon: Zap },
  { id: 'burnout', label: 'Burnout', icon: Shield },
  { id: 'sensory', label: 'Sensory', icon: Heart },
  { id: 'regulation', label: 'Regulation First™', icon: Heart },
];

export const ARTICLES = [
  {
    id: 1, category: 'adhd', readTime: '5 min',
    title: 'Body Doubling: The ADHD Superpower You Haven\'t Tried',
    summary: 'Working alongside someone else — even virtually — dramatically improves focus for ADHD brains. Here\'s why it works and how to use it.',
    emoji: '👥',
    content: `## What is Body Doubling?
Body doubling is the practice of working in the presence of another person. For ADHD brains, the mere presence of another person activates a different level of focus and accountability.

## Why It Works
Your brain's dopamine system is highly responsive to social cues. When someone else is present — even silently — your nervous system perceives a mild social accountability that bypasses the usual executive function roadblocks.

Research shows that body doubling can increase task completion rates by up to 60% for people with ADHD.

## How to Use It as an Entrepreneur

**Virtual Body Doubling:**
- Use apps like Focusmate or virtual co-working spaces
- Schedule recurring 50-minute sessions with a business friend
- Join NeuroAligned's community working sessions (coming soon!)

**Solo Hacks:**
- Record yourself working and play back the audio
- Work on video calls with clients (low-stakes tasks)
- Use background café noise (brown noise works too)

**Structure Your Sessions:**
1. State your intention at the start ("I'm going to finish the proposal")
2. Work in silence
3. Report back at the end

## Quick Start
Tomorrow morning, message one person and say: "Want to do a 45-minute virtual work session?" That's it.`,
    tags: ['ADHD', 'Focus', 'Productivity'],
  },
  {
    id: 2, category: 'adhd', readTime: '4 min',
    title: 'Task Initiation: How to Start When Your Brain Won\'t',
    summary: 'The hardest part for ADHD entrepreneurs isn\'t doing the work — it\'s starting. These five strategies bypass the initiation block.',
    emoji: '🚀',
    content: `## The Initiation Problem
Task initiation is a core executive function challenge for ADHD brains. It's not laziness — it's a neurological barrier to starting tasks, especially when they feel overwhelming or boring.

## Why Starting is Hard
Your prefrontal cortex isn't generating enough dopamine signal to engage the task. You need a "spark" — novelty, urgency, challenge, or passion.

## 5 Strategies That Actually Work

**1. The 2-Minute Lie**
Tell yourself: "I'll just do this for 2 minutes." Your brain accepts low-stakes starts. Once you're in, you'll often continue.

**2. Make it Interesting First**
Add novelty: new coffee, new playlist, new location. Novelty boosts dopamine just enough to start.

**3. Shrink the Task**
"Write the report" is too big. "Type the first sentence" is not. Micro-tasks reduce the dopamine gap needed to begin.

**4. External Accountability**
Tell someone what you're starting, right now. Social stakes create urgency your brain responds to.

**5. Transition Rituals**
Same music, same drink, same spot = Pavlovian work trigger. Build a 5-minute ritual that always precedes deep work.

## Today's Action
Pick one task you've been avoiding. Apply the 2-Minute Lie to it within the next hour.`,
    tags: ['ADHD', 'Executive Function', 'Task Management'],
  },
  {
    id: 3, category: 'autism', readTime: '6 min',
    title: 'Sensory Environment Design for Autistic Entrepreneurs',
    summary: 'Your workspace is either working with your nervous system or against it. Design your sensory environment intentionally.',
    emoji: '🎨',
    content: `## Why Your Environment Matters More
Autistic nervous systems process sensory input differently — often more intensely. An environment that's "fine" for a neurotypical colleague may be genuinely dysregulating for you.

This isn't sensitivity to overcome. It's a design problem to solve.

## Sensory Categories to Audit

**Visual**
- Reduce visual clutter aggressively — clear desk, plain walls
- Consider warm vs cool lighting (many autistic people find cool fluorescent lights dysregulating)
- Try a single-focus monitor setup
- Use dark mode consistently

**Auditory**
- Identify your ideal sound environment: silence, white noise, specific music genres
- Invest in good noise-cancelling headphones — it's a medical device for your brain
- Create a "no meetings" audio buffer zone around deep work

**Tactile**
- Wear clothes you've already sensory-tested when working
- Keep fidget tools accessible (not hidden)
- Consider your chair, keyboard, mouse tactile experience

**Olfactory**
- Identify scents that regulate vs dysregulate you
- Use a consistent work scent as a focus anchor

## Creating a Regulation Workspace Protocol
1. Audit each sense this week
2. Identify your top 3 dysregulators
3. Eliminate or mitigate one per week

## Remote Work Advantage
You have more control over your environment than any office worker. Use it intentionally.`,
    tags: ['Autism', 'Sensory', 'Environment'],
  },
  {
    id: 4, category: 'executive', readTime: '5 min',
    title: 'The Executive Function Stack for Entrepreneurs',
    summary: 'Executive function isn\'t one thing — it\'s a stack of skills. Know which ones are hard for you and build systems around them.',
    emoji: '🧩',
    content: `## What Is Executive Function?
Executive function is a set of cognitive processes managed by the prefrontal cortex. Think of it as your brain's CEO — planning, organising, starting, stopping, and adapting.

For neurodivergent brains, this CEO is often unreliable, inconsistent, or takes long coffee breaks.

## The 8 Executive Functions

1. **Inhibition** — Stopping impulses (e.g., not checking phone)
2. **Working Memory** — Holding info while using it
3. **Cognitive Flexibility** — Switching between tasks/ideas
4. **Planning** — Breaking goals into steps
5. **Organisation** — Arranging info and space
6. **Time Management** — Perceiving and managing time
7. **Task Initiation** — Starting tasks
8. **Emotional Regulation** — Managing feelings to focus

## Building Systems for Each

**For Working Memory:** Externalise everything. Write it down immediately. Use voice memos. Assume your brain will drop it.

**For Time Management:** ADHD time blindness is real. Use timers, time-blocking, and visual clocks. Never trust "I'll remember when."

**For Planning:** Use the backward planning method — start from the deadline and work backwards in concrete steps.

**For Emotional Regulation:** Build a 3-minute regulation practice before difficult tasks. Your emotional state is prerequisite, not optional.

## Your Action
Identify your weakest 2 executive functions. Then design one external system for each — not willpower.`,
    tags: ['Executive Function', 'Systems', 'Planning'],
  },
  {
    id: 5, category: 'burnout', readTime: '7 min',
    title: 'Neurodivergent Burnout: What It Is and How to Recover',
    summary: 'ND burnout is different from regular stress. It can last months. Here\'s a real recovery framework — not toxic positivity.',
    emoji: '🌿',
    content: `## What Makes ND Burnout Different
Neurodivergent burnout is a state of chronic exhaustion caused by prolonged masking, sensory overload, and sustained effort to compensate for executive function differences.

Unlike regular burnout, ND burnout can persist for 3–6 months even with rest. It involves:
- Profound fatigue that doesn't respond to sleep
- Loss of previously managed skills (regression)
- Increased sensory sensitivity
- Emotional shutdown or meltdowns
- Loss of ability to mask

## The 3 Causes
1. **Masking** — Constantly suppressing autistic/ADHD traits to appear neurotypical
2. **Compensation effort** — Using 3× the mental energy to do "normal" things
3. **Sensory overload accumulation** — The cost builds without obvious symptoms until collapse

## The Recovery Framework

**Phase 1: Immediate (weeks 1–2)**
- Radical reduction in demands — cancel what you can
- Increase sensory-safe activities
- No new commitments
- Tell one trusted person what's happening

**Phase 2: Stabilisation (weeks 3–6)**
- Gradual, structured reintroduction of tasks
- Identify and reduce top masking triggers
- Sleep as the primary intervention
- Journaling burnout patterns

**Phase 3: Prevention (ongoing)**
- Design your business to require less masking
- Build regulation breaks into every working day
- Know your early warning signs personally

## Prevention Over Cure
The goal isn't to recover faster — it's to need to recover less. Use NeuroAligned's Burnout Risk dashboard as your early warning system.`,
    tags: ['Burnout', 'Recovery', 'Mental Health'],
  },
  {
    id: 6, category: 'burnout', readTime: '4 min',
    title: 'The Spoon Theory Guide for Business Planning',
    summary: 'Spoon theory isn\'t just a metaphor — it\'s a practical framework for neurodivergent capacity planning in your business.',
    emoji: '🥄',
    content: `## What Is Spoon Theory?
Spoon Theory, coined by Christine Miserandino, uses "spoons" as units of daily energy. Everyone starts with a limited number. Neurodivergent people often start with fewer and spend more per task.

## Applying It to Business

**Your Daily Spoon Budget**
On average days you might have 12 spoons. On bad sensory/ADHD days, maybe 6. Plan based on your minimum, not your best days.

**Spoon Costs by Task Type**
- Deep work / creative = 3–4 spoons
- Client calls = 2–3 spoons
- Admin / email = 1–2 spoons
- Masking-heavy networking = 4–5 spoons
- Social media = 1–2 spoons

**The ND Tax**
Add 1–2 extra spoons per task for the neurological overhead that others don't pay. This is real and not an excuse.

## Practical Application

**Weekly Planning:**
- Map your weekly spoon budget
- Schedule high-cost tasks in peak energy windows
- Build in "spoon savings days" (lighter days before intense ones)

**Client Management:**
- Price your spoon cost into your rates
- Design services that respect your capacity
- Say no to high-spoon, low-value work

## Your Homework
Track your spoon usage for 5 days. Notice patterns. Then redesign your week accordingly.`,
    tags: ['Burnout', 'Energy', 'Planning'],
  },
  {
    id: 7, category: 'sensory', readTime: '4 min',
    title: 'The Regulation Toolkit: 8 Techniques for Dysregulation',
    summary: 'When your nervous system spirals, you need tools that work in 5 minutes or less. This is your quick-reference guide.',
    emoji: '🧰',
    content: `## When to Use This Guide
You're dysregulated when: you feel overwhelmed, shut down, agitated, unable to think, or on the verge of a meltdown or shutdown.

This isn't weakness. It's your nervous system signalling that its limits have been exceeded.

## The Toolkit

**1. Cold Water (30 seconds)**
Splash cold water on your face or hold ice. Triggers the dive reflex — drops heart rate within 30 seconds.

**2. Box Breathing (4 minutes)**
Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat. Activates parasympathetic nervous system.

**3. 5-4-3-2-1 Grounding**
Name: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Interrupts the spiral.

**4. Bilateral Stimulation**
Tap alternating knees or shoulders. Borrowed from EMDR therapy. Calms the amygdala.

**5. Heavy Work / Proprioception**
Push against a wall, do push-ups, carry something heavy. Deep pressure regulates the nervous system.

**6. Safe Stimming**
If rocking, tapping, or other stims help — use them. They're not embarrassing. They're neurological regulation.

**7. Noise Exit**
Leave the stimulating environment. Even 5 minutes in a quiet bathroom counts.

**8. Scripted Phrase**
Prepare a sentence for dysregulated moments: "I need 10 minutes to regulate. I'll be back." Deliver it calmly.

## Build Your Personal Kit
Identify your top 3 techniques. Practice them when regulated so they're automatic when you're not.`,
    tags: ['Sensory', 'Regulation', 'Mental Health'],
  },
  {
    id: 9, category: 'regulation', readTime: '5 min',
    title: 'The Regulation First Framework™: Why Regulation Beats Productivity Hacks',
    summary: 'Most productivity systems fail neurodivergent entrepreneurs because they skip the foundational step: nervous system regulation. Here\'s what to do instead.',
    emoji: '🧬',
    content: `## Why Productivity Hacks Don't Work for ND Brains

You've tried time-blocking. You've tried Pomodoro. You've tried every planner. And yet — the moment your nervous system is dysregulated, none of it works.

That's not a personal failing. That's neuroscience.

## The Science of the Prefrontal Cortex

Your prefrontal cortex (PFC) is responsible for planning, focus, decision-making, and task initiation — the core executive functions every entrepreneur needs. But the PFC is also the first region to go offline when your nervous system enters a stress or threat state.

For neurodivergent people, the threshold for dysregulation is often lower, the recovery time is longer, and chronic masking creates a baseline state of cognitive tax that neurotypical productivity systems simply don't account for.

## The Regulation First Framework™

Developed in collaboration with **Amanda White** (mandawhite.com) — CPD Certified AI Consultant and neurodivergent entrepreneur — the Regulation First Framework™ flips the productivity script:

**1. Assess** your nervous system state before you open your task list.
**2. Regulate** if needed — regulation is your first task of the day.
**3. Match** your work to your actual current energy capacity.
**4. Build recovery** into your structure as a non-negotiable.
**5. Track** patterns without shame for long-term self-knowledge.

## How NeuroAligned Implements This

Every feature in NeuroAligned is built around this framework:
- **Brain Check-In** — assess before you plan
- **Energy Selector** — match work to capacity
- **Focus Modes** — work blocks designed around ND rhythms
- **Regulation Widget** — regulation tools always one tap away
- **Burnout Dashboard** — early warning before collapse

## Your Takeaway

Before you open your task list tomorrow morning, take 60 seconds to check in with your body. Are you regulated? If yes — great, proceed. If not — 5 minutes of regulation will return more productive output than forcing productivity from a dysregulated state.

Regulate first. Then create.`,
    tags: ['Regulation First', 'Framework', 'Neuroscience'],
  },
  {
    id: 10, category: 'regulation', readTime: '4 min',
    title: 'Morning Regulation Rituals for Neurodivergent Entrepreneurs',
    summary: 'The first 20 minutes of your morning can set your nervous system up for a productive day — or tank it. Build a regulation-first morning ritual.',
    emoji: '🌅',
    content: `## Why Mornings Matter More for ND Brains

For many neurodivergent entrepreneurs, mornings are the most vulnerable regulation window. Sleep inertia, cortisol spikes, and the sudden transition from rest to "being a human" can dysregulate your nervous system before you've opened a single app.

Most morning routines say: check your phone, read email, jump into work. The Regulation First Framework™ says: don't.

## A Regulation-First Morning Protocol

**Minutes 0–5: Sensory Soft Start**
Avoid screens. Drink water. Let your nervous system wake gently — not in a flood of notifications and decisions.

**Minutes 5–10: Body Check-In**
Before you plan your day, notice your body. Tight chest? Foggy head? Buzzing with anxiety? Name your state without judgment. This is the data your day should be built on.

**Minutes 10–15: One Regulating Practice**
Choose based on your state:
- Dysregulated/anxious: box breathing or cold water
- Low energy/shutdown: gentle movement, sunlight, music
- Neutral: journaling or gratitude practice

**Minutes 15–20: Set Your Intention (Not a Task List)**
One sentence: "Today I am focused on ___." Keep it macro. Not a to-do list — a direction.

## Then Open Your Task List

Now — and only now — you open NeuroAligned, set your energy level, and build your day from a regulated nervous system.

## Why This Works

You have just:
1. Given your PFC time to come online
2. Assessed your actual capacity for the day
3. Set a regulatory baseline before demands begin

This is not woo. This is neuroscience applied to business.`,
    tags: ['Regulation First', 'Morning Routine', 'Nervous System'],
  },
  {
    id: 8, category: 'adhd', readTime: '5 min',
    title: 'Time Blindness: Practical Fixes for the ADHD Entrepreneur',
    summary: 'ADHD time blindness is neurological, not a character flaw. Here are 10 external systems to compensate for a brain that doesn\'t feel time.',
    emoji: '⏰',
    content: `## What Is Time Blindness?
ADHD time blindness is the neurological inability to feel the passage of time. For neurotypical people, time feels linear. For ADHD brains, there are only two times: now and not now.

This isn't laziness or disorganisation. It's a dopamine-based difference in how your prefrontal cortex processes time.

## The Business Impact
- Missing deadlines despite genuinely trying
- Underestimating how long tasks take (planning fallacy × 3)
- Over-scheduling and letting people down
- Chronic lateness to calls and meetings

## 10 External Systems That Help

1. **Time Timer app** — Visual countdown that shows time disappearing
2. **Analog clock on desk** — More intuitive than digital
3. **Transition alarms** — Set alarms 15min before every commitment
4. **Time audits** — Track actual time spent for 2 weeks. Reality-test your estimates.
5. **Pomodoro with physical timer** — External, not digital
6. **Time blocking with buffer** — Add 25% extra time to every estimate
7. **"Time anchors"** — Fix consistent daily events (lunch, end of day) that orient your time sense
8. **Visible calendar** — Paper calendar on the wall, not buried in an app
9. **Body doubling for deadlines** — Work beside someone when a deadline is close
10. **Accountability partner** — Weekly check-in on time commitments

## The Mindset Shift
Stop trying to feel time. Build external systems that make time visible, audible, and felt. Compensate, don't fight.`,
    tags: ['ADHD', 'Time Management', 'Systems'],
  },
];

export default function KnowledgeBase() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  // Selected article lives in the URL (?article=id) so back-swipe closes it
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedArticle = ARTICLES.find(a => String(a.id) === searchParams.get('article')) || null;

  const filtered = useMemo(() => {
    return ARTICLES.filter(a => {
      const matchesCat = category === 'all' || a.category === category;
      const q = search.toLowerCase();
      const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto pb-mobile-safe md:pb-0 pt-[env(safe-area-inset-top)]">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Header */}
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Knowledge Base</h1>
            <p className="text-sm text-muted-foreground mt-1">Guides and strategies written for neurodivergent brains — by Amanda White & the NeuroAligned team.</p>
            <a href="/regulation-first" className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary font-semibold hover:underline">
              🧬 Learn about the Regulation First Framework™ →
            </a>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search articles, strategies, topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  category === cat.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/30 bg-card'
                }`}
              >
                <cat.icon className="w-3 h-3" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Articles grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No articles match your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((article, i) => (
                <motion.button
                  key={article.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSearchParams({ article: String(article.id) })}
                  className="text-left bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-2xl">{article.emoji}</span>
                    <span className="text-xs text-muted-foreground">{article.readTime} read</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{article.summary}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {article.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedArticle && (
          <ArticleDetail article={selectedArticle} onClose={() => setSearchParams({}, { replace: true })} />
        )}
      </AnimatePresence>
    </div>
  );
}