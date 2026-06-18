import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookSearchHero from '@/components/home/BookSearchHero';
import LoadingState from '@/components/home/LoadingState';
import { saveDbSummary } from '@/utils/library';
import { baseClient } from '@/api/baseClient';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSummarize = async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { text, title, author, day, totalDays, allPages, totalPages } = payload;
      
      const apiResult = await baseClient.post('/api/summarize', {
        text,
        title,
        author,
        day,
        totalDays,
        allPages,
        totalPages
      });
      
      // Ensure the result has a temporary unique ID for routing and saving
      const uuid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const summaryId = `temp_${uuid}`;
      
      const summaryWithId = {
        id: summaryId,
        title: title || 'Untitled Book',
        author: author || 'Unknown Author',
        cover_url: '',
        totalPages: totalPages || 0,
        totalDays: totalDays || 1,
        unlockedDays: 1,
        currentDay: 1,
        lastPageProcessed: apiResult.lastPageProcessed || 0,
        allPages: allPages || null,
        days: {
          [day]: apiResult.summary
        }
      };

      const savedSummary = await saveDbSummary(summaryWithId);
      setIsLoading(false);
      navigate(`/summary/${savedSummary.id}`);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err.message || 'Failed to generate summary. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    handleSummarize({ 
      title: query,
      day: 1,
      totalDays: 5
    });
  };

  const handleTextExtracted = (pages, title, author) => {
    const totalPages = pages.length;
    const totalDays = Math.ceil(totalPages / 10);
    const day1Text = pages.slice(0, 10).join('\n');
    
    handleSummarize({ 
      text: day1Text, 
      title, 
      author,
      day: 1,
      totalDays,
      totalPages,
      allPages: pages
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-12">
      <BookSearchHero 
        onSearch={handleSearch} 
        onTextExtracted={handleTextExtracted} 
        isLoading={isLoading} 
      />
      {error && (
        <div className="max-w-xl mx-auto mt-4 mx-4 sm:mx-auto flex items-center gap-3 text-red-500 font-medium bg-red-500/10 border border-red-500/20 py-4 px-5 rounded-2xl animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-400">Summarization Failed</h4>
            <p className="text-sm text-red-500/90">{error}</p>
          </div>
        </div>
      )}
      {isLoading && <LoadingState />}
    </div>
  );
}