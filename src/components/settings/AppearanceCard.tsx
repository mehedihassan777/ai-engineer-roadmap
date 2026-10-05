import { ThemeToggle } from "../layout/ThemeToggle";
import { Card } from "../ui/Card";

export function AppearanceCard() {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold">Appearance</h2>
      <p className="mt-1 text-sm text-muted">System follows your operating system&apos;s light or dark setting.</p>
      <div className="mt-4">
        <ThemeToggle />
      </div>
    </Card>
  );
}
