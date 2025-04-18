import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GrillItemType } from "@shared/schema";

interface GrillItemProps {
  item: GrillItemType;
  selected: boolean;
  onToggle: (item: GrillItemType, selected: boolean) => void;
}

export function GrillItem({ item, selected, onToggle }: GrillItemProps) {
  const handleToggle = () => {
    onToggle(item, !selected);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onToggle(item, checked);
  };

  // Determine icon and border color based on item type
  let iconName = "eco";
  let colorClass = "border-[#84cc16]";
  
  if (item.type === "meat") {
    iconName = "restaurant";
    colorClass = "border-[#ef4444]";
  } else if (item.type === "fish") {
    iconName = "set_meal";
    colorClass = "border-[#3b82f6]";
  }

  // Format the cooking description
  const getCookingDescription = () => {
    if (item.cookTimeSecondSide) {
      return `${item.cookTimePerSide}min eka puoli + ${item.cookTimeSecondSide}min ${item.sides > 1 ? 'toinen puoli' : ''}${item.notes ? ` (${item.notes})` : ''}`;
    } else {
      return `${item.cookTimePerSide}min per puoli x${item.sides} ${item.notes ? `(${item.notes})` : ''}`;
    }
  };

  const textColorClass = item.type === "meat" 
    ? "text-[#ef4444]" 
    : item.type === "fish" 
      ? "text-[#3b82f6]" 
      : "text-[#84cc16]";

  return (
    <Card 
      className={`border-l-4 ${colorClass} p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-md`}
      onClick={handleToggle}
    >
      <div>
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-gray-600">{getCookingDescription()}</p>
      </div>
      <div className="flex items-center">
        <span className={`material-icons ${textColorClass} mr-2`}>{iconName}</span>
        <Checkbox 
          checked={selected} 
          onCheckedChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 text-primary border-gray-300"
        />
      </div>
    </Card>
  );
}
