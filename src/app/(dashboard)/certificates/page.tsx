"use client";

import Link from "next/link";
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCertificates } from "@/hooks";
import { format } from "date-fns";
import type { Certificate, Course } from "@/types";

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const course = typeof certificate.course === "object" ? certificate.course : null;

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 p-6 border-b">
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Award className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-white">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <Badge className="bg-amber-600 hover:bg-amber-600">Certificate of Completion</Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="font-semibold text-center line-clamp-2 min-h-[48px]">
          {course?.title || "Course Certificate"}
        </h3>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Issued {format(new Date(certificate.issuedAt || certificate.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          {certificate.certificateId && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">ID: {certificate.certificateId}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
          <Link href={`/certificates/${certificate._id}`}>
            <ExternalLink className="h-4 w-4 mr-1" />
            View Certificate
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CertificateCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-6 border-b">
        <div className="flex items-center justify-center">
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        <div className="flex justify-center mt-4">
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <CardContent className="p-5 space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CertificatesPage() {
  const { data: certificatesResponse, isLoading } = useCertificates();

  const certificates = certificatesResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Certificates</h1>
        <p className="text-muted-foreground mt-1">
          View and download your earned certificates
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{certificates.length}</p>
              <p className="text-sm text-muted-foreground">Total Certificates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{certificates.length}</p>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Share2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Shared Certificates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No certificates yet</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Complete courses to earn certificates that showcase your achievements.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
