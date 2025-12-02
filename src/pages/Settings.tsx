import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/utilities/utils";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { validatePassword } from "@/utilities/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { convertToEmbed } from "@/utilities/utils";
import AvatarUpload from "@/components/account/AvatarUpload";
import { supabase } from "@/supabaseClient";


import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Trash2,
  Trophy,
  GraduationCap,
  Plus,
  X,
  Instagram,
  Twitter,
  Facebook,
  CalendarIcon,
  Ruler,
  Weight,
  Hash,
} from "lucide-react";

interface FormData {
  fullname: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  height: string;
  weight: string;
  jerseyNumber: string;
  birthdate: string | null;
  bio: string;
  videoUrl?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  avatarUrl?: string;
}

interface Achievement {
  achievement_id?: string;
  title: string;
  year: string;
  description: string;
}

interface Education {
  education_id?: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
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

const Settings = () => {
  const navigate = useNavigate();
  const { session, user, loading: authLoading, signOut } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    email: "",
    phone: "",
    location: "NCR",
    position: "",
    height: "",
    weight: "",
    jerseyNumber: "",
    birthdate: null,
    bio: "",
    videoUrl: "",
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Fetch data when user is available
  useEffect(() => {
  const fetchSettings = async () => {
    if (!session || !user) return;
    setLoading(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/settings/${user.id}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      const { user: userData, achievements, education } = response.data;

      setFormData({
        fullname: userData.fullname || "",
        email: userData.email || "",
        phone: userData.contact_num || "",
        location: userData.location || "",
        position: userData.position || "",
        height: userData.height_cm?.toString() || "",
        weight: userData.weight_kg?.toString() || "",
        jerseyNumber: userData.jersey_number?.toString() || "",
        birthdate: userData.birthdate || null, 
        bio: userData.bio || "",
        videoUrl: userData.video_url || "",
        avatarUrl: userData.avatar_url || "",
      });

      setAchievements(achievements || []);
      setEducation(
  (education || []).map((edu: any) => ({
    education_id: edu.education_id,
    school: edu.school || "",
    degree: edu.degree || "",
    field: edu.field || "",
    startYear: edu.start_year?.toString() || "",
    endYear: edu.end_year?.toString() || "",
  }))
);

    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  fetchSettings();
}, [session, user]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
  setFormData((prev) => ({
    ...prev,
    birthdate: date ? date.toISOString().split("T")[0] : null,
  }));
};

  // Handle save changes 
const handleSave = async () => {
  if (!session || !user) {
    toast.error("User not authenticated");
    return;
  }

  const embedUrl = convertToEmbed(formData.videoUrl);

  try {
    await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/settings/${user.id}`,
      {
        user: {
          fullname: formData.fullname,
          email: formData.email,
          contact_num: formData.phone,
          location: formData.location,
          position: formData.position,
          height: parseFloat(formData.height) || null,
          weight: parseFloat(formData.weight) || null,
          jersey_number: parseInt(formData.jerseyNumber) || null,
          birthdate: formData.birthdate,
          bio: formData.bio,
          video_url: convertToEmbed(formData.videoUrl ?? null),
          avatar_url: formData.avatarUrl || null, 
        },
        achievements,
        education,
      },
      {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }
    );

    toast.success("Profile updated successfully!");
  } catch (error: any) {
    console.error("Error saving account settings:", error);
    toast.error(error.response?.data?.message || "Failed to save changes");
  }
};

  // Handle password update
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!session || !user) {
    toast.error("User not authenticated");
    return;
  }

  const { currentPassword, newPassword, confirmPassword } = formData;

  if (!currentPassword || !newPassword || !confirmPassword) {
    toast.error("All password fields are required");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("New passwords do not match");
    return;
  }

  const { isValid, criteria } = validatePassword(newPassword);
  if (!isValid) {
    const unmet = Object.entries(criteria)
      .filter(([_, met]) => !met)
      .map(([key]) => key.replace(/([A-Z])/g, " $1").toLowerCase());
    toast.error(`Password must include: ${unmet.join(", ")}`);
    return;
  }

  setLoading(true);

  try {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/update-password`, {
      email: user.email,
      currentPassword,
      newPassword,
      confirmPassword,
    });

    toast.success("Password updated successfully!");

    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));

    localStorage.removeItem("supabase.auth.token"); 
    navigate("/login"); 

  } catch (err: any) {
    console.error("Backend password update error:", err);
    toast.error(err.response?.data?.message || "Failed to update password");
  } finally {
    setLoading(false);
  }
};

  // Achievements management
  const addAchievement = () =>
    setAchievements([...achievements, { title: "", year: "", description: "" }]);

  const updateAchievement = (index: number, field: string, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const removeAchievement = (index: number) =>
    setAchievements(achievements.filter((_, i) => i !== index));

  // Education management
  const addEducation = () =>
    setEducation([...education, { school: "", degree: "", field: "", startYear: "", endYear: "" }]);

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) =>
    setEducation(education.filter((_, i) => i !== index));

  // Handle region selection
  const handleSelectChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
``
  // If still loading auth
  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading settings...
      </div>
    );
  }

const handleAvatarUpload = async (file: File) => {
  if (!session || !user) {
    toast.error("User not authenticated");
    return;
  }

 setAvatarUploading(true);
  try {
    // Delete old avatar if exists
    if (formData.avatarUrl) {
      const oldPath = formData.avatarUrl.split('/').slice(-2).join('/'); // Get "userId/filename"
      if (oldPath && !oldPath.includes('default')) {
        const { error: deleteError } = await supabase.storage
          .from('user-avatars')
          .remove([oldPath]);
        
        if (deleteError) console.error("Error deleting old avatar:", deleteError);
      }
    }

   // Upload new avatar
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    // Update backend via your existing API
    await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/settings/${user.id}`,
      {
        user: {
          ...formData,
          avatar_url: publicUrl,
        },
        achievements,
        education,
      },
      {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }
    );

    setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
    toast.success("Profile picture updated successfully!");
  } catch (error: any) {
    console.error("Error uploading avatar:", error);
    toast.error(error.message || "Failed to upload profile picture");
  } finally {
    setAvatarUploading(false);
  }
};
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* ACCOUNT TAB */}
          <TabsContent value="account">
            <Card className="mb-2">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </CardHeader>
           <CardContent>
                <div className="flex justify-end mb-6">
                  <AvatarUpload
                    currentAvatarUrl={formData.avatarUrl}
                    initials={
                      formData.fullname
                        ? formData.fullname.split(" ").map((n) => n[0]).join("").toUpperCase()
                        : ""
                    }
                    onAvatarChange={handleAvatarUpload}
                    uploading={avatarUploading}
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="fullname">
                    <User className="inline-block mr-2 h-4 w-4" /> Full Name
                  </Label>
                  <Input id="fullname" name="fullname" value={formData.fullname} onChange={handleInputChange} />
                  <Separator />
                  <Label htmlFor="email">
                    <Mail className="inline-block mr-2 h-4 w-4" /> Email
                  </Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                  <Separator />
                  <Label htmlFor="phone">
                    <Phone className="inline-block mr-2 h-4 w-4" /> Phone
                  </Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                  <Separator />
                  <Label htmlFor="region">
                    <MapPin className="inline-block mr-2 h-4 w-4" /> Region
                  </Label>
                  <Select value={formData.location} onValueChange={(value) => handleSelectChange("location", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Separator />
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" name="position" value={formData.position} onChange={handleInputChange} />
                  <Separator />
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="height">
                        <Ruler className="inline-block mr-2 h-4 w-4" /> Height (cm)
                      </Label>
                      <Input id="height" name="height" value={formData.height} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="weight">
                        <Weight className="inline-block mr-2 h-4 w-4" /> Weight (kg)
                      </Label>
                      <Input id="weight" name="weight" value={formData.weight} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="jerseyNumber">
                        <Hash className="inline-block mr-2 h-4 w-4" /> Jersey Number
                      </Label>
                      <Input
                        id="jerseyNumber"
                        name="jerseyNumber"
                        value={formData.jerseyNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <Separator />
                  <Label>
                    <CalendarIcon className="inline-block mr-2 h-4 w-4" /> Birthday
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !formData.birthdate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.birthdate ? format(new Date(formData.birthdate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.birthdate ? new Date(formData.birthdate) : undefined}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div> 
                      <Label htmlFor="bio">Bio</Label>
                      <div>
                        <textarea
                          id="bio"
                          name="bio"
                          className="w-full h-40 border rounded-md p-2 text-sm"
                          rows={4}
                          value={formData.bio}
                          onChange={handleInputChange}
                        />
                    </div>
                </div>
                </div>
                {/* Video Highlight Section */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Video Highlight</CardTitle>
                    <CardDescription>Paste a link to your video highlight</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <textarea
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                      placeholder="Paste your video highlight link here"
                      className="w-full h-24 border rounded-md p-2 text-sm resize-none"

                    />

                    {/* Clickable label below the textarea */}
                    <div className="text-left">
                      <Dialog>
                        <DialogTrigger asChild>
                          <span className="text-blue-500 text-sm underline cursor-pointer">
                            How?
                          </span>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>How to Get Your YouTube Video Link</DialogTitle>
                            <DialogDescription>
                              Follow these steps to get the proper YouTube link to embed:
                              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-gray-700">
                                <li>
                                  Go to <a href="https://www.youtube.com" target="_blank" className="text-blue-500 underline">YouTube</a> and open your video.
                                </li>
                                <li>Copy the URL provided (e.g., <code>https://www.youtube.com/watch?v=XXXXXX</code>) in your browser's search bar.</li>
                                <li>Paste this link into the Video Highlight textarea above.</li>
                                <li>Do not use shortened URLs or embedded code; only full YouTube URLs are accepted.</li>
                              </ol>
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Achievements Section */}
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" /> Achievements
                    </CardTitle>
                    <CardDescription>Showcase your accomplishments</CardDescription>
                  </div>
                  <Button onClick={addAchievement} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Achievement
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Title"
                        value={achievement.title}
                        onChange={(e) => updateAchievement(index, "title", e.target.value)}
                      />
                      <Input
                        placeholder="Year"
                        value={achievement.year}
                        onChange={(e) => updateAchievement(index, "year", e.target.value)}
                      />
                    </div>
                    <textarea
                      className="w-full border rounded-md mt-2 p-2 text-sm"
                      placeholder="Description"
                      value={achievement.description}
                      onChange={(e) => updateAchievement(index, "description", e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-500"
                      onClick={() => removeAchievement(index)}
                    >
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" /> Education
                    </CardTitle>
                    <CardDescription>Your academic background</CardDescription>
                  </div>
                  <Button onClick={addEducation} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Education
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {education.map((edu, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                    <Input
                      placeholder="School"
                      value={edu.school}
                      onChange={(e) => updateEducation(index, "school", e.target.value)}
                    />
                    <Input
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, "degree", e.target.value)}
                    />
                    <Input
                      placeholder="Field"
                      value={edu.field}
                      onChange={(e) => updateEducation(index, "field", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Input
                        placeholder="Start Year"
                        value={edu.startYear}
                        onChange={(e) => updateEducation(index, "startYear", e.target.value)}
                      />
                      <Input
                        placeholder="End Year"
                        value={edu.endYear}
                        onChange={(e) => updateEducation(index, "endYear", e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-500"
                      onClick={() => removeEducation(index)}
                    >
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                    {formData.newPassword && (
                      <ul className="text-sm text-muted-foreground mt-1">
                        {Object.entries(validatePassword(formData.newPassword).criteria).map(([rule, met]) => (
                          <li key={rule} className={cn("flex items-center gap-2", met ? "text-green-600" : "text-red-600")}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: met ? "green" : "red" }}></span>
                            {rule === "minLength" && "At least 8 characters"}
                            {rule === "hasUppercase" && "Contains uppercase letter"}
                            {rule === "hasLowercase" && "Contains lowercase letter"}
                            {rule === "hasNumber" && "Contains a number"}
                            {rule === "hasSpecialChar" && "Contains a special character"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
