import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Flame, Zap, TrendingUp } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface UserStats {
  xp: number;
  current_streak: number;
  longest_streak: number;
  badges: any;
}

interface CourseProgress {
  course_title: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch user stats
      const { data: statsData } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (statsData) {
        setStats(statsData);
      } else {
        // Create stats if they don't exist
        const { data: newStats } = await supabase
          .from("user_stats")
          .insert({ user_id: session.user.id })
          .select()
          .single();
        setStats(newStats);
      }

      // Fetch course progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select(`
          lesson_id,
          completed,
          lessons(course_id, courses(title))
        `)
        .eq("user_id", session.user.id);

      if (progressData) {
        // Group by course and calculate progress
        const courseMap = new Map<string, CourseProgress>();
        
        for (const item of progressData) {
          const lesson = item.lessons as any;
          const course = lesson?.courses;
          if (!course) continue;

          const courseTitle = course.title;
          if (!courseMap.has(courseTitle)) {
            courseMap.set(courseTitle, {
              course_title: courseTitle,
              total_lessons: 0,
              completed_lessons: 0,
              progress_percent: 0,
            });
          }

          const progress = courseMap.get(courseTitle)!;
          progress.total_lessons++;
          if (item.completed) {
            progress.completed_lessons++;
          }
        }

        const progressArray = Array.from(courseMap.values()).map((p) => ({
          ...p,
          progress_percent: (p.completed_lessons / p.total_lessons) * 100,
        }));

        setCourseProgress(progressArray);
      }

      setLoading(false);
    };

    fetchData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Your Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <Zap className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.xp || 0}</div>
              <p className="text-xs text-muted-foreground">Keep learning to earn more</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.current_streak || 0} days</div>
              <p className="text-xs text-muted-foreground">Don't break the chain!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.longest_streak || 0} days</div>
              <p className="text-xs text-muted-foreground">Your personal best</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Badges</CardTitle>
              <Award className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.badges?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Achievements unlocked</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>Track your progress across all enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            {courseProgress.length > 0 ? (
              <div className="space-y-6">
                {courseProgress.map((course, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{course.course_title}</span>
                      <span className="text-sm text-muted-foreground">
                        {course.completed_lessons}/{course.total_lessons} lessons
                      </span>
                    </div>
                    <Progress value={course.progress_percent} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't started any courses yet</p>
                <a
                  href="/courses"
                  className="text-primary hover:underline font-medium"
                >
                  Browse courses to get started
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;