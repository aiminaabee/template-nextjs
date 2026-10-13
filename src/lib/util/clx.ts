import { type ClassValue } from "clsx"
import { cn } from "@/lib/utils"

export function clx(...args: ClassValue[]) {
  return cn(...args)
}
