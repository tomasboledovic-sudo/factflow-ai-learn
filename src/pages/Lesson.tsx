import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  course_id: string;
  order_index: number;
}

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", id)
        .single();

      if (lessonError) {
        console.error("Error fetching lesson:", lessonError);
        setLoading(false);
        return;
      }

      setLesson(lessonData);

      // Check if lesson is completed
      if (session?.user) {
        const { data: progressData } = await supabase
          .from("user_progress")
          .select("completed")
          .eq("user_id", session.user.id)
          .eq("lesson_id", id)
          .single();

        if (progressData) {
          setCompleted(progressData.completed);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleComplete = async () => {
    if (!user || !lesson) return;

    const { error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete",
        variant: "destructive",
      });
      return;
    }

    setCompleted(true);
    
    // Update XP
    const { data: statsData } = await supabase
      .from("user_stats")
      .select("xp")
      .eq("user_id", user.id)
      .single();

    const currentXp = statsData?.xp || 0;
    await supabase
      .from("user_stats")
      .upsert({
        user_id: user.id,
        xp: currentXp + 10,
      });

    toast({
      title: "Lesson Complete!",
      description: "You earned 10 XP",
    });
  };

  const handleNext = () => {
    navigate(`/course/${lesson?.course_id}`);
  };

  if (loading) {
    const loadingContent = (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading lesson...</p>
      </div>
    );
    
    if (user) {
      return <DashboardLayout>{loadingContent}</DashboardLayout>;
    }
    
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        {loadingContent}
      </div>
    );
  }

  if (!lesson) {
    const notFoundContent = (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Lesson not found</p>
      </div>
    );
    
    if (user) {
      return <DashboardLayout>{notFoundContent}</DashboardLayout>;
    }
    
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        {notFoundContent}
      </div>
    );
  }

  const content = (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">{lesson.title}</h1>

        {lesson.video_url && (
          <div className="mb-8 rounded-lg overflow-hidden bg-muted aspect-video">
            <iframe
              src={lesson.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {lesson.content ? (
                <p className="whitespace-pre-wrap">{lesson.content}</p>
              ) : (
                <p className="text-muted-foreground">No content available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quiz placeholder */}
        <Card className="mb-8 border-dashed">
          <CardHeader>
            <CardTitle>Quick Quiz</CardTitle>
            <CardDescription>Test your knowledge (AI-powered quizzes coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Interactive quiz will appear here to test your understanding of the lesson.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {user && !completed && (
            <Button onClick={handleComplete} className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Complete
            </Button>
          )}
          {completed && (
            <Button onClick={handleNext} className="flex-1">
              Next Lesson
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {!user && (
            <Button onClick={() => navigate("/auth")} className="flex-1">
              Sign in to track progress
            </Button>
          )}
        </div>
      </div>
  );

  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {content}
    </div>
  );
};

export default Lesson;