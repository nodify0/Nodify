
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { CustomNode } from '@/lib/custom-nodes-types';

const nodesDirectory = path.join(process.cwd(), 'src', 'nodes');

// Ensure the nodes directory exists
async function ensureDirectoryExists() {
  try {
    await fs.access(nodesDirectory);
  } catch {
    await fs.mkdir(nodesDirectory, { recursive: true });
  }
}

// GET handler to read a node definition
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
  }

  try {
    const filePath = path.join(nodesDirectory, `${id}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const nodeData = JSON.parse(fileContent);

    // If there's a separate execution file, read it too
    if (nodeData.executionFile) {
        const jsFilePath = path.join(nodesDirectory, `${id}.js`);
        try {
            const jsContent = await fs.readFile(jsFilePath, 'utf-8');
            // The convention is to export default, so we'll just send the raw content
            nodeData.executionCode = jsContent;
        } catch (jsError) {
            // If the JS file doesn't exist, we can let the user create it.
            // Send back an empty string for the executionCode.
            nodeData.executionCode = '// Associated .js file not found. Create it or uncheck "Generate separated JS file".';
        }
    }

    return NextResponse.json(nodeData);
  } catch (error) {
    console.error(`[API] Failed to read node ${id}:`, error);
    return NextResponse.json({ error: 'Node definition not found' }, { status: 404 });
  }
}

// POST handler to save a node definition
export async function POST(request: Request) {
  try {
    const nodeData: CustomNode = await request.json();

    if (!nodeData || !nodeData.id) {
      return NextResponse.json({ error: 'Invalid node data' }, { status: 400 });
    }

    await ensureDirectoryExists();

    const jsonFilePath = path.join(nodesDirectory, `${nodeData.id}.json`);
    const jsFilePath = path.join(nodesDirectory, `${nodeData.id}.js`);

    const executionCode = nodeData.executionCode || '';
    
    // Separate the execution code if executionFile is true
    if (nodeData.executionFile) {
        // Don't store executionCode in the JSON file
        const jsonContent: Partial<CustomNode> = { ...nodeData };
        delete jsonContent.executionCode;

        await fs.writeFile(jsFilePath, executionCode, 'utf-8');
        await fs.writeFile(jsonFilePath, JSON.stringify(jsonContent, null, 2), 'utf-8');
    } else {
        // Inline the execution code
        await fs.writeFile(jsonFilePath, JSON.stringify(nodeData, null, 2), 'utf-8');
        // If a .js file exists but is no longer needed, remove it
        try {
            await fs.unlink(jsFilePath);
        } catch (error: any) {
            if (error.code !== 'ENOENT') { // Ignore if file doesn't exist
                console.warn(`[API] Could not delete unused JS file ${jsFilePath}:`, error);
            }
        }
    }

    return NextResponse.json({ success: true, id: nodeData.id });
  } catch (error) {
    console.error('[API] Failed to save node:', error);
    return NextResponse.json({ error: 'Failed to save node definition' }, { status: 500 });
  }
}
