import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface AchievementCardProps {
  title: string;
  description?: string;
  year?: string | number;
}

const AchievementCard = ({ title, description, year }: AchievementCardProps) => {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
                </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{title}</h3>
                            {year && (
                                <p className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                                {year}
                                </p>
                            )}
                    </div>
                        {description && (
                        <p className="text-sm text-muted-foreground mt-2">{description}</p>
                        )}
            </div>
        </CardContent>
    </Card>
  );
};

export default AchievementCard;