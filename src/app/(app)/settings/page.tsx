import { SettingsView } from "@/features/settings";
import { getProfile } from "@/shared/api/profile";

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <SettingsView
      courseName={profile.courseName}
      defaultCaddieFee={profile.defaultCaddieFee}
    />
  );
}
