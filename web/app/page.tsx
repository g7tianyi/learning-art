import Link from 'next/link';

export default function Home() {
  return (
    <div className="section-padding">
      <div className="max-w-4xl mx-auto">
        {/* Hero section */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Master the Great Works
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
            A serene space to study, memorize, and deeply understand
            328 masterworks of painting, sculpture, and architecture.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="font-serif text-xl font-semibold mb-2">
              Curated Collection
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              200 paintings, 64 sculptures, 64 architectures from across
              time and cultures
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-serif text-xl font-semibold mb-2">
              Deep Commentary
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Multi-dimensional analysis covering art, history, culture,
              economics, psychology, and philosophy
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="font-serif text-xl font-semibold mb-2">
              Smart Reviews
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Spaced repetition algorithm adapts to your memory,
              optimizing retention
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/browse"
            className="inline-block px-8 py-4 bg-accent-ochre text-white font-semibold rounded-lg transition-gentle hover:bg-accent-ochre/90 focus-ring"
          >
            Start Exploring
          </Link>
        </div>

        {/* Status notice */}
        <div className="mt-16 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-serif text-lg font-semibold mb-2">
            🚧 In Development
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The Learning Art system is currently being built. Core features
            implemented: database schema, SM-2 algorithm, AI artwork selection.
            Coming next: artwork loading, image pipeline, and full UI.
          </p>
        </div>
      </div>
    </div>
  );
}
