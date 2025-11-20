import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import CourseCard from "@/components/CourseCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen, Zap, Award, Brain, BarChart3, Code2, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  cover_image: string | null;
}

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchPopularCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .limit(6);

      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    };

    fetchPopularCourses();
  }, []);

  const content = (
    <div className="min-h-screen bg-background">
      {!user && <Navigation />}
      
      {/* Hero Section - Brilliant.org inspired */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Learn by <span className="italic">doing</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Interactive problem solving that's effective and fun.
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Excel in tech skills through practical, bite-sized lessons.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-12 h-14 rounded-full">
              Get started
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 mb-3">
                <Brain className="w-full h-full text-primary" />
              </div>
              <p className="text-sm font-medium">Data Analysis</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 mb-3">
                <BarChart3 className="w-full h-full text-accent" />
              </div>
              <p className="text-sm font-medium">Excel</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 mb-3">
                <Code2 className="w-full h-full text-info" />
              </div>
              <p className="text-sm font-medium">Programming</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 mb-3">
                <Lightbulb className="w-full h-full text-warning" />
              </div>
              <p className="text-sm font-medium">Python</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 mb-3">
                <Zap className="w-full h-full text-primary" />
              </div>
              <p className="text-sm font-medium">SQL</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Courses */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Trending Courses</h2>
          <p className="text-muted-foreground mb-8">Start your learning journey with our most popular courses</p>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  difficulty={course.difficulty}
                  durationMinutes={course.duration_minutes}
                  coverImage={course.cover_image}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-4">No courses available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );

  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return content;
};

export default Index;