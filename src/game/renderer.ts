/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerState, GameNPC, GameChallengeNode, Particle } from './types';
import { DaylightStage, SimulationStats } from '../types';

export const renderGame = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentStage: DaylightStage,
  stats: SimulationStats,
  player: PlayerState,
  npcs: GameNPC[],
  challengeNodes: GameChallengeNode[],
  particles: Particle[],
  activePopup: string | null
) => {
  if (activePopup !== null) {
    ctx.fillStyle = 'rgba(16, 9, 6, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff9d6c';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SIMULATION PAUSED', 500, 480);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px monospace';
    ctx.fillText(`[ CONSOLE MENU: ${activePopup.toUpperCase()} ]`, 500, 530);
    ctx.fillText('CLOSE COVER POPUP TO RESUME DAYLIGHT STABILIZATION', 500, 560);
    return;
  }

  // A. Background & Grid
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#110906';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let spotColor = 'rgba(245, 158, 11, 0.04)';
  if (currentStage === 'Morning') spotColor = 'rgba(244, 114, 182, 0.04)';
  else if (currentStage === 'Sunset') spotColor = 'rgba(168, 85, 247, 0.04)';
  else if (currentStage === 'Night') spotColor = 'rgba(6, 182, 212, 0.02)';

  ctx.fillStyle = spotColor;
  ctx.fillRect(80, 80, 840, 840);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  const step = 50;
  for (let i = step; i < canvas.width; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 15;
  ctx.strokeRect(80, 80, 840, 840);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.strokeRect(90, 90, 820, 820);

  ctx.font = '11px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillText('SIMULATION_VIEWPORT // CALIBR_STABLE', 110, 120);
  ctx.fillText(`CLK_LOCK_UNIT: ${stats.elapsedCycles}_MAIN`, 110, 140);
  ctx.fillText(`STABILITY: 98% // SECTOR_8_ECHO_GRID`, 680, 120);

  // B. Challenges
  challengeNodes.forEach(node => {
    const pulse = 1 + Math.sin(player.orbitAngle * 2) * 0.1;
    const clr = node.completed ? '#10b981' : '#f59e0b';
    ctx.strokeStyle = clr;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(node.x, node.y - 28 * pulse);
    ctx.lineTo(node.x + 28 * pulse, node.y);
    ctx.lineTo(node.x, node.y + 28 * pulse);
    ctx.lineTo(node.x - 28 * pulse, node.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = node.completed ? 'rgba(16, 185, 129, 0.45)' : 'rgba(245, 158, 11, 0.35)';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(node.name, node.x, node.y - 42);

    const dist = Math.hypot(player.x - node.x, player.y - node.y);
    if (dist < 85) {
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#ffb300';
      ctx.fillText('[E] ANALYZE CORE', node.x, node.y + 45);
      ctx.strokeStyle = 'rgba(255, 179, 0, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 55, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  // C. NPCs
  npcs.forEach(npc => {
    ctx.strokeStyle = npc.color;
    ctx.lineWidth = 3;
    if (npc.shape === 'eye') {
      ctx.beginPath(); ctx.arc(npc.x, npc.y, 35, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath(); ctx.arc(npc.x, npc.y, 12 + Math.sin(player.orbitAngle) * 4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(npc.x, npc.y - 30);
      ctx.bezierCurveTo(npc.x + 22, npc.y - 15, npc.x + 22, npc.y + 15, npc.x, npc.y + 30);
      ctx.bezierCurveTo(npc.x - 22, npc.y + 15, npc.x - 22, npc.y - 15, npc.x, npc.y - 30);
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = 'rgba(74, 243, 255, 0.15)'; ctx.fill();
    }
    const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
    if (dist < npc.interactionRadius + 15) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`TALK TO ${npc.name.toUpperCase()}`, npc.x, npc.y - 45);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(npc.x, npc.y, npc.interactionRadius + 15, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = npc.color; ctx.font = 'bold 10px monospace'; ctx.fillText(npc.name, npc.x, npc.y + 45);
  });

  // D. Player
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4.5;
  const px = player.x;
  const py = player.y;
  ctx.beginPath(); ctx.arc(px, py - 25, 13, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#110906'; ctx.fill();
  ctx.fillStyle = '#ffffff';
  if (player.eyeExpression === 'Determined') {
    ctx.fillRect(px - 6, py - 28, 3, 2); ctx.fillRect(px + 3, py - 28, 3, 2);
  } else if (player.eyeExpression === 'Reflecting') {
    ctx.beginPath(); ctx.arc(px - 4, py - 25, 2.5, 0, Math.PI); ctx.arc(px + 4, py - 25, 2.5, 0, Math.PI); ctx.fill();
  } else if (player.eyeExpression === 'Celebrating') {
    ctx.font = '11px sans-serif'; ctx.fillText('^', px - 6, py - 22); ctx.fillText('^', px + 3, py - 22);
  } else {
    ctx.beginPath(); ctx.arc(px - 4, py - 25, 2.5, 0, Math.PI * 2); ctx.arc(px + 4, py - 25, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.beginPath(); ctx.moveTo(px, py - 12); ctx.lineTo(px, py + 15); ctx.stroke();
  const moveSway = Math.sin(player.orbitAngle * 2.5) * (player.vx !== 0 ? 12 : 3);
  ctx.beginPath(); ctx.moveTo(px - 22, py - 15 + moveSway * 0.2); ctx.lineTo(px, py - 11); ctx.lineTo(px + 22, py - 15 - moveSway * 0.2); ctx.stroke();
  const walkSway = Math.sin(player.orbitAngle * 4) * (player.vx !== 0 ? 18 : 1);
  ctx.beginPath(); ctx.moveTo(px, py + 15); ctx.lineTo(px - 12 + walkSway * 0.1, py + 38 + walkSway); ctx.moveTo(px, py + 15); ctx.lineTo(px + 12 - walkSway * 0.1, py + 38 - walkSway); ctx.stroke();
  const dustOrbitRadius = 35 + Math.sin(player.orbitAngle) * 5;
  for (let j = 0; j < 8; j++) {
    const offsetAngle = player.orbitAngle + (j * Math.PI * 2) / 8;
    const dustX = px + Math.cos(offsetAngle) * dustOrbitRadius;
    const dustY = py + Math.sin(offsetAngle) * dustOrbitRadius * 0.5 - 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.beginPath(); ctx.arc(dustX, dustY, 2, 0, Math.PI * 2); ctx.fill();
  }

  // E. Particles
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    const opacity = 1 - p.life / p.maxLife;
    ctx.globalAlpha = opacity;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1.0;
  });
};
