import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Trash2 } from "lucide-react";

interface EventDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  // Added onDelete prop to handle the action
  onDelete: (eventId: number | string) => void;
  onEdit?: (
    eventId: number | string,
    updated: Partial<{
      title: string;
      organizer: string;
      type: string;
      sport: string;
      startdatetime: string;
      enddatetime: string;
      participants: number | string;
      status: string;
      description: string;
    }>
  ) => Promise<void> | void;
  event?: {
    id: number | string; // Added ID to identify the event
    title: string;
    organizer: string;
    type: string;
    sport: string;
    startdatetime: string;
    enddatetime: string;
    participants: number | string;
    status: string;
    description: string;
  } | null;
}

const EventDetailsDialog = ({
  open,
  onClose,
  event,
  onDelete,
  onEdit,
}: EventDetailsDialogProps) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const [form, setForm] = React.useState(() => ({
    title: event?.title || "",
    organizer: event?.organizer || "",
    type: event?.type || "",
    sport: event?.sport || "",
    startdatetime: event?.startdatetime || "",
    enddatetime: event?.enddatetime || "",
    participants: event?.participants || 0,
    status: event?.status || "",
    description: event?.description || "",
  }));

  React.useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        organizer: event.organizer,
        type: event.type,
        sport: event.sport,
        startdatetime: event.startdatetime,
        enddatetime: event.enddatetime,
        participants: event.participants,
        status: event.status,
        description: event.description,
      });
    }
  }, [event]);

  if (!event) return null;

  const handleSave = async () => {
    try {
      if (onEdit) await onEdit(event.id, form as any);
      setIsEditing(false);
      onClose();
    } catch (err) {
      console.error("Failed to save event:", err);
      alert("Failed to save event");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isEditing ? (
            <div className="space-y-2">
              <p>
                <span className="font-medium">Title:</span> {event.title}
              </p>
              <p>
                <span className="font-medium">Organizer:</span>{" "}
                {event.organizer}
              </p>
              <p>
                <span className="font-medium">Type:</span> {event.type}
              </p>
              <p>
                <span className="font-medium">Sport:</span> {event.sport}
              </p>
              <p>
                <span className="font-medium">Start Date & Time:</span>{" "}
                {event.startdatetime}
              </p>
              <p>
                <span className="font-medium">End Date & Time:</span>{" "}
                {event.enddatetime}
              </p>
              <p>
                <span className="font-medium">Participants:</span>{" "}
                {event.participants}
              </p>
              <p>
                <span className="font-medium">Status:</span> {event.status}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {event.description}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, title: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Organizer</Label>
                  <Input
                    value={form.organizer as string}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, organizer: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={form.type || ""}
                    onValueChange={(v) => setForm((s) => ({ ...s, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tournament">Tournament</SelectItem>
                      <SelectItem value="League">League</SelectItem>
                      <SelectItem value="Friendly">Friendly</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Sport</Label>
                  <Input
                    value={form.sport as string}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, sport: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Participants</Label>
                  <Input
                    value={String(form.participants)}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, participants: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Start</Label>
                  <Input
                    type="datetime-local"
                    value={form.startdatetime as string}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, startdatetime: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>End</Label>
                  <Input
                    type="datetime-local"
                    value={form.enddatetime as string}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, enddatetime: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={form.status || ""}
                  onValueChange={(v) => setForm((s) => ({ ...s, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                  value={form.description as string}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t mt-4 gap-2">
            {!isEditing && (
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
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
                onDelete(event.id);
                onClose();
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
