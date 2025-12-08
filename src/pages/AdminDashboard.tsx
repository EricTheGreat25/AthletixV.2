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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  Newspaper,
  TrendingUp,
  LogOut,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import UserVerificationDialog from "@/components/admin/UserAction";
import NewsDetailsDialog from "@/components/admin/NewsDetailDialog";
import EventDetailsDialog from "@/components/admin/EventDetailDialog";
import EventEditModal from "@/components/events/EventEditModal";
import NewsEditModal from "@/components/admin/NewsEditModal";
import EventCreationForm from "@/components/events/EventCreationForm";
import NewsCreationModal from "@/components/admin/NewsCreationModal";
import * as XLSX from "xlsx";

  type User = {
    id: string;
    name: string;
    sport: string;
    role: string;
    registrationDate: string;
    verificationStatus: "verified" | "unverified" | "rejected";
  };

  type Event = {
    id?: number;
    event_id?: number;
    title: string;
    organizer: string;
    type: string;
    sport: string;
    startdatetime: string;
    enddatetime: string;
    participants: string | number;
    status: string;
    description: string;
  };

  export type NewsArticle = {
    news_id: string;
    title: string | null;
    author_name: string | null;
    content: string | null;
    category: string | null;
    publish_date: string | null;
    event_date: string | null;
    location: string | null;
  };

  type AthleteStatsRow = {
    id: string;
    name: string;
    sport: string;
    ppg: number;
    rpg: number;
    apg: number;
  };

  type ExcelRow = {
  sport?: string;
  Sport?: string;
  SPORT?: string;
  user_id?: string;
  [key: string]: string | number | undefined;
};

type UploadError = {
  row: number;
  sport?: string;
  error: string;
  missing?: string[];
  invalidFields?: Array<{ column: string; value: any; reason: string }>;
  data?: any;
};

type UploadResult = {
  message: string;
  summary?: {
    total: number;
    success: number;
    failed: number;
  };
  breakdown?: {
    basketball: { success: number; failed: number };
    volleyball: { success: number; failed: number };
    football: { success: number; failed: number };
  };
  errors?: UploadError[];
  nonExistentUsers?: string[];
  sport?: string;
  error?: string;
  processedRows?: Array<{ row: number; sport: string; user_id: string }>;
};


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [showCreateNewsDialog, setShowCreateNewsDialog] = useState(false);
  const [newsFormData, setNewsFormData] = useState({
    title: "",
    content: "",
    category: "General",
    event_date: "",
    location: "",
    publish_date: new Date().toISOString().split("T")[0],
    author_name: "",
  });

  const [events, setEvents] = useState<Event[]>([
  ]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/get-users/users");
        if (!res.ok) throw new Error("Failed to fetch users");

        const data: User[] = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  // Fetch events from server
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/create-events");
        if (!res.ok) throw new Error("Failed to fetch events");

        const data = await res.json();
        const fetchedEvents = (data.events || []).map((event: any) => {
          // Calculate status based on dates
          const now = new Date();
          const startDate = new Date(event.start_datetime);
          const endDate = new Date(event.end_datetime);
          let status: "upcoming" | "ongoing" | "completed" = "upcoming";
          if (now < startDate) status = "upcoming";
          else if (now >= startDate && now <= endDate) status = "ongoing";
          else status = "completed";

          return {
            event_id: event.event_id,
            id: event.event_id,
            title: event.title,
            organizer: event.organizer_name || "Admin",
            type: event.type,
            sport: event.sport_name,
            startdatetime: event.start_datetime,
            enddatetime: event.end_datetime,
            participants: event.participants || 0,
            status: status,
            description: event.description || "",
          };
        });
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    fetchEvents();
  }, []);

  // Fetch news from server
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/news");
        if (!res.ok) throw new Error("Failed to fetch news");

        const data = await res.json();
        setNews(data.articles || []);
      } catch (err) {
        console.error("Failed to fetch news:", err);
      }
    };

    fetchNews();
  }, []);

  const [news, setNews] = useState<NewsArticle[]>([
    {
      news_id: "1",
      title: "New Season Announcement",
      author_name: "Admin",
      publish_date: "2024-04-01",
      content: "Welcome to the new season! We have exciting updates...",
      category: "General",
      event_date: null,
      location: null,
    },
  ]);

  const [athleteStats, setAthleteStats] = useState<AthleteStatsRow[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isEventEditOpen, setIsEventEditOpen] = useState(false);
  const [isNewsEditOpen, setIsNewsEditOpen] = useState(false);
  const [isEventCreateOpen, setIsEventCreateOpen] = useState(false);
  const [isNewsCreateOpen, setIsNewsCreateOpen] = useState(false);

  const totalUsers = users.length;
  const verifiedUsers = users.filter(
    (u) => u.verificationStatus === "verified"
  ).length;
  const pendingUsers = users.filter(
    (u) => u.verificationStatus === "unverified"
  ).length;
  const totalEvents = events.length;
  const totalNews = news.length;

  const handleVerificationChange = async (
    userId: string,
    status: "verified" | "unverified" | "rejected"
  ) => {
    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, verificationStatus: status } : u
      )
    );

    try {
      // FIX: Changed 'users' to 'user-action'
      const response = await fetch(
        `http://localhost:5000/api/user-action/verify/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error("Failed to verify user");
    } catch (error) {
      console.error(error);
      alert("Failed to update verification status on server");
    }

    setSelectedUser(null);
  };

  const handleDeleteUser = async (argId: string) => {
    // Safety check: ensure we have a valid ID string
    const userId = typeof argId === "string" ? argId : selectedUser?.id;

    if (!userId) {
      console.error("No user ID provided for deletion");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/user-action/delete/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelectedUser(null);
      alert("User deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };
  const handleDeleteEvent = async (eventId: number | string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/delete/${eventId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete event");

      setEvents((prev) => prev.filter((e) => (e.event_id || e.id) !== eventId));
      setSelectedEvent(null); // Close the dialog
      alert("Event deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to delete event");
    }
  };

  const handleEditEvent = () => {
    setIsEventEditOpen(true);
  };

  const handleEventUpdated = (updatedEvent: any) => {
    // Update the event in the local state
    // The updatedEvent from the API has event_id
    const eventId = updatedEvent.event_id || updatedEvent.id;
    setEvents((prev) =>
      prev.map((e) => {
        // Check if this is the event that was updated
        const currentId = e.event_id || e.id;
        if (currentId === eventId) {
          return {
            ...e,
            event_id: eventId,
            id: eventId,
            title: updatedEvent.title || e.title,
            type: updatedEvent.type || e.type,
            sport: updatedEvent.sport_name || updatedEvent.sport || e.sport,
            startdatetime: updatedEvent.start_datetime || e.startdatetime,
            enddatetime: updatedEvent.end_datetime || e.enddatetime,
            description: updatedEvent.description || e.description,
          };
        }
        return e;
      })
    );
    setIsEventEditOpen(false);
    setSelectedEvent(null);
  };

  const handleEditNews = () => {
    setIsNewsEditOpen(true);
  };

  const handleNewsUpdated = (updatedNews: NewsArticle) => {
    // Update the news article in the local state
    setNews((prev) =>
      prev.map((n) => (n.news_id === updatedNews.news_id ? updatedNews : n))
    );
    setIsNewsEditOpen(false);
    setSelectedNews(null);
  };

  const handleEventCreated = (newEvent: any) => {
    // Calculate status based on dates
    const now = new Date();
    const startDate = new Date(newEvent.start_datetime);
    const endDate = new Date(newEvent.end_datetime);
    let status: "upcoming" | "ongoing" | "completed" = "upcoming";
    if (now < startDate) status = "upcoming";
    else if (now >= startDate && now <= endDate) status = "ongoing";
    else status = "completed";

    // Add the new event to the local state
    const eventToAdd: Event = {
      event_id: newEvent.event_id,
      id: newEvent.event_id,
      title: newEvent.title,
      organizer: newEvent.organizer_name || "Admin",
      type: newEvent.type,
      sport: newEvent.sport_name || newEvent.sport,
      startdatetime: newEvent.start_datetime,
      enddatetime: newEvent.end_datetime,
      participants: 0,
      status: status,
      description: newEvent.description || "",
    };

    setEvents((prev) => [...prev, eventToAdd]);
    setIsEventCreateOpen(false);
  };

  const handleNewsCreated = (newNews: NewsArticle) => {
    // Add the new news article to the local state
    setNews((prev) => [...prev, newNews]);
    setIsNewsCreateOpen(false);
  };

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/news/${newsId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setNews((prev) => prev.filter((n) => n.news_id !== newsId));
        setSelectedNews(null);
        alert("News deleted");
        return;
      }
      // fallback local deletion
      setNews((prev) => prev.filter((n) => n.news_id !== newsId));
      setSelectedNews(null);
      alert("News removed locally (server may not support delete)");
    } catch (err) {
      console.error("Delete news error", err);
      setNews((prev) => prev.filter((n) => n.news_id !== newsId));
      setSelectedNews(null);
      alert("News removed locally (server error)");
    }
  };

  const handleResetPassword = async (argId: string) => {
    // Safety check: ensure we have a valid ID string
    const userId = typeof argId === "string" ? argId : selectedUser?.id;

    if (!userId) {
      console.error("No user ID provided for reset");
      return;
    }

    try {
      // FIX: Changed 'users' to 'user-action'
      const response = await fetch(
        `http://localhost:5000/api/user-action/reset-password/${userId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Failed to send reset email");

      alert("Password reset email sent to the user.");
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      alert("Failed to send password reset email");
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        setUploadedFile(file);
      } else {
        alert("Please upload an Excel file (.xlsx or .xls)");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleUploadStats = async () => {
  if (!uploadedFile) {
    toast.error("Please select a file first");
    return;
  }

  // Show loading toast
  const loadingToast = toast.loading("Processing file...");

  try {
    const data = await uploadedFile.arrayBuffer();
    const workbook = XLSX.read(data);
    
    // Check if workbook has sheets
    if (!workbook.SheetNames.length) {
      toast.dismiss(loadingToast);
      toast.error("Excel file has no sheets");
      return;
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let rows = XLSX.utils.sheet_to_json(sheet, { 
      raw: false, // Keep values as strings initially
      defval: '' // Default value for empty cells
    }) as ExcelRow[];

    if (!rows.length) {
      toast.dismiss(loadingToast);
      toast.error("Excel file is empty");
      return;
    }

    // Trim whitespace from all string values
    rows = rows.map(row => {
      const cleaned: ExcelRow = {};
      for (const [key, value] of Object.entries(row)) {
        cleaned[key.trim()] = typeof value === 'string' ? value.trim() : value;
      }
      return cleaned;
    });

    // Validate that required columns exist in at least one row
    const firstRow = rows[0];
    if (!firstRow.sport && !firstRow.Sport && !firstRow.SPORT) {
      toast.dismiss(loadingToast);
      toast.error("Excel file must contain a 'sport' column");
      return;
    }

    toast.dismiss(loadingToast);
    toast.loading("Uploading to server...");

    const res = await fetch("http://localhost:5000/api/upload-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    const result: UploadResult = await res.json();
    toast.dismiss();

    if (res.ok) {
      // Success response
      toast.success(result.message || "Stats uploaded successfully!", {
        description: `${result.summary?.success || 0} rows uploaded successfully`,
        duration: 5000,
      });

      // Show breakdown if available
      if (result.breakdown) {
        const breakdown = result.breakdown;
        Object.entries(breakdown).forEach(([sport, counts]) => {
          if (counts.success > 0) {
            toast.info(`${sport}: ${counts.success} records uploaded`);
          }
        });
      }

      setUploadedFile(null);
      
      // Optional: Refresh athlete stats if you have a fetch function
      // await fetchAthleteStats();
      
    } else {
      // Error response
      if (result.errors && Array.isArray(result.errors)) {
        // Multiple validation errors
        toast.error(result.message || "Validation failed", {
          description: `Failed to process ${result.errors.length} row(s)`,
          duration: 8000,
        });

        // Show first few errors in detail
        result.errors.slice(0, 3).forEach((err) => {
          const errorMsg = err.missing 
            ? `Row ${err.row} (${err.sport}): Missing ${err.missing.join(", ")}`
            : err.invalidFields
            ? `Row ${err.row} (${err.sport}): Invalid values in ${err.invalidFields.map(f => f.column).join(", ")}`
            : `Row ${err.row}: ${err.error}`;
          
          toast.error(errorMsg, { duration: 6000 });
        });

        if (result.errors.length > 3) {
          toast.info(`...and ${result.errors.length - 3} more errors`, {
            description: "Please check your Excel file and try again",
          });
        }
      } else if (result.nonExistentUsers) {
        // User ID validation error
        toast.error("Invalid user IDs found", {
          description: `${result.nonExistentUsers.length} user ID(s) do not exist`,
          duration: 8000,
        });
        
        toast.info("Non-existent users: " + result.nonExistentUsers.join(", "), {
          duration: 10000,
        });
      } else if (result.sport) {
        // Single sport error
        toast.error(`Failed to upload ${result.sport} stats`, {
          description: result.error || result.message,
          duration: 6000,
        });
      } else {
        // Generic error
        toast.error(result.message || "Upload failed", {
          description: result.error || "Please try again",
          duration: 5000,
        });
      }
    }
  } catch (err) {
    toast.dismiss();
    console.error("Upload error:", err);
    toast.error("Upload failed", {
      description: err instanceof Error ? err.message : "An unexpected error occurred",
      duration: 5000,
    });
  }
};

  const handleCreateNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newsFormData.title.trim()) {
      toast.error("Article title is required");
      return;
    }

    if (!newsFormData.content.trim()) {
      toast.error("Article content is required");
      return;
    }

    if (!newsFormData.author_name.trim()) {
      toast.error("Author name is required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/news/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: localStorage.getItem("userId") || "admin",
          ...newsFormData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to publish article");
      }

      toast.success("Article published successfully!");
      setNewsFormData({
        title: "",
        content: "",
        category: "General",
        event_date: "",
        location: "",
        publish_date: new Date().toISOString().split("T")[0],
        author_name: "",
      });
      setShowCreateNewsDialog(false);
      // Refresh news list - fetchNews would be called here if implemented
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish article"
      );
    }
  };

  const handleNewsFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewsFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewsCategoryChange = (value: string) => {
    setNewsFormData((prev) => ({ ...prev, category: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, events, news, and athlete statistics
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </header>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 lg:w-auto p-1 rounded-lg">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-slate-800 dark:bg-slate-900 text-white shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Total Users
                  </CardTitle>
                  <Users className="h-5 w-5 text-white opacity-80" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{totalUsers}</p>
                  <p className="text-xs text-white/80 mt-1">
                    {verifiedUsers} verified, {pendingUsers} pending
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 dark:bg-slate-900 text-white shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Total Events
                  </CardTitle>
                  <Calendar className="h-5 w-5 text-white opacity-80" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{totalEvents}</p>
                  <p className="text-xs text-white/80 mt-1">
                    Active and upcoming
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 dark:bg-slate-900 text-white shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Published News
                  </CardTitle>
                  <Newspaper className="h-5 w-5 text-white opacity-80" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{totalNews}</p>
                  <p className="text-xs text-white/80 mt-1">
                    Articles published
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 dark:bg-slate-900 text-white shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Athletes Tracked
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-white opacity-80" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">
                    {athleteStats.length}
                  </p>
                  <p className="text-xs text-white/80 mt-1">With statistics</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          New user registered
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Jane Smith joined 2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Event created</p>
                        <p className="text-xs text-muted-foreground">
                          Basketball Championship added
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Stats updated</p>
                        <p className="text-xs text-muted-foreground">
                          John Doe's stats modified
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <Users className="h-4 w-4" />
                    Review Pending Verifications ({pendingUsers})
                  </Button>
                  <Button
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4" />
                    Create New Event
                  </Button>
                  <Button
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Athlete Stats
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-sm text-muted-foreground">
                  Manage user accounts and verification status
                </p>
              </div>
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Add User
              </Button>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Verification Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.sport}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.registrationDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.verificationStatus === "verified"
                                ? "default"
                                : user.verificationStatus === "unverified"
                                ? "secondary"
                                : "destructive"
                            }
                            className="capitalize"
                          >
                            {user.verificationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser(user)}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Events Management</h2>
                <p className="text-sm text-muted-foreground">
                  Organize and track sporting events
                </p>
              </div>
              <Button
                className="gap-2"
                onClick={() => setIsEventCreateOpen(true)}
              >
                <Calendar className="h-4 w-4" />
                Create Event
              </Button>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Start Date & Time</TableHead>
                      <TableHead>End Date & Time</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.event_id || event.id}>
                        <TableCell className="font-medium">
                          {event.title}
                        </TableCell>
                        <TableCell>{event.organizer}</TableCell>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>{event.sport}</TableCell>
                        <TableCell>{event.startdatetime}</TableCell>
                        <TableCell>{event.enddatetime}</TableCell>
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
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEvent(event)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">News Management</h2>
                <p className="text-sm text-muted-foreground">
                  Publish and manage news articles
                </p>
              </div>
              <Button
                className="gap-2"
                onClick={() => setIsNewsCreateOpen(true)}
              >
                <Newspaper className="h-4 w-4" />
                Create Article
              </Button>
            </div>
            
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date Published</TableHead>
                      {/* Status column removed to match Type definition */}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news.map((article) => (
                      <TableRow key={article.news_id}>
                        {" "}
                        {/* Updated: id -> news_id */}
                        <TableCell className="font-medium">
                          {article.title}
                        </TableCell>
                        <TableCell>{article.author_name}</TableCell>{" "}
                        {/* Updated: author -> author_name */}
                        <TableCell>{article.publish_date}</TableCell>{" "}
                        {/* Updated: datePublished -> publish_date */}
                        {/* Status Cell removed */}
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedNews(article)}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Athlete Stats Management</h2>
                <p className="text-sm text-muted-foreground">
                  Upload and manage athlete statistics
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download Template
              </Button>
            </div>

            {/* File Upload Section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur border-2 border-dashed">
              <CardContent className="pt-6">
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Upload Athlete Stats
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your Excel file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Required columns: sport, user_id, and sport-specific stats
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      asChild
                    >
                      <span>Choose File</span>
                    </Button>
                  </label>

                  {uploadedFile && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center justify-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-foreground" />
                        <span className="text-sm font-medium">
                          {uploadedFile.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(uploadedFile.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2 justify-center">
                        <Button size="sm" onClick={handleUploadStats}>
                          Process & Upload
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUploadedFile(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Information Section */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel File Format
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Your Excel file should include the following columns:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>sport:</strong> basketball, volleyball, or football</li>
                      <li><strong>user_id:</strong> The athlete's user ID</li>
                      <li><strong>Sport-specific stats:</strong></li>
                    </ul>
                    <div className="ml-6 mt-2 space-y-1 text-xs">
                      <p><strong>Basketball:</strong> points, rebounds, assists, steals, blocks, turnovers, minutes_played</p>
                      <p><strong>Volleyball:</strong> kills, blocks, aces, digs, errors</p>
                      <p><strong>Football:</strong> goals, assists, tackles, yellow_cards, red_cards, minutes_played</p>
                    </div>
                    <p className="mt-3 text-xs">
                      💡 Click "Download Template" above to get a sample Excel file with the correct format.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <UserVerificationDialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onVerify={handleVerificationChange}
        onDelete={handleDeleteUser}
        onReset={handleResetPassword}
      />

      <EventDetailsDialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={
          selectedEvent
            ? {
                id: selectedEvent.id || selectedEvent.event_id,
                event_id: selectedEvent.event_id,
                title: selectedEvent.title,
                organizer: selectedEvent.organizer,
                type: selectedEvent.type,
                sport: selectedEvent.sport,
                startdatetime: selectedEvent.startdatetime,
                enddatetime: selectedEvent.enddatetime,
                participants: selectedEvent.participants,
                status: selectedEvent.status,
                description: selectedEvent.description,
              }
            : null
        }
        onDelete={handleDeleteEvent}
        onEdit={handleEditEvent}
      />

      <NewsDetailsDialog
        open={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        news={selectedNews}
        onDelete={(id) => {
          handleDeleteNews(id);
        }}
        onEdit={handleEditNews}
      />

      {selectedEvent && (
        <EventEditModal
          open={isEventEditOpen}
          onClose={() => {
            setIsEventEditOpen(false);
            setSelectedEvent(null);
          }}
          event={
            { event_id: selectedEvent.event_id || selectedEvent.id } as any
          }
          onEventUpdated={handleEventUpdated}
        />
      )}

      {selectedNews && (
        <NewsEditModal
          open={isNewsEditOpen}
          onClose={() => {
            setIsNewsEditOpen(false);
            setSelectedNews(null);
          }}
          news={selectedNews}
          onNewsUpdated={handleNewsUpdated}
        />
      )}

      <EventCreationForm
        open={isEventCreateOpen}
        onClose={() => setIsEventCreateOpen(false)}
        onEventCreated={handleEventCreated}
      />

      <NewsCreationModal
        open={isNewsCreateOpen}
        onClose={() => setIsNewsCreateOpen(false)}
        onNewsCreated={handleNewsCreated}
      />

      <EventCreationForm
        open={showCreateEventDialog}
        onClose={() => setShowCreateEventDialog(false)}
        onEventCreated={handleEventCreated}
      />

      <Dialog
        open={showCreateNewsDialog}
        onOpenChange={setShowCreateNewsDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create News Article</DialogTitle>
            <DialogDescription>
              Publish a new article to keep the community informed
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNewsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Article Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter article title"
                value={newsFormData.title}
                onChange={handleNewsFormChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newsFormData.category}
                  onValueChange={handleNewsCategoryChange}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Announcement">Announcement</SelectItem>
                    <SelectItem value="Result">Result</SelectItem>
                    <SelectItem value="Injury">Injury</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author Name</Label>
                <Input
                  id="author"
                  name="author_name"
                  placeholder="Your name"
                  value={newsFormData.author_name}
                  onChange={handleNewsFormChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publish_date">Publish Date</Label>
                <Input
                  id="publish_date"
                  name="publish_date"
                  type="date"
                  value={newsFormData.publish_date}
                  onChange={handleNewsFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date (Optional)</Label>
                <Input
                  id="event_date"
                  name="event_date"
                  type="date"
                  value={newsFormData.event_date}
                  onChange={handleNewsFormChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                name="location"
                placeholder="Event location"
                value={newsFormData.location}
                onChange={handleNewsFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your article content here..."
                value={newsFormData.content}
                onChange={handleNewsFormChange}
                rows={6}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateNewsDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Publish Article</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
