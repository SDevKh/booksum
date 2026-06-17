import { Zap } from "lucide-react";

export default function ActionableInsights({ insights }) {
  if (!insights?.length) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-chart-2" />
        </div>
        <div>
          <h3 className="font-heading text-2xl font-semibold">Apply It Today</h3>
          <p className="text-sm text-muted-foreground">Practical steps you can take right now</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {insights.map((item, i) => (
          <div key={i} className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" />
              <h4 className="font-semibold text-foreground text-sm">{item.insight}</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.how_to_apply}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
