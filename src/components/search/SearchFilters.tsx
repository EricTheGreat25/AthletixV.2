import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import { supabase } from "@/supabaseClient";

interface SearchFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  onApply: () => void;
  onReset: () => void;
}

  const regions = [
  "NCR",
  "Region I",
  "Region II",
  "Region III",
  "Region IV-A",
  "Region IV-B",
  "Region V",
  "Region VI",
  "Region VII",
  "Region VIII",
  "Region IX",
  "Region X",
  "Region XI",
  "Region XII",
  "Region XIII",
  "BARMM",
  "CAR",
  ];

const SearchFilters = ({
  filters,
  onFilterChange,
  onApply,
  onReset,
}: SearchFiltersProps) => {
  const [selectedGender, setSelectedGender] = useState(filters.gender || "any");
  const [selectedSport, setSelectedSport] = useState(filters.sport || "any");
  const [selectedPosition, setSelectedPosition] = useState(filters.position || "any");
  const [selectedRegion, setSelectedRegion] = useState(filters.region || "any");
  const [ageRange, setAgeRange] = useState(filters.ageRange || [16, 25]);
  const [sportsList, setSportsList] = useState<string[]>([]);

  // Fetch sports from Supabase
  useEffect(() => {
    const fetchSports = async () => {
      const { data, error } = await supabase.from("sports").select("sport_name");
      if (error) {
        console.error("Failed to fetch sports:", error);
        return;
      }
      setSportsList(data.map((s: any) => s.sport_name));
    };
    fetchSports();
  }, []);

  // Sync state changes with parent
  useEffect(() => {
  onFilterChange({
    gender: selectedGender,
    sport: selectedSport,
    position: selectedPosition,
    ageRange,
    region: selectedRegion,
  });
  }, [selectedGender, selectedSport, selectedPosition, ageRange, selectedRegion]);

  // Reset filters
  const handleResetClick = () => {
    setSelectedGender("any");
    setSelectedSport("any");
    setSelectedPosition("any");
    setAgeRange([16, 25]);
    setSelectedRegion("any");
    onReset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </span>
          <Button variant="ghost" size="sm" onClick={handleResetClick}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Gender Filter */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sport Filter */}
        <div className="space-y-2">
          <Label>Sport</Label>
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger>
              <SelectValue placeholder="Select a sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Sport</SelectItem>
              {sportsList.map((sport) => (
                <SelectItem key={sport} value={sport.toLowerCase()}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Region</Label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Region</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <Label>
            Age Range: {ageRange[0]} - {ageRange[1]} years
          </Label>
          <div className="px-2 relative">
            <Slider
              value={ageRange}
              onValueChange={setAgeRange}
              max={35}
              min={14}
              step={1}
              className="relative z-20 h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>14</span>
              <span>35</span>
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={onApply}>
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
