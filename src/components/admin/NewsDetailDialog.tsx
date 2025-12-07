import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Trash2, Calendar, MapPin, User, Tag } from "lucide-react";

interface NewsDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void; // Function to handle deletion
  onEdit?: (
    id: string,
    updated: Partial<{
      title: string | null;
      author_name: string | null;
      content: string | null;
      category: string | null;
      publish_date: string | null;
      event_date: string | null;
      location: string | null;
    }>
  ) => Promise<void> | void;
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

const NewsDetailsDialog = ({
  open,
  onClose,
  news,
  onDelete,
  onEdit,
}: NewsDetailsDialogProps) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const [form, setForm] = React.useState(() => ({
    title: news?.title || "",
    author_name: news?.author_name || "",
    content: news?.content || "",
    category: news?.category || "",
    publish_date: news?.publish_date || "",
    event_date: news?.event_date || "",
    location: news?.location || "",
  }));

  React.useEffect(() => {
    if (news) {
      setForm({
        title: news.title || "",
        author_name: news.author_name || "",
        content: news.content || "",
        category: news.category || "",
        publish_date: news.publish_date || "",
        event_date: news.event_date || "",
        location: news.location || "",
      });
    }
  }, [news]);

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

  const handleSave = async () => {
    try {
      if (onEdit) await onEdit(news.news_id, form as any);
      setIsEditing(false);
      onClose();
    } catch (err) {
      console.error("Failed to save news:", err);
      alert("Failed to save news");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold leading-tight">
            {form.title || "Untitled News"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata Row: Author, Category, Publish Date */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted/40 p-3 rounded-md">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{form.author_name || "Unknown Author"}</span>
            </div>
            {form.category && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                <span className="capitalize">{form.category}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Published: {formatDate(form.publish_date || null)}</span>
            </div>
          </div>

          {/* Conditional Context Row: Only show if Location or Event Date exists */}
          {(form.location || form.event_date) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-l-4 border-primary/20 pl-4 py-1">
              {form.event_date && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Event Date
                  </span>
                  <div className="font-medium">
                    {formatDate(form.event_date || null)}
                  </div>
                </div>
              )}
              {form.location && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Location
                  </span>
                  <div className="flex items-center gap-1 font-medium">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {form.location}
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
            {!isEditing ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {form.content || "No content available."}
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={form.title || ""}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, title: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={form.category || ""}
                      onValueChange={(v) =>
                        setForm((s) => ({ ...s, category: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Announcement">
                          Announcement
                        </SelectItem>
                        <SelectItem value="Result">Result</SelectItem>
                        <SelectItem value="Injury">Injury</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input
                      value={form.author_name || ""}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, author_name: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Publish Date</Label>
                    <Input
                      type="date"
                      value={form.publish_date || ""}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, publish_date: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Event Date</Label>
                    <Input
                      type="date"
                      value={form.event_date || ""}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, event_date: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={form.location || ""}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, location: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Content</Label>
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                    rows={6}
                    value={form.content || ""}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, content: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-end border-t pt-4 mt-4 flex gap-2">
          {!isEditing && (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}

          {isEditing && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </>
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
