import { fetchAllPlayers } from "@/lib/api";
import Header from "@/components/layout/Header";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function Page() {
  try {
    const players = await fetchAllPlayers();
    return <DashboardClient players={players} />;
  } catch (error) {
    return (
      <>
        <Header />
        <div
          className="flex items-center justify-center min-h-[50vh] px-4 pt-16 sm:pt-18"
          role="alert"
        >
          <div className="bg-surface/80 backdrop-blur-xl border border-white/6 rounded-2xl p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-red-400 mb-2">Failed to load data</h2>
            <p className="text-gray-400 text-sm">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
          </div>
        </div>
      </>
    );
  }
}
