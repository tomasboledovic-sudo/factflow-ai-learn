import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BarChart, Lock, PlayCircle } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { User } from "@supabase/supabase-js";

interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  cover_image: string | null;
}

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  is_free: boolean;
  order_index: number;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError) {
        console.error("Error fetching course:", courseError);
      } else {
        setCourse(courseData);
      }

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", id)
        .order("order_index");

      if (lessonsError) {
        console.error("Error fetching lessons:", lessonsError);
      } else {
        setLessons(lessonsData || []);

        // Calculate progress if user is logged in
        if (session?.user) {
          const { data: progressData } = await supabase
            .from("user_progress")
            .select("lesson_id, completed")
            .eq("user_id", session.user.id)
            .in(
              "lesson_id",
              lessonsData?.map((l) => l.id) || []
            );

          if (progressData) {
            const completedCount = progressData.filter((p) => p.completed).length;
            const progressPercent = (completedCount / lessonsData.length) * 100;
            setProgress(progressPercent);
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const difficultyColors = {
    beginner: "bg-success text-white",
    intermediate: "bg-warning text-white",
    advanced: "bg-destructive text-white",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="md:col-span-2">
            <div className="mb-6">
              {course.cover_image && (
                <div className="h-64 md:h-96 bg-gradient-hero rounded-lg overflow-hidden mb-6">
                  <img
                    src={course.cover_image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                {course.difficulty && (
                  <Badge className={difficultyColors[course.difficulty as keyof typeof difficultyColors]}>
                    <BarChart className="mr-1 h-3 w-3" />
                    {course.difficulty}
                  </Badge>
                )}
                {course.duration_minutes && (
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {course.duration_minutes} min total
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground">{course.description}</p>
            </div>

            {user && progress > 0 && (
              <ProgressBar value={progress} className="mb-6" />
            )}

            {/* Lessons List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Lessons</h2>
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <CardTitle className="text-base">{lesson.title}</CardTitle>
                            {lesson.duration_minutes && (
                              <CardDescription className="flex items-center mt-1">
                                <Clock className="mr-1 h-3 w-3" />
                                {lesson.duration_minutes} min
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </div>
                      {lesson.is_free || user ? (
                        <Link to={`/lesson/${lesson.id}`}>
                          <Button size="sm">
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Start
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          <Lock className="mr-2 h-4 w-4" />
                          Locked
                        </Button>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lessons</p>
                  <p className="font-semibold">{lessons.length} lessons</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Duration</p>
                  <p className="font-semibold">{course.duration_minutes} minutes</p>
                </div>
                {!user && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-3">
                      Sign in to access all lessons and track your progress
                    </p>
                    <Link to="/auth">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;