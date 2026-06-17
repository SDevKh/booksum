import { Lightbulb } from "lucide-react";

export default function KeyTakeaways({ takeaways }) {
  if (!takeaways?.length) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-heading text-2xl font-semibold">Key Takeaways</h3>
          <p className="text-sm text-muted-foreground">The most important ideas from the book</p>
        </div>
      </div>

      <div className="grid gap-4">
        {takeaways.map((item, i) => (
          <div key={i} className="flex gap-4 p-5 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-sm font-bold text-accent">{i + 1}</span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
