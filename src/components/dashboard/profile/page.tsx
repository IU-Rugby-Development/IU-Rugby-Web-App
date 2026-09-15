import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/profile");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
      <p className="mt-1 text-sm text-gray-600">
        Role and group membership are managed by administrators.
      </p>
      <div className="mt-6">
        <ProfileForm firstName={user.profile.first_name} lastName={user.profile.last_name} />
      </div>
    </div>
  );
}
