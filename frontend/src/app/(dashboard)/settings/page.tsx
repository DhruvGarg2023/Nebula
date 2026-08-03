import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Root /settings redirects to /settings/profile
 */
export default function SettingsPage() {
  redirect(ROUTES.SETTINGS_PROFILE);
}
