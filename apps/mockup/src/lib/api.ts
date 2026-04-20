import { hc } from 'hono/client'
import type { AppType } from '@ledger/api' // using the inferred type from Hono API

// Point to the API URL. In development, it runs on port 8787 via turborepo.
// Override with VITE_API_URL for non-local targets.
const baseUrl = import.meta.env["VITE_API_URL"] ?? 'http://localhost:8787'
export const client = hc<AppType>(baseUrl)
