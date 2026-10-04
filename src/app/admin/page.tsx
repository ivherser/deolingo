import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { getRegisteredUsers } from "@/lib/data/admin";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const userId = await requireUserId();
  if (!userId) {
    notFound();
  }
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!currentUser || !isAdminEmail(currentUser.email)) {
    notFound();
  }

  const users = await getRegisteredUsers();
  const dateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-black">Usuarios registrados</h1>
      <p className="mt-2 font-semibold text-[#777]">Total: {users.length}</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#ddd]">
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Correo electrónico</th>
              <th className="px-3 py-2">Fecha de registro</th>
              <th className="px-3 py-2">Nivel</th>
              <th className="px-3 py-2">XP</th>
              <th className="px-3 py-2">Lecciones completadas</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[#eee]">
                <td className="px-3 py-2">{user.name ?? "—"}</td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2">{dateFormatter.format(user.createdAt)}</td>
                <td className="px-3 py-2">{user.progress?.selectedLevel ?? "—"}</td>
                <td className="px-3 py-2">{user.progress?.xp ?? 0}</td>
                <td className="px-3 py-2">{user._count.completions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
