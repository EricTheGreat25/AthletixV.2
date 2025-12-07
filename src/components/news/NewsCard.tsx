import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

interface NewsCardProps {
  news_id: string;
  title: string;
  category: string;
  author_name: string;
  event_date: string;
  location: string;
  content: string;
  publish_date: string;
  featured?: boolean;
}

const NewsCard = ({
  news_id,
  title,
  category,
  author_name,
  event_date,
  location,
  content,
  publish_date,
  featured = false,
}: NewsCardProps) => {
  const categoryColors: Record<string, string> = {
    Basketball: "bg-orange-500 text-white hover:bg-orange-600",
    Soccer: "bg-green-500 text-white hover:bg-green-600",
    Football: "bg-blue-500 text-white hover:bg-blue-600",
    Swimming: "bg-cyan-500 text-white hover:bg-cyan-600",
    "Track & Field": "bg-purple-500 text-white hover:bg-purple-600",
    Volleyball: "bg-pink-500 text-white hover:bg-pink-600",
    Baseball: "bg-amber-500 text-white hover:bg-amber-600",
    Facilities: "bg-gray-500 text-white hover:bg-gray-600",
    General: "bg-slate-500 text-white hover:bg-slate-600",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Featured Card (Large)
  if (featured) {
    return (
      <Link to={`/news/${news_id}`}>
        <Card className="overflow-hidden border-2 card-hover cursor-pointer">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={categoryColors[category] || categoryColors.General}>
                {category}
              </Badge>
              <Badge variant="outline">Featured</Badge>
            </div>
            <CardTitle className="text-3xl hover:underline">{title}</CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-medium">
                <User className="h-3 w-3" />
                {author_name}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(event_date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getReadTime(content)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 line-clamp-3 text-muted-foreground">
              {content.substring(0, 200)}...
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Read Full Article →</span>
              <span className="text-xs text-muted-foreground">
                Published {getTimeAgo(publish_date)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Regular Card (Grid)
  return (
    <Link to={`/news/${news_id}`}>
      <Card className="card-hover cursor-pointer h-full">
        <CardHeader>
          <Badge
            className={`${categoryColors[category] || categoryColors.General} w-fit mb-2`}
          >
            {category}
          </Badge>
          <CardTitle className="text-lg line-clamp-2 hover:underline">
            {title}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{author_name}</span>
            <span>•</span>
            <span>{getTimeAgo(publish_date)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {content.substring(0, 150)}...
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(event_date)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {getReadTime(content)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default NewsCard;