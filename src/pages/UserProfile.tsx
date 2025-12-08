import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Globe, ChevronLeft, Share2 } from "lucide-react";
import { format, parseISO, endOfDay } from "date-fns";
import EventEditModal from "@/components/events/EventEditModal";
import { Plus, Star } from "lucide-react";
import AddReviewModal from "@/components/account/ReviewModal";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// --- Utility functions (getEventStatus, safeFormat, exportParticipantsToExcel) remain unchanged ---
const getEventStatus = (
  startStr: string | null,
  endStr: string | null
): "Completed" | "Ongoing" | "Upcoming" => {
  if (!startStr) return "Upcoming";

  const startDate = new Date(startStr);
  if (isNaN(startDate.getTime())) return "Upcoming";

  const effectiveEndDate = endStr ? new Date(endStr) : endOfDay(startDate);
  if (isNaN(effectiveEndDate.getTime())) return "Upcoming";

  const now = new Date();

  if (effectiveEndDate < now) return "Completed";
  if (now >= startDate && now <= effectiveEndDate) return "Ongoing";
  return "Upcoming";
};

const safeFormat = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  try {
    return format(parseISO(dateStr), "PPP");
  } catch {
    return "Invalid Date";
  }
};

const exportParticipantsToExcel = async (eventId: string, eventData: any) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/event-participants/${eventId}/participants`
    );
    const participants = res.data.participants;

    const wb = XLSX.utils.book_new();

    const eventInfo = [
      ["Event Title", eventData.title],
      ["Event Description", eventData.description || "N/A"],
      ["Event Start Date", format(new Date(eventData.start_datetime), "PPP p")],
      ["Event End Date", format(new Date(eventData.end_datetime), "PPP p")],
      ["Location", eventData.location],
      ["Event Organizer", eventData.organizer_name || "N/A"],
      [""],
      ["Total Participants", participants.length],
    ];

    const wsEventInfo = XLSX.utils.aoa_to_sheet(eventInfo);
    XLSX.utils.book_append_sheet(wb, wsEventInfo, "Event Info");

    const participantData = participants.map((p: any) => ({
      "User ID": p.userId,
      Name: p.name,
      Gender: p.gender || "N/A",
      Sport: p.sport,
      Location: p.location,
      Age: p.age,
      Birthday: p.birthdate ? format(new Date(p.birthdate), "PPP") : "N/A",
    }));

    const wsParticipants = XLSX.utils.json_to_sheet(participantData);
    XLSX.utils.book_append_sheet(wb, wsParticipants, "Participants");

    XLSX.writeFile(wb, `${eventData.title}_Participants.xlsx`);
    toast.success("Participant list exported successfully!");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Failed to export participant list");
  }
};
// --- End Utility functions ---

const EventRow = ({ event, status, userId, onEdit, isOwnProfile }: any) => {
  const [participantCount, setParticipantCount] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/event-participants/${event.event_id}/count`
        );
        setParticipantCount(res.data.count);
      } catch (err) {
        console.error("Failed to fetch count:", err);
      }
    };
    fetchCount();
  }, [event.event_id]);

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${event.event_id}`,
        { data: { organizerId: userId } }
      );
      toast.success("Event deleted successfully");
      setShowDeleteDialog(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              <Link to={`/events/${event.event_id}`}>{event.title}</Link>
            </h3>
            <p className="text-muted-foreground mb-2">
              {safeFormat(event.start_datetime)} -{" "}
              {safeFormat(event.end_datetime)}
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{participantCount} participants</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={
                status === "Completed"
                  ? "destructive"
                  : status === "Ongoing"
                  ? "default"
                  : "secondary"
              }
            >
              {status}
            </Badge>

            {/* Only show buttons if viewing own profile */}
            {isOwnProfile && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportParticipantsToExcel(event.event_id, event)}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(event)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">
                ⚠️ DELETE EVENT - THIS ACTION CANNOT BE UNDONE
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-bold">You are about to permanently delete:</p>
                <p className="text-lg">"{event.title}"</p>
                <p className="text-destructive font-semibold mt-4">
                  This will remove:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All event details</li>
                  <li>All {participantCount} registered participants</li>
                  <li>All event categories and sponsors</li>
                  <li>This action is PERMANENT and IRREVERSIBLE</li>
                </ul>
                <p className="mt-4 font-bold">
                  Are you absolutely sure you want to continue?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                No, Keep Event
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEvent}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Yes, Delete Forever"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

const UserProfile = () => {
  const { id } = useParams();

  const [editEvent, setEditEvent] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false); // New state for review modal
  const [achievements, setAchievements] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]); // New state for reviews
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const BIO_MAX_LENGTH = 200;
  const currentUserId = localStorage.getItem("userId");
  const currentUserRole = localStorage.getItem("userRole");
  const isOwnProfile = currentUserId === id;
  const isOrganizer = currentUserRole === "organizer";

  const fetchReviews = useCallback(async (userId: string) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${userId}`
      );
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  }, []);  

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);  
      try {
        const res = await fetch(`http://localhost:5000/api/organizers/${id}`);
        const data = await res.json();
        
        setUser(data);
        setAchievements(data.achievements || []);

        if (id) {
          await fetchReviews(id);
        } else {
          
        }

      } catch (err) {
        console.error("Failed to fetch user:", err);
        setReviews([]); 
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchUser(); 

  }, [id, fetchReviews]); 

  const initials = useMemo(() => {
    if (!user?.fullname) return "UP";
    return user.fullname
      .split(" ")
      .filter(Boolean)
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        User not found
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/events">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        {/* Profile Header*/}
        <div className="bg-muted/30 rounded-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-32 w-32">
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.fullname} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{user.fullname}</h1>
                    <Badge variant="secondary">
                      {user.verification_status || "N/A"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {user.role || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {user.sport_name || "N/A"}
                    </span>
                  </div>
                  <p className="text-muted-foreground max-w-2xl mb-1">
                    {user.bio &&
                    user.bio.length > BIO_MAX_LENGTH &&
                    !isBioExpanded
                      ? `${user.bio.slice(0, BIO_MAX_LENGTH)}...`
                      : user.bio || "N/A"}
                  </p>
                  {user.bio && user.bio.length > BIO_MAX_LENGTH && (
                    <button
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="text-sm text-primary underline"
                    >
                      {isBioExpanded ? "Read less" : "Read more"}
                    </button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: `${user.fullname} - Profile`,
                          text: `Check out ${user.fullname}'s profile on Athletix`,
                          url: window.location.href,
                        })
                        .catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>


        {/* Tabs Section */}
        <Tabs defaultValue="Events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 max-w-3xl">
            <TabsTrigger value="Events">Events</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* EVENTS TAB */}
          <TabsContent value="Events" className="space-y-6">
            <div className="grid gap-4">
              {user.events && user.events.length > 0 ? (
                user.events.map((event: any) => {
                  const status = getEventStatus(
                    event.start_datetime,
                    event.end_datetime
                  );
                  return (
                    <EventRow
                      key={event.event_id}
                      event={event}
                      status={status}
                      userId={user.user_id}
                      isOwnProfile={isOwnProfile && isOrganizer}
                      onEdit={(evt: any) => {
                        setEditEvent(evt);
                        setModalOpen(true);
                      }}
                    />
                  );
                })
              ) : (
                <p className="text-muted-foreground">No events available.</p>
              )}
            </div>
          </TabsContent>

          {/* ACHIEVEMENTS TAB */}
          <TabsContent value="achievements" className="space-y-4">
            {achievements.length > 0 ? (
              achievements.map((ach) => (
                <Card key={ach.achievement_id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{ach.title}</h3>
                    <p className="text-muted-foreground">
                      {ach.description || "No description"}
                    </p>
                    {ach.year && <Badge variant="secondary">{ach.year}</Badge>}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">
                No achievements available.
              </p>
            )}
          </TabsContent>

          {/* REVIEWS TAB */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">User Reviews</h3>
              {currentUserId && !isOwnProfile && (
                <Button onClick={() => setReviewModalOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Review
                </Button>
              )}
            </div>

            {/* Reviews List */}
            <div className="grid gap-4">
              {reviews && reviews.length > 0 ? (
                reviews.map((review: any) => (
                  <Card key={review.review_id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">
                            {review.reviewer_name || "Anonymous"}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {review.created_at
                              ? new Date(review.created_at).toLocaleDateString()
                              : "Date N/A"}
                          </span>
                        </div>
                        {/* Star Rating Display */}
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (review.rating || 0)
                                  ? "fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {review.comment}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No reviews yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {editEvent && (
          <EventEditModal
            key={editEvent.event_id}
            open={modalOpen}
            event={editEvent}
            onClose={() => setModalOpen(false)}
            onEventUpdated={(updatedEvent: any) => {
              setUser((prev: any) => ({
                ...prev,
                events: prev.events.map((e: any) =>
                  e.event_id === updatedEvent.event_id ? updatedEvent : e
                ),
              }));
              setModalOpen(false);
            }}
          />
        )}
        
        <AddReviewModal 
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          revieweeId={id!} 
          reviewerId={currentUserId!} 
          onReviewAdded={async (newReview) => {
            if (id) {
              await fetchReviews(id);
              toast.success("Review submitted successfully!");
            }
            setReviewModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default UserProfile;