import type { Metadata } from 'next';

import { Button } from '@/src/components/ui/Button';

import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Penvo Design Guide',
  description: 'A temporary reference screen for the Penvo design foundations.',
};

const breakpoints = [
  { name: 'Mobile', range: '0–767px' },
  { name: 'Tablet portrait', range: '768–1023px' },
  { name: 'Tablet landscape', range: '1024–1279px' },
  { name: 'Desktop', range: '1280px and above' },
] as const;

const layoutGuide = [
  { label: 'Maximum frame', value: '1700px' },
  { label: 'Outer gutter', value: '20–64px · desktop 50px' },
  { label: 'Responsive grid', value: '4 · 8 · 12 · 12' },
  { label: 'Grid gap', value: '16 · 20 · 24 · 32px' },
] as const;

const typography = [
  { role: 'Display mega', className: 'type-display-mega', sample: 'Penvo' },
  {
    role: 'Display giant',
    className: 'type-display-giant',
    sample: 'Creative',
  },
  {
    role: 'Display huge',
    className: 'type-display-huge',
    sample: 'Digital craft',
  },
  {
    role: 'Section title',
    className: 'type-section-title',
    sample: 'Ideas built clearly',
  },
  {
    role: 'Heading 1',
    className: 'type-heading-1',
    sample: 'A clear visual hierarchy',
  },
  {
    role: 'Heading 2',
    className: 'type-heading-2',
    sample: 'Designed to scale',
  },
  { role: 'Heading 3', className: 'type-heading-3', sample: 'Primary heading' },
  {
    role: 'Heading 4',
    className: 'type-heading-4',
    sample: 'Supporting heading',
  },
  { role: 'Heading 5', className: 'type-heading-5', sample: 'Compact heading' },
  { role: 'Heading 6', className: 'type-heading-6', sample: 'Small heading' },
  {
    role: 'Lead',
    className: 'type-lead',
    sample:
      'Hanken Grotesk carries longer introductions with a calm, readable rhythm.',
  },
  {
    role: 'Body large',
    className: 'type-body-large',
    sample: 'Penvo is a creative and digital agency based in Kerala.',
  },
  {
    role: 'Body',
    className: 'type-body',
    sample:
      'The body style is the default choice for clear, comfortable reading.',
  },
  {
    role: 'Body small',
    className: 'type-body-small',
    sample: 'Use this supporting size for secondary details and short notes.',
  },
  {
    role: 'Caption',
    className: 'type-caption',
    sample: 'Caption text and supporting metadata',
  },
  { role: 'Eyebrow', className: 'type-eyebrow', sample: 'Creative agency' },
  { role: 'Label', className: 'type-label', sample: 'Project category' },
  { role: 'Button', className: 'type-button', sample: 'View project' },
  {
    role: 'Navigation',
    className: 'type-navigation',
    sample: 'Work / About / Contact',
  },
  { role: 'Micro', className: 'type-micro', sample: 'Version 01' },
] as const;

const palette = [
  {
    name: 'Bright Orange',
    hex: '#FF400C',
    role: 'Primary',
    token: '--color-bright-orange',
    tone: 'dark',
  },
  {
    name: 'Pink Affair',
    hex: '#FFEFE8',
    role: 'Accent',
    token: '--color-pink-affair',
    tone: 'dark',
  },
  {
    name: 'Full White',
    hex: '#FFFFFF',
    role: 'Foundation',
    token: '--color-full-white',
    tone: 'dark',
  },
  {
    name: 'Concrete',
    hex: '#F2F2F2',
    role: 'Secondary',
    token: '--color-concrete',
    tone: 'dark',
  },
  {
    name: 'Smooth Grey',
    hex: '#CCCCCC',
    role: 'Secondary',
    token: '--color-smooth-grey',
    tone: 'dark',
  },
  {
    name: 'Super Grey',
    hex: '#999999',
    role: 'Secondary',
    token: '--color-super-grey',
    tone: 'dark',
  },
  {
    name: 'Attractive Black',
    hex: '#222222',
    role: 'Foundation',
    token: '--color-attractive-black',
    tone: 'light',
  },
  {
    name: 'Pure Black',
    hex: '#000000',
    role: 'Primary',
    token: '--color-pure-black',
    tone: 'light',
  },
] as const;

export default function DesignGuidePage() {
  return (
    <main className={`${styles.page} layout-viewport`}>
      <div className="layout-container">
        <header className={styles.masthead}>
          <p className="type-heading-5">Penvo.</p>
          <p className={`${styles.muted} type-label`}>
            Temporary design guide · v0.1
          </p>
        </header>

        <section
          className={`${styles.intro} layout-section`}
          aria-labelledby="guide-title"
        >
          <p className={`${styles.accent} type-eyebrow`}>Design foundations</p>
          <h1 className="type-display-huge" id="guide-title">
            Typography &amp; colour.
          </h1>
          <p className={`${styles.introCopy} type-lead`}>
            A simple working reference for the systems currently available in
            the Penvo website.
          </p>
        </section>

        <section
          className={`${styles.section} layout-section`}
          aria-labelledby="fonts-title"
        >
          <div className={`${styles.sectionHeader} layout-grid`}>
            <p className={`${styles.muted} type-label`}>01 / Fonts</p>
            <h2 className="type-heading-2" id="fonts-title">
              Font families
            </h2>
          </div>

          <div className={styles.fontGrid}>
            <article className={styles.fontSpecimen}>
              <div className={styles.specimenMeta}>
                <p className="type-label">Primary</p>
                <p className={`${styles.muted} type-body-small`}>
                  Display · headings · interface
                </p>
              </div>
              <p
                className={`${styles.primaryGlyph} type-heading-1`}
                aria-hidden="true"
              >
                Aa
              </p>
              <h3 className="type-heading-3">Bricolage Grotesque</h3>
              <p className={`${styles.alphabetPrimary} type-body-small`}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
                <br />
                abcdefghijklmnopqrstuvwxyz 0123456789
              </p>
            </article>

            <article className={styles.fontSpecimen}>
              <div className={styles.specimenMeta}>
                <p className="type-label">Secondary</p>
                <p className={`${styles.muted} type-body-small`}>
                  Reading · supporting content
                </p>
              </div>
              <p className={styles.secondaryGlyph} aria-hidden="true">
                Aa
              </p>
              <h3 className={styles.secondaryHeading}>Hanken Grotesk</h3>
              <p className="type-body-small">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
                <br />
                abcdefghijklmnopqrstuvwxyz 0123456789
              </p>
            </article>
          </div>
        </section>

        <section
          className={`${styles.section} layout-section`}
          aria-labelledby="breakpoints-title"
        >
          <div className={`${styles.sectionHeader} layout-grid`}>
            <p className={`${styles.muted} type-label`}>02 / Responsive type</p>
            <div>
              <h2 className="type-heading-2" id="breakpoints-title">
                Four breakpoint ranges
              </h2>
              <p className={`${styles.sectionCopy} type-body`}>
                Resize the viewport to see the typography scale respond at each
                range.
              </p>
            </div>
          </div>

          <div className={styles.breakpointGrid}>
            {breakpoints.map((breakpoint) => (
              <article className={styles.breakpoint} key={breakpoint.name}>
                <p className="type-heading-6">{breakpoint.name}</p>
                <p className={`${styles.muted} type-body-small`}>
                  {breakpoint.range}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`${styles.section} layout-section`}
          aria-labelledby="layout-title"
        >
          <div className={`${styles.sectionHeader} layout-grid`}>
            <p className={`${styles.muted} type-label`}>03 / Layout</p>
            <div>
              <h2 className="type-heading-2" id="layout-title">
                Frame &amp; grid
              </h2>
              <p className={`${styles.sectionCopy} type-body`}>
                A centered, constrained frame with proportional gutters and a
                responsive column grid.
              </p>
            </div>
          </div>

          <div className={styles.layoutMetrics}>
            {layoutGuide.map((item) => (
              <article className={styles.layoutMetric} key={item.label}>
                <p className={`${styles.muted} type-caption`}>{item.label}</p>
                <p className="type-heading-6">{item.value}</p>
              </article>
            ))}
          </div>

          <div
            className={`${styles.gridPreview} layout-grid`}
            aria-label="Responsive column grid"
          >
            {Array.from({ length: 12 }, (_, index) => (
              <div className={styles.gridColumn} key={index}>
                <span className="type-micro">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`${styles.section} layout-section`}
          aria-labelledby="button-title"
        >
          <div className={`${styles.sectionHeader} layout-grid`}>
            <p className={`${styles.muted} type-label`}>04 / Components</p>
            <div>
              <h2 className="type-heading-2" id="button-title">
                Button
              </h2>
              <p className={`${styles.sectionCopy} type-body`}>
                Penvo typography inside an angled shape with an animated
                border-reveal interaction.
              </p>
            </div>
          </div>

          <div className={styles.buttonGrid}>
            <article className={styles.buttonSpecimen}>
              <Button>View project</Button>
              <p className={`${styles.muted} type-caption`}>
                Primary · orange to black
              </p>
            </article>
            <article className={styles.buttonSpecimen}>
              <Button variant="secondary">Explore Penvo</Button>
              <p className={`${styles.muted} type-caption`}>
                Secondary · black to orange
              </p>
            </article>
          </div>
        </section>

        <section
          className={`${styles.section} layout-section`}
          aria-labelledby="type-title"
        >
          <div className={`${styles.sectionHeader} layout-grid`}>
            <p className={`${styles.muted} type-label`}>05 / Typography</p>
            <h2 className="type-heading-2" id="type-title">
              Type scale
            </h2>
          </div>

          <div className={styles.typeList}>
            {typography.map((item) => (
              <article
                className={`${styles.typeRow} layout-grid`}
                key={item.role}
              >
                <p className={`${styles.typeRole} type-caption`}>{item.role}</p>
                <p className={`${styles.typeSample} ${item.className}`}>
                  {item.sample}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`${styles.section} layout-section`}
          aria-labelledby="colours-title"
        >
          <div className={`${styles.sectionHeader} layout-grid`}>
            <p className={`${styles.muted} type-label`}>06 / Colours</p>
            <div>
              <h2 className="type-heading-2" id="colours-title">
                Brand palette
              </h2>
              <p className={`${styles.sectionCopy} type-body`}>
                The interface uses Pure Black as its main background and Bright
                Orange for primary action and focus states.
              </p>
            </div>
          </div>

          <div className={styles.paletteGrid}>
            {palette.map((colour) => (
              <article
                className={`${styles.swatch} ${
                  colour.tone === 'dark' ? styles.darkText : styles.lightText
                }`}
                key={colour.name}
                style={{ backgroundColor: `var(${colour.token})` }}
              >
                <div>
                  <h3 className="type-heading-6">{colour.name}</h3>
                  <p className="type-body-small">{colour.hex}</p>
                </div>
                <p className="type-label">{colour.role}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <p className="type-body-small">Penvo design foundations</p>
          <p className={`${styles.muted} type-caption`}>
            Temporary reference screen
          </p>
        </footer>
      </div>
    </main>
  );
}
