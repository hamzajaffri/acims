import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { SupabaseService } from "@/lib/supabase-service";
import { useToast } from "@/hooks/use-toast";

interface UserDeleteDialogProps {
  user: any;
  onUserDeleted: () => void;
}

export function UserDeleteDialog({ user, onUserDeleted }: UserDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      console.log('Deleting user:', user.user_id);
      
      // Delete user from database
      await SupabaseService.deleteUser(user.user_id);

      // Create audit log
      await SupabaseService.createAuditLog({
        entity: 'user',
        entity_id: user.user_id,
        action: 'delete',
        details: {
          deleted_user: {
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role
          }
        }
      });

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      onUserDeleted();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-orbitron">Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete user <strong>{user.first_name} {user.last_name}</strong> ({user.email})?
            <br /><br />
            This action cannot be undone and will remove all user data from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}