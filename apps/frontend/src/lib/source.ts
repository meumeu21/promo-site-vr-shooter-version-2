type QueryParamsLike = Pick<URLSearchParams, 'get'>;
const normalizeValue = (value: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized.length > 0 ? normalized : undefined;
};
const serializePart = (key: string, value: string): string => `${key}:${encodeURIComponent(value)}`;
export const extractSourceFromParams = (params: QueryParamsLike): string | undefined => {
  const utmSource = normalizeValue(params.get('utm_source'));
  const utmMedium = normalizeValue(params.get('utm_medium'));
  const utmCampaign = normalizeValue(params.get('utm_campaign'));
  const utmContent = normalizeValue(params.get('utm_content'));
  const utmTerm = normalizeValue(params.get('utm_term'));
  const utmParts = [utmSource ? serializePart('src', utmSource) : undefined, utmMedium ? serializePart('med', utmMedium) : undefined, utmCampaign ? serializePart('cmp', utmCampaign) : undefined, utmContent ? serializePart('cnt', utmContent) : undefined, utmTerm ? serializePart('trm', utmTerm) : undefined].filter((part): part is string => Boolean(part));
  if (utmParts.length > 0) {
    return utmParts.join('|').slice(0, 255);
  }
  const fallbackSource = normalizeValue(params.get('source'));
  return fallbackSource ? serializePart('source', fallbackSource).slice(0, 255) : undefined;
};
