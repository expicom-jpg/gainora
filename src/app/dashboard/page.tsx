import Link from "next/link";
import { listOrganizationsForCurrentUser } from "@/lib/organizations";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const organizations = await listOrganizationsForCurrentUser();

  return (
    <main>
      <h1>Gainora Dashboard</h1>
      <p>Organizations you can access:</p>
      <ul>
        {organizations.map((item: any) => (
          <li key={item.organization?.id}>
            {item.organization?.name} ({item.role})
          </li>
        ))}
      </ul>

      <p>
        <Link href="/dashboard/organizations/new">Create organization</Link>
      </p>
      <p>
        <Link href="/dashboard/imports/new">Start a financial import</Link>
      </p>
    </main>
  );
}
