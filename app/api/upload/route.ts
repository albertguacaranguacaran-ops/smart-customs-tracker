import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Network Path Configuration
const NETWORK_UPLOAD_PATH = String.raw`\\192.168.0.236\Recursos Humanos\TRABAJO PROYECTO\3.-Analistas\4.-Albert Guacaran\12.proyectos de api`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ status: "fail", error: "No files uploaded" }, { status: 400 });
    }

    // 1. Determine Folder Name smartly
    // Priority: Look for a file with "BL" or "Bill" in the name.
    // Fallback: Use the name of the first file.
    let mainFileName = files[0].name;
    const blFile = files.find(f => f.name.toUpperCase().includes('BL') || f.name.toUpperCase().includes('BILL'));

    if (blFile) {
      mainFileName = blFile.name;
    }

    // Clean up filename for folder usage
    const safeMainName = mainFileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const folderBaseName = path.parse(safeMainName).name;

    // Date prefix
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const folderName = `${dateStr}_${folderBaseName}`; // e.g., 2024-10-28_Bill_of_Lading_HLBU-123

    // Create the ONE folder for this batch
    const targetFolder = path.join(NETWORK_UPLOAD_PATH, folderName);

    if (!fs.existsSync(targetFolder)) {
      try {
        fs.mkdirSync(targetFolder, { recursive: true });
      } catch (err) {
        console.error("Error creating folder:", err);
        return NextResponse.json({ status: "fail", error: "Permission denied creating folder" }, { status: 500 });
      }
    }

    // 2. Save ALL files into that folder
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = path.join(targetFolder, safeFileName);

      fs.writeFileSync(filePath, buffer);
    }

    // Simulate SharePoint Sync
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      status: "success",
      folder: folderName,
      message: `Saved ${files.length} documents in ${folderName}`
    });

  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ status: "fail", error: String(e) }, { status: 500 });
  }
}
