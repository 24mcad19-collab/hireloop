import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSeekerProfile,
  useGetEmployerProfile,
  useUpdateSeekerProfile,
  useUpdateEmployerProfile,
  getGetSeekerProfileQueryKey,
  getGetEmployerProfileQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Save, User, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "seeker") return <SeekerProfileForm />;
  return <EmployerProfileForm />;
}

function SeekerProfileForm() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useGetSeekerProfile();
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setHeadline(profile.headline);
      setLocation(profile.location);
      setPhone(profile.phone);
      setBio(profile.bio);
      setResumeUrl(profile.resumeUrl);
      setSkillsInput(profile.skills.join(", "));
    }
  }, [profile]);

  const update = useUpdateSeekerProfile({
    mutation: {
      onSuccess: () => {
        toast.success("Profile saved");
        qc.invalidateQueries({ queryKey: getGetSeekerProfileQueryKey() });
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    update.mutate({
      data: {
        fullName,
        headline,
        location,
        phone,
        bio,
        resumeUrl,
        skills: skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <ProfileHeader
        title="Your profile"
        sub="Employers see this when you apply — make it shine."
        icon={User}
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/60">
            <Avatar className="size-16">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white text-xl font-semibold">
                {(fullName || user?.email || "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-display font-semibold text-lg">
                {fullName || user?.email}
              </div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                />
              </div>
              <div>
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Senior Product Designer · ex-Stripe"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">About you</Label>
              <Textarea
                id="bio"
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A few sentences about your experience, what you're great at, and what you're looking for next."
              />
            </div>
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Figma, React, User Research"
              />
            </div>
            <div>
              <Label htmlFor="resume">Resume URL</Label>
              <Input
                id="resume"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://… (Google Drive, Dropbox, personal site)"
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={update.isPending}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
              >
                {update.isPending ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Save className="size-4 mr-2" />
                )}
                Save profile
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

function EmployerProfileForm() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useGetEmployerProfile();
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName);
      setWebsite(profile.website);
      setIndustry(profile.industry);
      setLocation(profile.location);
      setDescription(profile.description);
      setLogoUrl(profile.logoUrl);
    }
  }, [profile]);

  const update = useUpdateEmployerProfile({
    mutation: {
      onSuccess: () => {
        toast.success("Company profile saved");
        qc.invalidateQueries({ queryKey: getGetEmployerProfileQueryKey() });
      },
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    update.mutate({
      data: { companyName, website, industry, location, description, logoUrl },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <ProfileHeader
        title="Company profile"
        sub="Candidates see this on every job listing — make a strong first impression."
        icon={Building2}
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/60">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-border/50 flex items-center justify-center font-display font-bold text-foreground/80 text-xl">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="size-full rounded-2xl object-cover"
                />
              ) : (
                (companyName || user?.email || "?")[0].toUpperCase()
              )}
            </div>
            <div>
              <div className="font-display font-semibold text-lg">
                {companyName || "Your company"}
              </div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <Label htmlFor="companyName">Company name *</Label>
              <Input
                id="companyName"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="SaaS · Fintech · Healthcare"
                />
              </div>
              <div>
                <Label htmlFor="location">Headquarters</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="New York, NY"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="acme.com"
              />
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://… square logo works best"
              />
            </div>
            <div>
              <Label htmlFor="description">About the company</Label>
              <Textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What you do, who you serve, and why a great candidate should care."
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={update.isPending}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
              >
                {update.isPending ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Save className="size-4 mr-2" />
                )}
                Save company profile
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

function ProfileHeader({
  title,
  sub,
  icon: Icon,
}: {
  title: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-border/50 flex items-center justify-center">
        <Icon className="size-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
