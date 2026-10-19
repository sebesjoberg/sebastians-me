import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { m } from '#/paraglide/messages';

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const isDark = computed === 'dark';

  return (
    <ActionIcon
      variant="default"
      size="lg"
      radius="md"
      aria-label={isDark ? m.color_scheme_to_light() : m.color_scheme_to_dark()}
      onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? '☀️' : '🌙'}
    </ActionIcon>
  );
}
