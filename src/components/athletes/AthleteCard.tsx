import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Activity, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AthleteCardProps {
  id: string;
  name: string;
  sport: string;
  position: string;
  age: number;
  gender?: string;
  location: string;
  achievements: number;
  stats: { label: string; value: string }[];
  imageUrl?: string;
  verified?: boolean;

  // NEW
  selectable?: boolean;
  checked?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

const AthleteCard = ({
  id,
  name,
  sport,
  position,
  age,
  gender,
  location,
  achievements,
  stats,
  imageUrl,
  verified = false,

  selectable = false,
  checked = false,
  onSelect,
}: AthleteCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="card-hover overflow-hidden relative">
      
      {/* Checkbox (only when selectable) */}
      {selectable && (
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onSelect && onSelect(id, e.target.checked)}
          className="absolute top-3 right-3 h-5 w-5 rounded border-gray-400"
        />
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {name}
                {verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{position}</p>

              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {sport}
                </span>
                <span>{age} yrs</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {location}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {stats.slice(0, 3).map((stat, index) => (
            <div key={index} className="text-center p-2 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-sm font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <Link to={`/athletes/${id}`} className="mt-3 block">
          <Button variant="secondary" className="w-full">
            <Eye className="mr-2 h-4 w-4" />
            View Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default AthleteCard;
