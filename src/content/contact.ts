export const email = 'sebesjoberg@gmail.com';

export interface ContactLink {
  label: string;
  /** Links without an href are left out until they get one. */
  href?: string;
}

export const contactLinks: ContactLink[] = [
  { label: 'GitHub', href: 'https://github.com/sebesjoberg' },
  // TODO: profile URL
  { label: 'LinkedIn' },
  // TODO: profile URL, e.g. https://www.strava.com/athletes/<id>
  { label: 'Strava' },
];
