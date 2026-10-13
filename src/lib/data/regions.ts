"use server";

import { HttpTypes } from "@aiminaabeejs/types";
import { sdk } from "@lib/config";
import aiminaabeeError from "@lib/util/aiminaabee-error";

export const listRegions = async (
  storeCode: string
): Promise<HttpTypes.StoreRegion[]> => {
  return sdk.store.region
    .list(storeCode)
    .then(
      ({ regions }: HttpTypes.StoreRegionListResponse) => regions
    )
    .catch(aiminaabeeError);
};

export const retrieveRegion = async (
  storeCode: string,
  id: string
): Promise<HttpTypes.StoreRegion> => {
  return sdk.store.region
    .retrieve(storeCode, id)
    .then(({ region }: HttpTypes.StoreRegionResponse) => region)
    .catch(aiminaabeeError);
};

const regionMap = new Map<string, HttpTypes.StoreRegion>();

export const getRegion = async (
  storeCode: string,
  countryCode: string
): Promise<HttpTypes.StoreRegion | undefined | null> => {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode);
    }

    const regions = await listRegions(storeCode);

    if (!regions) {
      return null;
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        const iso = (c?.iso_2 ?? "").toLowerCase();
        if (iso) {
          regionMap.set(iso, region);
        }
      });
    });

    const region = countryCode
      ? regionMap.get(countryCode.toLowerCase())
      : regionMap.get("us");

    return region;
  } catch {
    return null;
  }
};
