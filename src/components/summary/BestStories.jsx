import { BookMarked } from "lucide-react";

export default function BestStories({ stories }) {
  if (!stories?.length) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookMarked className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-2xl font-semibold">Best Stories & Examples</h3>
          <p className="text-sm text-muted-foreground">Memorable anecdotes that teach powerful lessons</p>
        </div>
      </div>

      <div className="space-y-4">
        {stories.map((item, i) => (
          <div key={i} className="rounded-xl bg-card border border-border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <h4 className="font-heading text-lg font-semibold mb-3">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.story}</p>
              <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-secondary/50 border-l-4 border-accent">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent mt-0.5">Lesson:</span>
                <p className="text-sm text-foreground/80">{item.lesson}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
