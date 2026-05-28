import { router } from 'expo-router';

/** Welcome / role-selection landing screen after logout */
export const WELCOME_ROUTE = '/' as const;

export function navigateToWelcomeCenter() {
  router.replace(WELCOME_ROUTE);
}
