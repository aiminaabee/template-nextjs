import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonProductPreview = () => {
  return (
    <Card className="overflow-hidden shadow-none">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <CardHeader className="p-3">
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardFooter className="p-3 pt-0">
        <Skeleton className="h-5 w-1/3" />
      </CardFooter>
    </Card>
  );
};

export default SkeletonProductPreview;
