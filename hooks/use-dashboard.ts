import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useMarkComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await fetch(
        `/api/dashboard/appointments/${appointmentId}/complete`,
        {
          method: "POST",
        }
      )
      if (!res.ok) throw new Error("Failed to mark as complete")
      return appointmentId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useMarkNoShow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await fetch(
        `/api/dashboard/appointments/${appointmentId}/no-show`,
        {
          method: "POST",
        }
      )
      if (!res.ok) throw new Error("Failed to mark as no-show")
      return appointmentId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
