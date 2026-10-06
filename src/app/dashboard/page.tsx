import { listOrganizationsForCurrentUser } from "@/lib/organizations";

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
    </main>
  );
}
