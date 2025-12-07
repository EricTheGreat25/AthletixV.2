import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2, Mail } from "lucide-react";

interface UserVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  user?: {
    id: string; 
    name: string;
    sport: string;
    role: string;
    registrationDate: string;
    verificationStatus: "verified" | "unverified" | "rejected";
  } | null;
  
  onVerify: (userId: string, status: "verified" | "unverified" | "rejected") => Promise<void> | void;
  onDelete: (userId: string) => Promise<void> | void;
  onReset: (userId: string) => Promise<void> | void;
}

const UserVerificationDialog = ({ 
  open, 
  onClose, 
  user,
  onVerify,
  onDelete,
  onReset
}: UserVerificationDialogProps) => {

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage User Verification</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {user.name}
            </p>
            <p>
              <span className="font-medium">Sport:</span> {user.sport}
            </p>
            <p>
              <span className="font-medium">Role:</span> {user.role}
            </p>
            <p>
              <span className="font-medium">Registration:</span>{" "}
              {user.registrationDate}
            </p>

            <div className="flex items-center gap-2">
              <span className="font-medium">Current Status:</span>
              <Badge
                className="capitalize"
                variant={
                  user.verificationStatus === "verified"
                    ? "default"
                    : user.verificationStatus === "unverified"
                    ? "secondary"
                    : "destructive"
                }
              >
                {user.verificationStatus}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">
              User Actions:
            </p>

            <div className="flex gap-2">
              <Button 
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => onVerify(user.id, "verified")}
              >
                <CheckCircle className="h-4 w-4" />
                Verify
              </Button>

              <Button 
                className="flex-1 gap-2" 
                variant="destructive"
                onClick={() => onDelete(user.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>

              <Button 
                className="flex-1 gap-2" 
                variant="outline"
                onClick={() => onReset(user.id)}
              >
                <Mail className="h-4 w-4" />
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserVerificationDialog;