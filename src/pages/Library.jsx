import { Link } from 'react-router-dom';
import { Library as LibraryIcon, Loader2, AlertCircle } from 'lucide-react';
import BookCard from '@/components/library/BookCard';
import { listDbSummaries } from '@/utils/library';
import { useQuery } from '@tanstack/react-query';

export default function Library() {
  const { data: books = [], isLoading, error } = useQuery({
    queryKey: ['dbSummaries'],
    queryFn: listDbSummaries,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <LibraryIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold">My Library</h1>
          <p className="text-sm text-muted-foreground">Saved summaries for quick review.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading your library...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 text-red-500 font-medium bg-red-500/10 border border-red-500/20 py-4 px-5 rounded-2xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-400">Failed to Load Library</h4>
            <p className="text-sm text-red-500/90">{error.message || 'An error occurred.'}</p>
          </div>
        </div>
      ) : books.length ? (
        <div className="grid gap-4 w-[93vw]">
          {books.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card">
          <p className="text-muted-foreground mb-4">No saved summaries yet.</p>
          <Link to="/" className="text-primary font-medium hover:underline">
            Create your first summary
          </Link>
        </div>
      )}
    </div>
  );
}