/**
 * Era Introduction Component
 *
 * Renders Markdown introduction content for an art era,
 * including metadata footer with generation provenance.
 */

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { EraIntroduction } from '@/lib/eras';

interface EraIntroductionProps {
  introduction: EraIntroduction;
}

export default function EraIntroduction({ introduction }: EraIntroductionProps) {
  return (
    <div>
      {/* Markdown Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Customize heading styles
            h1: ({ children }) => (
              <h1 className="font-serif text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-serif text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">
                {children}
              </h3>
            ),
            // Customize paragraph spacing
            p: ({ children }) => (
              <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {children}
              </p>
            ),
            // Customize list styles
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                {children}
              </ol>
            ),
            // Customize link styles
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-ochre hover:underline"
              >
                {children}
              </a>
            ),
            // Customize blockquote
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-accent-ochre pl-4 italic text-gray-600 dark:text-gray-400 my-4">
                {children}
              </blockquote>
            ),
            // Customize code blocks
            code: ({ className, children }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              }
              return (
                <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm font-mono">
                  {children}
                </code>
              );
            }
          }}
        >
          {introduction.content}
        </ReactMarkdown>
      </div>

      {/* Metadata Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
        <div className="text-sm text-gray-500 dark:text-gray-500">
          <p className="mb-2">
            <span className="font-semibold">Content provenance:</span>
          </p>
          <ul className="space-y-1 ml-4">
            <li>
              Generated: {new Date(introduction.metadata.generatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </li>
            <li>Model: {introduction.metadata.model}</li>
            <li>Prompt version: {introduction.metadata.promptVersion}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
