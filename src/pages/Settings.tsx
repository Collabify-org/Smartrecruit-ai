import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, KeyRound, Save } from "lucide-react";
import { lsGet, lsSet } from "@/lib/storage";

interface Profile { name: string; email: string; company: string; }
interface Notifs { product: boolean; weekly: boolean; billing: boolean; }

export default function Settings() {
  const [profile, setProfile] = useState<Profile>(() => lsGet("profile", { name: "Alex Recruiter", email: "alex@acme.com", company: "Acme Inc." }));
  const [notifs, setNotifs] = useState<Notifs>(() => lsGet("notifs", { product: true, weekly: true, billing: true }));
  const [pwOpen, setPwOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  const saveProfile = () => {
    lsSet("profile", profile);
    toast.success("Profile saved");
  };

  const setNotif = (k: keyof Notifs, v: boolean) => {
    const updated = { ...notifs, [k]: v };
    setNotifs(updated);
    lsSet("notifs", updated);
  };

  const changePassword = () => {
    if (!pw.current || !pw.next) return toast.error("Fill all fields");
    if (pw.next.length < 8) return toast.error("Password must be 8+ characters");
    if (pw.next !== pw.confirm) return toast.error("Passwords don't match");
    setPw({ current: "", next: "", confirm: "" });
    setPwOpen(false);
    toast.success("Password changed");
  };

  const deleteAccount = () => {
    localStorage.clear();
    setDelOpen(false);
    toast.success("Account deleted");
    setTimeout(() => (window.location.href = "/"), 800);
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, notifications, and account." />

      <div className="space-y-6">
        <Card className="p-6 shadow-soft-sm">
          <h3 className="font-semibold mb-4">Profile</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="text-xs text-muted-foreground">Full name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1.5" /></div>
            <div><Label className="text-xs text-muted-foreground">Email</Label><Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} type="email" className="mt-1.5" /></div>
            <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Company name</Label><Input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className="mt-1.5" /></div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={saveProfile}><Save className="h-4 w-4 mr-1.5" />Save changes</Button>
          </div>
        </Card>

        <Card className="p-6 shadow-soft-sm">
          <h3 className="font-semibold mb-4">Notifications</h3>
          <div className="space-y-4">
            <NotifRow label="Product updates" desc="New features, improvements, and tips" value={notifs.product} onChange={(v) => setNotif("product", v)} />
            <NotifRow label="Weekly digest" desc="Summary of your hiring activity" value={notifs.weekly} onChange={(v) => setNotif("weekly", v)} />
            <NotifRow label="Billing alerts" desc="Invoices, renewals, and payment issues" value={notifs.billing} onChange={(v) => setNotif("billing", v)} />
          </div>
        </Card>

        <Card className="p-6 shadow-soft-sm">
          <h3 className="font-semibold mb-2">Security</h3>
          <p className="text-sm text-muted-foreground mb-4">Update your password regularly to keep your account secure.</p>
          <Button variant="outline" onClick={() => setPwOpen(true)}><KeyRound className="h-4 w-4 mr-1.5" />Change password</Button>
        </Card>

        <Card className="p-6 border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive">Danger zone</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Once you delete your account, all data will be permanently removed. This cannot be undone.</p>
              <Button variant="destructive" onClick={() => setDelOpen(true)}>Delete account</Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change password</DialogTitle><DialogDescription>Use a strong password with 8+ characters.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Current password</Label><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">New password</Label><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">Confirm new password</Label><Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button onClick={changePassword}>Update password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete account?</DialogTitle>
            <DialogDescription>This will permanently erase all your data, templates, and history. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteAccount}>Yes, delete my account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function NotifRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}