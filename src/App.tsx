import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import News from "./pages/News";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import AthleteProfile from "./pages/AthleteProfile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "@/hooks/AuthProvider";
import NewsCreation from "./pages/NewsCreation";
import FullArticle from "./pages/FullArticle";

const CreateNewsRoute = () => {
  const role =
    typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  const isAdmin = role?.toLowerCase() === "admin";
  return isAdmin ? (
    <Navigate to="/admin/create-news" replace />
  ) : (
    <NewsCreation />
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/athletes/:id" element={<AthleteProfile />} />
            <Route path="/search-athletes" element={<Search />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/news" element={<News />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create-news" element={<NewsCreation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/athletes/:id" element={<AthleteProfile />} />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/create-news" element={<CreateNewsRoute />} />
            <Route path="/news/:newsId" element={<FullArticle />} />
            <Route path="/edit-news/:newsId" element={<NewsCreation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
