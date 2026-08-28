import test from "node:test"
import assert from "node:assert/strict"
import { selectSupabasePublicConfig } from "../lib/supabase/config.mjs"

test("keeps each Supabase URL paired with a key from the same integration", () => {
  const config = selectSupabasePublicConfig({
    jjUrl: "https://jj.supabase.co",
    jjPublishableKey: "sb_publishable_jj",
    genericUrl: "https://legacy.supabase.co",
    genericAnonKey: "legacy-anon",
  })

  assert.deepEqual(config, {
    url: "https://jj.supabase.co",
    key: "sb_publishable_jj",
  })
})

test("falls back to the complete generic Supabase pair", () => {
  const config = selectSupabasePublicConfig({
    jjUrl: "https://jj.supabase.co",
    genericUrl: "https://generic.supabase.co",
    genericPublishableKey: "sb_publishable_generic",
  })

  assert.deepEqual(config, {
    url: "https://generic.supabase.co",
    key: "sb_publishable_generic",
  })
})

test("returns null instead of mixing incomplete Supabase configurations", () => {
  assert.equal(selectSupabasePublicConfig({
    jjUrl: "https://jj.supabase.co",
    genericAnonKey: "legacy-anon",
  }), null)
})
