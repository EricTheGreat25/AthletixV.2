import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

interface EventDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  // Added onDelete prop to handle the action
  onDelete: (eventId: number | string) => void;
  // Added onEdit prop to handle edit action
  onEdit?: () => void;
  event?: {
    id?: number | string; // Added ID to identify the event
    event_id?: number | string;
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

const EventDetailsDialog = ({ open, onClose, event, onDelete, onEdit }: EventDetailsDialogProps) => {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* Action Section */}
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
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
                Edit Event
              </Button>
            )}
            <Button 
              variant="destructive"
              onClick={() => {
                onDelete(event.id || event.event_id || 0);
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
