import { PageHeader } from "../layout/PageHeader";
import { AppearanceCard } from "./AppearanceCard";
import { BackupCard } from "./BackupCard";
import { DangerZoneCard } from "./DangerZoneCard";
import { PlanStartCard } from "./PlanStartCard";

export function SettingsView() {
  return (
    <>
      <PageHeader title="Settings" description="Plan start date, appearance, and backing up or restoring your progress." />
      <div className="max-w-3xl space-y-5">
        <PlanStartCard />
        <AppearanceCard />
        <BackupCard />
        <DangerZoneCard />
      </div>
    </>
  );
}
