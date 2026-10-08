import { rejectFileImport } from "@/lib/imports/upload-blocked";

export async function POST() {
  return rejectFileImport();
}
