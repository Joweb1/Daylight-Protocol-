/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { PlayerState, JoystickState } from '../types';

export function useGameInput(onInteract: () => void) {
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const joystickRef = useRef<JoystickState>({
    active: false,
    startX: 0,
    startY: 0,
    curX: 0,
    curY: 0,
    vx: 0,
    vy: 0,
  });

  const handleJoystickStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const touch = 'touches' in e ? e.touches[0] : e;
    joystickRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      curX: touch.clientX,
      curY: touch.clientY,
      vx: 0,
      vy: 0,
    };
  }, []);

  const handleJoystickMove = useCallback((e: TouchEvent | MouseEvent) => {
    const joyst = joystickRef.current;
    if (!joyst.active) return;

    const touch = 'touches' in e ? e.touches[0] : e;
    joyst.curX = touch.clientX;
    joyst.curY = touch.clientY;

    const dx = joyst.curX - joyst.startX;
    const dy = joyst.curY - joyst.startY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 30;

    if (dist > 0) {
      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);
      const intensity = clampedDist / maxRadius;
      joyst.vx = Math.cos(angle) * intensity;
      joyst.vy = Math.sin(angle) * intensity;
    } else {
      joyst.vx = 0;
      joyst.vy = 0;
    }
  }, []);

  const handleJoystickEnd = useCallback(() => {
    const joyst = joystickRef.current;
    if (joyst.active) {
      const dragDistance = Math.hypot(joyst.curX - joyst.startX, joyst.curY - joyst.startY);
      if (dragDistance < 10) {
        onInteract();
      }
    }
    joyst.active = false;
    joyst.vx = 0;
    joyst.vy = 0;
  }, [onInteract]);

  // NEW: Mouse/Touch Canvas Control Logic
  const bindCanvasInteraction = useCallback((canvas: HTMLCanvasElement, playerRef: React.MutableRefObject<PlayerState>) => {
    const handlePointerAction = (e: MouseEvent | TouchEvent) => {
      // Ignore if clicking on joystick area or if joystick is active
      if (joystickRef.current.active) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Convert screen coords to canvas coords (1000x1000)
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      // Only set target if inside the viewport area (80-920)
      if (x >= 0 && x <= 1000 && y >= 0 && y <= 1000) {
        playerRef.current.targetX = x;
        playerRef.current.targetY = y;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      // Check if target is actually the canvas
      if (e.target === canvas) handlePointerAction(e);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.target === canvas) handlePointerAction(e);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchstart', onTouchStart);
    };
  }, []);

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (joystickRef.current.active) handleJoystickMove(e);
    };
    const onTouchEnd = () => handleJoystickEnd();

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('mousemove', handleJoystickMove);
    window.addEventListener('mouseup', handleJoystickEnd);

    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('mousemove', handleJoystickMove);
      window.removeEventListener('mouseup', handleJoystickEnd);
    };
  }, [handleJoystickMove, handleJoystickEnd]);

  return {
    keysPressed,
    joystickRef,
    handleJoystickStart,
    bindCanvasInteraction
  };
}
