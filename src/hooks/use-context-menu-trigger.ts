import { useState, useCallback, useRef, useEffect } from "react";

interface UseContextMenuTriggerOptions {
  onOpen?: () => void;
  longPressDuration?: number;
}

export function useContextMenuTrigger(
  options: UseContextMenuTriggerOptions = {}
) {
  const { onOpen, longPressDuration = 500 } = options;
  const [isOpen, setIsOpen] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsOpen(true);
      onOpen?.();
    },
    [onOpen]
  );

  const handleTouchStart = useCallback(
    () => {
      longPressTriggeredRef.current = false;
      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        setIsOpen(true);
        onOpen?.();
        // Haptic feedback on mobile
        if ("vibrate" in navigator) {
          navigator.vibrate(50);
        }
      }, longPressDuration);
    },
    [longPressDuration, onOpen]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    // Cancel long press if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen((prev) => !prev);
      if (!isOpen) {
        onOpen?.();
      }
    },
    [isOpen, onOpen]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    isOpen,
    setIsOpen,
    triggerProps: {
      onContextMenu: handleContextMenu,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchMove: handleTouchMove,
    },
    buttonProps: {
      onClick: handleButtonClick,
    },
  };
}
