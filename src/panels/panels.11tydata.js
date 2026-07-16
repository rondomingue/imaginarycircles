// Applies to every file in src/panels/.
// Keep the original flat URLs (e.g. /radian-circle.html) instead of Eleventy's
// default pretty-URL folders, so existing links and bookmarks keep working.
export default {
  eleventyComputed: {
    permalink: (data) => `${data.page.fileSlug}.html`,
  },
};
