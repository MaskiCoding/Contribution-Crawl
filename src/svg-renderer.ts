import { Cell, Position, Battle, ColorTheme, MonsterSpawn, WallBreak } from './types';

const CELL_SIZE = 11;
const CELL_GAP = 2;
const CELL_TOTAL = CELL_SIZE + CELL_GAP;

// Ghost colors (Pac-Man style)
const GHOST_COLORS = {
  red: '#ff0000',      // Blinky
  pink: '#ffb8ff',     // Pinky  
  cyan: '#00ffff',     // Inky
  orange: '#ffb852',   // Clyde
};

function cellToPixel(pos: Position, offsetY: number = 0): { x: number; y: number } {
  return {
    x: pos.x * CELL_TOTAL + CELL_GAP + CELL_SIZE / 2,
    y: pos.y * CELL_TOTAL + CELL_GAP + CELL_SIZE / 2 + offsetY,
  };
}

function renderGhost(cx: number, cy: number, size: number, color: string, id: string): string {
  const r = size * 0.45;
  const eyeOffset = r * 0.35;
  const eyeR = r * 0.3;
  const pupilR = r * 0.15;
  
  // Ghost body path (rounded top, wavy bottom)
  const bodyTop = cy - r;
  const bodyBottom = cy + r * 0.8;
  const waveHeight = r * 0.3;
  
  return `
    <g id="${id}">
      <!-- Ghost body -->
      <path d="
        M ${cx - r} ${cy}
        Q ${cx - r} ${bodyTop} ${cx} ${bodyTop}
        Q ${cx + r} ${bodyTop} ${cx + r} ${cy}
        L ${cx + r} ${bodyBottom}
        Q ${cx + r * 0.7} ${bodyBottom - waveHeight} ${cx + r * 0.5} ${bodyBottom}
        Q ${cx + r * 0.25} ${bodyBottom + waveHeight} ${cx} ${bodyBottom}
        Q ${cx - r * 0.25} ${bodyBottom - waveHeight} ${cx - r * 0.5} ${bodyBottom}
        Q ${cx - r * 0.7} ${bodyBottom + waveHeight} ${cx - r} ${bodyBottom}
        Z
      " fill="${color}">
        <animate attributeName="d" dur="0.3s" repeatCount="indefinite" values="
          M ${cx - r} ${cy} Q ${cx - r} ${bodyTop} ${cx} ${bodyTop} Q ${cx + r} ${bodyTop} ${cx + r} ${cy} L ${cx + r} ${bodyBottom} Q ${cx + r * 0.7} ${bodyBottom - waveHeight} ${cx + r * 0.5} ${bodyBottom} Q ${cx + r * 0.25} ${bodyBottom + waveHeight} ${cx} ${bodyBottom} Q ${cx - r * 0.25} ${bodyBottom - waveHeight} ${cx - r * 0.5} ${bodyBottom} Q ${cx - r * 0.7} ${bodyBottom + waveHeight} ${cx - r} ${bodyBottom} Z;
          M ${cx - r} ${cy} Q ${cx - r} ${bodyTop} ${cx} ${bodyTop} Q ${cx + r} ${bodyTop} ${cx + r} ${cy} L ${cx + r} ${bodyBottom} Q ${cx + r * 0.7} ${bodyBottom + waveHeight} ${cx + r * 0.5} ${bodyBottom} Q ${cx + r * 0.25} ${bodyBottom - waveHeight} ${cx} ${bodyBottom} Q ${cx - r * 0.25} ${bodyBottom + waveHeight} ${cx - r * 0.5} ${bodyBottom} Q ${cx - r * 0.7} ${bodyBottom - waveHeight} ${cx - r} ${bodyBottom} Z;
          M ${cx - r} ${cy} Q ${cx - r} ${bodyTop} ${cx} ${bodyTop} Q ${cx + r} ${bodyTop} ${cx + r} ${cy} L ${cx + r} ${bodyBottom} Q ${cx + r * 0.7} ${bodyBottom - waveHeight} ${cx + r * 0.5} ${bodyBottom} Q ${cx + r * 0.25} ${bodyBottom + waveHeight} ${cx} ${bodyBottom} Q ${cx - r * 0.25} ${bodyBottom - waveHeight} ${cx - r * 0.5} ${bodyBottom} Q ${cx - r * 0.7} ${bodyBottom + waveHeight} ${cx - r} ${bodyBottom} Z
        "/>
      </path>
      <!-- Eyes -->
      <ellipse cx="${cx - eyeOffset}" cy="${cy - r * 0.1}" rx="${eyeR}" ry="${eyeR * 1.2}" fill="white"/>
      <ellipse cx="${cx + eyeOffset}" cy="${cy - r * 0.1}" rx="${eyeR}" ry="${eyeR * 1.2}" fill="white"/>
      <!-- Pupils -->
      <circle cx="${cx - eyeOffset + pupilR * 0.3}" cy="${cy - r * 0.05}" r="${pupilR}" fill="#2020ff">
        <animate attributeName="cx" dur="2s" repeatCount="indefinite" values="${cx - eyeOffset - pupilR * 0.5};${cx - eyeOffset + pupilR * 0.5};${cx - eyeOffset - pupilR * 0.5}"/>
      </circle>
      <circle cx="${cx + eyeOffset + pupilR * 0.3}" cy="${cy - r * 0.05}" r="${pupilR}" fill="#2020ff">
        <animate attributeName="cx" dur="2s" repeatCount="indefinite" values="${cx + eyeOffset - pupilR * 0.5};${cx + eyeOffset + pupilR * 0.5};${cx + eyeOffset - pupilR * 0.5}"/>
      </circle>
    </g>
  `;
}

// Base64 encoded PlayerRun.gif sprite (animated!)
const HERO_SPRITE_BASE64 = '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';
const HERO_SPRITE_TYPE = 'gif';

// Base64 encoded Slash animation (color4 - orange/fire)
const SLASH_SPRITE_BASE64 = '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';
const SLASH_SPRITE_TYPE = 'gif';

function renderHero(size: number, theme: ColorTheme): string {
  // Use the actual animated GIF sprite, scaled to fit the cell
  const spriteWidth = 16;
  const spriteHeight = 17;
  const scale = (size * 1.2) / spriteWidth; // Scale to fit cell
  const scaledWidth = spriteWidth * scale;
  const scaledHeight = spriteHeight * scale;
  
  // Position so feet are at the bottom of the cell
  // Cell center is at 0,0, bottom edge is at size/2
  // We want feet (bottom of sprite) at bottom of cell
  const yOffset = (size / 2) - scaledHeight; // Feet at bottom of cell
  
  return `
    <g>
      <image 
        href="data:image/${HERO_SPRITE_TYPE};base64,${HERO_SPRITE_BASE64}"
        x="${-scaledWidth / 2}"
        y="${yOffset}"
        width="${scaledWidth}"
        height="${scaledHeight}"
        image-rendering="pixelated"
        style="image-rendering: pixelated; image-rendering: crisp-edges;"
      />
    </g>
  `;
}

function renderSlashEffect(size: number, delay: number, totalDuration: number, direction: { dx: number; dy: number }): string {
  // GIF-based slash animation
  const slashSize = size * 2.5;
  
  // The GIF plays for about 0.35s, show it for that duration
  const slashDuration = 0.35;
  
  // Calculate normalized times (0-1 range)
  // battleStart: when slash becomes visible
  // battleEnd: when slash becomes hidden again
  const battleStart = delay / totalDuration;
  const battleEnd = (delay + slashDuration) / totalDuration;
  
  // Ensure times are valid and strictly ascending
  const t1 = Math.max(0.001, Math.min(0.99, battleStart));
  const t2 = Math.max(t1 + 0.01, Math.min(0.999, battleEnd));
  
  // Calculate rotation based on attack direction
  let rotation = 0;
  if (direction.dx > 0) rotation = -45;       // attacking right
  else if (direction.dx < 0) rotation = 135;  // attacking left
  else if (direction.dy > 0) rotation = 45;   // attacking down
  else if (direction.dy < 0) rotation = -135; // attacking up
  
  return `
    <!-- Pixel art slash animation -->
    <g transform="rotate(${rotation})">
      <image 
        href="data:image/${SLASH_SPRITE_TYPE};base64,${SLASH_SPRITE_BASE64}"
        x="${-slashSize / 2}"
        y="${-slashSize / 2}"
        width="${slashSize}"
        height="${slashSize}"
        image-rendering="pixelated"
        style="image-rendering: pixelated; image-rendering: crisp-edges;"
        opacity="0"
      >
        <animate attributeName="opacity" 
          values="0;1;0" 
          keyTimes="0;${t1.toFixed(4)};${t2.toFixed(4)}"
          dur="${totalDuration.toFixed(2)}s" 
          repeatCount="indefinite"
          calcMode="discrete"/>
      </image>
    </g>
  `;
}

export function generateSVG(
  grid: Cell[][],
  path: Position[],
  battles: Battle[],
  username: string,
  theme: ColorTheme,
  monsterSpawns: MonsterSpawn[] = [],
  wallBreaks: WallBreak[] = []
): string {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  
  const width = cols * CELL_TOTAL + CELL_GAP;
  const height = rows * CELL_TOTAL + CELL_GAP + 35;
  const offsetY = 30;
  
  // Animation timing
  const moveTime = 0.25; // seconds per step (slower movement)
  const battleTime = 0.8; // seconds per battle
  const wallBreakTime = 0.5; // seconds to break a wall
  
  // Build segments with pauses for battles and wall breaks
  const segments: { start: Position; end: Position; duration: number; delay: number; hasBattleBefore: boolean; hasWallBreakBefore: boolean }[] = [];
  const battleEvents: { position: Position; heroPosition: Position; delay: number; direction: { dx: number; dy: number } }[] = [];
  const wallBreakEvents: { position: Position; delay: number; direction: { dx: number; dy: number } }[] = [];
  
  let currentDelay = 0;
  
  // Use Sets to track which positions have been processed (prevents double slashes)
  const battlePositions = new Set(battles.map(b => `${b.position.x},${b.position.y}`));
  const wallBreakPositions = new Set(wallBreaks.map(w => `${w.position.x},${w.position.y}`));
  const processedBattles = new Set<string>();
  const processedWallBreaks = new Set<string>();
  
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    const key = `${end.x},${end.y}`;
    
    // Calculate direction
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Check if next cell needs wall break (only process once)
    const hasWallBreak = wallBreakPositions.has(key) && !processedWallBreaks.has(key);
    
    if (hasWallBreak) {
      wallBreakEvents.push({
        position: end,
        delay: currentDelay,
        direction: { dx, dy },
      });
      currentDelay += wallBreakTime;
      processedWallBreaks.add(key);
    }
    
    // Check if next cell has a monster - battle happens BEFORE moving (only process once)
    const hasBattle = battlePositions.has(key) && !processedBattles.has(key);
    
    if (hasBattle) {
      // Battle happens while hero is still on current cell
      battleEvents.push({
        position: end,        // Ghost position (where slash appears)
        heroPosition: start,  // Hero stays here during battle
        delay: currentDelay,
        direction: { dx, dy },
      });
      currentDelay += battleTime;
      processedBattles.add(key);
    }
    
    // Then move to the cell (ghost is now dead)
    segments.push({
      start,
      end,
      duration: moveTime,
      delay: currentDelay,
      hasBattleBefore: hasBattle,
      hasWallBreakBefore: hasWallBreak,
    });
    
    currentDelay += moveTime;
  }
  
  const totalDuration = currentDelay || 1; // Prevent division by zero
  
  // Build keyframes for hero position with direction tracking
  // We need to create keyframes that make the hero STOP (not slow down) during battles
  const keyframes: { time: number; x: number; y: number; scaleX: number }[] = [];
  let lastDirection = 1; // 1 = right, -1 = left
  
  // Track time through segments
  let currentTime = 0;
  
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const startPx = cellToPixel(seg.start, offsetY);
    const endPx = cellToPixel(seg.end, offsetY);
    
    // Determine direction based on movement (face the direction we're going)
    if (seg.end.x > seg.start.x) {
      lastDirection = 1; // Moving right
    } else if (seg.end.x < seg.start.x) {
      lastDirection = -1; // Moving left
    }
    
    // Calculate pause time before this move
    let pauseTime = 0;
    if (seg.hasWallBreakBefore) pauseTime += wallBreakTime;
    if (seg.hasBattleBefore) pauseTime += battleTime;
    
    // If there's any pause before this move, hero stays put
    if (pauseTime > 0) {
      // Add keyframe at START of pause (hero at start position)
      const pauseStartTime = seg.delay - pauseTime;
      keyframes.push({ time: pauseStartTime / totalDuration, x: startPx.x, y: startPx.y, scaleX: lastDirection });
      // Add keyframe at END of pause (hero still at start position) 
      keyframes.push({ time: (seg.delay - 0.001) / totalDuration, x: startPx.x, y: startPx.y, scaleX: lastDirection });
    }
    
    // Add keyframe at start of this movement segment
    keyframes.push({ time: seg.delay / totalDuration, x: startPx.x, y: startPx.y, scaleX: lastDirection });
    
    // Add keyframe at end of movement (arrived at destination)
    const endTime = seg.delay + seg.duration;
    keyframes.push({ time: endTime / totalDuration, x: endPx.x, y: endPx.y, scaleX: lastDirection });
  }
  
  // Add final position
  if (path.length > 0) {
    const finalPx = cellToPixel(path[path.length - 1], offsetY);
    keyframes.push({ time: 1, x: finalPx.x, y: finalPx.y, scaleX: lastDirection });
  }
  
  // Sort keyframes by time and remove duplicates
  keyframes.sort((a, b) => a.time - b.time);
  const uniqueKeyframes = keyframes.filter((k, i) => i === 0 || k.time > keyframes[i-1].time + 0.0001);
  
  // Generate keyTimes and values strings from unique keyframes
  const keyTimes = uniqueKeyframes.map(k => k.time.toFixed(4)).join(';');
  const scaleXValues = uniqueKeyframes.map(k => `${k.scaleX} 1`).join(';');
  
  // Ghost color assignment
  const ghostColors = Object.values(GHOST_COLORS);
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${theme.background}"/>
  
  <!-- Title -->
  <text x="${width / 2}" y="20" text-anchor="middle" fill="${theme.text}" font-family="monospace" font-size="12" font-weight="bold">
    ${username}'s Contribution Crawl
  </text>
  
  <!-- Dungeon Grid -->
`;

  // Track monsters for battle animations
  const monsterPositions: { x: number; y: number; color: string; id: string }[] = [];
  let monsterIdx = 0;

  // Render grid cells
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      const px = x * CELL_TOTAL + CELL_GAP;
      const py = y * CELL_TOTAL + CELL_GAP + offsetY;
      
      // Check if this wall gets broken
      const wallBreak = wallBreakEvents.find(w => w.position.x === x && w.position.y === y);
      
      if (cell.isWall && !wallBreak) {
        // Wall (contribution) - not broken
        let colorIdx = 0;
        if (cell.contributionLevel === 'FIRST_QUARTILE') colorIdx = 0;
        else if (cell.contributionLevel === 'SECOND_QUARTILE') colorIdx = 1;
        else if (cell.contributionLevel === 'THIRD_QUARTILE') colorIdx = 2;
        else if (cell.contributionLevel === 'FOURTH_QUARTILE') colorIdx = 3;
        
        svg += `  <rect x="${px}" y="${py}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${theme.wallColors[colorIdx]}"/>\n`;
      } else if (wallBreak) {
        // Wall that will be broken - show wall, then break with slash
        let colorIdx = 0;
        if (cell.contributionLevel === 'FIRST_QUARTILE') colorIdx = 0;
        else if (cell.contributionLevel === 'SECOND_QUARTILE') colorIdx = 1;
        else if (cell.contributionLevel === 'THIRD_QUARTILE') colorIdx = 2;
        else if (cell.contributionLevel === 'FOURTH_QUARTILE') colorIdx = 3;
        
        // Wall breaks partway through the slash animation
        const slashMidpoint = wallBreak.delay + 0.2; // Break happens during slash
        const breakStart = (slashMidpoint / totalDuration).toFixed(4);
        const breakEnd = ((slashMidpoint + 0.15) / totalDuration).toFixed(4); // Quick break
        
        // Wall that fades out quickly when slashed
        svg += `  <rect x="${px}" y="${py}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${theme.wallColors[colorIdx]}">\n`;
        svg += `    <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;${breakStart};${breakEnd};0.999;1" dur="${totalDuration.toFixed(2)}s" repeatCount="indefinite" calcMode="linear"/>\n`;
        svg += `  </rect>\n`;
        
        // Floor revealed underneath
        svg += `  <rect x="${px}" y="${py}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${theme.floor}">\n`;
        svg += `    <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${breakStart};${breakEnd};0.999;1" dur="${totalDuration.toFixed(2)}s" repeatCount="indefinite" calcMode="linear"/>\n`;
        svg += `  </rect>\n`;
      } else {
        // Floor
        svg += `  <rect x="${px}" y="${py}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${theme.floor}"/>\n`;
        
        // Ghost monster - ONLY render if it's in the monsterSpawns list (actually part of the game)
        const spawn = monsterSpawns.find(s => s.position.x === x && s.position.y === y);
        
        if (spawn) {
          const { x: cx, y: cy } = cellToPixel({ x, y }, offsetY);
          const ghostColor = ghostColors[monsterIdx % ghostColors.length];
          const ghostId = `ghost-${x}-${y}`;
          
          // Check if this ghost gets defeated
          const battle = battleEvents.find(b => b.position.x === x && b.position.y === y);
          
          if (battle) {
            // Ghost that will be defeated - appear at spawn time, disappear when killed
            const spawnTime = spawn.spawnTime;
            const killTime = battle.delay;
            
            // Convert to normalized time (0-1)
            // Ghost appears at spawnTime, disappears at killTime
            const tAppear = Math.max(0.001, spawnTime / totalDuration);
            const tDisappear = Math.min(0.999, killTime / totalDuration);
            
            // Ensure times are strictly ascending
            const actualTDisappear = Math.max(tAppear + 0.01, tDisappear);
            
            svg += `  <g opacity="0">\n`;
            svg += `    <animate attributeName="opacity" values="0;1;0" keyTimes="0;${tAppear.toFixed(4)};${actualTDisappear.toFixed(4)}" dur="${totalDuration.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete"/>\n`;
            svg += `    ${renderGhost(cx, cy, CELL_SIZE, ghostColor, ghostId)}\n`;
            svg += `  </g>\n`;
          } else {
            // Ghost that won't be defeated - appears at spawn time and stays visible
            const spawnTime = spawn.spawnTime;
            const tAppear = Math.max(0.001, spawnTime / totalDuration);
            
            svg += `  <g opacity="0">\n`;
            svg += `    <animate attributeName="opacity" values="0;1;1" keyTimes="0;${tAppear.toFixed(4)};1" dur="${totalDuration.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete"/>\n`;
            svg += `    ${renderGhost(cx, cy, CELL_SIZE, ghostColor, ghostId)}\n`;
            svg += `  </g>\n`;
          }
          
          monsterPositions.push({ x, y, color: ghostColor, id: ghostId });
          monsterIdx++;
        }
      }
    }
  }
  
  // Render wall break effects (slash on wall)
  wallBreakEvents.forEach((wallBreak, idx) => {
    const { x: cx, y: cy } = cellToPixel(wallBreak.position, offsetY);
    
    svg += `
  <!-- Wall Break ${idx + 1} -->
  <g transform="translate(${cx}, ${cy})">
    ${renderSlashEffect(CELL_SIZE, wallBreak.delay, totalDuration, wallBreak.direction)}
  </g>`;
  });
  
  // Render battle slash effects
  battleEvents.forEach((battle, idx) => {
    const { x: cx, y: cy } = cellToPixel(battle.position, offsetY);
    
    svg += `
  <!-- Battle ${idx + 1} -->
  <g transform="translate(${cx}, ${cy})">
    ${renderSlashEffect(CELL_SIZE, battle.delay, totalDuration, battle.direction)}
  </g>`;
  });
  
  // Render animated hero with direction flipping
  if (path.length > 0 && uniqueKeyframes.length > 1) {
    const positionValues = uniqueKeyframes.map(k => `${k.x.toFixed(1)} ${k.y.toFixed(1)}`).join(';');
    
    svg += `
  <!-- Animated Hero -->
  <g id="hero-container">
    <animateTransform 
      attributeName="transform" 
      type="translate"
      values="${positionValues}"
      keyTimes="${keyTimes}"
      dur="${totalDuration.toFixed(2)}s"
      repeatCount="indefinite"
      calcMode="linear"
    />
    <g id="hero-sprite">
      <animateTransform 
        attributeName="transform" 
        type="scale"
        values="${scaleXValues}"
        keyTimes="${keyTimes}"
        dur="${totalDuration.toFixed(2)}s"
        repeatCount="indefinite"
        calcMode="discrete"
      />
      ${renderHero(CELL_SIZE, theme)}
    </g>
  </g>`;
  }
  
  svg += `
</svg>`;
  
  return svg;
}
