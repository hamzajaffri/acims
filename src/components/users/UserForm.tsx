import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SupabaseService } from "@/lib/supabase-service";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function UserForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "viewer" as "admin" | "investigator" | "viewer" | "analyst",
    department: "",
    badgeNumber: "",
    isActive: true,
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();

      // Attempt to create auth user via Edge Function (service role)
      const { data: fnData, error: fnError } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      });

      let targetUserId: string | null = null;
      let wasExisting = false;

      const responseError = (fnError as any)?.message || ((fnData as any)?.error as string | undefined);
      if (responseError) {
        const msg = responseError.toLowerCase();
        if (msg.includes('already been registered') || msg.includes('email_exists')) {
          // Email exists in auth -> update existing user's details & optionally password
          const existing = await SupabaseService.getUserByEmail(email);
          if (!existing) {
            throw new Error('User exists in auth but not found in users table.');
          }
          targetUserId = existing.user_id;
          wasExisting = true;

          // Update password if provided
          if (formData.password) {
            const { error: pwErr, data: pwData } = await supabase.functions.invoke('admin-create-user', {
              body: { action: 'update_password', user_id: targetUserId, password: formData.password },
            });
            if (pwErr || (pwData as any)?.error) {
              throw new Error(pwErr?.message || (pwData as any)?.error || 'Failed to update password');
            }
          }
        } else {
          throw new Error(responseError);
        }
      } else {
        targetUserId = (fnData as { user_id: string }).user_id;
      }

      if (!targetUserId) throw new Error('Missing user id');

      // Create or update users row
      if (wasExisting) {
        await SupabaseService.updateUser(targetUserId, {
          email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          phone: formData.phone,
          department: formData.department,
          badge_number: formData.badgeNumber,
          is_active: formData.isActive,
        });
      } else {
        await SupabaseService.createUser({
          user_id: targetUserId,
          email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          phone: formData.phone,
          department: formData.department,
          badge_number: formData.badgeNumber,
          is_active: formData.isActive,
        });
      }

      // Log audit trail
      await SupabaseService.createAuditLog({
        action: wasExisting ? 'UPDATE' : 'CREATE',
        entity: 'user',
        entity_id: targetUserId,
        details: {
          email,
          role: formData.role,
          created_by_admin: true,
          mode: wasExisting ? 'existing_user_updated' : 'new_user_created',
        },
      });

      toast({
        title: wasExisting ? 'User Updated' : 'User Created',
        description: wasExisting
          ? 'Existing user updated successfully.'
          : `User ${formData.firstName} ${formData.lastName} has been created successfully.`,
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'viewer',
        department: '',
        badgeNumber: '',
        isActive: true,
        password: ''
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with appropriate permissions and role assignments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@department.gov"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Secure password"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: "admin" | "investigator" | "viewer" | "analyst") => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="investigator">Investigator</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Investigations"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badgeNumber">Badge Number</Label>
              <Input
                id="badgeNumber"
                value={formData.badgeNumber}
                onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                placeholder="Badge #"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active User</Label>
                <p className="text-sm text-muted-foreground">User can log in and access the system</p>
              </div>
              <Switch 
                id="isActive" 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}