"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Calendar,
  BookOpen,
  Loader2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCertificates } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { certificatesApi } from "@/lib/api/certificates";
import { format } from "date-fns";
import type { Certificate, Course } from "@/types";
import { T, useT } from "@/components/t";

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const { toast } = useToast();
  const { t } = useT();
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const course = typeof certificate.course === "object" ? certificate.course : null;

  const certificateUrl = typeof window !== "undefined"
    ? `${window.location.origin}/certificates/${certificate._id}`
    : `/certificates/${certificate._id}`;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await certificatesApi.download(certificate._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certificate.certificateNumber || certificate._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: t("Certificate downloaded!") });
    } catch (error) {
      toast({ title: t("Failed to download certificate"), variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl);
      setCopied(true);
      toast({ title: t("Link copied to clipboard!") });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: t("Failed to copy link"), variant: "destructive" });
    }
  };

  const handleShareSocial = (platform: "twitter" | "linkedin" | "facebook") => {
    const text = t(`I just earned a certificate for completing "${course?.title || "a course"}"! Check it out:`);
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(certificateUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}`,
    };
    window.open(urls[platform], "_blank", "width=600,height=400");
    setShareDialogOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden rounded-[12px] border-gray-200 group hover:border-gray-300 transition-colors bg-white shadow-sm">
        <div className="bg-amber-50/80 p-6 border-b border-gray-200 text-center relative">
          <Badge className="absolute top-3 left-3 rounded-[8px] bg-amber-600 hover:bg-amber-600 border-0 text-[10px] font-semibold"><T>Verified</T></Badge>
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-[12px] border-2 border-amber-200 bg-amber-100/80 flex items-center justify-center">
                <Award className="h-10 w-10 text-amber-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center border-2 border-white">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-sans font-bold text-black text-center text-sm line-clamp-2 min-h-[40px] mb-4">
            {t(course?.title || "Course Certificate")}
          </h3>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-xs border-b border-gray-200 pb-2">
              <span className="font-sans text-gray-600 font-medium"><T>Issued</T></span>
              <span className="font-sans text-gray-600">{format(new Date(certificate.issuedAt || certificate.createdAt), "MMM d, yyyy")}</span>
            </div>
            {(certificate.certificateId || certificate.certificateNumber) && (
              <div className="flex items-center justify-between text-xs border-b border-gray-200 pb-2">
                <span className="font-sans text-gray-600 font-medium"><T>ID</T></span>
                <span className="font-sans text-gray-600 truncate max-w-[150px]">{certificate.certificateId || certificate.certificateNumber}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-[10px] border-gray-200 text-xs font-semibold h-9 hover:bg-gray-50"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-2" />
              )}
              <T>Download</T>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-[10px] border-gray-200 text-xs font-semibold h-9 hover:bg-gray-50"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="h-3 w-3 mr-2" />
              <T>Share</T>
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="w-full mt-2 rounded-[10px] text-xs font-semibold h-9 hover:bg-transparent hover:text-[#0052CC]" asChild>
            <Link href={`/certificates/${certificate._id}`}>
              <T>View Certificate</T> <ExternalLink className="h-3 w-3 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[12px] border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="font-sans font-bold text-black"><T>Share Certificate</T></DialogTitle>
            <DialogDescription className="font-sans text-gray-600">
              <T>Share your achievement with others</T>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex items-center space-x-2">
              <Input
                value={certificateUrl}
                readOnly
                className="flex-1 rounded-[10px] border-gray-200 font-sans text-xs"
              />
              <Button size="sm" onClick={handleCopyLink} className="rounded-[10px] h-10 w-10 p-0 bg-[#0052CC] hover:bg-[#003d99] text-white">
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-[10px] border-gray-200 font-sans text-xs font-semibold hover:bg-gray-50"
                onClick={() => handleShareSocial("twitter")}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-[10px] border-gray-200 font-sans text-xs font-semibold hover:bg-gray-50"
                onClick={() => handleShareSocial("linkedin")}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-[10px] border-gray-200 font-sans text-xs font-semibold hover:bg-gray-50"
                onClick={() => handleShareSocial("facebook")}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CertificateCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[12px] border-gray-200">
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <Skeleton className="h-20 w-20 rounded-[12px]" />
        </div>
      </div>
      <CardContent className="p-5 space-y-4">
        <Skeleton className="h-5 w-full rounded-[10px]" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12 rounded-[10px]" />
            <Skeleton className="h-3 w-20 rounded-[10px]" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-8 rounded-[10px]" />
            <Skeleton className="h-3 w-24 rounded-[10px]" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-[10px]" />
          <Skeleton className="h-9 flex-1 rounded-[10px]" />
        </div>
        <Skeleton className="h-8 w-full mt-2 rounded-[10px]" />
      </CardContent>
    </Card>
  );
}

export default function CertificatesPage() {
  const { data: certificatesResponse, isLoading } = useCertificates();

  const certificates = certificatesResponse?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-black tracking-tight"><T>My Certificates</T></h1>
        <p className="font-sans text-gray-600 mt-1">
          <T>View and download your earned certificates</T>
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-[12px] border border-amber-200 bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-sans font-bold text-black">{certificates.length}</p>
              <p className="text-sm font-sans text-gray-600 mt-1"><T>Total Certificates</T></p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-[12px] border border-green-200 bg-green-50 text-green-600 flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-sans font-bold text-black">{certificates.length}</p>
              <p className="text-sm font-sans text-gray-600 mt-1"><T>Courses Completed</T></p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-[12px] border border-blue-200 bg-blue-50 text-blue-600 flex items-center justify-center">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-sans font-bold text-black">0</p>
              <p className="text-sm font-sans text-gray-600 mt-1"><T>Shared Certificates</T></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CertificateCardSkeleton key={i} />
          ))}
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <CertificateCard key={certificate._id} certificate={certificate} />
          ))}
        </div>
      ) : (
        <Card className="rounded-[12px] border-gray-200 border-dashed bg-white shadow-sm">
          <CardContent className="py-20 text-center">
            <div className="h-16 w-16 mx-auto mb-6 rounded-[12px] border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-sans font-bold text-black"><T>No certificates yet</T></h3>
            <p className="font-sans text-gray-600 mt-2 max-w-md mx-auto text-sm">
              <T>Complete courses to earn certificates that showcase your achievements.</T>
            </p>
            <Button className="mt-8 rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-bold" asChild>
              <Link href="/courses"><T>Browse Courses</T></Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
