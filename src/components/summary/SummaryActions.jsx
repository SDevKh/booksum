import { Button } from "@/components/ui/button";
import { Bookmark, ArrowLeft, Trash2, Loader2 } from "lucide-react";

export default function SummaryActions({ onSave, onDelete, onBack, isSaving, isDeleting, isSaved }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="flex gap-2">
        {isSaved ? (
          <Button
            variant="outline"
            onClick={onDelete}
            disabled={isDeleting}
            className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 focus:ring-red-500"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Summary
          </Button>
        ) : (
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bookmark className="w-4 h-4 mr-2" />
            )}
            Save to Library
          </Button>
        )}
      </div>
    </div>
  );
}
