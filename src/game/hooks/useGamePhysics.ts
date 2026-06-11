/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useCallback } from 'react';
import { PlayerState, JoystickState } from '../types';

export function useGamePhysics() {
  const playerRef = useRef<PlayerState>({
    x: 500,
    y: 500,
    vx: 0,
    vy: 0,
    radius: 20,
    speed: 6,
    targetX: 500,
    targetY: 500,
    orbitAngle: 0,
    eyeExpression: 'Idle',
  });

  const updatePhysics = useCallback((
    keysPressed: { [key: string]: boolean },
    joystick: JoystickState,
    canvasWidth: number,
    canvasHeight: number,
    onSpendDaylight: (amount: number) => void,
    spawnParticles: (x: number, y: number, color: string, count: number) => void
  ) => {
    const player = playerRef.current;
    let moveX = 0;
    let moveY = 0;

    // Keyboard movement
    if (keysPressed['w'] || keysPressed['arrowup']) moveY -= 1;
    if (keysPressed['s'] || keysPressed['arrowdown']) moveY += 1;
    if (keysPressed['a'] || keysPressed['arrowleft']) moveX -= 1;
    if (keysPressed['d'] || keysPressed['arrowright']) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const length = Math.hypot(moveX, moveY);
      player.vx = (moveX / length) * player.speed;
      player.vy = (moveY / length) * player.speed;
      player.targetX = player.x + player.vx;
      player.targetY = player.y + player.vy;
    } else if (joystick.active) {
      player.vx = joystick.vx * player.speed;
      player.vy = joystick.vy * player.speed;
      player.targetX = player.x + player.vx;
      player.targetY = player.y + player.vy;
    } else {
      const dx = player.targetX - player.x;
      const dy = player.targetY - player.y;
      const distance = Math.hypot(dx, dy);

      if (distance > 4) {
        player.vx = (dx / distance) * player.speed;
        player.vy = (dy / distance) * player.speed;
      } else {
        player.vx = 0;
        player.vy = 0;
        player.x = player.targetX;
        player.y = player.targetY;
      }
    }

    player.x += player.vx;
    player.y += player.vy;

    // Bounds check
    const minLimit = 80;
    const maxLimit = 920;
    if (player.x < minLimit) { player.x = minLimit; player.targetX = minLimit; }
    if (player.x > maxLimit) { player.x = maxLimit; player.targetX = maxLimit; }
    if (player.y < minLimit) { player.y = minLimit; player.targetY = minLimit; }
    if (player.y > maxLimit) { player.y = maxLimit; player.targetY = maxLimit; }

    // Movement penalties and particles
    if (Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1) {
      onSpendDaylight(0.015);
      if (Math.random() < 0.04) {
        spawnParticles(player.x, player.y + 10, 'rgba(255, 255, 255, 0.4)', 1);
      }
    }

    // Time decay
    onSpendDaylight(0.005);

    player.orbitAngle += 0.04;
  }, []);

  return {
    playerRef,
    updatePhysics
  };
}
