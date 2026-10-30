import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ConsumedFoodWithDetails } from "@/services/consumedFoodService";

export type NutrientType = "kcal" | "protein" | "carbs" | "fats" | "fiber" | "sugar" | "salt";

interface NutrientDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nutrientType: NutrientType | null;
  foods: ConsumedFoodWithDetails[];
}

export function NutrientDetailDialog({
  open,
  onOpenChange,
  nutrientType,
  foods,
}: NutrientDetailDialogProps) {
  if (!nutrientType) return null;

  const nutrientLabels: Record<NutrientType, string> = {
    kcal: "kalórií",
    protein: "bielkovín",
    carbs: "sacharidov",
    fats: "tukov",
    fiber: "vlákniny",
    sugar: "cukrov",
    salt: "soli",
  };

  const unit = nutrientType === "kcal" ? " kcal" : "g";
  // Same precision as the dashboard card: whole calories, grams to two places
  const decimals = nutrientType === "kcal" ? 0 : 2;

  // Calculate nutrient value for each food and sort by it (highest first)
  const foodsWithNutrient = foods
    .map((food) => {
      if (!food.food) return null;

      const ratio = food.amount / 100;

      return {
        name: food.food.name,
        value: food.food[nutrientType] * ratio,
      };
    })
    .filter((item): item is { name: string; value: number } => item !== null)
    .sort((a, b) => b.value - a.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Podľa {nutrientLabels[nutrientType]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {foodsWithNutrient.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Žiadne záznamy
            </p>
          ) : (
            foodsWithNutrient.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-lg font-semibold text-primary">
                  {item.value.toFixed(decimals)}
                  {unit}
                </span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}