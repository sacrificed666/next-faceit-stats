import { currentLocale, getI18n } from "@/shared/i18n/server";
import Skeleton from "@/shared/ui/Skeleton/Skeleton";

const Loading = async () => {
  const { t } = await getI18n(await currentLocale());
  return (
    <Skeleton label={t("loading.squad")}>
      <div className="flex flex-col gap-3">
        <div className="h-3 w-48 rounded-full bg-inset" />
        <div className="h-12 w-72 rounded-2xl bg-inset sm:h-16" />
        <div className="h-4 w-full max-w-xl rounded-full bg-inset" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {["elo", "kd", "win", "together", "streak"].map((tile) => (
          <div key={tile} className="panel h-24" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {["a", "b", "c", "d", "e"].map((card) => (
          <div key={card} className="panel h-72" />
        ))}
      </div>
    </Skeleton>
  );
};

export default Loading;
