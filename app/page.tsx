import DashboardPage from "./(shell)/dashboard/page";

export const revalidate = 3600;

export default function Home() {
  return <DashboardPage />;
}

