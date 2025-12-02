import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/utilities/supabase";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        toast.error(result.message || "Login failed");
        return;
      }

      //session storing
      await supabase.auth.setSession({
        access_token: result.session?.access_token,
        refresh_token: result.session?.refresh_token,
      });

      // Ensure we always use the latest role from Supabase "users" table
      let roleFromBackend = result.user?.role || null;

      try {
        if (!roleFromBackend && result.user?.id) {
          const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("user_id", result.user.id)
            .single();

          if (!error && data?.role) {
            roleFromBackend = data.role;
          }
        }
      } catch (err) {
        console.error("Error fetching role from Supabase:", err);
      }

      const normalizedRole = (roleFromBackend || "").toLowerCase();

      localStorage.setItem("userRole", normalizedRole);
      localStorage.setItem("userId", result.user?.id);
      localStorage.setItem("userEmail", result.user?.email);

      toast.success(result.message || "Login successful!");

      if (normalizedRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      } catch (error: any) {
      console.error(error);
      setLoading(false);
      toast.error(error.message || "An unexpected error occurred during login.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, rememberMe: !!checked })
                }
                disabled={loading}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
