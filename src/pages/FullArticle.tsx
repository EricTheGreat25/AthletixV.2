import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Clock, Loader2, Edit, Share2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resourceLimits } from "worker_threads";

interface NewsArticle {
  news_id: string;
  user_id: string;
  author_name: string;
  title: string;
  event_date: string;
  location: string;
  content: string;
  category: string;
  publish_date: string;
  created_at: string;
}

const FullArticle = () => {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const id = localStorage.getItem("userId");
    setUserRole(role);
    setUserId(id);
  }, []);

  // Fetch article and recent articles
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        
        // Fetch current article
        const articleResponse = await fetch(`http://localhost:5000/api/news/${newsId}`);
        const articleData = await articleResponse.json();

        if (articleData.success && articleData.article) {
          setArticle(articleData.article);
        }

        // Fetch recent articles for sidebar
        const recentResponse = await fetch("http://localhost:5000/api/news/");
        const recentData = await recentResponse.json();

        if (recentData.success && recentData.articles) {
          // Filter out current article and get top 5 recent
          const filtered = recentData.articles
            .filter((a: NewsArticle) => a.news_id !== newsId)
            .slice(0, 5);
          setRecentArticles(filtered);
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        toast({
          title: "Error",
          description: "Failed to load article",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (newsId) {
      fetchArticle();
    }
  }, [newsId]);

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
      month: "long",
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

  const shareUrl = window.location.href;
  const shareTitle = article?.title || "";

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleDelete = async () => {
    try {
        setDeleting(true);

        const response = await fetch(`http://localhost:5000/api/news/${newsId}`, {
            method: "DELETE",
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        toast({
            title: "Article Deleted",
            description: "Article has been deleted",
        });

        navigate("/news");
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Failed to delete article",
            variant: "destructive",
        });
    } finally {
        setDeleting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast({
        title: "Link Copied!",
        description: "Article link copied to clipboard",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const canEdit = userRole === "organizer" && userId === article?.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Article not found</p>
              <Button onClick={() => navigate("/news")}>Back to News</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="space-y-4">
                {/* Category Badge */}
                <Badge className={`${categoryColors[article.category] || categoryColors.General} w-fit`}>
                  {article.category}
                </Badge>

                {/* Title and Edit Button */}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-4xl font-bold leading-tight">{article.title}</h1>
                  {canEdit && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                        <X className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>

                {/* Article Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <User className="h-4 w-4" />
                    {article.author_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(article.event_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {article.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getReadTime(article.content)}
                  </span>
                </div>

                {/* Published Date */}
                <p className="text-xs text-muted-foreground">
                  Published {getTimeAgo(article.publish_date)}
                </p>

                {/* Share Button */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Article
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {article.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-4 text-base leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Back to News Button */}
            <div className="mt-6">
              <Button variant="outline" onClick={() => navigate("/news")}>
                ← Back to News
              </Button>
            </div>
          </div>

          {/* Sidebar - Recent News */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Recent News</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No other articles available
                  </p>
                ) : (
                  recentArticles.map((recentArticle) => (
                    <Link
                      key={recentArticle.news_id}
                      to={`/news/${recentArticle.news_id}`}
                      className="block group"
                    >
                      <div className="border rounded-lg p-3 hover:bg-accent transition-colors">
                        <Badge
                          className={`${categoryColors[recentArticle.category] || categoryColors.General} text-xs mb-2`}
                        >
                          {recentArticle.category}
                        </Badge>
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:underline mb-2">
                          {recentArticle.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{recentArticle.author_name}</span>
                          <span>•</span>
                          <span>{getTimeAgo(recentArticle.publish_date)}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDeleteDialog(false);
                  handleDelete();
                }}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Article"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this article on social media
            </p>
            
            {/* Social Media Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleShare("facebook")}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleShare("twitter")}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X (Twitter)
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleShare("reddit")}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
                Reddit
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleShare("linkedin")}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>

            {/* Copy Link */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Or copy link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                />
                <Button
                  variant={linkCopied ? "default" : "outline"}
                  onClick={handleCopyLink}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    "Copy"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FullArticle;