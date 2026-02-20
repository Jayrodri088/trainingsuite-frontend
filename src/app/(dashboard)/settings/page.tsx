"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Lock,
  Bell,
  Globe,
  Camera,
  Save,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { getInitials, getErrorMessage } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores";
import { T, useT } from "@/components/t";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useT();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(" ") || [];
      setProfileForm({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        bio: user.bio || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const uploadResponse = await apiClient.post<{
        success: boolean;
        data: { fileUrl: string };
      }>("/upload", formData);

      if (!uploadResponse.data.success) {
        throw new Error("Upload failed");
      }

      await authApi.updateProfile({ avatar: uploadResponse.data.data.fileUrl });
      return uploadResponse.data.data.fileUrl;
    },
    onSuccess: (fileUrl) => {
      const updateState = () => {
        if (user) {
          setUser({ ...user, avatar: fileUrl });
        }
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        setAvatarPreview(null);
      };

      const preloadImage = (retriesLeft: number) => {
        const img = new Image();
        img.onload = () => {
          updateState();
          toast({ title: t("Avatar updated successfully!") });
        };
        img.onerror = () => {
          if (retriesLeft > 0) {
            setTimeout(() => preloadImage(retriesLeft - 1), 500);
          } else {
            updateState();
            toast({ title: t("Avatar updated successfully!") });
          }
        };
        img.src = fileUrl;
      };

      preloadImage(2);
    },
    onError: (error) => {
      toast({ title: getErrorMessage(error), variant: "destructive" });
      setAvatarPreview(null);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: t("Please select an image file"), variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t("File size must be less than 2MB"), variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    uploadAvatarMutation.mutate(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim();
      const response = await authApi.updateProfile({
        name: fullName,
        bio: profileForm.bio,
        phone: profileForm.phone,
      });

      if (response.success && response.data) {
        setUser(response.data);
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        toast({ title: t("Profile updated successfully!") });
      }
    } catch (error) {
      toast({ title: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-black tracking-tight"><T>Settings</T></h1>
        <p className="font-sans text-gray-600 mt-1">
          <T>Manage your account settings and preferences</T>
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-gray-100 border border-gray-200 w-full justify-start rounded-[10px] h-auto p-1 gap-1 overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="profile"
            className="rounded-[8px] border-0 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-4 py-2.5 font-sans font-semibold text-sm text-gray-600 transition-none shrink-0"
          >
            <User className="h-4 w-4 mr-2" />
            <T>Profile</T>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-[8px] border-0 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-4 py-2.5 font-sans font-semibold text-sm text-gray-600 transition-none shrink-0"
          >
            <Lock className="h-4 w-4 mr-2" />
            <T>Security</T>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-[8px] border-0 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-4 py-2.5 font-sans font-semibold text-sm text-gray-600 transition-none shrink-0"
          >
            <Bell className="h-4 w-4 mr-2" />
            <T>Alerts</T>
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="rounded-[8px] border-0 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-4 py-2.5 font-sans font-semibold text-sm text-gray-600 transition-none shrink-0"
          >
            <Globe className="h-4 w-4 mr-2" />
            <T>Preferences</T>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-8 space-y-8">
          <div className="grid gap-8">
            <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-sans font-bold text-black"><T>Profile Picture</T></CardTitle>
                <CardDescription>
                  <T>Upload a profile picture to personalize your account</T>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 rounded-[12px] border border-gray-200">
                      <AvatarImage src={avatarPreview || user?.avatar} />
                      <AvatarFallback className="text-2xl bg-[#0052CC]/10 text-[#0052CC] font-bold rounded-[12px] font-sans">
                        {getInitials(user?.name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    {uploadAvatarMutation.isPending && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadAvatarMutation.isPending}
                      className="rounded-[12px] border-gray-200 bg-white shadow-sm uppercase text-xs font-bold tracking-wider"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {uploadAvatarMutation.isPending ? t("Uploading...") : t("Change Photo")}
                    </Button>
                    <p className="text-xs font-sans text-gray-600">
                      <T>JPG, PNG or GIF. Max size 2MB.</T>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-sans font-bold text-black"><T>Personal Information</T></CardTitle>
                <CardDescription>
                  <T>Update your personal details</T>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-sans font-medium text-gray-600"><T>First Name</T></Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      placeholder={t("Enter your first name")}
                      className="rounded-[12px] border-gray-200 bg-white shadow-sm bg-muted/20 focus:bg-background transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-sans font-medium text-gray-600"><T>Last Name</T></Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      placeholder={t("Enter your last name")}
                      className="rounded-[12px] border-gray-200 bg-white shadow-sm bg-muted/20 focus:bg-background transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-sans font-medium text-gray-600"><T>Email</T></Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    placeholder={t("Enter your email")}
                    className="rounded-[12px] border-gray-200 bg-white shadow-sm bg-muted opacity-100 font-mono"
                  />
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide pt-1"><T>Email cannot be changed</T></p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-sans font-medium text-gray-600"><T>Bio</T></Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder={t("Tell us about yourself...")}
                    rows={4}
                    className="rounded-[12px] border-gray-200 bg-white shadow-sm bg-muted/20 focus:bg-background transition-colors resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-sans font-medium text-gray-600"><T>Phone Number</T></Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder={t("Enter your phone number")}
                    className="rounded-[12px] border-gray-200 bg-white shadow-sm bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-[10px] font-bold bg-[#0052CC] hover:bg-[#003d99] text-white">
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <T>Save Changes</T>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-8 space-y-8">
          <div className="grid gap-8">
            <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-sans font-bold text-black"><T>Change Password</T></CardTitle>
                <CardDescription>
                  <T>Update your password to keep your account secure</T>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-sans font-medium text-gray-600"><T>Current Password</T></Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder={t("Enter current password")}
                    className="rounded-[12px] border-gray-200 bg-white shadow-sm bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-sans font-medium text-gray-600"><T>New Password</T></Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder={t("Enter new password")}
                    className="rounded-[12px] border-gray-200 bg-white shadow-sm bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-sans font-medium text-gray-600"><T>Confirm New Password</T></Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t("Confirm new password")}
                    className="rounded-[12px] border-gray-200 bg-white shadow-sm bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>
                <Button className="rounded-[10px] font-bold bg-[#0052CC] hover:bg-[#003d99] text-white"><T>Update Password</T></Button>
              </CardContent>
            </Card>

            <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-sans font-bold text-black"><T>Two-Factor Authentication</T></CardTitle>
                <CardDescription>
                  <T>Add an extra layer of security to your account</T>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-sm"><T>Enable 2FA</T></p>
                    <p className="text-sm text-gray-600">
                      <T>Secure your account with two-factor authentication</T>
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-sans font-bold text-black"><T>Active Sessions</T></CardTitle>
                <CardDescription>
                  <T>Manage devices where you're currently logged in</T>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 bg-gray-50">
                    <div>
                      <p className="font-bold text-sm"><T>Current Device</T></p>
                      <p className="text-xs text-gray-600 mt-1">
                        Chrome on macOS • <T>Last active now</T>
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-[8px] bg-[#0052CC]/10 text-[#0052CC] border-0 font-semibold text-[10px]"><T>Current</T></Badge>
                  </div>
                </div>
                <Button variant="outline" className="mt-6 rounded-[12px] border-gray-200 bg-white shadow-sm uppercase text-xs font-bold tracking-wider">
                  <T>Sign out of all other devices</T>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-8">
          <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="font-sans font-bold text-black"><T>Notification Preferences</T></CardTitle>
              <CardDescription>
                <T>Choose what notifications you want to receive</T>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-6">
                <h4 className="font-sans font-bold text-black text-sm text-gray-600 border-b border-gray-200 pb-2"><T>Email Notifications</T></h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm"><T>Course Updates</T></p>
                      <p className="text-sm text-gray-600">
                        <T>Receive updates about your enrolled courses</T>
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm"><T>New Courses</T></p>
                      <p className="text-sm text-gray-600">
                        <T>Get notified when new courses are available</T>
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm"><T>Promotions</T></p>
                      <p className="text-sm text-gray-600">
                        <T>Receive promotional offers and discounts</T>
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm"><T>Weekly Progress</T></p>
                      <p className="text-sm text-gray-600">
                        <T>Get a weekly summary of your learning progress</T>
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-sans font-bold text-black text-sm text-gray-600 border-b border-gray-200 pb-2"><T>Push Notifications</T></h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm"><T>Live Session Reminders</T></p>
                      <p className="text-sm text-gray-600">
                        <T>Get reminded before live sessions start</T>
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm"><T>Certificate Earned</T></p>
                      <p className="text-sm text-gray-600">
                        <T>Get notified when you earn a certificate</T>
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="rounded-[10px] font-bold bg-[#0052CC] hover:bg-[#003d99] text-white">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <T>Save Preferences</T>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-8 space-y-8">
          <div className="grid gap-8">
            <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-sans font-bold text-black"><T>Language & Region</T></CardTitle>
                <CardDescription>
                  <T>Set your preferred language and regional settings</T>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-sans font-medium text-gray-600"><T>Language</T></Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="rounded-[12px] border-gray-200 bg-white shadow-sm">
                        <SelectValue placeholder={t("Select language")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-[12px] border-gray-200 bg-white shadow-sm">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-sans font-medium text-gray-600"><T>Timezone</T></Label>
                    <Select defaultValue="utc">
                      <SelectTrigger className="rounded-[12px] border-gray-200 bg-white shadow-sm">
                        <SelectValue placeholder={t("Select timezone")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-[12px] border-gray-200 bg-white shadow-sm">
                        <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                        <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                        <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                        <SelectItem value="ist">India Standard Time (GMT+5:30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-sans font-bold text-black"><T>Appearance</T></CardTitle>
                <CardDescription>
                  <T>Customize how the application looks</T>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-sans font-medium text-gray-600"><T>Theme</T></Label>
                  <Select defaultValue="system">
                    <SelectTrigger className="w-[200px] rounded-[12px] border-gray-200 bg-white shadow-sm">
                      <SelectValue placeholder={t("Select theme")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-[12px] border-gray-200 bg-white shadow-sm">
                      <SelectItem value="light"><T>Light</T></SelectItem>
                      <SelectItem value="dark"><T>Dark</T></SelectItem>
                      <SelectItem value="system"><T>System</T></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="font-sans font-bold text-black"><T>Learning Preferences</T></CardTitle>
                <CardDescription>
                  <T>Customize your learning experience</T>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-sm"><T>Autoplay Videos</T></p>
                    <p className="text-sm text-gray-600">
                      <T>Automatically play the next video in a lesson</T>
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-sm"><T>Show Subtitles</T></p>
                    <p className="text-sm text-gray-600">
                      <T>Display subtitles when available</T>
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-border" />
                <div className="space-y-2">
                  <Label className="text-sm font-sans font-medium text-gray-600"><T>Default Video Quality</T></Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="w-[200px] rounded-[12px] border-gray-200 bg-white shadow-sm">
                      <SelectValue placeholder={t("Select quality")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-[12px] border-gray-200 bg-white shadow-sm">
                      <SelectItem value="auto"><T>Auto</T></SelectItem>
                      <SelectItem value="1080p">1080p (HD)</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="mt-4 rounded-[10px] font-bold bg-[#0052CC] hover:bg-[#003d99] text-white">
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <T>Save Preferences</T>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
