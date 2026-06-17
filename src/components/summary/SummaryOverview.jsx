import { Quote } from "lucide-react";

export default function SummaryOverview({ summary }) {
  return (
    <div className="text-center mb-12">
      {summary.cover_url && (
        <div className="w-32 h-44 mx-auto mb-6 rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
          <img src={summary.cover_url} alt={summary.title} className="w-full h-full object-cover" />
        </div>
      )}

      <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-1">{summary.title}</h2>
      <p className="text-muted-foreground text-lg mb-4">by {summary.author}</p>

      {summary.one_line_summary && (
        <div className="inline-flex items-start gap-2 max-w-lg mx-auto px-5 py-3 rounded-xl bg-secondary/60 border border-border">
          <Quote className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-sm italic text-foreground/80">{summary.one_line_summary}</p>
        </div>
      )}

      {summary.overview && (
        <p className="max-w-2xl mx-auto mt-6 text-muted-foreground leading-relaxed">{summary.overview}</p>
      )}
    </div>
  );
}
