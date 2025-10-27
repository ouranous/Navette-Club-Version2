import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  GripVertical,
  Sparkles,
  Camera,
  Coffee,
  Landmark,
  Users,
  Map,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Highlight {
  id: string;
  text: string;
  icon?: string;
}

interface HighlightComposerProps {
  highlights: string[];
  onChange: (highlights: string[]) => void;
}

const iconOptions = [
  { value: "sparkles", icon: Sparkles, label: "Unique" },
  { value: "camera", icon: Camera, label: "Photo" },
  { value: "coffee", icon: Coffee, label: "Pause" },
  { value: "landmark", icon: Landmark, label: "Monument" },
  { value: "users", icon: Users, label: "Groupe" },
  { value: "map", icon: Map, label: "Découverte" },
  { value: "award", icon: Award, label: "Premium" },
];

const highlightTemplates = [
  { icon: "landmark", text: "Visite guidée des sites historiques" },
  { icon: "camera", text: "Arrêts photos aux points panoramiques" },
  { icon: "coffee", text: "Pause café dans un lieu authentique" },
  { icon: "users", text: "Rencontre avec des artisans locaux" },
  { icon: "award", text: "Expérience VIP exclusive" },
  { icon: "map", text: "Découverte de quartiers secrets" },
];

export function HighlightComposer({ highlights, onChange }: HighlightComposerProps) {
  const [newHighlight, setNewHighlight] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("sparkles");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const parsedHighlights: Highlight[] = highlights.map((h, i) => {
    if (h.includes("::")) {
      const [icon, text] = h.split("::");
      return { id: `${i}`, text, icon };
    }
    return { id: `${i}`, text: h };
  });
  
  const addHighlight = (text: string, icon: string = selectedIcon) => {
    if (!text.trim()) return;
    const formatted = `${icon}::${text.trim()}`;
    onChange([...highlights, formatted]);
    setNewHighlight("");
  };
  
  const removeHighlight = (index: number) => {
    onChange(highlights.filter((_, i) => i !== index));
  };
  
  const reorderHighlights = (fromIndex: number, toIndex: number) => {
    const newHighlights = [...highlights];
    const [removed] = newHighlights.splice(fromIndex, 1);
    newHighlights.splice(toIndex, 0, removed);
    onChange(newHighlights);
  };
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    reorderHighlights(draggedIndex, index);
    setDraggedIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  const addTemplate = (template: typeof highlightTemplates[0]) => {
    addHighlight(template.text, template.icon);
  };
  
  const getIcon = (iconName?: string) => {
    const option = iconOptions.find(opt => opt.value === iconName);
    return option ? option.icon : Sparkles;
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Points Forts du Tour</label>
        <p className="text-sm text-muted-foreground mb-4">
          Créez des highlights visuels avec icônes pour mettre en valeur votre tour
        </p>
      </div>
      
      {/* Templates Section */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">Templates Rapides</p>
        <div className="flex flex-wrap gap-2">
          {highlightTemplates.map((template, idx) => {
            const Icon = getIcon(template.icon);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => addTemplate(template)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-background border rounded-md hover-elevate active-elevate-2 transition-all"
                data-testid={`template-${idx}`}
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs">{template.text.substring(0, 30)}...</span>
                <Plus className="w-3 h-3 ml-auto" />
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Icon Selector + Input */}
      <div className="flex gap-2">
        <div className="flex gap-1 p-1 bg-muted rounded-md">
          {iconOptions.slice(0, 4).map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedIcon(option.value)}
                className={cn(
                  "p-2 rounded transition-all",
                  selectedIcon === option.value 
                    ? "bg-primary text-primary-foreground" 
                    : "hover-elevate"
                )}
                title={option.label}
                data-testid={`icon-${option.value}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
        
        <Input
          value={newHighlight}
          onChange={(e) => setNewHighlight(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addHighlight(newHighlight);
            }
          }}
          placeholder="Ex: Guide expert francophone inclus"
          className="flex-1"
          data-testid="input-new-highlight"
        />
        
        <Button 
          type="button" 
          onClick={() => addHighlight(newHighlight)}
          disabled={!newHighlight.trim()}
          data-testid="button-add-highlight"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Highlights List */}
      <div className="space-y-2">
        {parsedHighlights.map((highlight, index) => {
          const Icon = getIcon(highlight.icon);
          return (
            <Card
              key={highlight.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "cursor-move transition-all hover-elevate",
                draggedIndex === index && "opacity-50"
              )}
              data-testid={`highlight-card-${index}`}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                
                <span className="flex-1 text-sm">{highlight.text}</span>
                
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHighlight(index)}
                  className="h-8 w-8"
                  data-testid={`button-remove-highlight-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
        
        {parsedHighlights.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun highlight ajouté</p>
            <p className="text-xs">Utilisez les templates ou créez vos propres highlights</p>
          </div>
        )}
      </div>
    </div>
  );
}
