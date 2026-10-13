import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { Components } from "react-markdown";

// Block-level spacing + styling defaults so multi-paragraph, list, or table
// descriptions breathe. Inline elements (strong, em, inline code) inherit the
// call-site typography via the wrapper className. Colors are intentionally
// inherited from the call site except for links/tables/code, which need to be
// distinguishable.
const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="marker:text-white/40">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-red-500/60 pl-3 text-white/70 last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-white/10" />,
  // Fenced blocks carry a `language-*` class; inline code does not.
  code: ({ className, children, ...props }) =>
    className ? (
      <code className={className} {...props}>
        {children}
      </code>
    ) : (
      <code
        className="rounded bg-white/10 px-1 py-0.5 text-[0.9em] break-words"
        {...props}
      >
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded border border-white/10 bg-black/40 p-3 last:mb-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-[0.9em]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-white/15 px-2 py-1 text-left text-white/50 uppercase">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border border-white/15 px-2 py-1">{children}</td>,
  // Demote heading levels so they stay subordinate to the surrounding title.
  h1: ({ children }) => (
    <h3 className="mb-2 font-display text-lg font-bold last:mb-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 font-display text-base font-bold last:mb-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-2 font-display text-sm font-bold last:mb-0">{children}</h4>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 font-display text-sm font-bold last:mb-0">{children}</h4>
  ),
  h5: ({ children }) => (
    <h4 className="mb-2 font-display text-xs font-bold last:mb-0">{children}</h4>
  ),
  h6: ({ children }) => (
    <h4 className="mb-2 font-display text-xs font-bold last:mb-0">{children}</h4>
  ),
};

/**
 * Renders text as GitHub-flavored Markdown.
 *
 * - `remark-breaks` keeps single newlines as <br>, so line breaks typed by
 *   moderators survive; emoji (plain Unicode) pass through unchanged.
 * - Raw HTML is escaped by default (react-markdown does not use
 *   dangerouslySetInnerHTML), so moderator-entered content cannot inject
 *   markup or scripts.
 *
 * The `className` supplies typography (size, color, tracking) which cascades
 * into the generated elements.
 */
export default function MarkdownText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
