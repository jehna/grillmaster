import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGrillItems } from "@/hooks/useGrillItems";
import { useEffect, useState, useRef } from "react";

interface GrillTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GrillTimerModal({ isOpen, onClose }: GrillTimerModalProps) {
  const { timeline } = useGrillItems();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingTime, setRemainingTime] = useState("00:00");
  const [currentAction, setCurrentAction] = useState("Valmistaudu grillaukseen");
  const [nextActions, setNextActions] = useState<Array<{ time: string; message: string; icon: string }>>([
    { time: "00:00", message: "Odota...", icon: "hourglass_empty" }
  ]);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Initialize timer when modal opens
  useEffect(() => {
    if (isOpen && timeline) {
      startTimeRef.current = Date.now();
      setElapsedSeconds(0);
      setIsComplete(false);

      // Convert timeline to seconds for precision
      const timelineInSeconds = {
        items: timeline.items.map(item => ({
          ...item,
          startTime: item.startTime * 60,
          endTime: item.endTime * 60,
          flipTimes: item.flipTimes.map(time => time * 60),
          totalTime: item.totalTime * 60
        })),
        totalTime: timeline.totalTime * 60
      };

      // Start timer
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
        setElapsedSeconds(elapsed);

        // Calculate remaining time
        const remaining = Math.max(0, timelineInSeconds.totalTime - elapsed);
        setRemainingTime(formatTime(remaining));

        // Check if grilling is complete
        if (elapsed >= timelineInSeconds.totalTime) {
          setCurrentAction("Grillaus valmis! Hyvää ruokahalua!");
          setNextActions([{
            time: "00:00",
            message: "Kaikki valmista!",
            icon: "check_circle"
          }]);
          setIsComplete(true);

          // Play completion notification
          try {
            const audio = new Audio();
            audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3';
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.log('Audio playback failed:', error);
              });
            }
          } catch (e) {
            console.log('Audio notification not supported');
          }

          // Clear interval
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [isOpen, timeline]);

  // Calculate and update actions based on elapsed time
  useEffect(() => {
    if (!timeline || !isOpen) return;

    // Find all upcoming actions (start, flip, remove)
    const allActions: Array<{
      time: number;
      type: 'start' | 'flip' | 'end';
      item: typeof timeline.items[0];
      message: string;
    }> = [];
    
    timeline.items.forEach(item => {
      // Add item start
      allActions.push({
        time: item.startTime * 60,
        type: 'start',
        item,
        message: `Lisää ${item.name} grilliin`
      });
      
      // Add flips
      item.flipTimes.forEach(flipTime => {
        allActions.push({
          time: flipTime * 60,
          type: 'flip',
          item,
          message: `Käännä ${item.name}`
        });
      });
      
      // Add removal
      allActions.push({
        time: item.endTime * 60,
        type: 'end',
        item,
        message: `Poista ${item.name} grillistä`
      });
    });
    
    // Sort actions by time
    allActions.sort((a, b) => a.time - b.time);
    
    // Find current action
    const currentActions = allActions.filter(action => {
      return Math.abs(action.time - elapsedSeconds) < 3; // Within 3 seconds
    });
    
    if (currentActions.length > 0 && !isComplete) {
      const action = currentActions[0];
      setCurrentAction(action.message);
      
      // Play notification sound
      try {
        const audio = new Audio();
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3';
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Audio playback failed:', error);
          });
        }
      } catch (e) {
        console.log('Audio notification not supported');
      }
    }
    
    // Find next action
    const upcomingActions = allActions.filter(action => action.time > elapsedSeconds);
    
    if (upcomingActions.length > 0 && !isComplete) {
      const nextAct = upcomingActions[0];
      const timeUntilAction = nextAct.time - elapsedSeconds;
      const timeUntilFormatted = formatTime(timeUntilAction);
      
      let actionText = 'lisää';
      if (nextAct.type === 'flip') actionText = 'käännä';
      else if (nextAct.type === 'end') actionText = 'poista';
      
      // Group actions that happen at the same time
      // Find all actions that occur at the same time
      const sameTimeActions = upcomingActions.filter(action => 
        Math.abs(action.time - nextAct.time) < 5 // Within 5 seconds
      );
      
      // Create the next actions list
      const actionsToShow = sameTimeActions.map(action => {
        const timeUntil = action.time - elapsedSeconds;
        const timeFormatted = formatTime(timeUntil);
        
        let actionText = 'lisää';
        if (action.type === 'flip') actionText = 'käännä';
        else if (action.type === 'end') actionText = 'poista';
        
        let icon = 'add_circle';
        if (action.type === 'flip') icon = 'flip';
        else if (action.type === 'end') icon = 'remove_circle';
        
        return {
          time: timeFormatted,
          message: `${actionText} ${action.item.name}`,
          icon
        };
      });
      
      setNextActions(actionsToShow);
    }
  }, [elapsedSeconds, timeline, isOpen, isComplete]);

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !timeline) return null;

  const dialogDescriptionId = "timer-dialog-description";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md p-0 bg-black bg-opacity-95 text-white max-h-full overflow-hidden flex flex-col h-[90vh]"
        aria-describedby={dialogDescriptionId}
        hideCloseButton={true}
      >
        <DialogTitle className="sr-only">Grillausajastin</DialogTitle>
        <DialogDescription id={dialogDescriptionId} className="sr-only">
          Grillausajastin näyttää reaaliaikaisia ohjeita, milloin lisätä, kääntää tai poistaa eri ruoat grillistä.
        </DialogDescription>
        <div className="p-6 flex-grow flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Grillausajastin</h2>
            <Button 
              variant="destructive" 
              size="icon" 
              className="rounded-full" 
              onClick={onClose}
            >
              <span className="material-icons">close</span>
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <div className="text-5xl font-bold mb-2">{remainingTime}</div>
            <div className={`text-xl ${elapsedSeconds % 6 < 3 ? 'shake' : ''}`}>{currentAction}</div>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <div className="space-y-4">
              {timeline.items.map(item => {
                let status = "Odottaa";
                let statusClass = "text-gray-400";
                
                const startTimeInSeconds = item.startTime * 60;
                const endTimeInSeconds = item.endTime * 60;
                
                if (elapsedSeconds >= startTimeInSeconds && elapsedSeconds < endTimeInSeconds) {
                  status = "Grillautuu";
                  statusClass = "text-primary grilling-animation";
                  
                  // Check if currently flipping (increased to 45 seconds)
                  const isFlipping = item.flipTimes.some(flipTime => {
                    const timeDiff = (flipTime * 60) - elapsedSeconds;
                    // Show flip indicator from 15 seconds before to 30 seconds after flip time
                    return timeDiff <= 30 && timeDiff >= -15;
                  });
                  
                  if (isFlipping) {
                    status = "Käännä nyt!";
                    statusClass = "text-yellow-400 animate-pulse font-bold";
                  }
                } else if (elapsedSeconds >= endTimeInSeconds) {
                  status = "Valmis";
                  statusClass = "text-green-500";
                }
                
                // Determine icon based on type
                let iconClass = "text-[#84cc16]";
                let iconName = "eco";
                
                if (item.type === "meat") {
                  iconClass = "text-[#ef4444]";
                  iconName = "restaurant";
                } else if (item.type === "fish") {
                  iconClass = "text-[#3b82f6]";
                  iconName = "set_meal";
                }
                
                return (
                  <div 
                    key={item.id} 
                    className="bg-neutral-dark bg-opacity-30 p-3 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className={`material-icons ${iconClass} mr-2`}>{iconName}</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className={statusClass}>{status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-primary bg-opacity-20 rounded-lg">
            <h3 className="font-bold mb-2">Seuraavat toimenpiteet:</h3>
            <div className="space-y-2">
              {nextActions.map((action, index) => (
                <div key={index} className="flex items-center">
                  <span className="material-icons mr-2">
                    {action.icon}
                  </span>
                  <span>{action.time} - {action.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
