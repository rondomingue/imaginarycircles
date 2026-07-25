import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import parts from "./src/_data/parts.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME_DIR = path.join(__dirname, "src", "_includes", "chrome");

// Read a chrome partial fresh on every call so edits show up on rebuild.
const partial = (name) => fs.readFileSync(path.join(CHROME_DIR, `${name}.html`), "utf8");

// Build the series list (from parts.json) that lives inside the sidebar,
// marking the current page active via its slug.
function seriesNav(activeSlug) {
  return parts
    .map((p) => {
      const active = p.slug === activeSlug ? " is-active" : "";
      return `<a class="site-serieslink${active}" href="${p.slug}.html">` +
        `<span class="site-serieslink-num">${p.num}</span>` +
        `<span class="site-serieslink-title">${p.title}</span></a>`;
    })
    .join("\n    ");
}

export default function (eleventyConfig) {
  // Static assets for the chrome (and anything else added later).
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Rebuild when the chrome partials change (they aren't referenced as
  // Eleventy includes, so watch them explicitly).
  eleventyConfig.addWatchTarget("src/_includes/chrome");
  eleventyConfig.addWatchTarget("src/assets");

  // Inject the unified header, footer and sliding sidebar into every HTML
  // page, and remove each page's old in-page series nav.
  eleventyConfig.addTransform("siteChrome", function (content) {
    const out = this.page && this.page.outputPath;
    if (!out || !out.endsWith(".html")) return content;
    if (!/<\/body>/i.test(content)) return content;
    if (content.includes('data-site-chrome')) return content; // already injected

    // 1. drop the old per-page series nav
    let html = content.replace(/<nav class="seriesnav">[\s\S]*?<\/nav>\s*/i, "");

    // 2. head assets — shared chrome + a serif math font (STIX Two Text)
    //    and the equation typography that uses it.
    const head =
      '<link rel="stylesheet" href="assets/chrome.css">\n' +
      '<link rel="stylesheet" href="assets/math.css">\n' +
      '<link rel="stylesheet" href="assets/theme.css">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">\n' +
      '<script src="assets/chrome.js" defer></script>\n';
    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, head + "</head>");
    }

    // 3. header + overlay + sidebar right after <body>
    const sidebar = partial("sidebar").replace("<!--SERIES_NAV-->", seriesNav(this.page.fileSlug));
    const top = partial("header") + "\n" + sidebar + "\n";
    html = html.replace(/(<body[^>]*>)/i, `$1\n${top}`);

    // 4. footer before </body>
    html = html.replace(/<\/body>/i, `${partial("footer")}\n</body>`);

    return html;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      data: "_data",
    },
    // .html panels are processed (so the transform runs) but NOT run through
    // a template engine, protecting their inline scripts. .njk builds the home page.
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: false,
    markdownTemplateEngine: "njk",
  };
}
