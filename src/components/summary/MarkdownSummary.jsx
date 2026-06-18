import { useState } from 'react';
import { Copy, Check, Lightbulb, BookMarked, Quote, ClipboardList, BookOpen } from 'lucide-react';

export function parseMarkdown(md) {
  if (!md) return {};

  // Backward compatibility for legacy JSON-formatted summaries
  if (typeof md === 'object') {
    return {
      briefDescription: md.overview || md.one_line_summary || '',
      keyInsights: Array.isArray(md.key_takeaways) ? md.key_takeaways : [],
      stories: Array.isArray(md.best_stories) 
        ? md.best_stories.map(s => `### ${s.title}\n${s.story}\n\n*Lesson*: ${s.lesson}`).join('\n\n') 
        : '',
      quotes: [],
      todaysTask: Array.isArray(md.actionable_insights) 
        ? md.actionable_insights.map(i => `**${i.insight}**\n${i.how_to_apply}`).join('\n\n') 
        : ''
    };
  }

  if (typeof md !== 'string') return {};

  const result = {
    briefDescription: '',
    keyInsights: [],
    stories: '',
    quotes: [],
    todaysTask: ''
  };

  const getSection = (headerPattern) => {
    const regex = new RegExp(`##\\s+${headerPattern}\\s*\\n([\\s\\S]*?)(?=\\n##|\\n#|$)`, 'i');
    const match = md.match(regex);
    return match ? match[1].trim() : '';
  };

  result.briefDescription = getSection('Brief Description');
  result.stories = getSection('Stories & Examples');
  result.todaysTask = getSection("Today's Task");

  // Parse Key Insights
  const insightsText = getSection('Key Insights');
  if (insightsText) {
    const lines = insightsText.split('\n');
    const insightsList = [];
    let currentInsight = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        if (currentInsight) {
          insightsList.push(currentInsight);
        }
        const cleanLine = trimmed.replace(/^-\s*/, '');
        const boldMatch = cleanLine.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
        if (boldMatch) {
          currentInsight = { title: boldMatch[1], explanation: boldMatch[2] };
        } else {
          currentInsight = { title: 'Insight', explanation: cleanLine };
        }
      } else if (trimmed.length > 0) {
        if (currentInsight) {
          currentInsight.explanation += ' ' + trimmed;
        } else {
          currentInsight = { title: 'Insight', explanation: trimmed };
        }
      }
    });
    if (currentInsight) {
      insightsList.push(currentInsight);
    }
    result.keyInsights = insightsList;
  }

  // Parse Quotes
  const quotesText = getSection('Quotes');
  if (quotesText) {
    result.quotes = quotesText
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0 && !line.toLowerCase().includes('no quotable passages'));
  }

  return result;
}

export default function MarkdownSummary({ markdownContent, bookInfo }) {
  const [copied, setCopied] = useState(false);
  const parsed = parseMarkdown(markdownContent);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!markdownContent) return null;

  return (
    <div className="space-y-10">
      {/* Book Metadata & Title Banner */}
      <div className="text-center relative pb-6 border-b border-border/40">
        {bookInfo.cover_url && (
          <div className="w-32 h-44 mx-auto mb-6 rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
            <img src={bookInfo.cover_url} alt={bookInfo.title} className="w-full h-full object-cover" />
          </div>
        )}

        <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-1 tracking-tight text-foreground">{bookInfo.title}</h2>
        <p className="text-muted-foreground text-lg mb-6">by {bookInfo.author}</p>

        {/* Copy Markdown Note Control */}
        <div className="flex justify-center mb-2">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-300 ${
              copied
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-card hover:bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied Markdown Note!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Markdown Note
              </>
            )}
          </button>
        </div>
      </div>

      {/* Brief Description */}
      {parsed.briefDescription && (
        <section className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-foreground pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <BookOpen className="w-24 h-24" />
          </div>
          <h3 className="font-heading text-lg font-bold mb-3 flex items-center gap-2 text-foreground/90">
            <BookOpen className="w-4 h-4 text-primary" />
            Brief Description
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{parsed.briefDescription}</p>
        </section>
      )}

      {/* Key Insights */}
      {parsed.keyInsights.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-heading text-2xl font-bold text-foreground">Key Insights</h3>
              <p className="text-sm text-muted-foreground">The most crucial conceptual takeaways from this reading</p>
            </div>
          </div>

          <div className="grid gap-4">
            {parsed.keyInsights.map((item, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl bg-card border border-border hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                  <span className="text-xs font-bold text-accent">{i + 1}</span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1.5">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stories & Examples */}
      {parsed.stories && parsed.stories !== 'No stories or examples in this segment.' && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-2xl font-bold text-foreground">Stories & Examples</h3>
              <p className="text-sm text-muted-foreground">Anecdotes and case studies from this segment</p>
            </div>
          </div>

          <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm leading-relaxed text-sm sm:text-base text-muted-foreground whitespace-pre-line">
            {parsed.stories}
          </div>
        </section>
      )}

      {/* Quotes */}
      {parsed.quotes.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Quote className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-heading text-2xl font-bold text-foreground">Quotable Passages</h3>
              <p className="text-sm text-muted-foreground">Impactful lines directly from the pages</p>
            </div>
          </div>

          <div className="grid gap-4">
            {parsed.quotes.map((quote, i) => (
              <blockquote key={i} className="relative p-5 rounded-2xl bg-secondary/30 border-l-4 border-amber-500/60 italic text-foreground/90 text-sm sm:text-base leading-relaxed">
                <Quote className="absolute top-3 right-4 w-10 h-10 text-foreground/5 opacity-[0.03] pointer-events-none" />
                {quote}
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* Today's Task */}
      {parsed.todaysTask && (
        <section className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-transparent border border-primary/20">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-primary pointer-events-none">
            <ClipboardList className="w-20 h-20" />
          </div>
          <div className="flex items-center gap-2.5 mb-4">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-lg font-bold text-foreground">Today's Action Plan</h3>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{parsed.todaysTask}</p>
        </section>
      )}
    </div>
  );
}
