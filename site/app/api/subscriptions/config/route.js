import { getSubscriptionConfig, subscriptionRoute } from "@/lib/subscriptions-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request) {
  return subscriptionRoute(() => getSubscriptionConfig())
}
