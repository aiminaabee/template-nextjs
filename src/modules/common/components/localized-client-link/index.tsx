"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

/**
 * Prefixes href with the current country code. Store code lives in env, not the URL.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode;
  href: string;
  className?: string;
  onClick?: () => void;
  passHref?: true;
  [x: string]: any;
}) => {
  const { countryCode } = useParams();
  const defaultCountry = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";
  const country =
    typeof countryCode === "string" && countryCode.length === 2
      ? countryCode
      : defaultCountry;

  return (
    <Link href={`/${country}${href}`} {...props}>
      {children}
    </Link>
  );
};

export default LocalizedClientLink;
