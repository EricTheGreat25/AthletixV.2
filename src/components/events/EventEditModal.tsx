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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/utilities/utils";
import { useToast } from "@/hooks/use-toast";
import { useSports } from "@/hooks/useSports";
import { Badge } from "../ui/badge";

const formSchema = z
  .object({
    title: z.string().min(3),
    type: z.enum([
      "Competition",
      "Tryout",
      "Camp",
      "Showcase",
      "Clinic",
      "Tournament",
      "Seminar",
      "Other",
    ]),
    sport: z.string().min(1),
    startDate: z.date(),
    startTime: z.string(),
    endDate: z.date(),
    endTime: z.string(),
    location: z.string().min(3),
    description: z.string().min(10),
    category_ids: z.array(z.string()).optional(),
    sponsor_ids: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(
        `${data.startDate.toDateString()} ${data.startTime}`
      );
      const end = new Date(`${data.endDate.toDateString()} ${data.endTime}`);
      return end > start;
    },
    {
      message: "End date/time must be after start date/time",
      path: ["endDate"],
    }
  );

interface EventEditModalProps {
  open: boolean;
  onClose: () => void;
  event: any;
  onEventUpdated: (updatedEvent: any) => void;
}

function useFetch(url: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        return res.json();
      })
      .then((result) => {
        // Handle both array and object responses
        if (Array.isArray(result)) {
          setData(result);
        } else if (result.data && Array.isArray(result.data)) {
          setData(result.data);
        } else {
          setData([]);
        }
        setError(null);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

export default function EventEditModal({
  open,
  onClose,
  event,
  onEventUpdated,
}: EventEditModalProps) {
  const { toast } = useToast();
  const { sports, loading: sportsLoading, error: sportsError } = useSports();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const { data: categories } = useFetch(
    "http://localhost:5000/api/edit-event/categories"
  );
  const { data: sponsors } = useFetch(
    "http://localhost:5000/api/edit-event/sponsors"
  );

  // Initialize form FIRST before using it in useEffect
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "Competition",
      sport: "",
      startDate: new Date(),
      startTime: "09:00",
      endDate: new Date(),
      endTime: "17:00",
      location: "",
      description: "",
      category_ids: [],
      sponsor_ids: [],
    },
  });

  // Fetch complete event details when modal opens
  useEffect(() => {
    if (open && event?.event_id) {
      setLoadingDetails(true);
      fetch(`http://localhost:5000/api/edit-event/${event.event_id}/details`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
          return res.json();
        })
        .then((data) => {
          setEventDetails(data);
          // Reset form with fetched data
          const startDateTime = new Date(data.start_datetime);
          const endDateTime = new Date(data.end_datetime);

          form.reset({
            title: data.title || "",
            type: data.type
              ? data.type.charAt(0).toUpperCase() + data.type.slice(1)
              : "Competition",
            sport: data.sport_name || "",
            startDate: startDateTime,
            startTime: format(startDateTime, "HH:mm"),
            endDate: endDateTime,
            endTime: format(endDateTime, "HH:mm"),
            location: data.location || "",
            description: data.description || "",
            category_ids: data.categories?.map((c: any) => c.category_id) || [],
            sponsor_ids: data.sponsors?.map((s: any) => s.sponsor_id) || [],
          });
          setLoadingDetails(false);
        })
        .catch((err) => {
          console.error("Failed to fetch event details:", err);
          toast({
            title: "Error",
            description: err.message || "Failed to load event details",
            variant: "destructive",
          });
          setLoadingDetails(false);
        });
    } else if (!open) {
      // Reset when modal closes
      setLoadingDetails(true);
      setEventDetails(null);
    }
  }, [open, event?.event_id, form, toast]);

  const toggleSelection = (field: any, id: string) => {
    const values = field.value || [];
    field.onChange(
      values.includes(id) ? values.filter((v) => v !== id) : [...values, id]
    );
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formatDateLocal = (d: Date) =>
        `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;

      const startDatetime = `${formatDateLocal(values.startDate)}T${
        values.startTime
      }:00`;
      const endDatetime = `${formatDateLocal(values.endDate)}T${
        values.endTime
      }:00`;

      // Separate existing IDs from new names
      const existingCategoryIds =
        values.category_ids?.filter((v) =>
          categories.some((c: any) => c.category_id === v)
        ) || [];

      const newCategories =
        values.category_ids?.filter(
          (v) => !categories.some((c: any) => c.category_id === v)
        ) || [];

      const existingSponsorIds =
        values.sponsor_ids?.filter((v) =>
          sponsors.some((s: any) => s.sponsor_id === v)
        ) || [];

      const newSponsors =
        values.sponsor_ids?.filter(
          (v) => !sponsors.some((s: any) => s.sponsor_id === v)
        ) || [];

      const res = await fetch(
        `http://localhost:5000/api/edit-event/${event.event_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: values.title,
            type: values.type.toLowerCase(),
            sport_name: values.sport,
            start_datetime: startDatetime,
            end_datetime: endDatetime,
            location: values.location,
            description: values.description,
            category_ids: existingCategoryIds,
            new_categories: newCategories,
            sponsor_ids: existingSponsorIds,
            new_sponsors: newSponsors,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update event");

      onEventUpdated(result.event);
      onClose();

      toast({
        title: "Event Updated!",
        description: "Your event has been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSelectInput = (field: any, options: string[]) => (
    <Select onValueChange={field.onChange} value={field.value}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderBadgeInput = (
    field: any,
    items: any[],
    idKey: string = "category_id",
    nameKey: string = "name"
  ) => {
    const [input, setInput] = useState("");

    const handleAdd = () => {
      const trimmed = input.trim();
      if (trimmed && !(field.value || []).includes(trimmed)) {
        field.onChange([...(field.value || []), trimmed]);
        setInput("");
      }
    };

    return (
      <div>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder={`Add new ${nameKey}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAdd())
            }
          />
          <Button type="button" onClick={handleAdd}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((item) => {
            const id = item[idKey];
            if (!id) return null;
            const isSelected = (field.value || []).includes(id);
            return (
              <Badge
                key={id}
                variant={isSelected ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleSelection(field, id)}
              >
                {item[nameKey]} {isSelected && "✓"}
              </Badge>
            );
          })}

          {(field.value || [])
            .filter((v) => !items.some((i) => i[idKey] === v))
            .map((v) => (
              <Badge
                key={v}
                variant="default"
                className="cursor-pointer"
                onClick={() => toggleSelection(field, v)}
              >
                {v} ✓
              </Badge>
            ))}
        </div>
      </div>
    );
  };

  if (loadingDetails) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <p>Loading event details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    {renderSelectInput(field, [
                      "Competition",
                      "Tryout",
                      "Camp",
                      "Showcase",
                      "Clinic",
                      "Tournament",
                      "Seminar",
                      "Other",
                    ])}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport</FormLabel>
                  {sportsLoading ? (
                    <p>Loading...</p>
                  ) : sportsError ? (
                    <p className="text-red-500">Failed to load</p>
                  ) : (
                    renderSelectInput(
                      field,
                      sports.map((s) => s.sport_name)
                    )
                  )}
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full text-left",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          fromYear={2000}
                          toYear={2100}
                          className={cn("rounded-md border")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full text-left",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          fromYear={2000}
                          toYear={2100}
                          className={cn("rounded-md border")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  {renderBadgeInput(field, categories, "category_id", "name")}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sponsor_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsors</FormLabel>
                  {renderBadgeInput(field, sponsors, "sponsor_id", "name")}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || sportsLoading}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
