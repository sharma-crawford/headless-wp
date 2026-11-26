import { WIDGETS } from "@/components/widgets/registry";

/**
 * Where WordPress put a widget: the empty marker the plugin's [pcle_widget]
 * shortcode renders (pcle_widget_shortcode), possibly wrapped in a paragraph by
 * the content filters.
 */
const WIDGET_MARKER = /(?:<p>\s*)?<div class="pcle-widget" data-widget="([a-z0-9][a-z0-9-]{0,39})"><\/div>(?:\s*<\/p>)?/g;

/**
 * A protected attachment's address as WordPress writes it, on its own domain
 * behind a WordPress login the learner here does not have. Rewritten to this
 * app's /media route, which fetches it with the reader's own token.
 */
const PROTECTED_FILE = /https?:\/\/[^"'\s<>]*?\/?\?pcle_download=(\d+)/g;

function throughApp(html: string): string {
  return html.replace(PROTECTED_FILE, "/media/$1");
}

/**
 * Renders HTML produced by WordPress.
 *
 * The markup comes from `the_content` — the same pipeline that renders the
 * WordPress-served site — so it is authored content from instructors and
 * administrators, not reader input. It is inserted as HTML on purpose:
 * escaping it would show readers their own markup as text.
 *
 * Note this is also how model answers arrive. The plugin decides server-side
 * whether to include them; if the reader is not entitled to one, it is not in
 * this string at all.
 *
 * Widget markers are replaced by the component registered under their key
 * (components/widgets/registry.tsx); an unknown key draws nothing. A body with
 * no widget renders exactly as it always did.
 */
export default function WpContent({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  if (!html.trim()) {
    return null;
  }

  const wrapper = `wp-content ${className}`.trim();
  const parts = throughApp(html).split(WIDGET_MARKER);

  if (parts.length === 1) {
    return <div className={wrapper} dangerouslySetInnerHTML={{ __html: parts[0] }} />;
  }

  // split() with one capture group alternates: html, key, html, key, ...
  return (
    <div className={wrapper}>
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          return part.trim() ? <div key={index} dangerouslySetInnerHTML={{ __html: part }} /> : null;
        }

        const Widget = Object.hasOwn(WIDGETS, part) ? WIDGETS[part] : null;
        return Widget ? <Widget key={index} /> : null;
      })}
    </div>
  );
}
