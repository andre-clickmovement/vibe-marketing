// ─── Skill Registry ───
export const SKILLS = [
  {
    id: 'brand-voice',
    name: 'Brand Voice',
    layer: 'foundation',
    shortLabel: 'BV',
    tagline: 'Extract or build your voice profile',
    description:
      'Analyzes your content samples, website, or answers to build a voice profile that makes every piece of content sound like you.',
    time: '10–15 min',
    produces: 'voice-profile.md',
    brandKey: 'voiceProfile',
    needs: [],
    quickPrompts: [
      'Build my voice profile from my website',
      'Extract my brand voice from these content samples',
      'I want a conversational but authoritative tone',
    ],
  },
  {
    id: 'positioning-angles',
    name: 'Positioning & Angles',
    layer: 'foundation',
    shortLabel: 'PA',
    tagline: 'Find the angle that makes your offer stand out',
    description:
      'Performs competitive analysis, maps saturated vs. white-space claims, and generates 8 angle types using Schwartz, Dunford, and Hormozi frameworks.',
    time: '10–15 min',
    produces: 'positioning.md',
    brandKey: 'positioning',
    needs: [],
    quickPrompts: [
      'Find my competitive angle',
      'What positioning is untapped in my market?',
      'Generate a 12-ad testing matrix',
    ],
  },
  {
    id: 'keyword-research',
    name: 'Keyword Research',
    layer: 'strategy',
    shortLabel: 'KR',
    tagline: 'Data-backed keyword clusters and priorities',
    description:
      'Maps your content territory using the 6-Circles Method — search volume, difficulty, intent classification, and content gap analysis.',
    time: '15–20 min',
    produces: 'keyword-plan.md',
    brandKey: 'keywordPlan',
    needs: ['positioning'],
    quickPrompts: [
      'Map my keyword territory',
      'Find low-competition keywords I can rank for',
      'Build a content calendar from keyword clusters',
    ],
  },
  {
    id: 'lead-magnet',
    name: 'Lead Magnet',
    layer: 'strategy',
    shortLabel: 'LM',
    tagline: 'Concept + build list-growing assets',
    description:
      'Generates lead magnet concepts grounded in competitive research, then builds the actual content — checklists, templates, quizzes, guides.',
    time: '15–25 min',
    produces: 'lead magnet content',
    needs: ['voiceProfile', 'positioning'],
    quickPrompts: [
      'Create a lead magnet for my business',
      'Build a quiz that qualifies leads',
      'What format works best for my audience?',
    ],
  },
  {
    id: 'direct-response-copy',
    name: 'Direct Response Copy',
    layer: 'execution',
    shortLabel: 'DR',
    tagline: 'Landing pages, sales copy, headlines that convert',
    description:
      'Embeds Schwartz, Hopkins, Ogilvy, Halbert, Caples, Sugarman, and Collier methodologies. 7-dimension scoring, variant generation, AI-tell detection.',
    time: '15–30 min',
    produces: 'copy variants',
    needs: ['voiceProfile', 'positioning'],
    quickPrompts: [
      'Write a landing page for my product',
      'Generate 10 headline variants',
      'Write a sales page with proof stacking',
    ],
  },
  {
    id: 'seo-content',
    name: 'SEO Content',
    layer: 'execution',
    shortLabel: 'SEO',
    tagline: 'Long-form articles that rank and read like a human wrote them',
    description:
      'Live SERP analysis, People Also Ask coverage, E-E-A-T optimization, schema markup generation, and content refresh mode.',
    time: '20–30 min',
    produces: 'article + schema',
    needs: ['voiceProfile', 'keywordPlan'],
    quickPrompts: [
      'Write a blog post targeting [keyword]',
      'Refresh my existing article for [keyword]',
      'Create a pillar page on [topic]',
    ],
  },
  {
    id: 'email-sequences',
    name: 'Email Sequences',
    layer: 'execution',
    shortLabel: 'ES',
    tagline: 'Welcome, nurture, launch, and re-engagement flows',
    description:
      'Builds 6 sequence types with subject line variants, send timing, and optional ESP integration for Mailchimp, ConvertKit, or HubSpot.',
    time: '15–25 min',
    produces: 'email sequence',
    needs: ['voiceProfile', 'positioning'],
    quickPrompts: [
      'Build a 5-email welcome sequence',
      'Create a product launch sequence',
      'Write a re-engagement flow for cold subscribers',
    ],
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    layer: 'execution',
    shortLabel: 'NL',
    tagline: 'Newsletter editions modeled on top creators',
    description:
      '6 newsletter archetypes with format templates, growth strategy, and edition planning based on your voice and audience.',
    time: '15–20 min',
    produces: 'newsletter edition',
    needs: ['voiceProfile'],
    quickPrompts: [
      'Design my newsletter format',
      'Write this week\'s edition about [topic]',
      'Create a newsletter growth plan',
    ],
  },
  {
    id: 'creative',
    name: 'Creative Engine',
    layer: 'execution',
    shortLabel: 'CE',
    tagline: 'AI image, video, ads, and graphics',
    description:
      '5 production modes: Product Photo, Product Video, Social Graphics, Talking Head, and Ad Creative. Uses Replicate API or generates prompts.',
    time: '10–20 min',
    produces: 'creative assets',
    needs: ['voiceProfile', 'positioning'],
    quickPrompts: [
      'Create product photography for my brand',
      'Generate social media graphics',
      'Build an ad creative testing matrix',
    ],
  },
  {
    id: 'content-atomizer',
    name: 'Content Atomizer',
    layer: 'distribution',
    shortLabel: 'CA',
    tagline: 'One piece to 8 platforms',
    description:
      'Repurposes any content into platform-optimized posts for LinkedIn, Twitter/X, Instagram, TikTok, YouTube, Facebook, email, and blog.',
    time: '10–15 min',
    produces: 'platform posts',
    needs: ['voiceProfile'],
    quickPrompts: [
      'Repurpose my latest blog post across platforms',
      'Turn this article into a LinkedIn thread',
      'Create a week of social content from this piece',
    ],
  },
];

// ─── Pre-built Workflows ───
export const WORKFLOWS = [
  {
    id: 'from-zero',
    name: 'Starting from Zero',
    description: 'Build your brand foundation from scratch',
    trigger: 'First-time setup',
    steps: ['brand-voice', 'positioning-angles'],
    time: '20–30 min',
  },
  {
    id: 'new-idea',
    name: 'I Have an Idea',
    description: 'Take a product idea to market-ready copy',
    trigger: '"Launch this" / "New product"',
    steps: ['positioning-angles', 'direct-response-copy', 'lead-magnet'],
    time: '45–60 min',
  },
  {
    id: 'need-leads',
    name: 'I Need Leads',
    description: 'Build a complete lead generation funnel',
    trigger: '"Build my list" / "Lead magnet funnel"',
    steps: ['lead-magnet', 'direct-response-copy', 'email-sequences', 'content-atomizer'],
    time: '60–90 min',
  },
  {
    id: 'content-strategy',
    name: 'Content Strategy',
    description: 'Plan and execute a content system',
    trigger: '"Content plan" / "What should I write"',
    steps: ['keyword-research', 'seo-content', 'content-atomizer', 'newsletter'],
    time: '60–90 min',
  },
  {
    id: 'launch',
    name: 'Launch Campaign',
    description: 'Full product launch across all channels',
    trigger: '"Product launch" / "Launch campaign"',
    steps: [
      'positioning-angles',
      'direct-response-copy',
      'email-sequences',
      'content-atomizer',
      'creative',
    ],
    time: '90–120 min',
  },
  {
    id: 'newsletter-start',
    name: 'Start a Newsletter',
    description: 'Design and launch your newsletter',
    trigger: '"Newsletter" / "Weekly email"',
    steps: ['newsletter'],
    time: '15–20 min',
  },
];

// ─── Layer Metadata ───
export const LAYER_META = {
  foundation: { label: 'Foundation', color: '#E8B931', order: 0 },
  strategy: { label: 'Strategy', color: '#4ECDC4', order: 1 },
  execution: { label: 'Execution', color: '#7C6FE0', order: 2 },
  distribution: { label: 'Distribution', color: '#FF6B6B', order: 3 },
};

// ─── Goals ───
export const GOALS = [
  { id: 'build-audience', label: 'Build Audience', desc: 'Grow your list and following from scratch' },
  { id: 'launch-product', label: 'Launch Product', desc: 'Take something new to market' },
  { id: 'grow-revenue', label: 'Grow Revenue', desc: 'Increase sales from existing audience' },
  { id: 'content-system', label: 'Create Content System', desc: 'Build a repeatable content machine' },
];

// ─── Helpers ───
export const getSkillById = (id) => SKILLS.find((s) => s.id === id);
