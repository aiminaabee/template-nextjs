import React from "react"
import SpinnerIcon from "./spinner"
import TrashIcon from "./trash"
import XIcon from "./x"

type SvgProps = React.SVGAttributes<SVGElement> & {
  size?: string | number
  color?: string
}

const svg = (
  props: SvgProps,
  paths: React.ReactNode,
  viewBox = "0 0 24 24"
) => {
  const { size = 20, color = "currentColor", ...rest } = props
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {paths}
    </svg>
  )
}

export const Spinner = SpinnerIcon
export const Trash = TrashIcon
export const XMark = XIcon

export const ChevronUpDown = (props: SvgProps) =>
  svg(
    props,
    <>
      <path
        d="M7 9l5-5 5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 15l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )

export const Plus = (props: SvgProps) =>
  svg(
    props,
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  )

export const ArrowUpRightMini = (props: SvgProps) =>
  svg(
    props,
    <path
      d="M7 17L17 7M8 7h9v9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )

export const ArrowRightMini = (props: SvgProps) =>
  svg(
    props,
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )

export const ArrowRightOnRectangle = (props: SvgProps) =>
  svg(
    props,
    <path
      d="M15 8l5 4-5 4M20 12H9M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )

export const CheckCircleSolid = (props: SvgProps) =>
  svg(
    props,
    <path
      fill="currentColor"
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.3 7.3l-5 5a1 1 0 01-1.4 0l-2-2a1 1 0 111.4-1.4l1.3 1.3 4.3-4.3a1 1 0 111.4 1.4z"
    />
  )

export const CheckCircleMiniSolid = CheckCircleSolid

export const XCircleSolid = (props: SvgProps) =>
  svg(
    props,
    <path
      fill="currentColor"
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm3.5 12.1a1 1 0 11-1.4 1.4L12 13.4l-2.1 2.1a1 1 0 11-1.4-1.4l2.1-2.1-2.1-2.1a1 1 0 111.4-1.4l2.1 2.1 2.1-2.1a1 1 0 111.4 1.4L13.4 12l2.1 2.1z"
    />
  )

export const PencilSquare = (props: SvgProps) =>
  svg(
    props,
    <path
      d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )

export const Loader = SpinnerIcon

export const Github = (props: SvgProps) =>
  svg(
    props,
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0112 6.84c.85 0 1.71.12 2.51.35 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.21 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.58 5.06.36.32.68.94.68 1.9 0 1.38-.01 2.49-.01 2.83 0 .27.18.6.69.49A10.03 10.03 0 0022 12.26C22 6.58 17.52 2 12 2z"
    />
  )

export const CreditCard = (props: SvgProps) =>
  svg(
    props,
    <>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
    </>
  )

export const EllipseMiniSolid = (props: SvgProps) =>
  svg(
    { size: 16, ...props },
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  )

export const ExclamationCircleSolid = (props: SvgProps) =>
  svg(
    props,
    <path
      fill="currentColor"
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 01-1-1V8a1 1 0 112 0v4a1 1 0 01-1 1z"
    />
  )
