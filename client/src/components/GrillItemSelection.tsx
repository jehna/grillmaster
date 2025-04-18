import { GrillItem } from "./GrillItem";
import { Card } from "@/components/ui/card";
import { useGrillItems } from "@/hooks/useGrillItems";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddCustomItemModal } from "./AddCustomItemModal";

export function GrillItemSelection() {
  const { grillItems, selectedItems, toggleItemSelection } = useGrillItems();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="p-4 flex-grow overflow-y-auto pb-32">
      <h2 className="text-xl font-bold mb-4">Valitse grillattavat</h2>
      
      <div className="grid grid-cols-1 gap-3">
        {grillItems.map((item) => (
          <GrillItem
            key={item.id}
            item={item}
            selected={selectedItems.some(i => i.id === item.id)}
            onToggle={toggleItemSelection}
          />
        ))}
        
        <Card 
          className="border-l-4 border-primary p-4 flex items-center justify-between cursor-pointer hover:shadow-md"
          onClick={() => setIsAddModalOpen(true)}
        >
          <div>
            <h3 className="font-medium">Lisää oma grillattava</h3>
            <p className="text-sm text-gray-600">Määritä omat grilliajat</p>
          </div>
          <span className="material-icons text-primary">add_circle</span>
        </Card>
      </div>

      <AddCustomItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
