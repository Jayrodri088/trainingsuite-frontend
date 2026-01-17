"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, Share2, Download, ArrowRight, PartyPopper, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Confetti } from "@/components/ui/confetti";
import { useToast } from "@/hooks/use-toast";
import { certificatesApi } from "@/lib/api/certificates";
import type { Course, Certificate } from "@/types";

interface CourseCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onCertificateGenerated?: (certificate: Certificate) => void;
}

export function CourseCompletionDialog({
  open,
  onOpenChange,
  course,
  onCertificateGenerated,
}: CourseCompletionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
    }
  }, [open]);

  const generateCertificateMutation = useMutation({
    mutationFn: async () => {
      // This would call the backend to generate a certificate
      // For now, we'll simulate it
      const response = await fetch(`/api/courses/${course?._id}/certificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to generate certificate");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setCertificate(data.data);
      onCertificateGenerated?.(data.data);
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast({ title: "Certificate generated!" });
    },
    onError: () => {
      toast({ title: "Certificate generation failed", variant: "destructive" });
    },
  });

  const handleShare = async () => {
    const shareText = `I just completed "${course?.title}" on Training Suite! 🎉`;
    const shareUrl = certificate
      ? `${window.location.origin}/certificates/${certificate._id}`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Course Completed!",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  return (
    <>
      <Confetti active={showConfetti} duration={4000} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="space-y-4">
            <div className="mx-auto">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-lg">
                  <Award className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center border-4 border-white shadow-md">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div>
              <DialogTitle className="text-2xl flex items-center justify-center gap-2">
                <PartyPopper className="h-6 w-6 text-amber-500" />
                Congratulations!
                <PartyPopper className="h-6 w-6 text-amber-500 scale-x-[-1]" />
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                You&apos;ve successfully completed
              </DialogDescription>
              <p className="font-semibold text-foreground mt-1">
                {course?.title}
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {!certificate ? (
              <Button
                size="lg"
                className="w-full"
                onClick={() => generateCertificateMutation.mutate()}
                disabled={generateCertificateMutation.isPending}
              >
                {generateCertificateMutation.isPending ? (
                  "Generating..."
                ) : (
                  <>
                    <Award className="h-5 w-5 mr-2" />
                    Get Your Certificate
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    Certificate Generated!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    ID: {certificate.certificateNumber || certificate._id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/certificates/${certificate._id}`}>
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            )}

            <Button variant="outline" size="lg" className="w-full" onClick={handleShare}>
              <Share2 className="h-5 w-5 mr-2" />
              Share Achievement
            </Button>

            <div className="pt-4 border-t">
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link href="/courses">
                  Continue Learning
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
