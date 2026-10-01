import { getServerSession } from "next-auth";
import { ProfilePage } from "@/components/profile-page";
import { authOptions } from "@/lib/auth";

export default async function ProfileRoute() {
  const session = await getServerSession(authOptions);
  return <ProfilePage name={session?.user?.name ?? "Estudiante"} email={session?.user?.email ?? ""} />;
}
