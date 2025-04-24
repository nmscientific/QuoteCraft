'use server';

import fs from 'fs';
import fsPromises from 'fs/promises';

export async function listFiles(dir: string): Promise<string[] | null> {
  try {
    const files = await fsPromises.readdir(dir);
    return files;
  } catch (error) {
    console.error("Error reading directory:", error);
    return null;
  }
}

export async function readFile(filePath: string): Promise<string | null> {
  try {
    const fileContent = await fsPromises.readFile(filePath, 'utf-8');
    return fileContent;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fsPromises.unlink(filePath);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}
