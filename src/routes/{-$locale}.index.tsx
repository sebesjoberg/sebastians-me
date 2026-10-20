import { createFileRoute } from '@tanstack/react-router';
import { ColorSchemeToggle } from '#/components/ColorSchemeToggle';
import { LocaleSwitch } from '#/components/LocaleSwitch';
import { ScrollShell } from '#/components/scroll/ScrollShell';
import { Section } from '#/components/scroll/Section';
import { Facts } from '#/components/sections/Facts';
import { Hero } from '#/components/sections/Hero';
import { Timeline } from '#/components/sections/Timeline';
import { type SectionDef, sections } from '#/content/sections';
import { timeline } from '#/content/timeline';

export const Route = createFileRoute('/{-$locale}/')({ component: Home });

function SectionBody({ section }: { section: SectionDef }) {
  switch (section.kind) {
    case 'hero':
      return <Hero />;
    case 'facts':
      return <Facts items={section.items} />;
    case 'timeline':
      return <Timeline entries={timeline} />;
  }
}

function Home() {
  return (
    <ScrollShell
      sections={sections}
      controls={
        <>
          <LocaleSwitch />
          <ColorSchemeToggle />
        </>
      }
    >
      {sections.map((section) => (
        <Section key={section.id} section={section}>
          <SectionBody section={section} />
        </Section>
      ))}
    </ScrollShell>
  );
}
