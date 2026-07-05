import Link from "next/link";
import { Course } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star, Clock, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {course.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <span className="font-display text-2xl text-primary/30">{course.title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            {course.isFree ? (
              <Badge variant="success">Free</Badge>
            ) : (
              <Badge variant="accent">{formatCurrency(course.price)}</Badge>
            )}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <Badge variant="outline" className="w-fit mb-2 capitalize">{course.category}</Badge>
          <h3 className="font-display font-semibold text-base leading-snug mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{course.description}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
            <span className="flex items-center gap-1 capitalize"><BarChart3 className="h-3.5 w-3.5" /> {course.difficulty}</span>
            {course.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.duration}</span>}
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" /> {course.rating.toFixed(1)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
