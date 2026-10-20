import { createFileRoute } from '@tanstack/react-router';
import { ColorSchemeToggle } from '#/components/ColorSchemeToggle';
import { LocaleSwitch } from '#/components/LocaleSwitch';
import { ScrollShell } from '#/components/scroll/ScrollShell';
import { Section } from '#/components/scroll/Section';
import { Contact } from '#/components/sections/Contact';
import { Facts } from '#/components/sections/Facts';
import { Hero, HeroBadge } from '#/components/sections/Hero';
import { Now } from '#/components/sections/Now';
import { Numbers } from '#/components/sections/Numbers';
import { Runs } from '#/components/sections/Runs';
import { Timeline } from '#/components/sections/Timeline';
import { now } from '#/content/now';
import { stats } from '#/content/numbers';
import { type SectionDef, sections } from '#/content/sections';
import { timeline } from '#/content/timeline';
import { m } from '#/paraglide/messages';

export const Route = createFileRoute('/{-$locale}/')({ component: Home });

function SectionBody({ section }: { section: SectionDef }) {
  switch (section.kind) {
    case 'hero':
      return <Hero />;
    case 'now':
      return <Now entries={now} />;
    case 'facts':
      return <Facts items={section.items} />;
    case 'numbers':
      return <Numbers items={stats} />;
    case 'runs':
      return <Runs />;
    case 'timeline':
      return <Timeline entries={timeline} />;
    case 'contact':
      return <Contact />;
  }
}

function Home() {
  return (
    <ScrollShell
      sections={sections}
      brand={<HeroBadge />}
      navLabel={m.section_nav_label()}
      controls={
        <>
          <LocaleSwitch />
          <ColorSchemeToggle />
        </>
      }
    >
      {sections.map((section, index) => (
        <Section key={section.id} section={section} index={index}>
          <SectionBody section={section} />
        </Section>
      ))}
    </ScrollShell>
  );
}
