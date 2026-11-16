import { useMutation } from "@tanstack/react-query"

type LookupResponse = { found: boolean }

async function lookupClient(email: string): Promise<LookupResponse> {
  const res = await fetch("/api/clients/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    throw new Error("Client lookup failed")
  }
  return res.json()
}

export function useClientLookup() {
  return useMutation({ mutationFn: lookupClient })
}
