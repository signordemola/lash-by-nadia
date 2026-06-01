import { useMutation } from "@tanstack/react-query"

type LookupResponse =
  | { found: true; name: string; phone: string; allergies: string | null }
  | { found: false }

async function lookupClient(email: string): Promise<LookupResponse> {
  const res = await fetch("/api/clients/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  return res.json()
}

export function useClientLookup() {
  return useMutation({ mutationFn: lookupClient })
}
