import {
  Outlet,
  createFileRoute,
  notFound,
  redirect,
} from '@tanstack/react-router';
import { m } from '#/paraglide/messages';
import {
  baseLocale,
  isLocale,
  localizeHref,
  locales,
} from '#/paraglide/runtime';
import { absoluteUrl } from '#/site';

// Optional locale segment. "/" is Swedish (base locale, no prefix),
// "/en" is English. Every page lives under this route so it gets the
// prefix for free, e.g. "/about" and "/en/about".
export const Route = createFileRoute('/{-$locale}')({
  beforeLoad: ({ params }) => {
    const { locale } = params;

    // "/sv/..." is never canonical; send it to the unprefixed URL.
    if (locale === baseLocale) {
      throw redirect({
        to: '/{-$locale}',
        params: { locale: undefined },
        replace: true,
      });
    }

    if (locale !== undefined && !isLocale(locale)) {
      throw notFound();
    }

    return { locale: locale ?? baseLocale };
  },
  head: ({ match }) => {
    // Path without the locale prefix, used to build canonical/hreflang links.
    const path = match.pathname.replace(/^\/en(?=\/|$)/, '') || '/';

    return {
      meta: [
        { title: m.site_title() },
        { name: 'description', content: m.site_description() },
        { property: 'og:title', content: m.site_title() },
        { property: 'og:description', content: m.site_description() },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: absoluteUrl(localizeHref(path)) },
      ],
      links: [
        { rel: 'canonical', href: absoluteUrl(localizeHref(path)) },
        ...locales.map((locale) => ({
          rel: 'alternate',
          hrefLang: locale,
          href: absoluteUrl(localizeHref(path, { locale })),
        })),
        {
          rel: 'alternate',
          hrefLang: 'x-default',
          href: absoluteUrl(localizeHref(path, { locale: baseLocale })),
        },
      ],
    };
  },
  component: Outlet,
});
