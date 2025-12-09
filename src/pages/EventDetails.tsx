import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  Target,
  Mail,
  Phone,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import ParticipantCard from "@/components/events/ParticipantCard";
import axios from "axios";
import { Link } from "react-router-dom";


export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useUserRole();
  const userId = localStorage.getItem("userId");

  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showResignDialog, setShowResignDialog] = useState(false);

const calculateEventStatus = (startDate: Date | null, endDate: Date | null): "upcoming" | "ongoing" | "completed" => {
  if (!startDate || !endDate) return "upcoming";
  
  const now = new Date();
  
  if (now < startDate) return "upcoming";
  if (now >= startDate && now <= endDate) return "ongoing";
  return "completed";
};

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${id}`);
        const data = await res.json();

          const mappedEvent = {
            ...data,
            date: data.start_datetime ? new Date(data.start_datetime) : null,
            endDate: data.end_datetime ? new Date(data.end_datetime) : null,
            sport: data.sport_name,
            event_id: data.event_id,
            categories: data.categories || [],
            sponsors: data.sponsors || [],
            rules: ["Rule 1: Follow instructions", "Rule 2: No cheating"],
            coverImage: data.coverImage || "https://via.placeholder.com/800x400",
            organizer: data.organizer_name,
            organizer_id: data.organizer_id,
            contactEmail: data.organizer_email || "email@example.com",
            contactPhone: data.organizer_phone || "123-456-7890",
            participantCount: data.participantCount || 0,
            type: data.type,
            // Recalculate status based on dates
            status: calculateEventStatus(
              data.start_datetime ? new Date(data.start_datetime) : null,
              data.end_datetime ? new Date(data.end_datetime) : null
            ),
          };

        setEvent(mappedEvent);

        // Fetch participants
        const participantsRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/event-participants/${id}/participants`
        );
        setParticipants(participantsRes.data.participants);

        // Check if user has joined
        if (userId && role === "athlete") {
          const checkRes = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/event-participants/${id}/check/${userId}`
          );
          setHasJoined(checkRes.data.hasJoined);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading event:", error);
        setLoading(false);
      }
    };
    loadEvent();
  }, [id, userId, role]);

  const handleJoinEvent = async () => {
    if (!userId) {
      toast.error("Please log in to join events");
      navigate("/login");
      return;
    }

    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/event-participants/${id}/join`,
        { userId }
      );
      toast.success("Successfully joined the event!");
      setHasJoined(true);
      
      // Refresh participants
      const participantsRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/event-participants/${id}/participants`
      );
      setParticipants(participantsRes.data.participants);
      
      // Update count
      setEvent((prev: any) => ({
        ...prev,
        participantCount: prev.participantCount + 1,
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join event");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    setActionLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/event-participants/${id}/leave`,
        { data: { userId } }
      );
      toast.success("You have left the event");
      setHasJoined(false);
      setShowResignDialog(false);
      
      // Refresh participants
      const participantsRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/event-participants/${id}/participants`
      );
      setParticipants(participantsRes.data.participants);
      
      // Update count
      setEvent((prev: any) => ({
        ...prev,
        participantCount: Math.max(0, prev.participantCount - 1),
      }));
    } catch (error) {
      toast.error("Failed to leave event");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!event) return <p className="p-6">Event not found.</p>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default";
      case "ongoing":
        return "destructive";
      case "completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "championship":
        return "default";
      case "tournament":
        return "secondary";
      case "league":
        return "outline";
      case "friendly":
        return "secondary";
      default:
        return "outline";
    }
  };

// Calculate days until event ends
const now = new Date();
const daysUntilEnd = event.endDate 
  ? Math.ceil((event.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  : 0;

// Check if event has passed
const eventHasPassed = event.endDate ? now > event.endDate : false;

const showJoinButton = 
  role === "athlete" && 
  !hasJoined && 
  event.status !== "completed" &&
  !eventHasPassed &&
  (event.status === "upcoming" || (event.status === "ongoing" && daysUntilEnd > 3));

const showResignButton = 
  role === "athlete" && 
  hasJoined && 
  event.status !== "completed" &&
  !eventHasPassed;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-br from-primary/20 to-primary/5">
        <img
          src={event.coverImage}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <div className="flex gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={getTypeColor(event.type)}>{event.type}</Badge>
                <Badge variant={getStatusColor(event.status)}>{event.status}</Badge>
                <Badge variant="outline">{event.sport}</Badge>
              </div>
              
              {/* Join/Resign Buttons */}
              <div className="flex gap-2">
                {showJoinButton && (
                  <Button onClick={handleJoinEvent} disabled={actionLoading}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {actionLoading ? "Joining..." : "Join Event"}
                  </Button>
                )}
                {showResignButton && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowResignDialog(true)}
                    disabled={actionLoading}
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Resign
                  </Button>
                )}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold">{event.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {event.date && event.endDate
                  ? `${format(event.date, "MMM d")} - ${format(event.endDate, "MMM d, yyyy")}`
                  : "Date not available"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.participantCount} participants
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{event.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Event Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.categories && event.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {event.categories.map((category: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No categories assigned</p>
                    )}
                  </CardContent>
                </Card>

                {/* Participants Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Participants ({participants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {participants.length > 0 ? (
                      participants.map((participant) => (
                        <ParticipantCard
                          key={participant.userId}
                          userId={participant.userId}
                          name={participant.name}
                          age={participant.age}
                          location={participant.location}
                          participantNo={participant.participantNo}
                        />
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No participants yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules">
                <Card>
                  <CardHeader>
                    <CardTitle>Competition Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {event.rules.map((rule: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Organizer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link 
                  to={`/users/${event.organizer_id}`}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 cursor-pointer block"
                >
                  {event.organizer}
                </Link>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1 text-black">
                    <Mail className="h-4 w-4" />
                    {event.contactEmail}
                  </p>
                  <p className="flex items-center gap-1 text-black">
                    <Phone className="h-4 w-4" />
                    {event.contactPhone}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sponsors</CardTitle>
              </CardHeader>
              <CardContent>
                {event.sponsors && event.sponsors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {event.sponsors.map((sponsor: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {sponsor}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No sponsors yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Resign Confirmation Dialog */}
      <AlertDialog open={showResignDialog} onOpenChange={setShowResignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to resign?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be removed from this event and will need to rejoin if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveEvent}
              disabled={actionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading ? "Processing..." : "Yes, Resign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}