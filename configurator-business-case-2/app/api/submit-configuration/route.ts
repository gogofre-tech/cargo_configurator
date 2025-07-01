// app/api/submit-configuration/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the path for the JSON file where configurations will be stored.
// IMPORTANT: This approach has limitations in serverless environments like Vercel
// where the filesystem is ephemeral or read-only for write operations beyond /tmp.
// For production, a database or a dedicated backend service is recommended.
const dataFilePath = path.join(process.cwd(), 'data', 'configurations.json');

async function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  try {
    await fs.access(dirname);
  } catch (e) {
    // Directory does not exist
    await fs.mkdir(dirname, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Ensure the /data directory exists
    await ensureDirectoryExists(dataFilePath);

    let configurations: any[] = [];
    try {
      // Try to read existing configurations
      const fileContent = await fs.readFile(dataFilePath, 'utf-8');
      configurations = JSON.parse(fileContent);
    } catch (error: any) {
      // If file doesn't exist or is not valid JSON, start with an empty array
      if (error.code !== 'ENOENT') { // ENOENT means file not found, which is fine for the first time
        console.warn('Error reading or parsing configurations.json:', error);
      }
    }

    // Add new configuration with a timestamp
    configurations.push({ ...data, submittedAt: new Date().toISOString() });

    // Write updated configurations back to the file
    await fs.writeFile(dataFilePath, JSON.stringify(configurations, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Configuration submitted successfully.', data }, { status: 200 });
  } catch (error: any) {
    console.error('Error in submit-configuration API:', error);
    return NextResponse.json({ message: 'Error submitting configuration.', error: error.message }, { status: 500 });
  }
}
