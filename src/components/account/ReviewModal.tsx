import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  revieweeId: string;
  reviewerId: string;
  onReviewAdded: (review: any) => void;
}

const AddReviewModal = ({ isOpen, onClose, revieweeId, reviewerId, onReviewAdded }: AddReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      // THIS IS WHERE YOU CONNECT TO YOUR NEW ENDPOINT
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`, {
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment,
      });

      // Pass the new review data (including reviewer_name) back to the parent
      onReviewAdded(response.data);
      
      toast.success("Review submitted successfully!");
      
      // Reset and close
      setRating(0);
      setComment("");
      onClose();
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      const errorMessage = error.response?.data?.error || "Failed to submit review. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewModal;