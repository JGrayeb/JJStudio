import { sendSubscriptionReminders, subscriptionRoute } from "@/lib/subscriptions-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60
export async function GET(request) { return subscriptionRoute(() => sendSubscriptionReminders(request)) }
export async function POST(request) { return subscriptionRoute(() => sendSubscriptionReminders(request)) }
