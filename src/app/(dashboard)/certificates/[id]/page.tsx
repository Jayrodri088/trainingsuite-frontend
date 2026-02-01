"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Award, Download, Calendar, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/page-loader";
import { useToast } from "@/hooks/use-toast";
import { certificatesApi } from "@/lib/api/certificates";
import { format } from "date-fns";
import Link from "next/link";
import type { CertificateWithDetails } from "@/types";
import { T, useT } from "@/components/t";

export default function CertificateDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const { t } = useT();
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
        toast({ title: t("Certificate not found"), variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to load certificate:", error);
      toast({ title: t("Failed to load certificate"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;
    setIsDownloading(true);
    try {
      // Always use the API download endpoint - it will generate the PDF on-the-fly if needed
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
      console.error("Failed to download certificate:", error);
      toast({ title: t("Failed to download certificate"), variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Award className="h-16 w-16 text-gray-500" />
        <h2 className="text-xl font-sans font-bold text-black"><T>Certificate not found</T></h2>
        <p className="font-sans text-gray-600"><T>The certificate you're looking for doesn't exist.</T></p>
        <Button asChild className="rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-bold">
          <Link href="/certificates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <T>Back to Certificates</T>
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
          <h1 className="text-2xl font-bold"><T>Certificate Details</T></h1>
          <p className="text-muted-foreground"><T>View and download your certificate</T></p>
        </div>
      </div>

      {/* Certificate Card */}
      <Card className="overflow-hidden rounded-[12px] border-gray-200 bg-white shadow-sm">
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
                <T>Certificate of Completion</T>
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">
                {t(course?.title || "Course Certificate")}
              </h2>
              <p className="text-gray-600">
                <T>This is to certify that</T>
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {user?.name || t("Student")}
              </p>
              <p className="text-gray-600">
                <T>has successfully completed the course</T>
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-8 space-y-6">
          {/* Certificate Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-sans text-gray-600"><T>Certificate Number</T></span>
              <span className="font-mono text-sm font-medium">
                {certificate.certificateNumber || certificate.certificateId || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-sans text-gray-600"><T>Issued Date</T></span>
              <span className="text-sm font-medium">
                {format(new Date(certificate.issuedAt || certificate.createdAt), "MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-sans text-gray-600"><T>Course</T></span>
              <span className="text-sm font-medium text-right">
                {t(course?.title || "N/A")}
              </span>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-bold"
            size="lg"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <T>Downloading...</T>
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                <T>Download Certificate</T>
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
