import { getAllArtworks } from '@/lib/db';
import ArtworkGrid from '@/components/ArtworkGrid';

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
        <ArtworkGrid
          artworks={artworks}
          emptyMessage="No artworks yet. Load artworks to get started."
        />
      </div>
    </div>
  );
}
