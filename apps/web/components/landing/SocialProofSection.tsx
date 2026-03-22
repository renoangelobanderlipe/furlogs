const stats = [
  {
    value: "15+",
    label: "Pet species",
    sub: "from dogs to reptiles",
  },
  {
    value: "11",
    label: "Care modules",
    sub: "covering every need",
  },
  {
    value: "∞",
    label: "Household members",
    sub: "invite everyone",
  },
] as const;

export const SocialProofSection = () => {
  return (
    <div className="relative border-y border-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-card/40 to-background" />
      <div className="relative container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center relative"
            >
              {/* Divider between items on desktop */}
              {i > 0 && (
                <div className="hidden md:block absolute left-0 inset-y-4 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
              )}
              <span
                className="text-[3.5rem] font-black leading-none tabular-nums mb-2"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(174 80% 62%) 0%, hsl(174 80% 40%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </span>
              <span className="text-base font-semibold text-foreground mb-0.5">
                {stat.label}
              </span>
              <span className="text-sm text-muted-foreground">{stat.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
