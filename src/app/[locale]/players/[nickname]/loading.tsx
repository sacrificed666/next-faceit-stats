import { currentLocale, getI18n } from "@/shared/i18n/server";
import { Skeleton } from "@/shared/ui/Skeleton";

export default async function PlayerLoading() {
  const { t } = await getI18n(await currentLocale());
  return (
    <Skeleton label={t("loading.player")}>
      <div className="h-4 w-40 rounded-full bg-inset" />
      <div className="panel h-72 sm:h-80" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {["kd", "kr", "adr", "hs", "win", "record"].map((tile) => (
          <div key={tile} className="panel h-24" />
        ))}
      </div>
      <div className="panel h-80" />
    </Skeleton>
  );
}
