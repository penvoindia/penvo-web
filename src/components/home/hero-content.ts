// Working Penvo copy. Particle groupings illustrate disciplines, not project data.
export const heroWords = ['Edge', 'Energy', 'Vision', 'Engine'] as const;

export const heroModes = [
  { id: 'flow', label: 'Free flow', groups: [] },
  {
    id: 'services',
    label: 'Services',
    groups: ['Strategy', 'Identity', 'Web design', 'Development', 'Growth'],
  },
  {
    id: 'process',
    label: 'Process',
    groups: ['Discover', 'Define', 'Create', 'Deliver'],
  },
  { id: 'focus', label: 'Focus', groups: ['Brand', 'Digital', 'Growth'] },
  { id: 'globe', label: 'Explore More', groups: [] },
] as const;

export type HeroMode = (typeof heroModes)[number]['id'];
