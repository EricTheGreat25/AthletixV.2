import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { NewsArticle } from "@/pages/AdminDashboard";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  event_date: z.string().optional(),
  location: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

interface NewsEditModalProps {
  open: boolean;
  onClose: () => void;
  news: NewsArticle | null;
  onNewsUpdated: (updatedNews: NewsArticle) => void;
}

export default function NewsEditModal({ open, onClose, news, onNewsUpdated }: NewsEditModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      event_date: "",
      location: "",
      content: "",
    },
  });

  // Fetch and populate form when modal opens
  useEffect(() => {
    if (open && news?.news_id) {
      setLoadingDetails(true);
      fetch(`http://localhost:5000/api/news/${news.news_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.article) {
            const article = data.article;
            form.reset({
              title: article.title || "",
              category: article.category || "",
              event_date: article.event_date ? article.event_date.split('T')[0] : "",
              location: article.location || "",
              content: article.content || "",
            });
          }
        })
        .catch(err => {
          console.error("Failed to fetch news details:", err);
          toast({
            title: "Error",
            description: "Failed to load news details",
            variant: "destructive",
          });
        })
        .finally(() => setLoadingDetails(false));
    }
  }, [open, news?.news_id, form, toast]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!news?.news_id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/news/${news.news_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          category: values.category,
          event_date: values.event_date || null,
          location: values.location || null,
          content: values.content,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update news");

      // Update the news article with the response
      const updatedNews: NewsArticle = {
        ...news,
        title: values.title,
        category: values.category,
        event_date: values.event_date || null,
        location: values.location || null,
        content: values.content,
      };

      onNewsUpdated(updatedNews);
      onClose();

      toast({
        title: "News Updated!",
        description: "The news article has been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update news",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingDetails) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <p>Loading news details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit News Article</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter article title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Soccer">Soccer</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                      <SelectItem value="Track & Field">Track & Field</SelectItem>
                      <SelectItem value="Volleyball">Volleyball</SelectItem>
                      <SelectItem value="Baseball">Baseball</SelectItem>
                      <SelectItem value="Facilities">Facilities</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Manila Sports Complex" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your article content here..."
                      className="min-h-[300px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

