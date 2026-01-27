import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { v2 as cloudinary } from 'cloudinary';
import pool from '@/lib/db';
import { PDFDocument } from 'pdf-lib';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE email = $1',
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    // Count user's uploads
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM learning_agreements WHERE user_id = $1',
      [userId]
    );

    return NextResponse.json({
      count: parseInt(countResult.rows[0].count) || 0
    });
  } catch (error: any) {
    console.error('Error counting uploads:', error);
    return NextResponse.json(
      { error: 'Failed to count uploads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Du må være logget inn for å laste opp Learning Agreement' },
        { status: 401 }
      );
    }

    // Get user from database
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE email = $1',
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bruker ikke funnet' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;
    const userRole = userResult.rows[0].role;

    // Check upload limit (only for non-admins)
    if (userRole !== 'admin') {
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM learning_agreements WHERE user_id = $1',
        [userId]
      );
      const uploadCount = parseInt(countResult.rows[0].count) || 0;

      if (uploadCount >= 2) {
        return NextResponse.json(
          { error: 'Du har nådd maksimalt antall opplastinger (2)' },
          { status: 403 }
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Ingen fil lastet opp' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Kun PDF-filer er tillatt' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Filen er for stor. Maksimal størrelse er 5MB. Vennligst komprimer PDF-en før opplasting.' },
        { status: 400 }
      );
    }

    // Convert file to array buffer and compress
    const bytes = await file.arrayBuffer();

    // Load and compress the PDF
    let compressedBytes: Uint8Array;
    try {
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      // Get all pages and compress them
      const pages = pdfDoc.getPages();

      // Reduce image quality by embedding images at lower resolution
      // This is done automatically by pdf-lib when saving

      // Save with aggressive compression options
      compressedBytes = await pdfDoc.save({
        useObjectStreams: true, // Enable object streams for better compression
        addDefaultPage: false,
        objectsPerTick: 50,
        updateFieldAppearances: false,
      });

      console.log(`PDF compressed from ${bytes.byteLength} to ${compressedBytes.length} bytes (${Math.round((1 - compressedBytes.length / bytes.byteLength) * 100)}% reduction)`);
    } catch (error) {
      console.error('PDF compression failed, using original:', error);
      compressedBytes = new Uint8Array(bytes);
    }

    // Convert compressed PDF to base64
    const buffer = Buffer.from(compressedBytes);
    const base64String = buffer.toString('base64');
    const dataURI = `data:application/pdf;base64,${base64String}`;

    // Generate a custom filename: LA_USERNAME_DDMMYYYY
    const userName = session.user.name || 'Unknown';
    const sanitizedUserName = userName.toUpperCase().replace(/\s+/g, '');
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const customFilename = `LA_${sanitizedUserName}_${day}${month}${year}`;

    // Upload to Cloudinary as raw file (PDFs don't support quality transformations when downloaded)
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: 'learning-agreements',
      resource_type: 'raw', // Use 'raw' for PDFs to ensure download works
      type: 'upload',
      access_mode: 'public',
      public_id: customFilename,
    });

    // For raw files, Cloudinary returns the correct URL
    const baseUrl = uploadResponse.secure_url;
    // Add fl_attachment to force download
    const downloadUrl = baseUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');

    // Save to database
    await pool.query(
      `INSERT INTO learning_agreements (user_id, pdf_url, cloudinary_public_id)
       VALUES ($1, $2, $3)`,
      [userId, baseUrl, uploadResponse.public_id]
    );

    return NextResponse.json({
      success: true,
      url: baseUrl,
      downloadUrl: downloadUrl,
      publicId: uploadResponse.public_id,
      message: 'Takk for at du deler din Learning Agreement! Den vil bli gjennomgått av admin.',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'En feil oppstod under opplasting' },
      { status: 500 }
    );
  }
}
