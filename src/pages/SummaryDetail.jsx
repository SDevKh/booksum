import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import SummaryActions from '@/components/summary/SummaryActions';
import SummaryOverview from '@/components/summary/SummaryOverview';
import KeyTakeaways from '@/components/summary/KeyTakeaways';
import BestStories from '@/components/summary/BestStories';
import ActionableInsights from '@/components/summary/ActionableInsights';
import { getDbSummary, saveDbSummary, deleteDbSummary, setCurrentSummary } from '@/utils/library';
import { Loader2, AlertCircle, Lock, Check, Sparkles } from 'lucide-react';
import { baseClient } from '@/api/baseClient';

export default function SummaryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['summary', id],
    queryFn: () => getDbSummary(id),
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: saveDbSummary,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dbSummaries'] });
      queryClient.setQueryData(['summary', data.id], data);
      navigate(`/summary/${data.id}`, { replace: true });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDbSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dbSummaries'] });
      navigate('/library');
    },
  });

  const handleSelectDay = (daySelected) => {
    if (!summary) return;
    const updatedSummary = {
      ...summary,
      currentDay: daySelected,
    };
    queryClient.setQueryData(['summary', id], updatedSummary);
    if (!id.startsWith('temp_')) {
      saveDbSummary(updatedSummary);
    } else {
      setCurrentSummary(updatedSummary);
    }
  };

  const handleUnlockDay = async (dayToUnlock) => {
    if (!summary) return;
    setIsUnlocking(true);
    try {
      let payload = {
        title: summary.title,
        author: summary.author,
        day: dayToUnlock,
        totalDays: summary.totalDays,
      };

      if (summary.allPages && summary.allPages.length > 0) {
        const startPage = (dayToUnlock - 1) * 10;
        const endPage = dayToUnlock * 10;
        const dayText = summary.allPages.slice(startPage, endPage).join('\n');
        payload.text = dayText;
        payload.allPages = summary.allPages;
        payload.totalPages = summary.totalPages;
      }

      const apiResult = await baseClient.post('/summarize', payload);

      const updatedSummary = {
        ...summary,
        unlockedDays: Math.max(summary.unlockedDays, dayToUnlock),
        currentDay: dayToUnlock,
        days: {
          ...summary.days,
          [dayToUnlock]: {
            one_line_summary: apiResult.one_line_summary || '',
            overview: apiResult.overview || '',
            key_takeaways: apiResult.key_takeaways || [],
            best_stories: apiResult.best_stories || [],
            actionable_insights: apiResult.actionable_insights || [],
            rating: apiResult.rating || 5,
          },
        },
      };

      queryClient.setQueryData(['summary', id], updatedSummary);
      if (!id.startsWith('temp_')) {
        await saveDbSummary(updatedSummary);
        queryClient.invalidateQueries({ queryKey: ['dbSummaries'] });
      } else {
        setCurrentSummary(updatedSummary);
      }
    } catch (err) {
      console.error('Error unlocking day:', err);
      alert('Failed to unlock next day: ' + (err.message || err));
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Loading summary details...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="font-heading text-3xl font-bold mb-3">Summary not found</h1>
        <p className="text-muted-foreground mb-6">
          {error ? error.message : 'Create a new summary or open one from your library.'}
        </p>
        <Link to="/" className="inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/95 transition-all">
          New Search
        </Link>
      </div>
    );
  }

  const isSaved = !id.startsWith('temp_');
  const currentDayNum = summary.currentDay || 1;
  const currentDayData = summary.days[currentDayNum];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <SummaryActions 
        onSave={() => saveMutation.mutate(summary)} 
        onDelete={() => deleteMutation.mutate(id)}
        onBack={() => navigate('/')} 
        isSaving={saveMutation.isPending}
        isDeleting={deleteMutation.isPending}
        isSaved={isSaved}
      />
      
      {/* Daily Progress Journey */}
      {summary.totalDays > 1 && (
        <div className="mb-8 p-5 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reading habit journey</span>
            <span className="text-xs font-bold text-primary">Day {summary.unlockedDays} of {summary.totalDays} unlocked</span>
          </div>
          
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none items-center">
            {Array.from({ length: summary.totalDays }).map((_, idx) => {
              const dNum = idx + 1;
              const isUnlocked = dNum <= summary.unlockedDays;
              const isActive = dNum === currentDayNum;
              
              return (
                <button
                  key={dNum}
                  onClick={() => isUnlocked && handleSelectDay(dNum)}
                  disabled={!isUnlocked}
                  className={`flex flex-col items-center justify-center min-w-[4.8rem] py-2.5 px-3 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.03]'
                      : isUnlocked
                      ? 'bg-secondary/40 border-border hover:border-primary/50 text-foreground cursor-pointer'
                      : 'bg-secondary/10 border-dashed border-white/5 text-muted-foreground/35 cursor-not-allowed'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Day</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-base font-extrabold">{dNum}</span>
                    {!isUnlocked ? (
                      <Lock className="w-3 h-3 text-muted-foreground/35" />
                    ) : dNum < summary.unlockedDays ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lock Screen placeholder or Day Summary content */}
      {!currentDayData ? (
        <div className="mt-8 p-12 text-center rounded-3xl border-2 border-dashed border-border bg-card/30 backdrop-blur-sm shadow-xl flex flex-col items-center gap-6 animate-fade-in">
          <div className="relative p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Lock className="w-10 h-10 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl bg-amber-500/5 blur animate-pulse" />
          </div>
          
          <div>
            <h3 className="font-heading text-2xl font-bold mb-2">Day {currentDayNum} Summary is Locked</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              Build your reading momentum. Unlock Day {currentDayNum} to read the summary and takeaways for pages {((currentDayNum - 1) * 10) + 1} to {Math.min(currentDayNum * 10, summary.totalPages || currentDayNum * 10)}.
            </p>
          </div>
          
          <button
            onClick={() => handleUnlockDay(currentDayNum)}
            disabled={isUnlocking}
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            {isUnlocking ? (
              <>
                <Loader2 className="w-5 h-5 mr-2.5 animate-spin" />
                Analyzing Day {currentDayNum} content...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2.5" />
                Unlock Day {currentDayNum} Summary
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">
          <SummaryOverview summary={{
            title: summary.title,
            author: summary.author,
            cover_url: summary.cover_url,
            one_line_summary: currentDayData.one_line_summary,
            overview: currentDayData.overview,
          }} />
          
          <KeyTakeaways takeaways={currentDayData.key_takeaways} />
          <BestStories stories={currentDayData.best_stories} />
          <ActionableInsights insights={currentDayData.actionable_insights} />
          
          {/* Final Day Celebration */}
          {currentDayNum === summary.totalDays && (
            <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 text-center flex flex-col items-center gap-3">
              <span className="text-3xl">🎉</span>
              <h4 className="font-heading text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Book Summary Completed!</h4>
              <p className="text-muted-foreground text-sm max-w-md">
                Incredible! You have finished reading and summarizing this entire book step-by-step. Keep up the daily reading habit!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}