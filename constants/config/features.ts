/**
 * Runtime feature flags. `EXPO_PUBLIC_*` vars are inlined by Expo at build time.
 *
 * USE_AGGREGATED_REVIEW_CENTER: when true, the Mentor Review Center loads from the
 * single aggregated backend endpoint (`GET /mentor/review-center`) instead of the
 * legacy client-side fan-out (hundreds of per-mentee/per-task/per-assessment calls).
 * Defaults to true; set EXPO_PUBLIC_USE_AGGREGATED_REVIEW_CENTER=false to roll back.
 */
export const USE_AGGREGATED_REVIEW_CENTER =
    process.env.EXPO_PUBLIC_USE_AGGREGATED_REVIEW_CENTER !== "false";
