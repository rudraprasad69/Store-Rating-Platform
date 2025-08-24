
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export function RecentRatings() {
  // Mock data for now
  const ratings = [
    { id: 1, storeName: "Tech Haven", rating: 5 },
    { id: 2, storeName: "Gadget World", rating: 4 },
    { id: 3, storeName: "Electro Mart", rating: 4 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest store ratings.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {ratings.map((rating) => (
            <li key={rating.id} className="flex items-center justify-between">
              <span className="font-medium">{rating.storeName}</span>
              <div className="flex items-center gap-1">
                <span className="font-bold">{rating.rating}</span>
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
