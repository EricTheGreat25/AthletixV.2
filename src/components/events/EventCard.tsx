import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import axios from "axios";

interface EventCardProps {
  id: string;
  title: string;
  type: "tryout" | "competition" | "showcase" | "camp";
  sport: string;
  date: string;
  endDate?: string;
  location: string;
  organizer: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
}

const EventCard = ({
  id,
  title,
  type,
  sport,
  date,
  endDate,
  location,
  description,
  status,
}: EventCardProps) => {
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/event-participants/${id}/count`
        );
        setParticipantCount(res.data.count);
      } catch (err) {
        console.error("Failed to fetch participant count:", err);
      }
    };
    fetchCount();
  }, [id]);

  const typeColors = {
    tryout: "bg-primary text-primary-foreground",
    competition: "bg-accent text-accent-foreground",
    showcase: "bg-secondary text-secondary-foreground",
    camp: "bg-muted text-muted-foreground",
  };

  const statusColors = {
    upcoming: "default",
    ongoing: "secondary",
    completed: "outline",
  } as const;

  const formatDateRange = () => {
    const start = new Date(date);
    const end = endDate ? new Date(endDate) : start;
    
    if (start.toDateString() === end.toDateString()) {
      return format(start, "PPP");
    }
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge className={typeColors[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
          <Badge variant={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        
        {/* Sport and Participant Count on same line */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{sport}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="font-medium">{participantCount}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm line-clamp-2">{description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateRange()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{location}</span>
          </div>
        </div>

        <div className="pt-2">
          <Link to={`/events/${id}`} className="w-full">
            <Button variant="secondary" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;