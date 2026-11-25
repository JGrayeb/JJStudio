import { getSubscriptionAdmin, updateSubscriptionAdmin, subscriptionRoute } from "@/lib/subscriptions-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export async function GET(request) { return subscriptionRoute(() => getSubscriptionAdmin(request)) }
export async function POST(request) { return subscriptionRoute(() => updateSubscriptionAdmin(request)) }
