"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api, getErrorMessage } from "@/lib/api";
import { Homepage } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";

export default function AdminHomepagePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["homepage"],
    queryFn: async () => (await api.get<{ data: Homepage }>("/homepage")).data.data,
  });

  const { register, handleSubmit, reset } = useForm<any>({ defaultValues: {} });

  useEffect(() => {
    if (data) {
      reset({
        heroTitle: data.heroTitle, heroSubtitle: data.heroSubtitle, heroImage: data.heroImage,
        heroCtaText: data.heroCtaText, heroCtaLink: data.heroCtaLink,
        aboutTitle: data.aboutTitle, aboutContent: data.aboutContent, aboutImage: data.aboutImage,
        contactEmail: data.contactEmail, contactPhone: data.contactPhone, contactAddress: data.contactAddress,
        footerText: data.footerText,
        facebook: data.socialLinks?.facebook, twitter: data.socialLinks?.twitter,
        instagram: data.socialLinks?.instagram, linkedin: data.socialLinks?.linkedin, youtube: data.socialLinks?.youtube,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: any) => {
    setSaving(true);
    try {
      const { facebook, twitter, instagram, linkedin, youtube, ...rest } = values;
      await api.put("/homepage", { ...rest, socialLinks: { facebook, twitter, instagram, linkedin, youtube } });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
      toast("Homepage updated", "success");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">Homepage CMS</h1>
        <p className="text-sm text-muted-foreground">Edit every section of your public homepage.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Hero Banner</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Hero title</Label><Input {...register("heroTitle")} /></div>
          <div className="space-y-1.5"><Label>Hero subtitle</Label><Textarea rows={2} {...register("heroSubtitle")} /></div>
          <div className="space-y-1.5"><Label>Hero image URL</Label><Input {...register("heroImage")} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>CTA text</Label><Input {...register("heroCtaText")} /></div>
            <div className="space-y-1.5"><Label>CTA link</Label><Input {...register("heroCtaLink")} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>About Section</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>About title</Label><Input {...register("aboutTitle")} /></div>
          <div className="space-y-1.5"><Label>About content</Label><Textarea rows={4} {...register("aboutContent")} /></div>
          <div className="space-y-1.5"><Label>About image URL</Label><Input {...register("aboutImage")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Email</Label><Input {...register("contactEmail")} /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input {...register("contactPhone")} /></div>
          <div className="space-y-1.5"><Label>Address</Label><Input {...register("contactAddress")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Footer & Social Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Footer text</Label><Input {...register("footerText")} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Facebook</Label><Input {...register("facebook")} /></div>
            <div className="space-y-1.5"><Label>Twitter / X</Label><Input {...register("twitter")} /></div>
            <div className="space-y-1.5"><Label>Instagram</Label><Input {...register("instagram")} /></div>
            <div className="space-y-1.5"><Label>LinkedIn</Label><Input {...register("linkedin")} /></div>
            <div className="space-y-1.5"><Label>YouTube</Label><Input {...register("youtube")} /></div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" variant="accent" disabled={saving}>{saving ? "Saving..." : "Save Homepage"}</Button>
    </form>
  );
}
