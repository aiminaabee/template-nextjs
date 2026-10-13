"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import React from "react"
import { useFormStatus } from "react-dom"

const VARIANT = {
  primary: "default",
  secondary: "secondary",
  transparent: "ghost",
  danger: "destructive",
} as const

export function SubmitButton({
  children,
  variant = "primary",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: keyof typeof VARIANT | null
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      size="lg"
      className={className}
      type="submit"
      disabled={pending}
      variant={VARIANT[variant || "primary"]}
      data-testid={dataTestId}
    >
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {children}
    </Button>
  )
}
