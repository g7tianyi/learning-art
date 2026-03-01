/**
 * API Route: Upload Artwork Image
 *
 * POST /api/artworks/[id]/image
 * Accepts multipart/form-data with image file
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const DB_PATH = path.join(process.cwd(), '../data/artworks.db');
const IMAGES_DIR = path.join(process.cwd(), 'public/images/artworks');

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];

function getDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');
  return db;
}

/**
 * Generate slug from artwork title
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const artworkId = parseInt(id);

    if (isNaN(artworkId)) {
      return NextResponse.json(
        { error: 'Invalid artwork ID' },
        { status: 400 }
      );
    }

    // Get artwork from database
    const db = getDb();
    const artwork = db
      .prepare('SELECT id, title, image_path FROM artworks WHERE id = ?')
      .get(artworkId) as { id: number; title: string; image_path: string | null } | undefined;

    if (!artwork) {
      db.close();
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      db.close();
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      db.close();
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      db.close();
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate filename
    const ext = file.name.split('.').pop() || 'jpg';
    const slug = slugify(artwork.title);
    const filename = `${artworkId}-${slug}.${ext}`;
    const filepath = path.join(IMAGES_DIR, filename);
    const dbPath = `/images/artworks/${filename}`;

    // Delete old image if exists
    if (artwork.image_path) {
      const oldFilepath = path.join(process.cwd(), 'public', artwork.image_path);
      if (existsSync(oldFilepath)) {
        try {
          await unlink(oldFilepath);
        } catch (err) {
          console.error('Failed to delete old image:', err);
          // Continue anyway - not a critical error
        }
      }
    }

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update database
    db.prepare('UPDATE artworks SET image_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(dbPath, artworkId);

    db.close();

    return NextResponse.json({
      success: true,
      imagePath: dbPath,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const artworkId = parseInt(id);

    if (isNaN(artworkId)) {
      return NextResponse.json(
        { error: 'Invalid artwork ID' },
        { status: 400 }
      );
    }

    // Get artwork from database
    const db = getDb();
    const artwork = db
      .prepare('SELECT id, image_path FROM artworks WHERE id = ?')
      .get(artworkId) as { id: number; image_path: string | null } | undefined;

    if (!artwork) {
      db.close();
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    if (!artwork.image_path) {
      db.close();
      return NextResponse.json(
        { error: 'No local image to delete' },
        { status: 404 }
      );
    }

    // Delete file
    const filepath = path.join(process.cwd(), 'public', artwork.image_path);
    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    // Update database
    db.prepare('UPDATE artworks SET image_path = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(artworkId);

    db.close();

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error during deletion' },
      { status: 500 }
    );
  }
}
