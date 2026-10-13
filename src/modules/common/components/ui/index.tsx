"use client"

import * as React from "react"

import { clx } from "@lib/util/clx"

export { default as useToggleState } from "@lib/hooks/use-toggle-state"
export { Button, buttonVariants } from "@/components/ui/button"
export { Badge, badgeVariants } from "@/components/ui/badge"
export { Input } from "@/components/ui/input"
export { Label } from "@/components/ui/label"
export { Checkbox } from "@/components/ui/checkbox"
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
export { Spinner } from "@/components/ui/spinner"
export { Toaster } from "@/components/ui/sonner"
export { toast } from "sonner"
export { Separator } from "@/components/ui/separator"
export { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  level?: "h1" | "h2" | "h3"
}

export const Heading = ({
  level = "h1",
  className,
  ...props
}: HeadingProps) => {
  const Tag = level
  return (
    <Tag
      className={clx("font-sans font-medium text-foreground", className)}
      {...props}
    />
  )
}

export const Text = ({
  className,
  as: Comp = "p",
  size: _size,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "div"
  size?: string
}) => <Comp className={clx("text-sm text-foreground", className)} {...props} />
