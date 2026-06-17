import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";

const formatDate = (value) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
};

export default function BookCard({ book, index }) {
  return (
    <div style={{ animationDelay: `${index * 50}ms` }}>
      <Link
        to={`/summary/${book.id}`}
        className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all"
      >
        <div className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>
          {book.one_line_summary && (
            <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{book.one_line_summary}</p>
          )}
          <p className="text-xs text-muted-foreground/50 mt-2">{formatDate(book.created_at || book.created_date)}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
      </Link>
    </div>
  );
}
