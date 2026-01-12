import { ContributionWeek, Cell, Position, Battle, MonsterSpawn, WallBreak } from './types';
import { MOVE_TIME, BATTLE_TIME, WALL_BREAK_TIME, TOTAL_MONSTERS } from './constants';

export function createDungeonGrid(weeks: ContributionWeek[]): Cell[][] {
  const grid: Cell[][] = [];

  // Grid is 7 rows (days) x 53 columns (weeks)
  for (let day = 0; day < 7; day++) {
    grid[day] = [];
    for (let week = 0; week < weeks.length; week++) {
      const contribution = weeks[week]?.contributionDays[day];
      const hasContribution = contribution && contribution.contributionLevel !== 'NONE';

      grid[day][week] = {
        x: week,
        y: day,
        isWall: hasContribution,
        contributionLevel: contribution?.contributionLevel || 'NONE',
        hasMonster: false,
        monsterType: null,
      };
    }
  }

  return grid;
}

function getRandomMonsterType(): NonNullable<Cell['monsterType']> {
  const rand = Math.random();
  if (rand < 0.45) return 'slime';
  if (rand < 0.75) return 'skeleton';
  if (rand < 0.92) return 'demon';
  return 'dragon';
}

function getNeighbors(grid: Cell[][], pos: Position, allowWalls: boolean = false): Position[] {
  const dirs = [
    { x: 1, y: 0 }, // Prioritize right movement
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  const neighbors: Position[] = [];
  for (const dir of dirs) {
    const nx = pos.x + dir.x;
    const ny = pos.y + dir.y;
    if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
      if (allowWalls || !grid[ny][nx].isWall) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }
  return neighbors;
}

function findPath(grid: Cell[][], start: Position, end: Position): Position[] | null {
  const queue: { pos: Position; path: Position[] }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.pos.x === end.x && current.pos.y === end.y) {
      return current.path;
    }

    for (const neighbor of getNeighbors(grid, current.pos)) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          pos: neighbor,
          path: [...current.path, neighbor],
        });
      }
    }
  }

  return null;
}

// Find path that can break through walls
function findPathWithWallBreaking(
  grid: Cell[][],
  start: Position,
  end: Position
): { path: Position[]; wallsToBreak: Position[] } | null {
  const queue: { pos: Position; path: Position[]; walls: Position[]; cost: number }[] = [
    { pos: start, path: [start], walls: [], cost: 0 },
  ];
  const visited = new Map<string, number>();
  visited.set(`${start.x},${start.y}`, 0);

  let bestResult: { path: Position[]; wallsToBreak: Position[] } | null = null;
  let bestCost = Infinity;

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;

    if (current.cost >= bestCost) continue;

    if (current.pos.x === end.x && current.pos.y === end.y) {
      if (current.cost < bestCost) {
        bestCost = current.cost;
        bestResult = { path: current.path, wallsToBreak: current.walls };
      }
      continue;
    }

    for (const neighbor of getNeighbors(grid, current.pos, true)) {
      const isWall = grid[neighbor.y][neighbor.x].isWall;
      const moveCost = isWall ? 10 : 1;
      const newCost = current.cost + moveCost;
      const key = `${neighbor.x},${neighbor.y}`;

      if (!visited.has(key) || visited.get(key)! > newCost) {
        visited.set(key, newCost);
        const newWalls = isWall ? [...current.walls, neighbor] : current.walls;
        queue.push({
          pos: neighbor,
          path: [...current.path, neighbor],
          walls: newWalls,
          cost: newCost,
        });
      }
    }
  }

  return bestResult;
}

// Get empty cells (non-wall, non-contribution) in a specific column range
function getEmptyCellsInRange(grid: Cell[][], minX: number, maxX: number, excludePositions: Set<string>): Position[] {
  const cells: Position[] = [];
  for (let x = minX; x <= maxX && x < grid[0].length; x++) {
    for (let y = 0; y < grid.length; y++) {
      const key = `${x},${y}`;
      const cell = grid[y][x];
      // Only spawn on empty floor cells (not walls/contributions)
      if (!cell.isWall && cell.contributionLevel === 'NONE' && !excludePositions.has(key)) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}

export interface GamePath {
  path: Position[];
  battles: Battle[];
  monsterSpawns: MonsterSpawn[];
  wallBreaks: WallBreak[];
}

export function generateHeroPath(grid: Cell[][]): GamePath {
  const gridWidth = grid[0].length;

  // Find start position (leftmost empty cell that's not a contribution)
  let start: Position | null = null;
  for (let x = 0; x < gridWidth && !start; x++) {
    for (let y = 0; y < grid.length && !start; y++) {
      if (!grid[y][x].isWall && grid[y][x].contributionLevel === 'NONE') {
        start = { x, y };
      }
    }
  }

  // Fallback: just find any non-wall cell
  if (!start) {
    for (let x = 0; x < gridWidth && !start; x++) {
      for (let y = 0; y < grid.length && !start; y++) {
        if (!grid[y][x].isWall) {
          start = { x, y };
        }
      }
    }
  }

  if (!start) {
    return { path: [], battles: [], monsterSpawns: [], wallBreaks: [] };
  }

  // PRE-PLACE all monsters spread across the entire year
  const monsterPositions: { pos: Position; type: string }[] = [];
  const occupiedPositions = new Set<string>();
  occupiedPositions.add(`${start.x},${start.y}`);

  // Place monsters evenly across the grid width
  for (let i = 0; i < TOTAL_MONSTERS; i++) {
    const zoneStart = Math.floor((i / TOTAL_MONSTERS) * gridWidth);
    const zoneEnd = Math.floor(((i + 1) / TOTAL_MONSTERS) * gridWidth);

    // Find empty cells in this zone (must be non-contribution floor cells)
    const candidates = getEmptyCellsInRange(grid, zoneStart, zoneEnd, occupiedPositions);

    if (candidates.length > 0) {
      // Pick a random cell from this zone
      const pos = candidates[Math.floor(Math.random() * candidates.length)];
      const type = getRandomMonsterType();
      monsterPositions.push({ pos, type });
      occupiedPositions.add(`${pos.x},${pos.y}`);
      grid[pos.y][pos.x].hasMonster = true;
      grid[pos.y][pos.x].monsterType = type;
    }
  }

  // Sort monsters by X position (left to right) so hero traverses the full year
  monsterPositions.sort((a, b) => a.pos.x - b.pos.x);

  // Create a map of monster positions for quick lookup
  const monsterMap = new Map<string, { pos: Position; type: string }>();
  for (const m of monsterPositions) {
    monsterMap.set(`${m.pos.x},${m.pos.y}`, m);
  }

  const fullPath: Position[] = [start];
  const battles: Battle[] = [];
  const monsterSpawns: MonsterSpawn[] = [];
  const wallBreaks: WallBreak[] = [];
  const brokenWalls = new Set<string>();
  const killedMonsters = new Set<string>();
  let currentPos = start;
  let currentTime = 0;

  const moveTime = MOVE_TIME;
  const battleTime = BATTLE_TIME;
  const wallBreakTime = WALL_BREAK_TIME;

  // All monsters spawn at the beginning (they're already placed)
  for (const monster of monsterPositions) {
    monsterSpawns.push({
      position: monster.pos,
      monsterType: monster.type,
      spawnTime: 0, // All visible from start
    });
  }

  // Hero hunts monsters in order (left to right across the year)
  for (const targetMonster of monsterPositions) {
    const targetKey = `${targetMonster.pos.x},${targetMonster.pos.y}`;
    if (killedMonsters.has(targetKey)) continue;

    // Find path to this monster
    let pathToMonster = findPath(grid, currentPos, targetMonster.pos);

    // If no direct path, try wall-breaking
    if (!pathToMonster) {
      const result = findPathWithWallBreaking(grid, currentPos, targetMonster.pos);
      if (result) {
        pathToMonster = result.path;
      }
    }

    if (!pathToMonster || pathToMonster.length <= 1) {
      // Can't reach this monster, mark as killed (skip it)
      killedMonsters.add(targetKey);
      continue;
    }

    // Walk the path step by step
    for (let i = 1; i < pathToMonster.length; i++) {
      const pos = pathToMonster[i];
      const posKey = `${pos.x},${pos.y}`;

      // Check if we need to break this wall FIRST (before moving)
      if (grid[pos.y][pos.x].isWall && !brokenWalls.has(posKey)) {
        brokenWalls.add(posKey);
        wallBreaks.push({
          position: pos,
          breakTime: currentTime,
        });
        grid[pos.y][pos.x].isWall = false;
        currentTime += wallBreakTime;
      }

      // Check if there's a monster at this position (ONLY if not already killed)
      const monsterAtPos = monsterMap.get(posKey);
      if (monsterAtPos && !killedMonsters.has(posKey)) {
        // Record battle BEFORE adding this position to path
        // The slash happens while hero is at previous position
        killedMonsters.add(posKey);
        battles.push({
          position: pos,
          monsterType: monsterAtPos.type,
          frameStart: Math.floor(currentTime * 10),
        });
        currentTime += battleTime;
      }

      // Now add the position to the path (hero moves here)
      fullPath.push(pos);
      currentTime += moveTime;
    }

    currentPos = targetMonster.pos;
  }

  return { path: fullPath, battles, monsterSpawns, wallBreaks };
}
