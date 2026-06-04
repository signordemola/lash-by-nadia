import { useQuery } from "@tanstack/react-query"

type CheckoutInput = {
  serviceSlug: string
  date: string
  time: string
  name: string
  email: string
  phone: string
  allergies?: string
  referralSource?: string
  policyAgreed: true
}

type CheckoutResponse = {
  clientSecret?: string
  free?: boolean
  manageToken?: string
}

async function fetchCheckout(data: CheckoutInput): Promise<CheckoutResponse> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? "Failed to create checkout")
  return json
}

export function useStripeCheckout(data: CheckoutInput | null) {
  return useQuery({
    queryKey: ["stripe-checkout", data],
    queryFn: () => fetchCheckout(data!),
    enabled: !!data,
    staleTime: Infinity,
  })
}
