import { HttpTypes } from "@aiminaabeejs/types";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.AIMINAABEE_BACKEND_URL;
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_AIMINAABEE_PUBLISHABLE_KEY;
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";
const DEFAULT_STORE_CODE = process.env.NEXT_PUBLIC_DEFAULT_STORE_CODE || "";

const APP_PATHS = new Set([
  "store",
  "cart",
  "account",
  "checkout",
  "products",
  "collections",
  "categories",
  "order",
]);

const regionMapCache = {
  storeCode: "",
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
};

function getPathSegments(pathname: string) {
  return pathname.split("/").filter(Boolean);
}

function isStoreCodeSegment(segment: string | undefined) {
  if (!segment) {
    return false;
  }

  if (DEFAULT_STORE_CODE && segment === DEFAULT_STORE_CODE) {
    return true;
  }

  return /^sel_[0-9A-Z]+$/i.test(segment);
}

function isCountrySegment(
  segment: string | undefined,
  regionMap: Map<string, HttpTypes.StoreRegion>
) {
  if (!segment || APP_PATHS.has(segment) || segment === "json") {
    return false;
  }

  if (isStoreCodeSegment(segment)) {
    return false;
  }

  if (regionMap.has(segment)) {
    return true;
  }

  return segment.length === 2;
}

async function getRegionMap(cacheId: string) {
  const storeCode = DEFAULT_STORE_CODE;

  if (!BACKEND_URL || !storeCode) {
    return regionMapCache.regionMap;
  }

  const { regionMap, regionMapUpdated } = regionMapCache;

  if (
    regionMapCache.storeCode === storeCode &&
    regionMapUpdated >= Date.now() - 3600 * 1000
  ) {
    return regionMap;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/store/${storeCode}/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    });

    const json = await response.json().catch(() => ({}));
    const regions = Array.isArray(json.regions) ? json.regions : [];

    regionMapCache.regionMap = new Map();
    regionMapCache.storeCode = storeCode;

    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region);
      });
    });

    regionMapCache.regionMapUpdated = Date.now();
  } catch {
    regionMapCache.storeCode = storeCode;
    regionMapCache.regionMapUpdated = Date.now();
  }

  return regionMapCache.regionMap;
}

function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion>,
  segments: string[]
) {
  const vercelCountryCode = request.headers
    .get("x-vercel-ip-country")
    ?.toLowerCase();

  const urlCountryCode = segments[0]?.toLowerCase();

  if (isCountrySegment(urlCountryCode, regionMap)) {
    return urlCountryCode;
  }

  if (vercelCountryCode && isCountrySegment(vercelCountryCode, regionMap)) {
    return vercelCountryCode;
  }

  if (regionMap.has(DEFAULT_REGION)) {
    return DEFAULT_REGION;
  }

  return regionMap.keys().next().value || DEFAULT_REGION;
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next();
  }

  const cacheIdCookie = request.cookies.get("_aiminaabee_cache_id");
  const cacheId = cacheIdCookie?.value || crypto.randomUUID();
  const regionMap = await getRegionMap(cacheId);

  const rawSegments = getPathSegments(request.nextUrl.pathname);
  const hadStoreCode = isStoreCodeSegment(rawSegments[0]);
  const segments = hadStoreCode ? rawSegments.slice(1) : rawSegments;

  const countryCode = getCountryCode(request, regionMap, segments);
  const urlHasCountry = isCountrySegment(segments[0]?.toLowerCase(), regionMap);

  if (urlHasCountry && cacheIdCookie && !hadStoreCode) {
    return NextResponse.next();
  }

  const restSegments = urlHasCountry ? segments.slice(1) : segments;
  const queryString = request.nextUrl.search ? request.nextUrl.search : "";
  const restPath = restSegments.length ? `/${restSegments.join("/")}` : "";
  const redirectUrl = `${request.nextUrl.origin}/${countryCode}${restPath}${queryString}`;

  const response = NextResponse.redirect(redirectUrl, 307);
  response.cookies.set("_aiminaabee_cache_id", cacheId, {
    maxAge: 60 * 60 * 24,
  });

  return response;
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp|json).*)",
  ],
};
