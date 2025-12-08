import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import NewsCard from "@/components/news/NewsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const News = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  // Fetch articles function
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/news/");
      const data = await response.json();

      if (data.success && data.articles) {
        // sort by recenty
        const sorted = [...data.articles].sort((a, b) =>
          new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
        );
        
        setArticles(sorted);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({
        title: "Error",
        description: "Failed to load news articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchArticles();
  }, []);

  // Auto-refresh when coming from publish
  useEffect(() => {
    // Check if we were redirected after publishing
    if (location.state?.refreshNews) {
      fetchArticles();
      
      // Show success toast if provided
      if (location.state?.message) {
        toast({
          title: "Success",
          description: location.state.message,
        });
      }
      
      // Clear the state so it doesn't re-fetch on every render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  // Filter articles based on selected category
  const filteredArticles = selectedCategory
    ? articles.filter((article) => article.category === selectedCategory)
    : articles;

  // Get recent articles (top 3 most recent)
  const recentArticles = filteredArticles.slice(0, 3);
  
  // Get remaining articles
  const otherArticles = filteredArticles.slice(3);

  // Handle category click
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  // Clear category filter
  const clearCategoryFilter = () => {
    setSelectedCategory(null);
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">News & Updates</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest in Filipino athletics
            </p>
          </div>
          {userRole === "organizer" && (
            <Button onClick={() => navigate("/create-news")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Article
            </Button>
          )}
        </div>

        {/* Category Filter Indicator */}
        {selectedCategory && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-white">
                Filtering by:
              </span>
              <Badge className={categoryColors[selectedCategory]}>
                {selectedCategory}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 text-white hover:text-white"
                onClick={clearCategoryFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {selectedCategory 
                  ? `No articles found in ${selectedCategory} category`
                  : "No articles published yet"}
              </p>
              {selectedCategory ? (
                <Button onClick={clearCategoryFilter}>
                  View All Articles
                </Button>
              ) : (
                userRole === "organizer" && (
                  <Button onClick={() => navigate("/create-news")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Article
                  </Button>
                )
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent News Section */}
              {recentArticles.length > 0 && (
                <>
                  <div className="border-l-4 border-primary pl-3">
                    <h2 className="text-2xl font-bold">Recent News</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentArticles.map((article) => (
                      <NewsCard
                        key={article.news_id}
                        news_id={article.news_id}
                        title={article.title}
                        category={article.category}
                        author_name={article.author_name}
                        event_date={article.event_date}
                        location={article.location}
                        content={article.content}
                        publish_date={article.publish_date}
                        featured={false}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Other Stories Header */}
              {otherArticles.length > 0 && (
                <div className="border-l-4 border-primary pl-3 mt-8">
                  <h2 className="text-2xl font-bold">More Stories</h2>
                </div>
              )}

              {/* Other Articles Grid */}
              {otherArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherArticles.map((article) => (
                    <NewsCard
                      key={article.news_id}
                      news_id={article.news_id}
                      title={article.title}
                      category={article.category}
                      author_name={article.author_name}
                      event_date={article.event_date}
                      location={article.location}
                      content={article.content}
                      publish_date={article.publish_date}
                      featured={false}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Categories Filter */}
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(categoryColors).map((category) => (
                      <Badge
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className={`cursor-pointer ${
                          selectedCategory === category 
                            ? categoryColors[category]
                            : "hover:bg-accent"
                        }`}
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                  {selectedCategory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3"
                      onClick={clearCategoryFilter}
                    >
                      <X className="mr-2 h-3 w-3" />
                      Clear Filter
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">
                      {selectedCategory 
                        ? filteredArticles.length 
                        : articles.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCategory 
                        ? `${selectedCategory} Articles`
                        : "Total Articles Published"}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {new Set(
                        (selectedCategory ? filteredArticles : articles)
                          .map((a) => a.author_name)
                      ).size}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Contributing Authors
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link
                      to="/events"
                      className="block text-sm hover:underline hover:text-primary"
                    >
                      → Upcoming Events
                    </Link>
                    <Link
                      to="/search-athletes"
                      className="block text-sm hover:underline hover:text-primary"
                    >
                      → Featured Athletes
                    </Link>
                    <Link
                      to="/"
                      className="block text-sm hover:underline hover:text-primary"
                    >
                      → Home
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;