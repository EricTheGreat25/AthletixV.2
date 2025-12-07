import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, MapPin, User, Tag, Edit } from "lucide-react";

interface NewsDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void; // Function to handle deletion
  onEdit?: () => void; // Function to handle edit action
  news?: {
    news_id: string;
    title: string | null;
    author_name: string | null;
    content: string | null;
    category: string | null;
    publish_date: string | null; // specific time it went live
    event_date: string | null; // optional date if news relates to an event
    location: string | null;
  } | null;
}

const NewsDetailsDialog = ({ open, onClose, news, onDelete, onEdit }: NewsDetailsDialogProps) => {
  if (!news) return null;

  // Helper to format dates nicely
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold leading-tight">
            {news.title || "Untitled News"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata Row: Author, Category, Publish Date */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted/40 p-3 rounded-md">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{news.author_name || "Unknown Author"}</span>
            </div>
            {news.category && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                <span className="capitalize">{news.category}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Published: {formatDate(news.publish_date || null)}</span>
            </div>
          </div>

          {/* Conditional Context Row: Only show if Location or Event Date exists */}
          {(news.location || news.event_date) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-l-4 border-primary/20 pl-4 py-1">
              {news.event_date && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Event Date
                  </span>
                  <div className="font-medium">
                    {formatDate(news.event_date || null)}
                  </div>
                </div>
              )}
              {news.location && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Location
                  </span>
                  <div className="flex items-center gap-1 font-medium">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {news.location}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Body */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground/80">
              Content
            </h4>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {news.content || "No content available."}
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-end border-t pt-4 mt-4 gap-2">
          {onEdit && (
            <Button
              variant="default"
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit News
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => {
              // Ensure we have an ID before trying to delete
              if (news.news_id) onDelete(news.news_id);
            }}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete News
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailsDialog;
