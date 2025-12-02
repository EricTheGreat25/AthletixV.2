import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/utilities/supabase";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";

type AthleteStatsRow = {
  id: string;
  name: string;
  sport: string;
  ppg: number;
  rpg: number;
  apg: number;
};

type User = {
  id: number;
  name: string;
  sport: string;
  role: string;
  registrationDate: string;
};

type Event = {
  id: number;
  name: string;
  type: string;
  date: string;
  participants: number;
  status: string;
};

type NewsArticle = {
  id: number;
  title: string;
  author: string;
  datePublished: string;
  status: string;
};

type SelectedRow =
  | { type: "user"; data: User }
  | { type: "event"; data: Event }
  | { type: "news"; data: NewsArticle }
  | null;

const AdminDashboard = () => {
  const [selectedRow, setSelectedRow] = useState<SelectedRow>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [athleteStats, setAthleteStats] = useState<AthleteStatsRow[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const totalUsers = users.length;
  const totalEvents = events.length;
  const totalNews = news.length;

  // Redirect non-admins away from this page
  useEffect(() => {
    if (!roleLoading && role !== "admin") {
      navigate("/login");
    }
  }, [role, roleLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Users from Supabase "users" table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_id, fullname, sport_name, role, registration_date")
          .order("registration_date", { ascending: false });

        if (userError) {
          console.error("Error fetching users:", userError.message);
        } else if (userData) {
          const mappedUsers: User[] = userData.map((u: any) => ({
            id: u.user_id,
            name: u.fullname,
            sport: u.sport_name ?? "N/A",
            role: u.role ?? "N/A",
            registrationDate: u.registration_date
              ? new Date(u.registration_date).toLocaleDateString()
              : "N/A",
          }));
          setUsers(mappedUsers);
        }

        // Events via existing backend route
        const eventsRes = await fetch("http://localhost:5000/get-events");
        const eventsJson = await eventsRes.json();
        const mappedEvents: Event[] = (eventsJson.events || []).map(
          (e: any) => ({
            id: e.event_id,
            name: e.title,
            type: e.type ?? "N/A",
            date: e.start_datetime
              ? new Date(e.start_datetime).toLocaleDateString()
              : "N/A",
            participants: e.participant_count ?? 0,
            status: e.status ?? "upcoming",
          })
        );
        setEvents(mappedEvents);

        // News — if you add a "news" table later, wire it here.
        // For now this remains empty or could be filled with static content.
        setNews([]);

        // Athlete stats management data
        const athletesRes = await axios.get(
          "http://localhost:5000/api/athletes"
        );
        const athletesForStats: AthleteStatsRow[] = athletesRes.data.map(
          (a: any) => ({
            id: a.id,
            name: a.name,
            sport: a.sport,
            ppg: parseFloat(a.stats?.[0]?.value || "0"),
            rpg: parseFloat(a.stats?.[1]?.value || "0"),
            apg: parseFloat(a.stats?.[2]?.value || "0"),
          })
        );
        setAthleteStats(athletesForStats);
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const closeDialog = () => setSelectedRow(null);

  const handleStatChange = (
    id: string,
    field: "ppg" | "rpg" | "apg",
    value: string
  ) => {
    setAthleteStats((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, [field]: isNaN(parseFloat(value)) ? 0 : parseFloat(value) }
          : row
      )
    );
  };

  const handleSaveStats = async (id: string) => {
    const row = athleteStats.find((a) => a.id === id);
    if (!row) return;

    try {
      setSavingId(id);
      await axios.put(`http://localhost:5000/api/athlete-stats/${id}`, {
        ppg: row.ppg,
        rpg: row.rpg,
        apg: row.apg,
      });
    } catch (err) {
      console.error("Failed to save stats:", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (roleLoading || role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of users, events, and news across the Athletix platform.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </header>

        {loading && (
          <p className="text-sm text-muted-foreground">Loading data…</p>
        )}

        {/* Summary cards */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card className="bg-muted/40">
            <CardHeader>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{totalUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">
                All registered users in the platform.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/40">
            <CardHeader>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{totalEvents}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Includes upcoming, ongoing, and completed events.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/40">
            <CardHeader>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Total News Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{totalNews}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Articles visible to athletes and organizers.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* User management table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Management</h2>
          </div>

          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sports</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedRow({ type: "user", data: user })}
                    >
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.sport}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.registrationDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Events table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Events</h2>
          </div>

          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow
                      key={event.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedRow({ type: "event", data: event })}
                    >
                      <TableCell>{event.name}</TableCell>
                      <TableCell>{event.type}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.participants}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.status === "completed"
                              ? "outline"
                              : event.status === "ongoing"
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* News table */}
        <section className="space-y-4 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">News</h2>
          </div>

          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Date Published</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.map((article) => (
                    <TableRow
                      key={article.id}
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedRow({ type: "news", data: article })
                      }
                    >
                      <TableCell>{article.title}</TableCell>
                      <TableCell>{article.author}</TableCell>
                      <TableCell>{article.datePublished}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            article.status === "Published" ? "default" : "outline"
                          }
                        >
                          {article.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Athlete stats management */}
        <section className="space-y-4 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Athlete Stats Management</h2>
            <p className="text-xs text-muted-foreground">
              Edit PPG, RPG, and APG for each athlete. Changes are saved per row.
            </p>
          </div>

          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>PPG</TableHead>
                    <TableHead>RPG</TableHead>
                    <TableHead>APG</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {athleteStats.map((athlete) => (
                    <TableRow key={athlete.id}>
                      <TableCell>{athlete.name}</TableCell>
                      <TableCell>{athlete.sport}</TableCell>
                      <TableCell>
                        <input
                          type="number"
                          step="0.1"
                          className="w-20 rounded border px-2 py-1 text-sm bg-background"
                          value={athlete.ppg}
                          onChange={(e) =>
                            handleStatChange(athlete.id, "ppg", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <input
                          type="number"
                          step="0.1"
                          className="w-20 rounded border px-2 py-1 text-sm bg-background"
                          value={athlete.rpg}
                          onChange={(e) =>
                            handleStatChange(athlete.id, "rpg", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <input
                          type="number"
                          step="0.1"
                          className="w-20 rounded border px-2 py-1 text-sm bg-background"
                          value={athlete.apg}
                          onChange={(e) =>
                            handleStatChange(athlete.id, "apg", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingId === athlete.id}
                          onClick={() => handleSaveStats(athlete.id)}
                        >
                          {savingId === athlete.id ? "Saving..." : "Save"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Row details modal */}
      <Dialog open={!!selectedRow} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          {selectedRow && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedRow.type === "user" && "User Details"}
                  {selectedRow.type === "event" && "Event Details"}
                  {selectedRow.type === "news" && "News Article Details"}
                </DialogTitle>
              </DialogHeader>

              {selectedRow.type === "user" && (
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedRow.data.name}
                  </p>
                  <p>
                    <span className="font-medium">Sport:</span>{" "}
                    {selectedRow.data.sport}
                  </p>
                  <p>
                    <span className="font-medium">Role:</span>{" "}
                    {selectedRow.data.role}
                  </p>
                  <p>
                    <span className="font-medium">Registration Date:</span>{" "}
                    {selectedRow.data.registrationDate}
                  </p>
                </div>
              )}

              {selectedRow.type === "event" && (
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Event:</span>{" "}
                    {selectedRow.data.name}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {selectedRow.data.type}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {selectedRow.data.date}
                  </p>
                  <p>
                    <span className="font-medium">Participants:</span>{" "}
                    {selectedRow.data.participants}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {selectedRow.data.status}
                  </p>
                </div>
              )}

              {selectedRow.type === "news" && (
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Title:</span>{" "}
                    {selectedRow.data.title}
                  </p>
                  <p>
                    <span className="font-medium">Author:</span>{" "}
                    {selectedRow.data.author}
                  </p>
                  <p>
                    <span className="font-medium">Date Published:</span>{" "}
                    {selectedRow.data.datePublished}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {selectedRow.data.status}
                  </p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;


