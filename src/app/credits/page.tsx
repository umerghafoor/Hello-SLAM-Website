import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Credits',
  description:
    'Credits and attribution for Hello SLAM. Original course content by Nikolaos Stathoulopoulos. Web port built with Next.js, MDX, Tailwind CSS, KaTeX, and a Material 3 Expressive design system.',
  alternates: { canonical: '/credits' },
  openGraph: {
    title: 'Credits · Hello SLAM',
    description:
      'Credits for Hello SLAM — original notebooks by Nikolaos Stathoulopoulos, web port built with Next.js and MDX.',
    url: '/credits',
  },
};

export default function CreditsPage() {
  return (
    <div className="prose-slam">
      <span className="md-chip">Credits & attribution</span>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-md-on-surface">
        Credits
      </h1>
      <p className="mt-3 text-md-on-surface-variant">
        This site stands on the shoulders of open-source work. Here is who made
        it possible.
      </p>

      {/* Author spotlight */}
      <section className="not-prose mt-8 md-card overflow-hidden">
        <div className="bg-md-primary-container px-6 py-6 md:px-8 md:py-8">
          <span
            className="md-chip"
            style={{
              background: 'var(--md-tertiary-container)',
              color: 'var(--md-on-tertiary-container)',
            }}
          >
            Original author
          </span>
          <h2 className="mt-3 font-display text-2xl font-medium text-md-on-primary-container">
            Nikolaos Stathoulopoulos
          </h2>
          <p className="mt-2 text-md-on-primary-container/90">
            Author of the original{' '}
            <a
              href="https://github.com/nstathou/hello-slam"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              hello-slam
            </a>{' '}
            Jupyter-notebook course. All explanations, derivations, figures, and
            code in the lessons originate from his work. This web port adds
            navigation, styling, and theming, but the educational content is
            entirely his.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://github.com/nstathou/hello-slam"
              target="_blank"
              rel="noopener noreferrer"
              className="md-btn-filled"
            >
              hello-slam on GitHub ↗
            </a>
            <a
              href="https://github.com/nstathou"
              target="_blank"
              rel="noopener noreferrer"
              className="md-btn-tonal"
            >
              @nstathou ↗
            </a>
          </div>
        </div>
      </section>

      <h2>Course content</h2>
      <p>
        The lessons on this site are adaptations of the notebooks in the{' '}
        <a
          href="https://github.com/nstathou/hello-slam"
          target="_blank"
          rel="noopener noreferrer"
        >
          hello-slam repository
        </a>
        . Please refer to that repository for the canonical source, the
        executable notebooks, the dataset/figure assets, and the project license.
      </p>
      <p>
        If you use the material in research, teaching, or your own projects,
        please credit the original repository. If you spot an error in the web
        port that is not present in the source notebooks, the bug is most likely
        in this port — not in the original work.
      </p>

      <h2>Web port</h2>
      <p>
        The web port is built with the following stack and design system:
      </p>
      <ul>
        <li>
          <strong>Next.js 15</strong> + the App Router for routing and static
          generation.
        </li>
        <li>
          <strong>MDX</strong> via <code>@next/mdx</code> for authoring lessons in
          Markdown with inline React components.
        </li>
        <li>
          <strong>Tailwind CSS</strong> for utilities, layered on top of a
          custom <strong>Material 3 Expressive</strong> design-token system
          (tonal palettes, surface containers, the M3 shape scale, and elevation).
        </li>
        <li>
          <strong>KaTeX</strong> (via <code>rehype-katex</code> + <code>remark-math</code>) for
          math rendering.
        </li>
        <li>
          <strong>Shiki</strong> (via <code>rehype-pretty-code</code>) for syntax
          highlighting in code blocks.
        </li>
        <li>
          <strong>Google Sans</strong>, <strong>Google Sans Display</strong>,{' '}
          <strong>Google Sans Text</strong>, and <strong>Roboto Mono</strong> —
          loaded from Google Fonts.
        </li>
      </ul>

      <h2>Design system</h2>
      <p>
        The interface follows <strong>Material 3 Expressive</strong>, Google’s
        latest evolution of Material You. The palette is generated from a
        green-leaning primary seed and exposes the standard M3 roles — primary,
        secondary, tertiary, and a full set of surface containers — as CSS
        custom properties, mirrored for light and dark themes.
      </p>

      <h2>License & usage</h2>
      <p>
        Course content is © Nikolaos Stathoulopoulos and is governed by the
        license in the{' '}
        <a
          href="https://github.com/nstathou/hello-slam"
          target="_blank"
          rel="noopener noreferrer"
        >
          original repository
        </a>
        . The web-port code (this site’s layout, components, theme, and
        navigation) is a derivative work and follows the same license unless
        noted otherwise. When in doubt, defer to the upstream project.
      </p>

      <div className="not-prose mt-10 flex flex-wrap gap-3">
        <Link href="/" className="md-btn-tonal">
          ← Back to home
        </Link>
        <Link href="/about" className="md-btn-outlined">
          About this course
        </Link>
      </div>
    </div>
  );
}
