import { getPrivateImportReview, privateImportReviewRoute, privateImportReviewMethodNotAllowed } from "@/lib/private-import-review-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 20
export async function GET(request) { return privateImportReviewRoute(() => getPrivateImportReview(request)) }
export const POST = privateImportReviewMethodNotAllowed
export const PUT = privateImportReviewMethodNotAllowed
export const PATCH = privateImportReviewMethodNotAllowed
export const DELETE = privateImportReviewMethodNotAllowed
export const HEAD = privateImportReviewMethodNotAllowed
export const OPTIONS = privateImportReviewMethodNotAllowed
