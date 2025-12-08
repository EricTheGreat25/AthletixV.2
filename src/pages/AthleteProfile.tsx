import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { convertToEmbed } from "@/utilities/utils";
import AchievementCard from "@/components/account/AchievementCard";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import {
  MapPin,
  Trophy,
  Activity,
  Share2,
  TrendingUp,
  ChevronLeft,
  GraduationCap
} from "lucide-react";
import axios from "axios";

// --- Interfaces ---
interface Athlete {
  id: string;
  name: string;
  sport: string;
  position: string;
  age: number | string;
  gender: string;
  location: string;
  bio: string;
  verification_status: string;
  height?: number | null;
  weight?: number | null;
  jerseyNumber?: number | null;
  email?: string | null;
  contactNum?: string | null;
  achievements?: Array<{ achievement_id: string; title: string; year?: number; description?: string }>;
  videos?: Array<{ url: string }>;
  education?: Array<{ school: string; degree?: string; field?: string; year?: string }>;
  imageUrl?: string;
}

interface StatColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

interface StatsTableProps {
  stats: any[];
  sport: string;
}

// --- StatsTable Component ---
const StatsTable = ({ stats, sport }: StatsTableProps) => {
  const sportColumns: Record<string, StatColumn[]> = {
    basketball: [
      { key: "minutes_played", label: "MIN" },
      { key: "points", label: "PTS" },
      { key: "rebounds", label: "REB" },
      { key: "assists", label: "AST" },
      { key: "steals", label: "STL" },
      { key: "blocks", label: "BLK" },
      { key: "turnovers", label: "TO" },
      { key: "fg_percent", label: "FG%", format: (val) => val ? `${val}%` : "0%" },
      { key: "three_percent", label: "3P%", format: (val) => val ? `${val}%` : "0%" },
      { key: "ft_percent", label: "FT%", format: (val) => val ? `${val}%` : "0%" },
    ],
    football: [
      { key: "minutes_played", label: "MIN" },
      { key: "goals", label: "Goals" },
      { key: "assists", label: "Assists" },
      { key: "shots", label: "Shots" },
      { key: "passes", label: "Passes" },
      { key: "tackles", label: "Tackles" },
      { key: "interceptions", label: "INT" },
      { key: "saves", label: "Saves" },
      { key: "yellow_cards", label: "Yellow" },
      { key: "red_cards", label: "Red" },
    ],
    volleyball: [
      { key: "kills", label: "Kills" },
      { key: "blocks", label: "Blocks" },
      { key: "aces", label: "Aces" },
      { key: "assists", label: "Assists" },
      { key: "digs", label: "Digs" },
      { key: "receptions", label: "Receptions" },
      { key: "errors", label: "Errors" },
    ],
  };

  // Safe lowercasing
  const normalizedSport = sport ? sport.toLowerCase() : "";
  const columns = sportColumns[normalizedSport] || [];

  if (!stats || stats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No statistics available yet.</p>
      </div>
    );
  }

  // If the sport isn't in our list (e.g. soccer isn't mapped above but might be valid), handle gracefully
  if (columns.length === 0) {
    return (
        <div className="text-center py-8 text-muted-foreground">
            <p>Statistics display format not defined for {sport}.</p>
        </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Season</TableHead>
            {columns.map((col) => (
              <TableHead key={col.key} className="text-center">
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat, index) => (
            <TableRow key={stat.id || index}>
              <TableCell className="font-medium">
                {stat.season_year || new Date(stat.created_at || Date.now()).getFullYear()}
              </TableCell>
              {columns.map((col) => (
                <TableCell key={col.key} className="text-center">
                  {col.format 
                    ? col.format(stat[col.key]) 
                    : stat[col.key] ?? "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// --- Main Component ---
const AthleteProfile = () => {
  const { id } = useParams();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const { role, loading: roleLoading } = useUserRole();
  const BIO_MAX_LENGTH = 200;
  
  // Refactored: Single state for stats regardless of sport
  const [stats, setStats] = useState<any[]>([]);

  const userId = localStorage.getItem("userId"); 

  // 1. Fetch Athlete Data
  useEffect(() => {
    const fetchAthlete = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/athletes/${id}`);
        setAthlete(res.data);
      } catch (err) {
        console.error("Failed to load athlete:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAthlete();
  }, [id]);

  // 2. Fetch Stats (Retrieves data from allstats.js)
  useEffect(() => {
    const fetchStats = async () => {
      // Guard clauses: need athlete data and a defined sport
      if (!athlete || !athlete.sport) return;

      try {
        // CORRECTED ROUTE: Mounted at /api/allstats
        const res = await axios.get(`http://localhost:5000/api/allstats/${athlete.id}`, {
          params: { sport: athlete.sport.toLowerCase() } 
        });
        
        // Ensure data is an array (backend returns [] or [...data])
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
        setStats([]); // Clear stats on error
      }
    };
    fetchStats();
  }, [athlete]);

  // 3. Check Follow Status
  useEffect(() => {
    const checkFollowing = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/follows/is-following`, {
            params: { follower_id: userId, following_id: id },
          });
          setIsFollowing(res.data.isFollowing);
        } catch (err) {
          console.error("Failed to check following status:", err);
        }
      };

    if (userId && athlete) {
      checkFollowing();
    }
  }, [athlete, userId, id]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await axios.delete(`http://localhost:5000/api/follows/unfollow`, {
          data: { follower_id: userId, following_id: id },
        });
        toast(`You have unfollowed ${athlete?.name}.`); 
      } else {
        await axios.post(`http://localhost:5000/api/follows/follow`, {
          follower_id: userId,
          following_id: id,
        });
        toast(`You are now following ${athlete?.name}.`); 
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Failed to update follow status:", err);
      toast.error("Something went wrong while updating follow status.");
    }
  };

  // Handle loading / error
  if (loading) return <p className="text-center py-10">Loading Profile...</p>;
  if (!athlete) return <p className="text-center py-10">Athlete not found</p>;

  const initials = athlete?.name
    ? athlete.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/search-athletes">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Athletes
          </Button>
        </Link>

        {/* Profile Header */}
        <div className="bg-muted/30 rounded-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-32 w-32">
              {athlete.imageUrl ? (
                <AvatarImage src={athlete.imageUrl} alt={athlete.name} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{athlete.name}</h1>
                    <Badge
                      className={
                        athlete.verification_status === "verified"
                          ? "bg-black text-white"
                          : "bg-gray-400 text-white"
                      }
                    >
                      {athlete.verification_status === "verified" ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      {athlete.sport} {athlete.position}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {athlete.location}
                    </span>
                  </div>
                  <p className="text-muted-foreground max-w-2xl">
                    {athlete.bio.length > BIO_MAX_LENGTH && !isBioExpanded
                      ? `${athlete.bio.slice(0, BIO_MAX_LENGTH)}...`
                      : athlete.bio}
                  </p>
                  {athlete.bio.length > BIO_MAX_LENGTH && (
                    <button
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="text-sm text-primary underline mt-1"
                    >
                      {isBioExpanded ? "Read less" : "Read more"}
                    </button>
                  )}

                  {/* Education */}
                  {athlete.education && athlete.education.length > 0 && (
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {athlete.education.map((edu, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span className="font-medium">{edu.school}</span>
                          {edu.year && (
                            <span className="text-xs text-muted-foreground">| Class of {edu.year}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {athlete.id !== userId && (
                    <Button
                      onClick={handleFollowToggle}
                      variant={isFollowing ? "secondary" : "default"}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast("Profile link copied to clipboard");
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-2xl font-bold">{athlete.age}</p>
                  <p className="text-sm text-muted-foreground">Age</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{athlete.height || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">Height (cm)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{athlete.weight || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">Weight (kg)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{athlete.jerseyNumber || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">Jersey</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="videos">Highlights</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Season Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <StatsTable stats={stats} sport={athlete.sport} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {athlete.achievements && athlete.achievements.length > 0 ? (
                athlete.achievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.achievement_id}
                    title={achievement.title}
                    description={achievement.description}
                    year={achievement.year}
                  />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No achievements yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video w-full max-w-4xl mx-auto">
                  <iframe
                    width="100%"
                    height="100%"
                    src={
                      athlete.videos?.[0]?.url
                        ? convertToEmbed(athlete.videos[0].url)
                        : "https://www.youtube.com/embed/dQw4w9WgXcQ"
                    }
                    title="Athlete Highlight Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{athlete.email || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{athlete.contactNum || "N/A"}</span>
                </div>
              </CardContent>
            </Card>
            
            {athlete.education && athlete.education.length > 0 && (
              <Card>
                 <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {athlete.education.map((edu: any, index: number) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold">{edu.school || "N/A"}</h4>
                      <p className="text-muted-foreground">{edu.degree || edu.field || "N/A"}</p>
                      {edu.year && <p className="text-sm text-muted-foreground">{edu.year}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AthleteProfile;