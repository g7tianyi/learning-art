import Link from 'next/link';
import Image from 'next/image';
import { getArtworkById, getAllArtworks } from '@/lib/db';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const artworks = getAllArtworks();
  return artworks.map((artwork) => ({
    id: artwork.id.toString(),
  }));
}

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artwork = getArtworkById(parseInt(id));

  if (!artwork) {
    notFound();
  }

  // Get next/previous artworks
  const allArtworks = getAllArtworks();
  const currentIndex = allArtworks.findIndex(a => a.id === artwork.id);
  const prevArtwork = currentIndex > 0 ? allArtworks[currentIndex - 1] : null;
  const nextArtwork = currentIndex < allArtworks.length - 1 ? allArtworks[currentIndex + 1] : null;

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/browse" className="text-gray-600 dark:text-gray-400 hover:text-accent-ochre transition-colors">
            ← Back to Browse
          </Link>

          <div className="flex gap-4">
            {prevArtwork && (
              <Link
                href={`/works/${prevArtwork.id}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ← Previous
              </Link>
            )}
            {nextArtwork && (
              <Link
                href={`/works/${nextArtwork.id}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>

        {/* Artwork */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Image */}
          <div>
            {artwork.imageUrl ? (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-6xl">
                {artwork.category === 'painting' && '🎨'}
                {artwork.category === 'sculpture' && '🗿'}
                {artwork.category === 'architecture' && '🏛️'}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div>
            <h1 className="font-serif text-4xl font-bold mb-4">
              {artwork.title}
            </h1>

            <div className="space-y-3 mb-8">
              <p className="text-xl text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Artist:</span> {artwork.artist}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Year:</span> {artwork.year}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Category:</span>{' '}
                <span className="capitalize">{artwork.category}</span>
              </p>
              {artwork.medium && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Medium:</span> {artwork.medium}
                </p>
              )}
              {artwork.dimensions && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Dimensions:</span> {artwork.dimensions}
                </p>
              )}
              {artwork.location && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Location:</span> {artwork.location}
                </p>
              )}
              {artwork.movement && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Movement:</span> {artwork.movement}
                </p>
              )}
            </div>

            {/* Links */}
            <div className="flex gap-4">
              {artwork.wikiUrl && (
                <a
                  href={artwork.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-accent-ochre text-white rounded-lg hover:bg-accent-ochre/90 transition-colors"
                >
                  Wikipedia →
                </a>
              )}
              {artwork.museumUrl && (
                <a
                  href={artwork.museumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Museum →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Commentary placeholder */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="font-serif text-2xl font-bold mb-4">Commentary</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Multi-dimensional commentary coming soon. This will include:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
            <li>Art & Technique - Visual analysis and formal elements</li>
            <li>Historical Context - Creation circumstances and reception</li>
            <li>Social & Cultural Impact - Influence and meaning over time</li>
            <li>Economics - Patronage, sales, and market value</li>
            <li>Psychology - Artist&apos;s state and viewer response</li>
            <li>Philosophy - Existential themes and aesthetic questions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
