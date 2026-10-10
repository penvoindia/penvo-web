// Sample content for the design preview. Replace with approved client stories.
export const homeTestimonials = [
  {
    id: 'strategy',
    kind: 'quote',
    avatar: '/testimonials/avatar-strategy.webp',
    name: 'Client name',
    role: 'Founder',
    company: 'Company name',
    service: 'Brand Strategy',
    project: 'Brand foundations',
    quote: 'A brand that feels like us, and a clear direction forward.',
    description:
      'The team took the time to understand our business, challenge our assumptions, and find what makes us different. Every detail felt considered, from the first conversation to the final identity.   ',
  },
  {
    id: 'story',
    kind: 'video',
    avatar: '/testimonials/story-portrait.webp',
    poster: '/testimonials/story-portrait.webp',
    video: null as string | null,
    name: 'Client name',
    role: 'Founder · Brand & digital',
  },
  {
    id: 'digital',
    kind: 'quote',
    avatar: '/testimonials/avatar-digital.webp',
    name: 'Client name',
    role: 'Marketing lead',
    company: 'Company name',
    service: 'Web Design',
    project: 'Website launch',
    quote: 'Our new website brings the brand to life.',
    description:
      'The communication was clear, the process was collaborative, and the attention to detail showed in every screen. Our new website brings the brand to life and makes it easier for people to understand what we do.',
  },
  {
    id: 'growth',
    kind: 'quote',
    avatar: '/testimonials/avatar-growth.webp',
    name: 'Client name',
    role: 'Business owner',
    company: 'Company name',
    service: 'Digital Growth',
    project: 'Growth campaign',
    quote:
      'Fresh ideas, thoughtful execution, and a practical plan for growth.',
    description:
      'We wanted a partner who could connect the creative work with our wider business goals. The team brought fresh ideas, thoughtful execution, and a practical plan for moving forward.',
  },
] as const;
