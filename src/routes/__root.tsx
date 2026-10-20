import '@mantine/core/styles.css';

import { useEffect } from 'react';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { HeadContent, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import '../styles.css';
import { getLocale } from '#/paraglide/runtime';
import { cssVariablesResolver, theme } from '#/theme/theme';

// Persists the user's choice in localStorage. Until they pick one the site
// is dark: that is the look it was designed for, light is the alternative.
const colorSchemeManager = localStorageColorSchemeManager({
  key: 'sebastians-me-color-scheme',
});

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const locale = getLocale();

  // index.html ships lang="sv"; keep it in sync with the URL locale.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <>
      {/* Renders the title/meta/link tags declared in each route's head(). */}
      <HeadContent />
      <MantineProvider
        theme={theme}
        cssVariablesResolver={cssVariablesResolver}
        defaultColorScheme="dark"
        colorSchemeManager={colorSchemeManager}
      >
        <Outlet />
      </MantineProvider>
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[
          { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
        ]}
      />
    </>
  );
}
