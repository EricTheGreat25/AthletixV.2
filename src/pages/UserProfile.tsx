import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Globe, ChevronLeft, Star, Share2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/organizers/${id}`);
        const data = await res.json();
        setUser(data);
        
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">User not found</div>;
  }

  const initials = user.fullname
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/search">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </Link>

        {/* Profile Header */}
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
                    <Badge variant="secondary">{user.verification_status || "N/A"}</Badge>
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
                  <p className="text-muted-foreground max-w-2xl mb-3">{user.bio || "N/A"}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${user.fullname} - Profile`,
                        text: `Check out ${user.fullname}'s profile on Athletix`,
                        url: window.location.href,
                      }).catch(() => {});
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

        {/* Tabs (only placeholders for now) */}
        <Tabs defaultValue="Events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 max-w-3xl">
            <TabsTrigger value="Events">Events</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="Events" className="space-y-6">
            <div className="grid gap-4">
              {user.events && user.events.length > 0 ? (
                user.events.map((event: any) => (
                  <Card key={event.event_id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            <Link
                              to={`/events/${event.event_id}`}
                              className="hover:underline text-primary"
                            >
                              {event.title}
                            </Link>
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {event.start_datetime
                                ? format(parseISO(event.start_datetime), "MMM dd, yyyy")
                                : "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location || "N/A"}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            event.status?.toLowerCase() === "upcoming"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {event.status
                            ? event.status.charAt(0).toUpperCase() + event.status.slice(1)
                            : "N/A"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">No events found.</p>
              )}
            </div>
          </TabsContent>


          <TabsContent value="achievements">
            <p>N/A</p>
          </TabsContent>

          <TabsContent value="reviews">
            <p>N/A</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
