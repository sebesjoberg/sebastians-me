import { useLocation } from '@tanstack/react-router';
import { Anchor, Group } from '@mantine/core';
import { m } from '#/paraglide/messages';
import { getLocale, localizeHref, locales } from '#/paraglide/runtime';

const labels: Record<string, string> = { sv: 'SV', en: 'EN' };

// Plain anchors on purpose: switching locale is a full page load, which keeps
// the locale state trivially correct and matches what crawlers see.
export function LocaleSwitch() {
  const current = getLocale();
  const { pathname } = useLocation();

  return (
    <Group gap="sm" component="nav" aria-label={m.locale_switch_label()}>
      {locales.map((locale) => {
        const isCurrent = locale === current;
        return (
          <Anchor
            key={locale}
            href={localizeHref(pathname, { locale })}
            hrefLang={locale}
            size="sm"
            underline="never"
            fw={isCurrent ? 600 : 400}
            c={isCurrent ? undefined : 'dimmed'}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {labels[locale] ?? locale}
          </Anchor>
        );
      })}
    </Group>
  );
}
