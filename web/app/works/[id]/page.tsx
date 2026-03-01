import { getArtworkById, getAllArtworks } from '@/lib/db';
import { getAllEras, getEraForArtwork } from '@/lib/eras';
import { notFound } from 'next/navigation';
import ArtworkDetail from '@/components/ArtworkDetail';

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

  // Get artwork's era
  const eras = getAllEras();
  const era = getEraForArtwork(artwork, eras);

  return (
    <ArtworkDetail
      artwork={artwork}
      prevArtwork={prevArtwork}
      nextArtwork={nextArtwork}
      era={era || undefined}
    />
  );
}
