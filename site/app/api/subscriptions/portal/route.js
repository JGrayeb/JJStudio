import { createSubscriptionPortal, subscriptionRoute } from "@/lib/subscriptions-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request) {
  return subscriptionRoute(() => createSubscriptionPortal(request))
}
