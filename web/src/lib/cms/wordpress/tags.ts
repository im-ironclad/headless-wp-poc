/**
 * Cache tags shared with WordPress (mu-plugins/revalidate.php sends these same strings).
 *   page:{path}  one Page       pages  the list of Pages       globals  menu + Site Settings
 */
export const tags = {
  page: (path: string) => `page:${path}`,
  pages: "pages",
  globals: "globals",
} as const;
