/**
 * Third-party quotes. Empty = the section does not render at all (no placeholders on the live site).
 * Add one object per person ONLY with that person's written permission. Fields:
 *   quote      the exact words, no editing beyond trimming
 *   name       as they want to be named
 *   relation   how they know my work, e.g. "Teammate, CICADA 2026" or "Faculty, DSATM CSE"
 *   about      slug of the project the quote is about (optional)
 *   permission true once you have it in writing (the site refuses to render a quote without it)
 */
export type Testimonial = { quote: string; name: string; relation: string; about?: string; permission: boolean };
export const TESTIMONIALS: Testimonial[] = [];
