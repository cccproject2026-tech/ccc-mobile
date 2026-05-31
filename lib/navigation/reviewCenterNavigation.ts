/** Canonical hrefs for mentor review-center back navigation. */

export function buildReviewCenterIndexHref(): string {
  return "/(mentor)/(tabs)/review-center";
}

export function buildReviewCenterPastorHref(
  pastorId: string,
  pastorName?: string,
): string {
  const params = new URLSearchParams();
  if (pastorId) params.set("pastorId", pastorId);
  if (pastorName) params.set("pastorName", pastorName);
  const qs = params.toString();
  return qs
    ? `${buildReviewCenterIndexHref()}/pastor?${qs}`
    : `${buildReviewCenterIndexHref()}/pastor`;
}

export function buildReviewCenterListHref(
  bucket: string,
  pastorId?: string,
  pastorName?: string,
): string {
  const params = new URLSearchParams({ bucket });
  if (pastorId) params.set("pastorId", pastorId);
  if (pastorName) params.set("pastorName", pastorName);
  return `${buildReviewCenterIndexHref()}/list?${params.toString()}`;
}
