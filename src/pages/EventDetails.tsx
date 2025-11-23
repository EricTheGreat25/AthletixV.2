  import { useState } from "react";
  import { useParams, useNavigate, Link } from "react-router-dom";
  import Navbar from "@/components/layout/Navbar";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { useEffect } from "react";
  import { 
    Calendar, 
    MapPin, 
    Users, 
    ChevronLeft,
    Medal,
    Target,
    Mail,
    Phone
  } from "lucide-react";
  import { format } from "date-fns";




  export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const loadEvent = async () => {
      const res = await fetch(`http://localhost:5000/api/events/${id}`);
      const data = await res.json();

      const mappedEvent = {
        ...data,
        date: data.start_datetime ? new Date(data.start_datetime) : null,
        endDate: data.end_datetime ? new Date(data.end_datetime) : null,
        sport: data.sport_name,
        event_id: data.event_id,
        categories: ["5K Run", "Relay"],  // mock categories
        prizes: ["Gold Medal", "Silver Medal", "Bronze Medal"],  // mock prizes
        rules: ["Rule 1: Follow instructions", "Rule 2: No cheating"],  // mock rules
        coverImage: data.coverImage || "https://via.placeholder.com/800x400",
        organizer: data.organizer_name || "Organizer Name",
        contactEmail: data.organizer_email || "email@example.com",
        contactPhone: data.organizer_phone || "123-456-7890",
        website: data.website || "https://example.com",
        sponsors: ["Sponsor A", "Sponsor B"], 
        participants: data.participants || 0,
        maxParticipants: data.maxParticipants || 100,
      };

      setEvent(mappedEvent); 
      setLoading(false);
    };

    loadEvent();
  }, [id]);


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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4 w-fit"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Events
            </Button>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={getTypeColor(event.type)}>
                  {event.type}
                </Badge>
                <Badge variant={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
                <Badge variant="outline">
                  {event.sport}
                </Badge>
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
                  {event.participants}/{event.maxParticipants} participants
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Information */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="rules">Rules & Info</TabsTrigger>
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
                      <div className="flex flex-wrap gap-2">
                        {event.categories.map((category, index) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Prizes & Awards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {event.prizes.map((prize, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Medal className={`h-5 w-5 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 
                              'text-orange-600'
                            }`} />
                            <span>{prize}</span>
                          </div>
                        ))}
                      </div>
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
                        {event.rules.map((rule, index) => (
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

            {/* Right Column - Registration & Info */}
            <div className="space-y-6">

              <Card>
                <CardHeader>
                  <CardTitle>Event Organizer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-medium">
                    <Link 
                      to={`/users/${event.organizer_id}`} 
                      className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition-colors duration-200"
                    >
                      {event.organizer}
                    </Link>
                  </p>
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
                  <div className="flex flex-wrap gap-2">
                    {event.sponsors.map((sponsor, index) => (
                      <Badge key={index} variant="secondary">
                        {sponsor}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      </div>
    );
  }