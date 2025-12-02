import { useEffect, useState } from "react";
import { supabase } from "@/utilities/supabase";
import { set } from "date-fns";

type UserRole = "athlete" | "organizer" | "admin" | "scout" | null;

export const useUserRole = () => {
  
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const storedRoleRaw = localStorage.getItem("userRole");
    const storedRole = storedRoleRaw ? storedRoleRaw.toLowerCase() : null;
    if (storedRole) {
      const validRoles = ["athlete", "organizer", "admin", "scout"];
      if (validRoles.includes(storedRole as UserRole)) {
        setRole(storedRole as UserRole);
      }else{
        setRole(null);
      }
    
      setLoading(false);
    }
  }, []);

  return { role, loading };
}
