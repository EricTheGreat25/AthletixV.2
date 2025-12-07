import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ParticipantCardProps {
  userId: string;
  name: string;
  age: number | string;
  location: string;
  participantNo: number;
}

export default function ParticipantCard({
  userId,
  name,
  age,
  location,
  participantNo,
}: ParticipantCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-muted-foreground">
                #{participantNo}
              </span>
              <h4 className="font-semibold text-lg">{name}</h4>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {age} years
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            </div>
          </div>
          <Link to={`/athletes/${userId}`}>
            <Button variant="outline" size="sm">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}