import { Badge } from "@/components/ui/badge";
import { 
  Landmark, 
  UtensilsCrossed, 
  Mountain, 
  Clock, 
  Sparkles,
  Users,
  Euro,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualCategoryChipProps {
  category: string;
  selected: boolean;
  onClick: () => void;
}

const categoryConfig = {
  cultural: {
    label: "Culturel",
    icon: Landmark,
    color: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700",
    selectedColor: "bg-purple-500 text-white border-purple-600",
  },
  gastronomic: {
    label: "Gastronomique",
    icon: UtensilsCrossed,
    color: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700",
    selectedColor: "bg-orange-500 text-white border-orange-600",
  },
  adventure: {
    label: "Aventure",
    icon: Mountain,
    color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
    selectedColor: "bg-green-500 text-white border-green-600",
  },
  historical: {
    label: "Historique",
    icon: Clock,
    color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    selectedColor: "bg-amber-500 text-white border-amber-600",
  },
  nature: {
    label: "Nature",
    icon: Sparkles,
    color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    selectedColor: "bg-emerald-500 text-white border-emerald-600",
  },
};

export function VisualCategoryChip({ category, selected, onClick }: VisualCategoryChipProps) {
  const config = categoryConfig[category as keyof typeof categoryConfig];
  if (!config) return null;
  
  const Icon = config.icon;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 hover-elevate active-elevate-2",
        selected ? config.selectedColor : config.color
      )}
      data-testid={`category-chip-${category}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{config.label}</span>
    </button>
  );
}

interface VisualDifficultyChipProps {
  difficulty: string;
  selected: boolean;
  onClick: () => void;
}

const difficultyConfig = {
  easy: {
    label: "Facile",
    color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
    selectedColor: "bg-green-500 text-white border-green-600",
    dots: 1,
  },
  moderate: {
    label: "Modéré",
    color: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
    selectedColor: "bg-yellow-500 text-white border-yellow-600",
    dots: 2,
  },
  difficult: {
    label: "Difficile",
    color: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
    selectedColor: "bg-red-500 text-white border-red-600",
    dots: 3,
  },
};

export function VisualDifficultyChip({ difficulty, selected, onClick }: VisualDifficultyChipProps) {
  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig];
  if (!config) return null;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 hover-elevate active-elevate-2",
        selected ? config.selectedColor : config.color
      )}
      data-testid={`difficulty-chip-${difficulty}`}
    >
      <div className="flex gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-opacity",
              i < config.dots 
                ? "opacity-100" 
                : selected 
                  ? "opacity-30" 
                  : "opacity-20"
            )}
            style={{
              backgroundColor: selected ? "currentColor" : undefined,
            }}
          />
        ))}
      </div>
      <span className="font-medium">{config.label}</span>
    </button>
  );
}

interface TourMetadataBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  className?: string;
}

export function TourMetadataBadge({ icon: Icon, label, value, className }: TourMetadataBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-sm rounded-md border", className)}>
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
    </div>
  );
}

interface TourPreviewCardProps {
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
  difficulty: string;
  duration: number;
  maxCapacity: number;
  price: string;
}

export function TourPreviewCard({
  name,
  description,
  imageUrl,
  category,
  difficulty,
  duration,
  maxCapacity,
  price,
}: TourPreviewCardProps) {
  const categoryInfo = categoryConfig[category as keyof typeof categoryConfig];
  const difficultyInfo = difficultyConfig[difficulty as keyof typeof difficultyConfig];
  
  return (
    <div className="rounded-xl overflow-hidden border bg-card shadow-lg">
      {/* Hero Image with Gradient Overlay */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Category & Difficulty Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {categoryInfo && (
            <Badge className={cn("flex items-center gap-1", categoryInfo.selectedColor)}>
              <categoryInfo.icon className="w-3 h-3" />
              {categoryInfo.label}
            </Badge>
          )}
          {difficultyInfo && (
            <Badge className={cn("flex items-center gap-1", difficultyInfo.selectedColor)}>
              {difficultyInfo.label}
            </Badge>
          )}
        </div>
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            {name || "Nouveau Tour"}
          </h3>
          <p className="text-sm text-white/90 line-clamp-2">
            {description || "Description du tour..."}
          </p>
        </div>
      </div>
      
      {/* Metadata Section */}
      <div className="p-4 grid grid-cols-3 gap-2">
        <TourMetadataBadge icon={Clock} label="Durée" value={`${duration}h`} />
        <TourMetadataBadge icon={Users} label="Max" value={maxCapacity} />
        <TourMetadataBadge icon={Euro} label="À partir de" value={`${price}€`} />
      </div>
    </div>
  );
}
