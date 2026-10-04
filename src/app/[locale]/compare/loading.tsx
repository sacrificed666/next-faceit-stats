import { currentLocale, getI18n } from "@/shared/i18n/server";
import { Skeleton } from "@/shared/ui/Skeleton";

export default async function CompareLoading() {
  const { t } = await getI18n(await currentLocale());
  return (
    <Skeleton label={t("loading.compare")}>
      <div className="flex flex-col gap-3">
        <div className="h-3 w-48 rounded-full bg-inset" />
        <div className="h-12 w-80 rounded-2xl bg-inset sm:h-16" />
      </div>
      <div className="panel h-64" />
      <div className="panel h-96" />
    </Skeleton>
  );
}
