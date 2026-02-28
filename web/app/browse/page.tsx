import Link from 'next/link';
import { getAllArtworks } from '@/lib/db';
import Image from 'next/image';

export default function BrowsePage() {
  const artworks = getAllArtworks();

  return (
    <div className="section-padding">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-4xl font-bold mb-8">Browse Collection</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          {artworks.length} artworks across painting, sculpture, and architecture
        </p>

        {/* Artwork Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((artwork) => (
            <Link
              key={artwork.id}
              href={`/works/${artwork.id}`}
              className="group block transition-gentle hover:-translate-y-1"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                  {artwork.imageUrl ? (
                    <Image
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      {artwork.category === 'painting' && '🎨'}
                      {artwork.category === 'sculpture' && '🗿'}
                      {artwork.category === 'architecture' && '🏛️'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-accent-ochre transition-colors">
                    {artwork.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    {artwork.artist}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {artwork.year} • {artwork.category}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {artworks.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No artworks yet. Load artworks to get started.
            </p>
            <p className="text-sm text-gray-400">
              Run: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run load-artworks</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
