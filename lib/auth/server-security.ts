import { headers } from "next/headers"

export async function getClientIP(): Promise<string> {
  const headersList = await headers()

  // Check various headers for the real IP
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")
  const cfConnectingIP = headersList.get("cf-connecting-ip")

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return "unknown"
}
