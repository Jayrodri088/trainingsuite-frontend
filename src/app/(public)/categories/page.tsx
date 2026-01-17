"use client";

import Link from "next/link";
import {
  BookOpen,
  Code,
  Palette,
  TrendingUp,
  Camera,
  Music,
  Briefcase,
  Heart,
  Globe,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks";
import type { Category } from "@/types";

// Default category icons and gradients
const categoryStyles: Record<string, { icon: React.ElementType; gradient: string }> = {
  development: { icon: Code, gradient: "from-blue-500 to-indigo-600" },
  design: { icon: Palette, gradient: "from-pink-500 to-rose-600" },
  business: { icon: Briefcase, gradient: "from-emerald-500 to-teal-600" },
  marketing: { icon: TrendingUp, gradient: "from-amber-500 to-orange-600" },
  photography: { icon: Camera, gradient: "from-violet-500 to-purple-600" },
  music: { icon: Music, gradient: "from-red-500 to-pink-600" },
  health: { icon: Heart, gradient: "from-rose-500 to-red-600" },
  lifestyle: { icon: Globe, gradient: "from-cyan-500 to-blue-600" },
  default: { icon: BookOpen, gradient: "from-slate-500 to-slate-600" },
};

function getCategoryStyle(categoryName: string) {
  const key = categoryName.toLowerCase().replace(/[^a-z]/g, "");
  return categoryStyles[key] || categoryStyles.default;
}

function CategoryCard({ category }: { category: Category }) {
  const style = getCategoryStyle(category.name);
  const Icon = style.icon;

  return (
    <Link href={`/courses?category=${category._id}`}>
      <Card className="overflow-hidden group cursor-pointer h-full hover:shadow-lg transition-all hover:-translate-y-1">
        <div className={`h-32 bg-gradient-to-br ${style.gradient} relative`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-12 w-12 text-white/90" strokeWidth={1.5} />
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {category.courseCount || 0} courses
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CategoryCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16 mt-1.5" />
      </CardContent>
    </Card>
  );
}

// Featured categories for when no data is available
const featuredCategories = [
  { name: "Web Development", slug: "web-development", courseCount: 120 },
  { name: "Data Science", slug: "data-science", courseCount: 85 },
  { name: "Mobile Development", slug: "mobile-development", courseCount: 64 },
  { name: "UI/UX Design", slug: "ui-ux-design", courseCount: 78 },
  { name: "Digital Marketing", slug: "digital-marketing", courseCount: 56 },
  { name: "Business Strategy", slug: "business-strategy", courseCount: 42 },
  { name: "Photography", slug: "photography", courseCount: 38 },
  { name: "Music Production", slug: "music-production", courseCount: 29 },
];

export default function CategoriesPage() {
  const { data: categoriesResponse, isLoading } = useCategories();

  const categories = categoriesResponse?.data || [];

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Course Categories</h1>
        <p className="text-muted-foreground mt-1">
          Explore our wide range of course categories and find the perfect learning path for you
        </p>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCategories.map((category, index) => (
            <CategoryCard
              key={category.slug}
              category={{
                _id: category.slug,
                name: category.name,
                slug: category.slug,
                courseCount: category.courseCount,
              } as Category}
            />
          ))}
        </div>
      )}

      {/* Popular Topics Section */}
      <div className="mt-16">
        <h2 className="text-xl font-bold tracking-tight mb-6">Popular Topics</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "JavaScript",
            "Python",
            "React",
            "Machine Learning",
            "AWS",
            "Docker",
            "Node.js",
            "TypeScript",
            "SQL",
            "Figma",
            "Adobe Photoshop",
            "Excel",
            "Power BI",
            "iOS Development",
            "Android",
            "Flutter",
            "Kubernetes",
            "Cybersecurity",
            "Blockchain",
            "SEO",
          ].map((topic) => (
            <Link key={topic} href={`/courses?search=${encodeURIComponent(topic)}`}>
              <Badge
                variant="secondary"
                className="px-3 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
              >
                {topic}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-16 py-12 bg-muted/30 -mx-4 px-4 rounded-lg">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">500+</div>
            <p className="text-sm text-muted-foreground mt-1">Courses Available</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">50K+</div>
            <p className="text-sm text-muted-foreground mt-1">Students Enrolled</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">100+</div>
            <p className="text-sm text-muted-foreground mt-1">Expert Instructors</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">15+</div>
            <p className="text-sm text-muted-foreground mt-1">Course Categories</p>
          </div>
        </div>
      </div>
    </div>
  );
}
