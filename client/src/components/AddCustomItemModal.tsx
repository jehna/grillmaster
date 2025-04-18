import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useGrillItems } from "@/hooks/useGrillItems";
import { useState, useEffect } from "react";
import { GrillItemType } from "@shared/schema";

interface AddCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCustomItemModal({ isOpen, onClose }: AddCustomItemModalProps) {
  const { addCustomItem } = useGrillItems();
  
  const [name, setName] = useState("");
  const [type, setType] = useState<"veggie" | "meat" | "fish">("veggie");
  const [cookTimePerSide, setCookTimePerSide] = useState<number>(3);
  const [flipCount, setFlipCount] = useState<number>(1);
  const [hasDifferentSides, setHasDifferentSides] = useState(false);
  const [cookTimeSecondSide, setCookTimeSecondSide] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setName("");
      setType("veggie");
      setCookTimePerSide(3);
      setFlipCount(1);
      setHasDifferentSides(false);
      setCookTimeSecondSide(undefined);
      setNotes("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: GrillItemType = {
      id: `custom_${Date.now()}`,
      name,
      type,
      cookTimePerSide,
      sides: flipCount + 1,
      notes: notes || "",
    };

    if (hasDifferentSides && cookTimeSecondSide) {
      newItem.cookTimeSecondSide = cookTimeSecondSide;
    }

    addCustomItem(newItem);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Lisää oma grillattava</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="itemName">Nimi</Label>
            <Input 
              id="itemName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label>Tyyppi</Label>
            <RadioGroup value={type} onValueChange={(value: "veggie" | "meat" | "fish") => setType(value)}>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="veggie" id="veggie" />
                  <Label htmlFor="veggie" className="flex items-center">
                    <span className="material-icons text-[#84cc16] mr-1">eco</span>
                    Kasvis
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="meat" id="meat" />
                  <Label htmlFor="meat" className="flex items-center">
                    <span className="material-icons text-[#ef4444] mr-1">restaurant</span>
                    Liha
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fish" id="fish" />
                  <Label htmlFor="fish" className="flex items-center">
                    <span className="material-icons text-[#3b82f6] mr-1">set_meal</span>
                    Kala
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label>Grilliajat</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="cookTimeSide1" className="text-xs mb-1">Aika per puoli (min)</Label>
                <Input 
                  id="cookTimeSide1"
                  type="number" 
                  min={1}
                  max={60}
                  value={cookTimePerSide}
                  onChange={(e) => setCookTimePerSide(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="flipCount" className="text-xs mb-1">Kääntöjen määrä</Label>
                <Input 
                  id="flipCount"
                  type="number" 
                  min={0}
                  max={10}
                  value={flipCount}
                  onChange={(e) => setFlipCount(Number(e.target.value))}
                  required
                />
              </div>
            </div>
            
            <div className="mt-2 flex items-center space-x-2">
              <Checkbox 
                id="differentSides" 
                checked={hasDifferentSides}
                onCheckedChange={(checked) => setHasDifferentSides(!!checked)}
              />
              <Label htmlFor="differentSides" className="text-sm">
                Toisen puolen grillauksella eri aika
              </Label>
            </div>
            
            {hasDifferentSides && (
              <div className="mt-2">
                <Label htmlFor="cookTimeSide2" className="text-xs mb-1">Aika toiselle puolelle (min)</Label>
                <Input 
                  id="cookTimeSide2"
                  type="number" 
                  min={1}
                  max={60}
                  value={cookTimeSecondSide || ""}
                  onChange={(e) => setCookTimeSecondSide(Number(e.target.value))}
                  required
                />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="itemNotes">Lisätiedot</Label>
            <Input 
              id="itemNotes"
              placeholder="esim. muista öljy"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Peruuta
            </Button>
            <Button type="submit">
              Lisää
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
