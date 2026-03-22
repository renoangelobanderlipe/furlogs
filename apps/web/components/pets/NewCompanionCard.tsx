import { PlusCircle } from "lucide-react";

export const NewCompanionCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/60 bg-card/30 p-6 text-center transition-all hover:border-primary/40 hover:bg-card animate-fade-in-up active:scale-[0.98] w-full min-h-[180px] sm:min-h-[280px]"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <PlusCircle className="h-7 w-7" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">New Companion</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-[160px]">
          Ready for a new adventure? Tap here to add your latest addition.
        </p>
      </div>
    </button>
  );
};
