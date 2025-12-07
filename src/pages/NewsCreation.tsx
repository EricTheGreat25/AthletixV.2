import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const NewsCreation = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    event_date: "",
    location: "",
    publish_date: new Date().toISOString().split("T")[0],
    author_name: "",
  });

  const categories = [
    "General",
    "Announcement",
    "Result",
    "Injury",
    "Transfer",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Article title is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Article content is required");
      return;
    }

    if (!formData.author_name.trim()) {
      toast.error("Author name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/news/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: localStorage.getItem("userId") || "admin",
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to publish article");
      }

      toast.success("Article published successfully!");

      // Reset form and navigate back
      const userRole = localStorage.getItem("userRole");
      console.log("User role from localStorage:", userRole);
      const isAdmin = userRole?.toLowerCase() === "admin";
      console.log("Is admin:", isAdmin);
      const targetPage = isAdmin ? "/admin" : "/news";
      console.log("Navigating to:", targetPage);
      setTimeout(() => {
        navigate(targetPage);
      }, 1500);
    } catch (err) {
      console.error("Error publishing article:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to publish article"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Create New Article</CardTitle>
            <CardDescription>
              Publish a new news article to keep everyone updated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Article Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter article title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Author Name */}
              <div className="space-y-2">
                <Label htmlFor="author_name">Author Name</Label>
                <Input
                  id="author_name"
                  name="author_name"
                  placeholder="Your name"
                  value={formData.author_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Publish Date */}
              <div className="space-y-2">
                <Label htmlFor="publish_date">Publish Date</Label>
                <Input
                  id="publish_date"
                  name="publish_date"
                  type="date"
                  value={formData.publish_date}
                  onChange={handleInputChange}
                />
              </div>

              {/* Event Date (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date (Optional)</Label>
                <Input
                  id="event_date"
                  name="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                />
              </div>

              {/* Location (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Event location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Article Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your article content here..."
                  value={formData.content}
                  onChange={handleInputChange}
                  className="min-h-[250px]"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Publishing..." : "Publish Article"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewsCreation;
