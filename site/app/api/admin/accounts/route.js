import { classAccountAdminRoute, getClassAccounts, updateClassAccount } from "@/lib/class-account-admin-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30
export async function GET(request) { return classAccountAdminRoute(() => getClassAccounts(request)) }
export async function POST(request) { return classAccountAdminRoute(() => updateClassAccount(request)) }
