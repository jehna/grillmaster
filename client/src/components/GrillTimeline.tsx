import { Button } from "@/components/ui/button";
import { useGrillItems } from "@/hooks/useGrillItems";
import { useRef, useEffect, useState } from "react";
import { GrillTimerModal } from "./GrillTimerModal";

export function GrillTimeline() {
  const { selectedItems, timeline, calculateTimeline } = useGrillItems();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isGrillingActive, setIsGrillingActive] = useState(false);

  useEffect(() => {
    // Calculate timeline whenever selectedItems changes
    calculateTimeline();
    
    // If no items selected, ensure we clear the timeline display
    if (selectedItems.length === 0 && timelineRef.current) {
      const contentEl = timelineRef.current;
      contentEl.innerHTML = '';
      
      const emptyState = document.createElement('div');
      emptyState.className = 'text-center text-gray-400 absolute inset-0 flex items-center justify-center';
      emptyState.innerHTML = '<p>Valitse ensin grillattavat tuotteet</p>';
      contentEl.appendChild(emptyState);
    }
  }, [selectedItems, calculateTimeline]);

  useEffect(() => {
    if (!timeline || !timelineRef.current) return;
    
    const contentEl = timelineRef.current;
    contentEl.innerHTML = '';

    // Skip rendering if no items selected
    if (timeline.items.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'text-center text-gray-400 absolute inset-0 flex items-center justify-center';
      emptyState.innerHTML = '<p>Valitse ensin grillattavat tuotteet</p>';
      contentEl.appendChild(emptyState);
      return;
    }

    // Calculate a responsive pixels per minute value
    const containerWidth = contentEl.parentElement?.clientWidth || 300;
    const minWidth = Math.max(containerWidth - 40, 300);
    const minPixelsPerMinute = 40; // Minimum size to keep visibility
    
    // Calculate how many pixels we have per minute, ensure it's at least minPixelsPerMinute
    const pixelsPerMinute = Math.max(
      minPixelsPerMinute,
      Math.min(60, minWidth / (timeline.totalTime || 1))
    );
    
    const timelineWidth = (timeline.totalTime * pixelsPerMinute) + 60; // Add padding
    contentEl.style.width = `${timelineWidth}px`;

    // Create time markers every minute
    for (let i = 0; i <= Math.ceil(timeline.totalTime); i++) {
      const tick = document.createElement('div');
      tick.className = 'timeline-tick';
      tick.style.left = `${i * pixelsPerMinute}px`;
      
      const label = document.createElement('div');
      label.className = 'text-xs text-gray-500 absolute';
      label.style.left = `${i * pixelsPerMinute}px`;
      label.style.top = '0';
      label.style.transform = 'translateX(-50%)';
      label.textContent = `${i}min`;
      
      contentEl.appendChild(tick);
      contentEl.appendChild(label);
    }

    // Add each item to the timeline
    timeline.items.forEach((item, index) => {
      const itemPosition = 30 + (index * 25); // Vertical position
      
      // Create the item bar
      const itemBar = document.createElement('div');
      itemBar.className = 'timeline-item';
      
      // Set color based on type
      if (item.type === 'veggie') {
        itemBar.className += ' bg-[#84cc16]';
      } else if (item.type === 'meat') {
        itemBar.className += ' bg-[#ef4444]';
      } else if (item.type === 'fish') {
        itemBar.className += ' bg-[#3b82f6]';
      }
      
      itemBar.style.left = `${item.startTime * pixelsPerMinute}px`;
      itemBar.style.width = `${item.totalTime * pixelsPerMinute}px`;
      itemBar.style.top = `${itemPosition}px`;
      itemBar.textContent = item.name;
      
      contentEl.appendChild(itemBar);
      
      // Add flip indicators
      item.flipTimes.forEach(flipTime => {
        const flipIndicator = document.createElement('div');
        flipIndicator.className = 'flip-indicator';
        if (item.type === 'veggie') {
          flipIndicator.className += ' text-[#84cc16] border-[#84cc16]';
          flipIndicator.style.borderColor = '#84cc16';
        } else if (item.type === 'meat') {
          flipIndicator.className += ' text-[#ef4444] border-[#ef4444]';
          flipIndicator.style.borderColor = '#ef4444';
        } else if (item.type === 'fish') {
          flipIndicator.className += ' text-[#3b82f6] border-[#3b82f6]';
          flipIndicator.style.borderColor = '#3b82f6';
        }
        
        flipIndicator.style.left = `${flipTime * pixelsPerMinute}px`;
        flipIndicator.style.top = `${itemPosition}px`;
        
        // Add flip icon
        const flipIcon = document.createElement('span');
        flipIcon.className = 'material-icons text-xs';
        flipIcon.textContent = 'flip';
        flipIndicator.appendChild(flipIcon);
        
        contentEl.appendChild(flipIndicator);
      });
    });
  }, [timeline]);

  const handleStartGrilling = () => {
    setIsGrillingActive(true);
  };

  const handleStopGrilling = () => {
    setIsGrillingActive(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="p-4 bg-[#fdba74] text-neutral-dark">
          <h2 className="text-lg font-bold flex items-center">
            <span className="material-icons mr-2">schedule</span>
            Grilliaikataulu
          </h2>
        </div>
        
        <div className="timeline-container h-40 bg-gray-50 relative">
          <div ref={timelineRef} className="relative h-full w-full p-2" />
        </div>
        
        <div className="p-4 text-center">
          <Button 
            variant="default"
            size="lg"
            onClick={handleStartGrilling}
            disabled={selectedItems.length === 0}
            className={`bg-primary text-white py-4 px-8 rounded-full text-xl font-bold shadow-lg w-full max-w-sm ${selectedItems.length > 0 ? 'pulse' : ''}`}
          >
            <span className="material-icons align-middle mr-2">play_arrow</span>
            Aloita grillaus
          </Button>
        </div>
      </div>

      <GrillTimerModal 
        isOpen={isGrillingActive} 
        onClose={handleStopGrilling} 
      />
    </>
  );
}
