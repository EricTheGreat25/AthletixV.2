import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

const News = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const newsArticles = [
    {
      id: "1",
      title: "Rising Star: Local Basketball Player Signs with Division I School",
      category: "Basketball",
      author: "Sports Editor",
      date: "2024-03-20",
      readTime: "3 min",
      featured: true,
      excerpt: "After an impressive showcase performance, 18-year-old Sarah Johnson has committed to play basketball at Duke University, marking a historic moment for our local athletic community.",
      image: "/api/placeholder/800/400",
    },
    {
      id: "2",
      title: "New Training Facility Opens for Youth Athletes",
      category: "Facilities",
      author: "Community Reporter",
      date: "2024-03-19",
      readTime: "2 min",
      featured: false,
      excerpt: "A state-of-the-art training facility dedicated to developing young athletic talent has opened its doors in downtown, offering professional-grade equipment and coaching.",
    },
    {
      id: "3",
      title: "Track & Field Championships: Records Broken",
      category: "Track & Field",
      author: "Athletics Correspondent",
      date: "2024-03-18",
      readTime: "4 min",
      featured: false,
      excerpt: "Three national records were shattered at this weekend's youth championships, showcasing the incredible talent emerging from our regional programs.",
    },
    {
      id: "4",
      title: "Soccer Tryouts Attract Record Number of Participants",
      category: "Soccer",
      author: "Soccer Analyst",
      date: "2024-03-17",
      readTime: "3 min",
      featured: false,
      excerpt: "Over 300 young athletes attended the regional soccer tryouts, demonstrating the growing popularity and competitive nature of youth soccer development.",
    },
    {
      id: "5",
      title: "Swimming Prodigy Qualifies for National Team",
      category: "Swimming",
      author: "Aquatics Editor",
      date: "2024-03-16",
      readTime: "3 min",
      featured: false,
      excerpt: "At just 16 years old, Michael Chen has qualified for the national swimming team after breaking multiple junior records at the regional qualifiers.",
    },
    {
      id: "6",
      title: "Football Camp Announces NFL Guest Coaches",
      category: "Football",
      author: "Football Reporter",
      date: "2024-03-15",
      readTime: "2 min",
      featured: false,
      excerpt: "The upcoming Elite Football Camp has announced that three current NFL players will serve as guest coaches, providing invaluable insights to young athletes.",
    },
  ];

  const announcements = [
    {
      id: "1",
      title: "Registration Open for Spring Showcases",
      date: "2024-03-20",
      type: "registration",
    },
    {
      id: "2",
      title: "New Partnership with College Scout Network",
      date: "2024-03-19",
      type: "partnership",
    },
    {
      id: "3",
      title: "Platform Update: Enhanced Profile Features",
      date: "2024-03-18",
      type: "update",
    },
  ];

  const categoryColors: Record<string, string> = {
    Basketball: "bg-orange-500 text-white",
    Soccer: "bg-green-500 text-white",
    Football: "bg-blue-500 text-white",
    Swimming: "bg-cyan-500 text-white",
    "Track & Field": "bg-purple-500 text-white",
    Facilities: "bg-gray-500 text-white",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">News & Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest in local athletics
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Article */}
            {newsArticles
              .filter(article => article.featured)
              .map(article => (
                <Card key={article.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted"></div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={categoryColors[article.category]}>
                        {article.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Featured</span>
                    </div>
                    <CardTitle className="text-2xl">{article.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{article.excerpt}</p>
                    <Button>
                      Read Full Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            
            {/* Other Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsArticles
                .filter(article => !article.featured)
                .map(article => (
                  <Card key={article.id} className="card-hover">
                    <CardHeader>
                      <Badge className={`${categoryColors[article.category]} w-fit mb-2`}>
                        {article.category}
                      </Badge>
                      <CardTitle className="text-lg line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                        <span>{article.readTime}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {article.excerpt}
                      </p>
                      <Link to={`/news/${article.id}`}>
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                          Read more
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="pb-4 last:pb-0 border-b last:border-0">
                      <Badge variant="outline" className="mb-2">
                        {announcement.type}
                      </Badge>
                      <h4 className="font-medium text-sm mb-1">
                        {announcement.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(announcement.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Newsletter Signup */}
            <Card>
              <CardHeader>
                <CardTitle>Stay Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest news and opportunities delivered to your inbox
                </p>
                <Button className="w-full">
                  Subscribe to Newsletter
                </Button>
              </CardContent>
            </Card>
            
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to="/events" className="block text-sm hover:underline">
                    → Upcoming Events
                  </Link>
                  <Link to="/athletes" className="block text-sm hover:underline">
                    → Featured Athletes
                  </Link>
                  <Link to="/search" className="block text-sm hover:underline">
                    → Advanced Search
                  </Link>
                  <Link to="/register" className="block text-sm hover:underline">
                    → Join Athletix
                  </Link>
                </div>
              </CardContent>
            </Card>

            {userRole == "organizer" && (
              <Card>
                <CardContent className="p-4">
                  <Button 
                  onClick={() => navigate('/create-news')}
                  className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Article
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
