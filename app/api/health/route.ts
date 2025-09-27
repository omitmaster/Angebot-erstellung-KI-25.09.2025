import { createHealthResponse } from "@/lib/monitoring/health"

export async function GET() {
  return await createHealthResponse()
}
