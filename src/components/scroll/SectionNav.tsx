import { jumpOnClick } from './jump';
import classes from './SectionNav.module.css';
import type { SectionDef } from '#/content/sections';

interface SectionNavProps {
  sections: SectionDef[];
  activeSectionId: string | null;
  label: string;
}

// One dot per section down the right edge, the current one filled. Hovering
// or tabbing into the rail shows the names; a click jumps straight there,
// so nobody has to scroll through every item to reach the end.
export function SectionNav({
  sections,
  activeSectionId,
  label,
}: SectionNavProps) {
  return (
    <nav className={classes.nav} aria-label={label}>
      <ol className={classes.list}>
        {sections.map((section) => {
          const isCurrent = section.id === activeSectionId;
          return (
            <li key={section.id}>
              <a
                className={classes.link}
                href={`#${section.id}`}
                onClick={jumpOnClick(section.id)}
                aria-current={isCurrent ? 'location' : undefined}
              >
                <span className={classes.label}>{section.title()}</span>
                <span className={classes.dot} aria-hidden />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
