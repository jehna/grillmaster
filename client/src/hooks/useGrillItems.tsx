import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { GrillItemType } from "@shared/schema";
import { useLocalStorage } from "./useLocalStorage";

interface CalculatedTimelineItem extends GrillItemType {
  startTime: number;
  endTime: number;
  totalTime: number;
  flipTimes: number[];
}

interface Timeline {
  items: CalculatedTimelineItem[];
  totalTime: number;
}

interface GrillItemsContextType {
  grillItems: GrillItemType[];
  selectedItems: GrillItemType[];
  toggleItemSelection: (item: GrillItemType, selected: boolean) => void;
  addCustomItem: (item: GrillItemType) => void;
  timeline: Timeline | null;
  calculateTimeline: () => void;
}

const GrillItemsContext = createContext<GrillItemsContextType | undefined>(undefined);

// Default grill items
const defaultGrillItems: GrillItemType[] = [
  { id: 'maissi', name: 'Maissi', type: 'veggie', cookTimePerSide: 3, sides: 8, notes: '6-8 kääntöä' },
  { id: 'parsa', name: 'Parsa', type: 'veggie', cookTimePerSide: 3.5, sides: 2, notes: '' },
  { id: 'pekonisienet', name: 'Pekonisienet', type: 'veggie', cookTimePerSide: 5, sides: 2, notes: '+2min isoille sienille' },
  { id: 'kana', name: 'Kana', type: 'meat', cookTimePerSide: 5, sides: 2, notes: '' },
  { id: 'ulkofile', name: 'Ulkofile', type: 'meat', cookTimePerSide: 2.5, sides: 2, notes: '' },
  { id: 'salaatti', name: 'Salaatti', type: 'veggie', cookTimePerSide: 2, sides: 1, notes: '' },
  { id: 'lohi', name: 'Lohi', type: 'fish', cookTimePerSide: 3, cookTimeSecondSide: 5, sides: 2, notes: 'muista öljy' },
  { id: 'makkara', name: 'Makkara', type: 'meat', cookTimePerSide: 6, sides: 2, notes: '' }
];

export function GrillItemsProvider({ children }: { children: ReactNode }) {
  // Use localStorage to persist custom items
  const [savedItems, setSavedItems] = useLocalStorage<GrillItemType[]>(
    'grillItems', 
    defaultGrillItems
  );
  
  const [grillItems, setGrillItems] = useState<GrillItemType[]>(savedItems);
  const [selectedItems, setSelectedItems] = useState<GrillItemType[]>([]);
  const [timeline, setTimeline] = useState<Timeline | null>(null);

  // Sync state with localStorage when savedItems changes
  useEffect(() => {
    setGrillItems(savedItems);
  }, [savedItems]);

  const toggleItemSelection = useCallback((item: GrillItemType, selected: boolean) => {
    setSelectedItems(prev => {
      if (selected) {
        return [...prev, item];
      } else {
        return prev.filter(i => i.id !== item.id);
      }
    });
  }, []);

  const addCustomItem = useCallback((item: GrillItemType) => {
    // Add to items list
    setSavedItems(prev => [...prev, item]);
    
    // Also select the new item
    setSelectedItems(prev => [...prev, item]);
  }, [setSavedItems]);

  const calculateTimeline = useCallback(() => {
    if (selectedItems.length === 0) {
      setTimeline(null);
      return;
    }

    // Calculate total cooking time for each item
    const itemsWithTimes = selectedItems.map(item => {
      let totalTime = 0;
      let flips: number[] = [];

      // Special case for items with different cook times for different sides
      if (item.cookTimeSecondSide) {
        totalTime = item.cookTimePerSide + item.cookTimeSecondSide;
        flips = [item.cookTimePerSide];
      } else {
        // Regular items with same cook time per side
        const timePerSide = item.cookTimePerSide;
        totalTime = timePerSide * item.sides;
        
        // Calculate flip times
        if (item.sides > 1) {
          for (let i = 1; i < item.sides; i++) {
            flips.push(timePerSide * i);
          }
        }
      }

      return {
        ...item,
        totalTime,
        flips
      };
    });

    // Sort by total cooking time (descending)
    itemsWithTimes.sort((a, b) => b.totalTime - a.totalTime);

    // Longest cooking time will determine our end point
    const longestTime = itemsWithTimes[0].totalTime;

    // Calculate start time for each item so they all finish at the same time
    const timelineItems = itemsWithTimes.map(item => {
      const startDelay = longestTime - item.totalTime;
      return {
        ...item,
        startTime: startDelay,
        endTime: startDelay + item.totalTime,
        flipTimes: item.flips.map(flipTime => startDelay + flipTime)
      };
    });

    setTimeline({
      items: timelineItems,
      totalTime: longestTime
    });
  }, [selectedItems]);

  return (
    <GrillItemsContext.Provider
      value={{
        grillItems,
        selectedItems,
        toggleItemSelection,
        addCustomItem,
        timeline,
        calculateTimeline
      }}
    >
      {children}
    </GrillItemsContext.Provider>
  );
}

export function useGrillItems() {
  const context = useContext(GrillItemsContext);
  if (context === undefined) {
    throw new Error("useGrillItems must be used within a GrillItemsProvider");
  }
  return context;
}


