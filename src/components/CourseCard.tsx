import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  durationMinutes: number | null;
  coverImage: string | null;
}

const CourseCard = ({ id, title, description, difficulty, durationMinutes, coverImage }: CourseCardProps) => {
  const difficultyColors = {
    beginner: "bg-success text-white",
    intermediate: "bg-warning text-white",
    advanced: "bg-destructive text-white",
  };

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-lg transition-all">
      <div className="h-48 bg-gradient-hero overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
            {title.charAt(0)}
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          {difficulty && (
            <Badge className={difficultyColors[difficulty as keyof typeof difficultyColors]}>
              <BarChart className="mr-1 h-3 w-3" />
              {difficulty}
            </Badge>
          )}
          {durationMinutes && (
            <span className="text-sm text-muted-foreground flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {durationMinutes} min
            </span>
          )}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link to={`/course/${id}`} className="w-full">
          <Button className="w-full">Start Learning</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;