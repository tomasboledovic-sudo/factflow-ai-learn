import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  className?: string;
}

const ProgressBar = ({ value, className }: ProgressBarProps) => {
  return (
    <div className={className}>
      <div className="flex justify-between mb-2 text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-semibold text-primary">{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
};

export default ProgressBar;