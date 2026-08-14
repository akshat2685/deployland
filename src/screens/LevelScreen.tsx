import { useState } from 'react';
import { CityCanvas } from '../components/CityCanvas';
import { getLevel } from '../content/level-loader';
import { getCourseLevels } from '../content/course-registry';
import { usePlayerStore } from '../store/player-store';
import '../design/shell.css';

import TriageBoard from './boards/TriageBoard';
import AllocateBoard from './boards/AllocateBoard';
import ClassifyBoard from './boards/ClassifyBoard';
import GraphBuildBoard from './boards/GraphBuildBoard';
import MissionShell from './MissionShell';

interface Props {
  levelId: string;
  onExit: () => void;
  onSelectLevel?: (nextLevelId: string) => void;
}

export default function LevelScreen({ levelId, onExit, onSelectLevel }: Props) {
  const level = getLevel(levelId);
  const xp = usePlayerStore((player) => player.xp);

  const courseLevels = getCourseLevels(level.courseId);
  const currentIndex = courseLevels.findIndex(l => l.id === level.id);
  const nextLevel = currentIndex >= 0 && currentIndex < courseLevels.length - 1 ? courseLevels[currentIndex + 1] : null;

  const handleNextLevel = () => {
    if (nextLevel && onSelectLevel) {
      onSelectLevel(nextLevel.id);
    } else {
      onExit();
    }
  };

  const renderBoard = (onOutcome: any) => {
    switch (level.archetype) {
      case 'TRIAGE':
        return <TriageBoard level={level} onOutcome={onOutcome} />;
      case 'ALLOCATE':
        return <AllocateBoard level={level} onOutcome={onOutcome} />;
      case 'CLASSIFY':
        return <ClassifyBoard level={level} onOutcome={onOutcome} />;
      case 'GRAPH_BUILD':
        return <GraphBuildBoard level={level} onOutcome={onOutcome} />;
      default:
        return (
          <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>ARCHETYPE: {level.archetype}</h2>
            <p>UI implementation pending.</p>
          </div>
        );
    }
  };

  return (
    <MissionShell 
      key={level.id}
      level={level} 
      onExit={onExit}
      nextLevelId={nextLevel?.id || null}
      onNextLevel={nextLevel ? handleNextLevel : undefined}
    >
      {(onOutcome) => renderBoard(onOutcome)}
    </MissionShell>
  );
}
