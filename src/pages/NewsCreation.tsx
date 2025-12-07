import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, FileText, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/utilities/utils";

// Interface for draft article structure
// Matches the news_drafts table schema exactly
interface Draft {
  draft_id: string;
  title: string;
  event_date: string;
  location: string;
  content: string;
  category: string;
  last_modified: Date;
}

const NewsCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state - stores current article being edited
  // Fields match your news_drafts and news table schemas
  const [formData, setFormData] = useState({
    title: "",
    event_date: "",
    location: "",
    content: "",
    category: "",
  });

  // Drafts state - stores all saved drafts from backend
  const [drafts, setDrafts] = useState<Draft[]>([]);
  
  // Currently selected draft ID
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  
  // Track if form has unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Confirmation dialog states
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingDraftId, setPendingDraftId] = useState<string | null>(null);

  // Fetch user's drafts from backend on component mount
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        // Get logged-in user ID from localStorage
        const userId = localStorage.getItem("userId");
        
        // TODO: Replace with your actual backend endpoint
        const response = await fetch(`http://localhost:5000/api/news/drafts/${userId}`);
        const data = await response.json();
        
        setDrafts(data.drafts || []);
      } catch (error) {
        console.error("Failed to fetch drafts:", error);
      }
    };

    fetchDrafts();
  }, []);

  // Handle input changes and mark as having unsaved changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Auto-save draft function (can be called periodically)
  const saveDraft = async () => {
    try {
      const userId = localStorage.getItem("userId");
      
      // TODO: Replace with your actual backend endpoint
      const response = await fetch("http://localhost:5000/api/news/drafts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft_id: currentDraftId, // null for new draft, ID for existing
          user_id: userId,
          title: formData.title,
          event_date: formData.event_date,
          location: formData.location,
          content: formData.content,
          category: formData.category,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message);

      // Update drafts list with new/updated draft
      if (currentDraftId) {
        // Update existing draft
        setDrafts((prev) =>
          prev.map((d) => 
            d.draft_id === currentDraftId 
              ? { ...d, ...formData, last_modified: new Date() } 
              : d
          )
        );
      } else {
        // Add new draft
        const newDraft = {
          draft_id: result.draft_id,
          ...formData,
          last_modified: new Date(),
        };
        setDrafts((prev) => [...prev, newDraft]);
        setCurrentDraftId(result.draft_id);
      }

      setHasUnsavedChanges(false);
      toast({
        title: "Draft Saved",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      console.error("Failed to save draft:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save draft",
        variant: "destructive",
      });
    }
  };

  // Load a draft into the form
  const loadDraft = (draft: Draft) => {
    // If there are unsaved changes, show warning first
    if (hasUnsavedChanges) {
      setPendingDraftId(draft.draft_id);
      setShowUnsavedDialog(true);
    } else {
      // No unsaved changes, load immediately
      setFormData({
        title: draft.title,
        event_date: draft.event_date,
        location: draft.location,
        content: draft.content,
        category: draft.category,
      });
      setCurrentDraftId(draft.draft_id);
      setHasUnsavedChanges(false);
    }
  };

  // Handle unsaved changes dialog confirmation (Save and switch)
  const handleUnsavedConfirm = async () => {
    // Save current changes
    await saveDraft();
    
    // Load the pending draft
    if (pendingDraftId) {
      const draft = drafts.find((d) => d.draft_id === pendingDraftId);
      if (draft) {
        setFormData({
          title: draft.title,
          event_date: draft.event_date,
          location: draft.location,
          content: draft.content,
          category: draft.category,
        });
        setCurrentDraftId(draft.draft_id);
        setHasUnsavedChanges(false);
      }
    }
    
    setShowUnsavedDialog(false);
    setPendingDraftId(null);
  };

  // Handle unsaved changes dialog cancel (Discard and switch)
  const handleUnsavedCancel = () => {
    // Don't save, just load the pending draft
    if (pendingDraftId) {
      const draft = drafts.find((d) => d.draft_id === pendingDraftId);
      if (draft) {
        setFormData({
          title: draft.title,
          event_date: draft.event_date,
          location: draft.location,
          content: draft.content,
          category: draft.category,
        });
        setCurrentDraftId(draft.draft_id);
        setHasUnsavedChanges(false);
      }
    }
    
    setShowUnsavedDialog(false);
    setPendingDraftId(null);
  };

  // Create new blank draft
  const createNewDraft = () => {
    if (hasUnsavedChanges) {
      // Prompt to save first
      toast({
        title: "Unsaved Changes",
        description: "Please save or discard current changes first.",
        variant: "destructive",
      });
      return;
    }

    setFormData({ title: "", event_date: "", location: "", content: "", category: "" });
    setCurrentDraftId(null);
    setHasUnsavedChanges(false);
  };

  // Delete a draft
  const deleteDraft = async (draftId: string) => {
    try {
      // TODO: Replace with your actual backend endpoint
      await fetch(`http://localhost:5000/api/news/drafts/${draftId}`, {
        method: "DELETE",
      });

      setDrafts((prev) => prev.filter((d) => d.draft_id !== draftId));
      
      // If deleted draft was current, clear form
      if (currentDraftId === draftId) {
        setFormData({ title: "", event_date: "", location: "", content: "", category: "" });
        setCurrentDraftId(null);
        setHasUnsavedChanges(false);
      }

      toast({
        title: "Draft Deleted",
        description: "Draft has been removed.",
      });
    } catch (error) {
      console.error("Failed to delete draft:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete draft",
        variant: "destructive",
      });
    }
  };

  // Publish article
  const handlePublish = async () => {
    try {
      const userId = localStorage.getItem("userId"); 

      const response = await fetch("http://localhost:5000/api/news/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          title: formData.title,
          event_date: formData.event_date,
          location: formData.location,
          content: formData.content,
          category: formData.category,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message); 

      if (currentDraftId) {
        // Remove published draft from drafts list
        setDrafts((prev) => prev.filter((d) => d.draft_id !== currentDraftId));

        await fetch(`http://localhost:5000/api/news/drafts/${currentDraftId}`, {
          method: "DELETE",
        });
      }

      toast({
        title: "Article Published!",
        description: "Your article is now live!",
      });

      // Clear form
      setFormData({ title: "", event_date: "", location: "", content: "", category: "" });
      setCurrentDraftId(null);
      setHasUnsavedChanges(false);

      //navigate with state to trigger auto-refresh
      navigate("/news", { 
        state: { 
          refreshNews: true, 
          message: "Article published successfully!" 
        } 
      });
    } catch (error: any) {
      console.error("Failed to publish article:", error);
      toast({
        title: "Publish Failed",
        description: error.message || "Failed to publish article",
        variant: "destructive",
      });
    }
  };

  // Archive draft (delete from drafts table)
  const handleArchive = async () => {
    try {
      if (!currentDraftId) {
        toast({
          title: "No Draft Selected",
          description: "Please save as draft first before archiving.",
          variant: "destructive",
        });
        return;
      }

      // TODO: Replace with your actual backend endpoint
      await fetch(`http://localhost:5000/api/news/drafts/${currentDraftId}`, {
        method: "DELETE",
      });

      // Remove from drafts list
      setDrafts((prev) => prev.filter((d) => d.draft_id !== currentDraftId));

      toast({
        title: "Draft Archived",
        description: "Draft has been removed.",
      });

      // Clear form
      setFormData({ title: "", event_date: "", location: "", content: "", category: "" });
      setCurrentDraftId(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to archive:", error);
      toast({
        title: "Archive Failed",
        description: "Failed to archive draft",
        variant: "destructive",
      });
    }
  };

  // Handle cancel (navigate back with warning if unsaved)
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      navigate("/news");
    }
  };

  // Confirm cancel and discard changes
  const confirmCancel = () => {
    setFormData({ title: "", event_date: "", location: "", content: "", category: "" });
    setCurrentDraftId(null);
    setHasUnsavedChanges(false);
    navigate("/news");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR - Drafts Archive */}
          <div className="col-span-12 lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Draft Archives</h3>
                  <Button variant="ghost" size="sm" onClick={createNewDraft}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Drafts List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {drafts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No drafts yet
                    </p>
                  ) : (
                    drafts.map((draft) => (
                      <div
                        key={draft.draft_id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors",
                          currentDraftId === draft.draft_id && "bg-accent border-primary"
                        )}
                        onClick={() => loadDraft(draft)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <p className="text-sm font-medium truncate">
                                {draft.title || "Untitled Draft"}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(draft.last_modified).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDraft(draft.draft_id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Save Draft Button */}
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={saveDraft}
                  disabled={!hasUnsavedChanges}
                >
                  Save Draft
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* MAIN CONTENT - Article Form */}
          <div className="col-span-12 lg:col-span-9">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-bold">Create News Article</h2>

                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title">Article Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter article title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                {/* Category Field */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Soccer">Soccer</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                      <SelectItem value="Track & Field">Track & Field</SelectItem>
                      <SelectItem value="Volleyball">Volleyball</SelectItem>
                      <SelectItem value="Baseball">Baseball</SelectItem>
                      <SelectItem value="Facilities">Facilities</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Event Date Field */}
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => handleInputChange("event_date", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Date when the event occurred (not publish date)
                  </p>
                </div>

                {/* Location Field */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Manila Sports Complex"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>

                {/* Article Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Article Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your article content here..."
                    className="min-h-[400px] resize-none"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button
                    variant="default"
                    onClick={() => setShowPublishDialog(true)}
                    disabled={!formData.title || !formData.event_date || !formData.location || !formData.content || !formData.category}
                  >
                    Publish
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowArchiveDialog(true)}
                    disabled={!currentDraftId}
                  >
                    Archive
                  </Button>
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PUBLISH CONFIRMATION DIALOG */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Article?</DialogTitle>
            <DialogDescription>
              Are you sure you want to publish this article? It will be visible to all users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              No
            </Button>
            <Button
              onClick={() => {
                setShowPublishDialog(false);
                handlePublish();
              }}
            >
              Yes, Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ARCHIVE CONFIRMATION DIALOG */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Draft?</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this draft? It will be removed from your drafts list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
              No
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowArchiveDialog(false);
                handleArchive();
              }}
            >
              Yes, Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CANCEL CONFIRMATION DIALOG */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to cancel? All unsaved changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              No, Keep Editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowCancelDialog(false);
                confirmCancel();
              }}
            >
              Yes, Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UNSAVED CHANGES DIALOG (when switching drafts) */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Do you want to save them before switching drafts?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleUnsavedCancel}>
              No, Discard
            </Button>
            <Button onClick={handleUnsavedConfirm}>
              Yes, Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsCreation;