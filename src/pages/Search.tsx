import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import AthleteCard from "@/components/athletes/AthleteCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Users, BarChart, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<any>({
    sport: "any",
    ageRange: [16, 25],
  });
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch all athletes once
  useEffect(() => {
  const fetchAthletes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/athletes");
      const shuffled = [...res.data];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setAthletes(shuffled);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchAthletes();
  }, []);

  const handleFilterChange = (newFilter: any) => {
    setFilters(prev => ({ ...prev, ...newFilter }));
  };

  const handleApplyFilters = () => setAppliedFilters(filters);

  const handleReset = () => {
    const defaultFilters = { sport: "any", ageRange: [16, 25] };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchQuery("");
  };

  const toggleAthleteSelection = (id: string) => {
  const athleteToToggle = filteredAthletes.find(a => a.id === id);
  if (!athleteToToggle) return;

  if (!selectedAthletes.includes(id)) {
    const selectedSports = filteredAthletes
      .filter(a => selectedAthletes.includes(a.id))
      .map(a => a.sport);

    if (selectedSports.length > 0 && selectedSports[0] !== athleteToToggle.sport) {
      toast({
        title: "Invalid Comparison",
        description: "You can only compare athletes from the same sport.",
        variant: "destructive",
      });
      return;
    }
  }

  setSelectedAthletes(prev =>
    prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
  );
  };


  const filteredAthletes = useMemo(() => {
    let result = [...athletes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.name?.toLowerCase().includes(q) ||
          a.sport?.toLowerCase().includes(q) ||
          a.location?.toLowerCase().includes(q) || 
          a.position?.toLowerCase().includes(q)

      );
    }

    if (appliedFilters.sport && appliedFilters.sport !== "any") {
      result = result.filter(
        a => a.sport?.toLowerCase() === appliedFilters.sport.toLowerCase()
      );
    }

    if (appliedFilters.position && appliedFilters.position !== "any") {
      result = result.filter(
        a => a.position?.toLowerCase() === appliedFilters.position.toLowerCase()
      );
    }

    if (appliedFilters.ageRange && appliedFilters.ageRange.length === 2) {
      const [min, max] = appliedFilters.ageRange;
      result = result.filter(a => a.age >= min && a.age <= max);
    }

    if (appliedFilters.gender && appliedFilters.gender !== "any") {
      result = result.filter(
        a => a.gender?.toLowerCase() === appliedFilters.gender.toLowerCase()
      );
    }

    if (appliedFilters.region && appliedFilters.region !== "any") {
      const region = appliedFilters.region.toLowerCase();
      result = result.filter(a => {
        if (!a.location) return false;
        const loc = a.location.toLowerCase();
        return loc.includes(region) || region.includes(loc);
      });
    }

    return result;
  }, [athletes, searchQuery, appliedFilters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Advanced Search</h1>
          <p className="text-muted-foreground">
            Find and compare athletes using dynamic search and filters
          </p>
        </div>

        <div className="relative mb-8">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or sport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="search">
              <SearchIcon className="mr-2 h-4 w-4" /> Search
            </TabsTrigger>
            <TabsTrigger value="compare">
              <Users className="mr-2 h-4 w-4" /> Compare
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart className="mr-2 h-4 w-4" /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-auto pr-2">
                  <SearchFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApply={handleApplyFilters}
                    onReset={handleReset}
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Found {filteredAthletes.length} athletes
                  </p>
                  {selectedAthletes.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const tab = document.querySelector('[value="compare"]') as HTMLElement;
                        if (tab) tab.click();
                      }}
                    >
                      Compare Selected ({selectedAthletes.length})
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAthletes.map(a => (
                    <div key={a.id} className="relative">
                      <input
                        type="checkbox"
                        className="absolute top-4 right-4 z-10 h-4 w-4 cursor-pointer"
                        checked={selectedAthletes.includes(a.id)}
                        onChange={() => toggleAthleteSelection(a.id)}
                      />
                      <AthleteCard {...a} />
                    </div>
                  ))}
                </div>

                {filteredAthletes.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No athletes found matching your criteria.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Athlete Comparison
                  {selectedAthletes.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setSelectedAthletes([])}>
                      Clear Selection
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAthletes.length < 2 ? (
                  <p className="text-center py-12 text-muted-foreground">
                    Select at least 2 athletes from the Search tab to compare.
                  </p>
                ) : (
                  <div className="space-y-8">
                    {/* Athlete overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredAthletes
                        .filter(a => selectedAthletes.includes(a.id))
                        .map(a => (
                          <Card key={a.id} className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => toggleAthleteSelection(a.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <CardContent className="pt-6">
                              <div className="text-center mb-4">
                                <h3 className="font-bold text-lg">{a.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {a.sport} • {a.position}
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                  <Badge variant="outline">{a.age} years</Badge>
                                  {a.verified && <Badge variant="default">Verified</Badge>}
                                </div>
                              </div>
                              <div className="space-y-2">
                                {a.stats?.map((s, idx) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">{s.label}</span>
                                    <span className="font-semibold">{s.value}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {filteredAthletes
                            .filter(a => selectedAthletes.includes(a.id))
                            .map(a => (
                              <div key={a.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{a.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {a.achievements} achievements
                                  </span>
                                </div>
                                <Progress value={(a.achievements / 20) * 100} className="h-2" />
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Stats Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Attribute</th>
                                {filteredAthletes
                                  .filter(a => selectedAthletes.includes(a.id))
                                  .map(a => (
                                    <th key={a.id} className="text-center py-2 px-4">
                                      {a.name.split(" ")[0]}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="py-2 font-medium">Sport</td>
                                {filteredAthletes
                                  .filter(a => selectedAthletes.includes(a.id))
                                  .map(a => (
                                    <td key={a.id} className="text-center py-2 px-4">{a.sport}</td>
                                  ))}
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 font-medium">Position</td>
                                {filteredAthletes
                                  .filter(a => selectedAthletes.includes(a.id))
                                  .map(a => (
                                    <td key={a.id} className="text-center py-2 px-4">{a.position}</td>
                                  ))}
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 font-medium">Age</td>
                                {filteredAthletes
                                  .filter(a => selectedAthletes.includes(a.id))
                                  .map(a => (
                                    <td key={a.id} className="text-center py-2 px-4">{a.age}</td>
                                  ))}
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 font-medium">Height(cm)</td>
                                {filteredAthletes
                                  .filter(a => selectedAthletes.includes(a.id))
                                  .map(a => (
                                    <td key={a.id} className="text-center py-2 px-4">{a.height}</td>
                                  ))}
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 font-medium">Weight(kg)</td>
                                {filteredAthletes
                                  .filter(a => selectedAthletes.includes(a.id))
                                  .map(a => (
                                    <td key={a.id} className="text-center py-2 px-4">{a.weight}</td>
                                  ))}
                              </tr>
                              <tr>
                                <td className="py-2 font-medium">Location</td>
                                {filteredAthletes
                                  .filter(a => selectedAthletes.includes(a.id))
                                  .map(a => (
                                    <td key={a.id} className="text-center py-2 px-4 text-sm">{a.location}</td>
                                  ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    Analytics visualization will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Search;
