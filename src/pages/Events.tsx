import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import EventCard from "@/components/events/EventCard";
import EventCreationForm from "@/components/events/EventCreationForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { role, loading } = useUserRole();
  const [events, setEvents] = useState<any[]>([]);

    const handleEventCreated = (newEvent: any) => {
      // Check for event status
      const now = new Date();
      const startDate = new Date(newEvent.event.start_datetime);
      const endDate = new Date(newEvent.event.end_datetime);

      let status: "upcoming" | "ongoing" | "completed" = "upcoming";
      if (now < startDate) status = "upcoming";
      else if (now >= startDate && now <= endDate) status = "ongoing";
      else status = "completed";

      // Add the new event with status
      const eventWithStatus = { ...newEvent.event, status };
      
      setEvents((prev) => [eventWithStatus, ...prev]);
    };

    const getStatus = (start: string, end: string) => {
      const now = new Date();
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (now < startDate) return "upcoming";
      if (now >= startDate && now <= endDate) return "ongoing";
      return "completed";
    };

useEffect(() => {
  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/get-events");
      const data = await response.json();
      
      // Map events with correct status
      const withStatus = data.events.map((event: any) => ({
        ...event,
        status: getStatus(event.start_datetime, event.end_datetime),
      }));
      
      setEvents(withStatus);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  fetchEvents();
}, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Events & Opportunities</h1>
            <p className="text-muted-foreground">
              Discover tryouts, competitions, and showcases near you
            </p>
          </div>
          {!loading && role === "organizer" && (
            <Button onClick={() => setIsFormOpen(true)} className="hidden md:flex">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events by name, sport, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs for Upcoming, Ongoing, Completed */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {["upcoming", "ongoing", "completed"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events
                  .filter((event) => event.status === status)
                  .filter(
                    (event) =>
                      (event.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                      (event.sport_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                      (event.location?.toLowerCase() || "").includes(searchQuery.toLowerCase())
                  )
                  .map((event) => (
                    <EventCard
                      key={event.event_id}
                      id={event.event_id}
                      title={event.title}
                      type={event.type}
                      sport={event.sport_name}
                      date={event.start_datetime}
                      endDate={event.end_datetime} // Add this line
                      location={event.location}
                      organizer={event.organizer_id}
                      description={event.description}
                      status={event.status}
                    />
                  ))
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <EventCreationForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default Events;
