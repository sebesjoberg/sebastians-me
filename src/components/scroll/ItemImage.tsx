import { Box, type BoxProps } from '@mantine/core';

interface ItemImageProps extends BoxProps {
  src: string;
  /** Rendered height, any CSS length; the width follows a 4:3 ratio. */
  height: string;
}

// The picture that goes with one item: a small rounded photo, decorative
// (the item's text carries the meaning), so no alt text.
export function ItemImage({ src, height, ...rest }: ItemImageProps) {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      h={height}
      display="block"
      style={{
        aspectRatio: '4 / 3',
        objectFit: 'cover',
        borderRadius: 'var(--mantine-radius-lg)',
        boxShadow: 'var(--mantine-shadow-md)',
      }}
      {...rest}
    />
  );
}
