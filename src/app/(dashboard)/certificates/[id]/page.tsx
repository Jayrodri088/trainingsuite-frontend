"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Award, Download, Calendar, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { certificatesApi } from "@/lib/api/certificates";
import { format } from "date-fns";
import Link from "next/link";
import type { CertificateWithDetails } from "@/types";

export default function CertificateDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [certificate, setCertificate] = useState<CertificateWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadCertificate();
    }
  }, [params.id]);

  const loadCertificate = async () => {
    try {
      setIsLoading(true);
      const response = await certificatesApi.getById(params.id as string);
      if (response.success && response.data) {
        setCertificate(response.data);
      } else {
        toast({ title: "Certificate not found", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to load certificate:", error);
      toast({ title: "Failed to load certificate", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;
    setIsDownloading(true);
    try {
      // Try to get from certificateUrl first if available
      if (certificate.certificateUrl) {
        const link = document.createElement("a");
        link.href = certificate.certificateUrl;
        link.download = `certificate-${certificate.certificateNumber || certificate._id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Certificate downloaded!" });
      } else {
        // Fallback to API download
        const blob = await certificatesApi.download(certificate._id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificate-${certificate.certificateNumber || certificate._id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast({ title: "Certificate downloaded!" });
      }
    } catch (error) {
      console.error("Failed to download certificate:", error);
      toast({ title: "Failed to download certificate", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Award className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Certificate not found</h2>
        <p className="text-muted-foreground">The certificate you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/certificates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Certificates
          </Link>
        </Button>
      </div>
    );
  }

  const course = typeof certificate.course === "object" ? certificate.course : null;
  const user = typeof certificate.user === "object" ? certificate.user : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/certificates">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Certificate Details</h1>
          <p className="text-muted-foreground">View and download your certificate</p>
        </div>
      </div>

      {/* Certificate Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 p-8 border-b">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <Award className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center border-4 border-white">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <Badge className="bg-amber-600 hover:bg-amber-600 text-base px-4 py-1">
                Certificate of Completion
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">
                {course?.title || "Course Certificate"}
              </h2>
              <p className="text-gray-600">
                This is to certify that
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {user?.name || "Student"}
              </p>
              <p className="text-gray-600">
                has successfully completed the course
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-8 space-y-6">
          {/* Certificate Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Certificate Number</span>
              <span className="font-mono text-sm font-medium">
                {certificate.certificateNumber || certificate.certificateId || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Issued Date</span>
              <span className="text-sm font-medium">
                {format(new Date(certificate.issuedAt || certificate.createdAt), "MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Course</span>
              <span className="text-sm font-medium text-right">
                {course?.title || "N/A"}
              </span>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full"
            size="lg"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download Certificate
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
