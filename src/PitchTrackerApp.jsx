/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, ChevronRight, TrendingUp, Target, BarChart3, Users } from 'lucide-react';

const PitchTrackerApp = () => {
const [pitchers, setPitchers] = useState([]);
const [selectedPitcher, setSelectedPitcher] = useState(null);
const [games, setGames] = useState([]);
const [currentGame, setCurrentGame] = useState(null);
const [currentInning, setCurrentInning] = useState(1);
const [currentBatter, setCurrentBatter] = useState(1);
const [currentBatterHandedness, setCurrentBatterHandedness] = useState('R');
const [atBatPitches, setAtBatPitches] = useState([]);
const [selectedZone, setSelectedZone] = useState(null);
const [pitchTrail, setPitchTrail] = useState([]);
const [view, setView] = useState('landing');
const [seasonStats, setSeasonStats] = useState(null);
const [pendingPitch, setPendingPitch] = useState(null);
const [showOutModal, setShowOutModal] = useState(false);
const [outLocation, setOutLocation] = useState('');
const [showConfirmModal, setShowConfirmModal] = useState(null);
const [currentOuts, setCurrentOuts] = useState(0);
const [actionHistory, setActionHistory] = useState([]);
const [showAddPitcherModal, setShowAddPitcherModal] = useState(false);
const [newPitcher, setNewPitcher] = useState({ name: '', number: '', pitchTypes: [], role: '', handedness: '' });
const [editingPitcher, setEditingPitcher] = useState(null);
const [showEditPitcherModal, setShowEditPitcherModal] = useState(false);
const [teamStats, setTeamStats] = useState(null);
const [filterRole, setFilterRole] = useState('all');
const [filterHandedness, setFilterHandedness] = useState('all');
const [showPitcherSelect, setShowPitcherSelect] = useState(false);
const [pitcherSearch, setPitcherSearch] = useState('');
const [pendingPitchingChangeGame, setPendingPitchingChangeGame] = useState(null);
const [reportText, setReportText] = useState('');
const [reportId, setReportId] = useState(null);
const [oneHandMode, setOneHandMode] = useState(false);
const [showPitchEffectiveness, setShowPitchEffectiveness] = useState(false);
const [bullpenMode, setBullpenMode] = useState(false);
const [scoutingMode, setScoutingMode] = useState(false);
const [isScouting, setIsScouting] = useState(false);
const [zoneFilterHandedness, setZoneFilterHandedness] = useState('all');
const [zoneFilterPitch, setZoneFilterPitch] = useState('all');
const [pairFilterFirst, setPairFilterFirst] = useState('all');
const [zoneResultFilter, setZoneResultFilter] = useState('all');

const allPitchTypes = {
fastballs: [
{ abbr: '4S', name: 'Four-Seam' },
{ abbr: '2S', name: 'Two-Seam' },
{ abbr: 'SNK', name: 'Sinker' },
{ abbr: 'CT', name: 'Cutter' }
],
breaking: [
{ abbr: 'SL', name: 'Slider' },
{ abbr: 'CB', name: 'Curveball' },
{ abbr: 'SW', name: 'Sweeper' },
{ abbr: 'SLV', name: 'Slurve' }
],
changeups: [
{ abbr: 'CH', name: 'Changeup' },
{ abbr: 'SP', name: 'Splitter' },
{ abbr: 'CCH', name: 'Circle Change' }
]
};

const isScoutContext = isScouting || scoutingMode;

const autosaveKey = isScouting ? 'baseball_autosave_scout' : 'baseball_autosave';

const outcomes = ['1B', '2B', '3B', 'HR', 'BB', 'K', 'E', 'SAC', 'DP', 'OUT'];
const strikeTypes = ['Called', 'Swinging', 'Foul'];
const ballTypes = ['Ball', 'Check Swing'];
const zoneLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const zoneGrid = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9']
];

const normalizePitchTypeAbbr = (abbr) => (abbr === 'SN' ? 'SNK' : abbr);
const normalizePitchTypeList = (pitchTypes = []) => {
  const seen = new Set();
  return (Array.isArray(pitchTypes) ? pitchTypes : []).reduce((acc, type) => {
    const normalized = normalizePitchTypeAbbr(type);
    if (!normalized || seen.has(normalized)) return acc;
    seen.add(normalized);
    acc.push(normalized);
    return acc;
  }, []);
};
const normalizePitcherRecord = (pitcher = {}) => ({
  ...pitcher,
  pitchTypes: normalizePitchTypeList(pitcher.pitchTypes)
});

const getCountFromPitches = (pitches) => {
let strikes = 0;
let strikesSoFar = 0;
for (const pitch of pitches) {
  if (pitch.isStrike) {
    if (pitch.strikeType === 'Foul') {
      if (strikesSoFar < 2) {
        strikes++;
        strikesSoFar++;
      }
    } else {
      strikes++;
      strikesSoFar++;
    }
  }
}
const balls = pitches.filter(p => !p.isStrike).length;
return { balls, strikes };
};

useEffect(() => {
loadPitchers();
calculateTeamStats();
loadAutosave();
}, []);

useEffect(() => {
const reportParam = new URLSearchParams(window.location.search).get('report');
if (reportParam) {
  const stored = JSON.parse(localStorage.getItem('baseball_reports') || '{}');
  if (stored[reportParam]) {
    setReportId(reportParam);
    setReportText(stored[reportParam]);
    setView('report');
  }
}
}, []);

useEffect(() => {
if (selectedPitcher) {
  if (isScouting) loadScoutGames(selectedPitcher.id);
  else loadGames(selectedPitcher.id);
}
}, [selectedPitcher]);

useEffect(() => {
saveAutosave();
}, [currentGame, currentInning, currentBatter, currentBatterHandedness, atBatPitches, currentOuts, pitchTrail, selectedZone, view, selectedPitcher, isScouting]);


const saveAutosave = () => {
  if (!currentGame || !selectedPitcher) return;
  const payload = {
    selectedPitcher,
    currentGame,
    currentInning,
    currentBatter,
    currentBatterHandedness,
    atBatPitches,
    currentOuts,
    pitchTrail,
    selectedZone,
    view
  };
  localStorage.setItem(autosaveKey, JSON.stringify(payload));
};

const loadAutosave = () => {
  const stored = localStorage.getItem(autosaveKey);
  if (!stored) return;
  try {
    const payload = JSON.parse(stored);
    setSelectedPitcher(payload.selectedPitcher || null);
    setCurrentGame(payload.currentGame || null);
    setCurrentInning(payload.currentInning || 1);
    setCurrentBatter(payload.currentBatter || 1);
    setCurrentBatterHandedness(payload.currentBatterHandedness || 'R');
    setAtBatPitches(payload.atBatPitches || []);
    setCurrentOuts(payload.currentOuts || 0);
    setPitchTrail(payload.pitchTrail || []);
    setSelectedZone(payload.selectedZone || null);
    if (payload.view) setView(payload.view);
  } catch (e) {
    // ignore bad autosave
  }
};
const generateGameReport = (game) => {
let report = 'GAME REPORT\n';
report += `Date: ${new Date(game.date).toLocaleDateString()}\n`;
report += `Opponent: ${game.opponent || 'Unknown'}\n\n`;

game.innings?.forEach((inning) => {
  report += `Inning ${inning.number}\n`;
  report += `${'='.repeat(40)}\n`;

  inning.atBats?.forEach((atBat) => {
    report += `Batter ${atBat.batter} (${atBat.batterHandedness || 'R'}): `;
    atBat.pitches.forEach((p) => {
      if (p.isStrike) {
        report += `${p.type}S(${p.strikeType})${p.zone ? `@${p.zone}` : ''} `;
      } else {
        report += `${p.type}B${p.ballType ? `(${p.ballType})` : ''}${p.zone ? `@${p.zone}` : ''} `;
      }
    });
    report += `→ ${atBat.outcome}`;
    if (atBat.runsScored > 0) report += ` (${atBat.runsScored}R)`;
    report += '\n';
  });

  const inningPitches = inning.atBats?.reduce((sum, ab) => sum + ab.totalPitches, 0) || 0;
  report += `Total Pitches: ${inningPitches}\n\n`;
});

return report;
 

};


const generateSeasonReport = (pitcher, gamesList) => {
  let report = 'ADVANCE REPORT\n';
  report += `Pitcher: ${pitcher?.name || 'Unknown'}\n`;
  report += `Games: ${gamesList?.length || 0}\n\n`;

  const stats = seasonStats || {};
  report += `Strike%: ${stats.strikePercentage || 0}%\n`;
  report += `First Pitch Strike%: ${stats.firstPitchStrikeRate || 0}%\n`;
  report += `K/BB: ${(stats.strikeouts || 0)}/${(stats.walks || 0)}\n`;
  report += `Total Pitches: ${stats.totalPitches || 0}\n\n`;

  if (stats.pitchTypeCounts) {
    report += 'Pitch Mix:\n';
    Object.entries(stats.pitchTypeCounts).forEach(([type, count]) => {
      const strikes = stats.pitchTypeStrikes?.[type] || 0;
      const pct = count ? ((strikes / count) * 100).toFixed(1) : '0.0';
      report += `- ${type}: ${count} pitches, ${pct}% strikes\n`;
    });
    report += '\n';
  }

  return report;
};
const deleteGame = (gameId) => {
const updatedGames = games.filter(g => g.id !== gameId);
saveGames(updatedGames);
};

const saveReport = (report) => {
const stored = JSON.parse(localStorage.getItem('baseball_reports') || '{}');
const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
stored[id] = report;
localStorage.setItem('baseball_reports', JSON.stringify(stored));
return id;
};

const openReport = (game) => {
const report = generateGameReport(game);
const id = saveReport(report);
setReportId(id);
setReportText(report);
setView('report');
};

const copyShareLink = (game) => {
const report = generateGameReport(game);
const id = saveReport(report);
const link = `${window.location.origin}?report=${id}`;
if (navigator.clipboard?.writeText) {
  navigator.clipboard.writeText(link);
}
};

const loadPitchers = () => {
const stored = localStorage.getItem('baseball_pitchers');
if (stored) {
  const loaded = JSON.parse(stored).map(normalizePitcherRecord);
  localStorage.setItem('baseball_pitchers', JSON.stringify(loaded));
  setPitchers(loaded);
  calculateTeamStats();
}
};


const loadScoutPitchers = () => {
  const stored = localStorage.getItem('baseball_scout_pitchers');
  if (!stored) return [];
  const loaded = JSON.parse(stored).map(normalizePitcherRecord);
  localStorage.setItem('baseball_scout_pitchers', JSON.stringify(loaded));
  return loaded;
};

const saveScoutPitchers = (updatedPitchers) => {
  localStorage.setItem('baseball_scout_pitchers', JSON.stringify(updatedPitchers.map(normalizePitcherRecord)));
};

const loadScoutGames = (pitcherId) => {
  const allGames = JSON.parse(localStorage.getItem('baseball_scout_games') || '{}');
  const pitcherGames = allGames[pitcherId] || [];
  setGames(pitcherGames);
  calculateSeasonStats(pitcherGames);
};

const saveScoutGames = (updatedGames) => {
  const allGames = JSON.parse(localStorage.getItem('baseball_scout_games') || '{}');
  if (!selectedPitcher) return;
  allGames[selectedPitcher.id] = updatedGames;
  localStorage.setItem('baseball_scout_games', JSON.stringify(allGames));
  setGames(updatedGames);
  calculateSeasonStats(updatedGames);
};
const savePitchers = (updatedPitchers) => {
const normalizedPitchers = updatedPitchers.map(normalizePitcherRecord);
localStorage.setItem('baseball_pitchers', JSON.stringify(normalizedPitchers));
setPitchers(normalizedPitchers);
calculateTeamStats();
};

const addPitcher = () => {
if (!newPitcher.name || newPitcher.pitchTypes.length === 0) return;
if (!isScoutContext && (!newPitcher.number || !newPitcher.role || !newPitcher.handedness)) return;

 
const pitcher = {
  id: Date.now(),
  name: newPitcher.name,
  number: newPitcher.number,
  pitchTypes: newPitcher.pitchTypes,
  role: newPitcher.role,
  handedness: newPitcher.handedness
};

if (isScoutContext) {
  const scoutPitchers = loadScoutPitchers();
  saveScoutPitchers([...scoutPitchers, pitcher]);
} else {
  savePitchers([...pitchers, pitcher]);
}
setNewPitcher({ name: '', number: '', pitchTypes: [], role: '', handedness: '' });
setShowAddPitcherModal(false);
 

};

const openEditPitcher = (pitcher) => {
setEditingPitcher({ ...pitcher });
setShowEditPitcherModal(true);
};

const saveEditedPitcher = () => {
if (!editingPitcher.name || !editingPitcher.number || editingPitcher.pitchTypes.length === 0 || !editingPitcher.role || !editingPitcher.handedness) return;

const source = isScoutContext ? loadScoutPitchers() : pitchers;
const updatedPitchers = source.map(p => 
  p.id === editingPitcher.id ? editingPitcher : p
);
if (isScoutContext) {
  saveScoutPitchers(updatedPitchers);
} else {
  savePitchers(updatedPitchers);
}
setEditingPitcher(null);
setShowEditPitcherModal(false);
 

};

const toggleEditPitchType = (abbr) => {
if (editingPitcher.pitchTypes.includes(abbr)) {
setEditingPitcher({...editingPitcher, pitchTypes: editingPitcher.pitchTypes.filter(t => t !== abbr)});
} else {
setEditingPitcher({...editingPitcher, pitchTypes: [...editingPitcher.pitchTypes, abbr]});
}
};

const deletePitcher = (pitcherId) => {
savePitchers(pitchers.filter(p => p.id !== pitcherId));
const allGames = JSON.parse(localStorage.getItem('baseball_games') || '{}');
delete allGames[pitcherId];
localStorage.setItem('baseball_games', JSON.stringify(allGames));
};

const togglePitchType = (abbr) => {
if (newPitcher.pitchTypes.includes(abbr)) {
setNewPitcher({...newPitcher, pitchTypes: newPitcher.pitchTypes.filter(t => t !== abbr)});
} else {
setNewPitcher({...newPitcher, pitchTypes: [...newPitcher.pitchTypes, abbr]});
}
};

const loadGames = (pitcherId) => {
const allGames = JSON.parse(localStorage.getItem('baseball_games') || '{}');
const pitcherGames = allGames[pitcherId] || [];
setGames(pitcherGames);
calculateSeasonStats(pitcherGames);
};

const saveGames = (updatedGames) => {
const allGames = JSON.parse(localStorage.getItem('baseball_games') || '{}');
allGames[selectedPitcher.id] = updatedGames;
localStorage.setItem('baseball_games', JSON.stringify(allGames));
setGames(updatedGames);
calculateSeasonStats(updatedGames);
};

const createNewGame = () => {
setShowPitcherSelect(true);
};

const createBullpenSession = () => {
setScoutingMode(false);
setBullpenMode(true);
setShowPitcherSelect(true);
};

const createScoutingSession = () => {
setScoutingMode(true);
setShowPitcherSelect(true);
};

const openScoutingRoster = () => {
setScoutingMode(true);
setIsScouting(true);
setShowPitcherSelect(false);
setShowAddPitcherModal(false);
setView('scouting-rotation');
};

const startGameWithPitcher = (pitcher) => {
setSelectedPitcher(pitcher);
loadGames(pitcher.id);
const carryOver = pendingPitchingChangeGame;
const newGame = {
id: Date.now(),
date: carryOver?.date || new Date().toISOString(),
opponent: carryOver?.opponent || '',
innings: [],
completed: false
};
setCurrentGame(newGame);
setCurrentInning(1);
setCurrentBatter(1);
setCurrentBatterHandedness('R');
setAtBatPitches([]);
setPitchTrail([]);
setSelectedZone(null);
setActionHistory([]);
setCurrentOuts(0);
setShowPitcherSelect(false);
setView(bullpenMode ? 'bullpen' : (scoutingMode ? 'pitch-entry' : 'pitch-entry'));
setBullpenMode(false);
setIsScouting(scoutingMode);
setScoutingMode(false);
setPendingPitchingChangeGame(null);
};

const calculateStatsFromGames = (gamesList) => {
let totalPitches = 0;
let totalStrikes = 0;
let firstPitchStrikes = 0;
let totalFirstPitches = 0;
let strikeouts = 0;
let walks = 0;
let hits = 0;
let totalGames = 0;

gamesList.forEach(game => {
  totalGames++;
  game.innings?.forEach(inning => {
    inning.atBats?.forEach(atBat => {
      totalPitches += atBat.totalPitches;
      
      if (atBat.pitches.length > 0) {
        totalFirstPitches++;
        if (atBat.pitches[0].isStrike) firstPitchStrikes++;
      }

      atBat.pitches.forEach(pitch => {
        if (pitch.isStrike) totalStrikes++;
      });

      if (atBat.outcome === 'K') strikeouts++;
      if (atBat.outcome === 'BB') walks++;
      if (['1B', '2B', '3B', 'HR'].includes(atBat.outcome)) hits++;
    });
  });
});

return {
  totalPitches,
  totalStrikes,
  strikePercentage: totalPitches > 0 ? ((totalStrikes / totalPitches) * 100).toFixed(1) : 0,
  firstPitchStrikeRate: totalFirstPitches > 0 ? ((firstPitchStrikes / totalFirstPitches) * 100).toFixed(1) : 0,
  strikeouts,
  walks,
  hits,
  gamesPlayed: totalGames
};
};

const calculateTeamStats = () => {
const allGames = JSON.parse(localStorage.getItem('baseball_games') || '{}');
const gamesList = Object.values(allGames).flat();
setTeamStats(calculateStatsFromGames(gamesList));
};

const recordPitch = (type, isStrike, strikeType = null, ballType = null) => {
const pitch = {
type,
isStrike,
strikeType: isStrike ? strikeType : null,
ballType: !isStrike ? ballType : null,
zone: selectedZone,
count: atBatPitches.length + 1
};
const newPitches = [...atBatPitches, pitch];
const newTrail = [{ type, isStrike, zone: selectedZone }, ...pitchTrail].slice(0, 8);

 
setActionHistory([...actionHistory, {
  type: 'pitch',
  atBatPitches: [...atBatPitches],
  currentBatter,
  currentInning,
  currentOuts,
  currentBatterHandedness,
  selectedZone,
  pitchTrail: [...pitchTrail],
  currentGame: JSON.parse(JSON.stringify(currentGame))
}]);

setAtBatPitches(newPitches);
setPitchTrail(newTrail);
setPendingPitch(null);
setSelectedZone(null);

const { balls } = getCountFromPitches(newPitches);
if (balls >= 4) {
  setTimeout(() => completeAtBatWithPitches('BB', newPitches), 0);
}
 

};

const selectPitchType = (type, isStrike) => {
setPendingPitch({ type, isStrike });
};

const completeAtBatWithPitches = (outcome, pitchesArray) => {
const atBat = {
batter: currentBatter,
 batterHandedness: currentBatterHandedness,
pitches: pitchesArray,
outcome,
runsScored: 0,
outDetails: null,
totalPitches: pitchesArray.length
};

 
const updatedGame = { ...currentGame };
const inningData = updatedGame.innings.find(i => i.number === currentInning) || {
  number: currentInning,
  atBats: []
};

inningData.atBats.push(atBat);

if (!updatedGame.innings.find(i => i.number === currentInning)) {
  updatedGame.innings.push(inningData);
} else {
  updatedGame.innings = updatedGame.innings.map(i =>
    i.number === currentInning ? inningData : i
  );
}

setCurrentGame(updatedGame);
setAtBatPitches([]);
setPitchTrail([]);
setCurrentBatter(currentBatter + 1);
setPendingPitch(null);

const outOutcomes = ['K', 'OUT', 'SAC', 'DP', 'E'];
if (outOutcomes.includes(outcome)) {
  const newOuts = currentOuts + (outcome === 'DP' ? 2 : 1);
  setCurrentOuts(newOuts);
  
  if (newOuts >= 3) {
    setTimeout(() => {
      setCurrentInning(currentInning + 1);
      setCurrentBatter(1);
      setCurrentOuts(0);
    }, 500);
  }
}
 

};

const completeAtBat = (outcome, runsScored = 0, outDetails = null) => {
if (atBatPitches.length === 0 && outcome !== 'K' && outcome !== 'BB') return;

 
setActionHistory([...actionHistory, {
  type: 'completeAtBat',
  atBatPitches: [...atBatPitches],
  currentBatter,
  currentInning,
  currentOuts,
  currentBatterHandedness,
  selectedZone,
  pitchTrail: [...pitchTrail],
  currentGame: JSON.parse(JSON.stringify(currentGame))
}]);

completeAtBatWithPitches(outcome, atBatPitches);
 

};

const handleOutClick = () => {
setShowOutModal(true);
};

const submitOut = () => {
if (outLocation.trim()) {
completeAtBat('OUT', 0, outLocation);
setOutLocation('');
setShowOutModal(false);
}
};

const undoLastPitch = () => {
setShowConfirmModal('undo');
};

const confirmUndo = () => {
if (actionHistory.length > 0) {
const lastAction = actionHistory[actionHistory.length - 1];

 
  setAtBatPitches(lastAction.atBatPitches);
  setCurrentBatter(lastAction.currentBatter);
  setCurrentInning(lastAction.currentInning);
  setCurrentOuts(lastAction.currentOuts);
  setCurrentBatterHandedness(lastAction.currentBatterHandedness || 'R');
  setSelectedZone(lastAction.selectedZone || null);
  setPitchTrail(lastAction.pitchTrail || []);
  setCurrentGame(lastAction.currentGame);
  
  setActionHistory(actionHistory.slice(0, -1));
}
setShowConfirmModal(null);
 

};

const nextBatter = () => {
setShowConfirmModal('nextBatter');
};

const pitchingChange = () => {
setShowConfirmModal('pitchChange');
};

const confirmNextBatter = () => {
setActionHistory([...actionHistory, {
type: 'nextBatter',
atBatPitches: [...atBatPitches],
currentBatter,
currentInning,
currentOuts,
currentBatterHandedness,
selectedZone,
pitchTrail: [...pitchTrail],
currentGame: JSON.parse(JSON.stringify(currentGame))
}]);

 
setAtBatPitches([]);
setPitchTrail([]);
setSelectedZone(null);
setCurrentBatter(currentBatter + 1);
setShowConfirmModal(null);
 

};

const saveGame = () => {
setShowConfirmModal('saveGame');
};

const confirmPitchingChange = () => {
if (currentGame) {
  const updatedGame = { ...currentGame, completed: false };
  const existingIndex = games.findIndex(g => g.id === currentGame.id);
  let updatedGames;
  if (existingIndex >= 0) {
    updatedGames = [...games];
    updatedGames[existingIndex] = updatedGame;
  } else {
    updatedGames = [...games, updatedGame];
  }
  saveGames(updatedGames);
  setPendingPitchingChangeGame(updatedGame);
  setShowPitcherSelect(true);
}
setShowConfirmModal(null);
};

const confirmSaveGame = (shouldContinue = false) => {
if (currentGame) {
const updatedGame = { ...currentGame, completed: false };
const existingIndex = games.findIndex(g => g.id === currentGame.id);

 
  let updatedGames;
  if (existingIndex >= 0) {
    updatedGames = [...games];
    updatedGames[existingIndex] = updatedGame;
  } else {
    updatedGames = [...games, updatedGame];
  }
  
  saveGames(updatedGames);
  
  if (!shouldContinue) {
    setView('rotation');
  }
}
setShowConfirmModal(null);
 

};

const getCount = () => {
const { balls, strikes } = getCountFromPitches(atBatPitches);
return `${balls}-${strikes}`;
};

const getTotalPitchCount = () => {
if (!currentGame || !currentGame.innings) return atBatPitches.length;
let total = 0;
currentGame.innings.forEach(inning => {
inning.atBats?.forEach(atBat => {
total += atBat.totalPitches || 0;
});
});
total += atBatPitches.length;
return total;
};

const calculateSeasonStats = (gamesList) => {
if (!gamesList || gamesList.length === 0) {
setSeasonStats(null);
return;
}

 
let totalPitches = 0;
let totalStrikes = 0;
let firstPitchStrikes = 0;
let totalFirstPitches = 0;
let twoOfThreeStrikes = 0;
let totalThreePitchSequences = 0;
let threeOrLessOuts = 0;
let totalAtBats = 0;
let strikeouts = 0;
let walks = 0;
let hits = 0;
let runsAllowed = 0;
const pitchTypeCounts = {};
const pitchTypeStrikes = {};

gamesList.forEach(game => {
  game.innings?.forEach(inning => {
    inning.atBats?.forEach(atBat => {
      totalAtBats++;
      totalPitches += atBat.totalPitches;
      runsAllowed += atBat.runsScored || 0;

      if (atBat.pitches.length > 0) {
        totalFirstPitches++;
        if (atBat.pitches[0].isStrike) firstPitchStrikes++;
      }

      if (atBat.pitches.length >= 3) {
        totalThreePitchSequences++;
        const firstThree = atBat.pitches.slice(0, 3);
        const strikesInFirstThree = firstThree.filter(p => p.isStrike).length;
        if (strikesInFirstThree >= 2) twoOfThreeStrikes++;
      }

      if (atBat.totalPitches <= 3 && ['OUT', 'SAC', 'DP'].includes(atBat.outcome)) {
        threeOrLessOuts++;
      }

      atBat.pitches.forEach(pitch => {
        if (pitch.isStrike) totalStrikes++;
        
        pitchTypeCounts[pitch.type] = (pitchTypeCounts[pitch.type] || 0) + 1;
        if (pitch.isStrike) {
          pitchTypeStrikes[pitch.type] = (pitchTypeStrikes[pitch.type] || 0) + 1;
        }
      });

      if (atBat.outcome === 'K') strikeouts++;
      if (atBat.outcome === 'BB') walks++;
      if (['1B', '2B', '3B', 'HR'].includes(atBat.outcome)) hits++;
    });
  });
});

setSeasonStats({
  totalPitches,
  totalStrikes,
  strikePercentage: totalPitches > 0 ? ((totalStrikes / totalPitches) * 100).toFixed(1) : 0,
  firstPitchStrikeRate: totalFirstPitches > 0 ? ((firstPitchStrikes / totalFirstPitches) * 100).toFixed(1) : 0,
  twoOfThreeRate: totalThreePitchSequences > 0 ? ((twoOfThreeStrikes / totalThreePitchSequences) * 100).toFixed(1) : 0,
  threeOrLessRate: totalAtBats > 0 ? ((threeOrLessOuts / totalAtBats) * 100).toFixed(1) : 0,
  strikeouts,
  walks,
  hits,
  runsAllowed,
  gamesPlayed: gamesList.length,
  pitchTypeCounts,
  pitchTypeStrikes
});
 

};


const classifyOutcome = (outcome) => {
  if (outcome === 'K') return 'K';
  if (outcome === 'BB') return 'BB';
  if (['1B','2B','3B','HR'].includes(outcome)) return 'H';
  if (['OUT','SAC','DP'].includes(outcome)) return 'OUT';
  return 'OTHER';
};

const getPitchPairingImpact = (gamesList, firstFilter = 'all') => {
  const pairs = {};
  gamesList.forEach(game => {
    game.innings?.forEach(inning => {
      inning.atBats?.forEach(atBat => {
        const outcomeClass = classifyOutcome(atBat.outcome);
        for (let i = 0; i < (atBat.pitches?.length || 0) - 1; i++) {
          const a = atBat.pitches[i].type;
          const b = atBat.pitches[i + 1].type;
          if (firstFilter !== 'all' && a !== firstFilter) continue;
          const key = `${a}→${b}`;
          if (!pairs[key]) pairs[key] = { total: 0, K: 0, BB: 0, H: 0, OUT: 0, OTHER: 0 };
          pairs[key].total += 1;
          pairs[key][outcomeClass] += 1;
        }
      });
    });
  });
  return Object.entries(pairs).map(([pair, s]) => ({
    pair,
    total: s.total,
    kPct: s.total ? Math.round((s.K / s.total) * 100) : 0,
    bbPct: s.total ? Math.round((s.BB / s.total) * 100) : 0,
    hPct: s.total ? Math.round((s.H / s.total) * 100) : 0
  })).sort((a,b) => b.total - a.total);
};

const getZoneResultStats = (gamesList, resultFilter = 'all') => {
  const zoneCounts = Object.fromEntries(zoneLabels.map(z => [z, 0]));
  gamesList.forEach(game => {
    game.innings?.forEach(inning => {
      inning.atBats?.forEach(atBat => {
        const outcomeClass = classifyOutcome(atBat.outcome);
        if (resultFilter !== 'all' && outcomeClass !== resultFilter) return;
        const lastPitch = atBat.pitches?.[atBat.pitches.length - 1];
        if (lastPitch?.zone && zoneCounts[lastPitch.zone] !== undefined) {
          zoneCounts[lastPitch.zone] += 1;
        }
      });
    });
  });
  const max = Math.max(1, ...Object.values(zoneCounts));
  return { zoneCounts, max };
};

const getPutAwayStats = (gamesList) => {
  let opportunities = 0;
  let strikeouts = 0;
  let walks = 0;
  let ballsInPlay = 0;
  let swingingStrikes = 0;
  let twoStrikePitches = 0;

  gamesList.forEach(game => {
    game.innings?.forEach(inning => {
      inning.atBats?.forEach(atBat => {
        let strikes = 0;
        let strikesSoFar = 0;
        let reachedTwo = false;
        for (const p of atBat.pitches || []) {
          if (p.isStrike) {
            if (p.strikeType === 'Foul') {
              if (strikesSoFar < 2) { strikes += 1; strikesSoFar += 1; }
            } else { strikes += 1; strikesSoFar += 1; }
          }
          if (strikes >= 2) {
            reachedTwo = true;
            twoStrikePitches += 1;
            if (p.strikeType === 'Swinging') swingingStrikes += 1;
          }
        }
        if (reachedTwo) {
          opportunities += 1;
          if (atBat.outcome === 'K') strikeouts += 1;
          else if (atBat.outcome === 'BB') walks += 1;
          else ballsInPlay += 1;
        }
      });
    });
  });

  return {
    opportunities,
    strikeouts,
    walks,
    ballsInPlay,
    whiffRate: twoStrikePitches ? Math.round((swingingStrikes / twoStrikePitches) * 100) : 0,
    kRate: opportunities ? Math.round((strikeouts / opportunities) * 100) : 0,
    bbRate: opportunities ? Math.round((walks / opportunities) * 100) : 0
  };
};

const getZoneStats = (gamesList, handednessFilter, pitchFilter) => {
const zoneCounts = Object.fromEntries(zoneLabels.map(z => [z, 0]));
gamesList.forEach(game => {
  game.innings?.forEach(inning => {
    inning.atBats?.forEach(atBat => {
      if (handednessFilter !== 'all' && atBat.batterHandedness !== handednessFilter) return;
      atBat.pitches.forEach(pitch => {
        if (pitchFilter !== 'all' && pitch.type !== pitchFilter) return;
        if (pitch.zone && zoneCounts[pitch.zone] !== undefined) {
          zoneCounts[pitch.zone] += 1;
        }
      });
    });
  });
});
const max = Math.max(1, ...Object.values(zoneCounts));
return { zoneCounts, max };
};


const getRecentOutcomes = () => {
  const outcomes = [];
  currentGame?.innings?.forEach(inning => {
    inning.atBats?.forEach(atBat => {
      if (atBat.outcome) outcomes.push(atBat.outcome);
    });
  });
  return outcomes.slice(-3);
};
const getInGamePitchStats = () => {
const pitches = [];
currentGame?.innings?.forEach(inning => {
  inning.atBats?.forEach(atBat => {
    atBat.pitches?.forEach(p => pitches.push(p));
  });
});
atBatPitches.forEach(p => pitches.push(p));

const stats = {};
for (const p of pitches) {
  if (!stats[p.type]) {
    stats[p.type] = { total: 0, strikes: 0, called: 0, swinging: 0, foul: 0 };
  }
  stats[p.type].total += 1;
  if (p.isStrike) {
    stats[p.type].strikes += 1;
    if (p.strikeType === 'Called') stats[p.type].called += 1;
    if (p.strikeType === 'Swinging') stats[p.type].swinging += 1;
    if (p.strikeType === 'Foul') stats[p.type].foul += 1;
  }
}

return Object.entries(stats)
  .map(([type, s]) => ({
    type,
    ...s,
    strikePct: s.total > 0 ? Math.round((s.strikes / s.total) * 100) : 0
  }))
  .sort((a, b) => b.total - a.total);
};

// Landing Page
if (view === 'landing') {
return (
<div className="min-h-screen text-[16px] relative overflow-hidden text-[16px]" style={{ fontSize: '16px' }}>
<div
className="absolute inset-0 bg-cover bg-center bg-no-repeat"
style={{
backgroundImage: "url('/mnt/user-data/uploads/Screenshot_2025-11-16_165624.png')"
}}
>
<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70"></div>
</div>

 
    <div className="relative z-10 w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6 p-4 sm:p-4 sm:p-6">
      <div className="text-center mb-12 pt-16">
      <div className="text-5xl sm:text-6xl mb-6">⚾</div>
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl tracking-tight">PitchTrace</h1>
      <p className="text-lg sm:text-2xl text-white/90 mb-8 drop-shadow-lg font-light">
          Track every pitch. Analyze every game. Elevate your team.
        </p>
        
        {/* Start Game Button */}
        <button
          onClick={createNewGame}
          disabled={pitchers.length === 0}
          className="bg-lime-400 text-slate-900 px-8 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-2xl hover:bg-lime-300 transition-all inline-flex items-center gap-3 shadow-2xl shadow-lime-400/30 hover:scale-105 transform mb-12 sm:mb-16 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={32} />
          Start New Game
        </button>
        {pitchers.length === 0 && (
          <p className="text-white/70 text-sm mb-16">Add a pitcher first to start tracking games</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full md:max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        <div 
          onClick={() => setView('rotation')}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
        >
          <div className="w-16 h-16 bg-lime-400/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-lime-400/30 transition-all">
            <Users size={32} className="text-lime-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3 drop-shadow-lg">Team Rotation</h2>
          <p className="text-white/80 mb-6 drop-shadow">Manage your pitching roster and track individual performance</p>
          <div className="flex items-center text-lime-400 font-medium">
            <span>View Roster</span>
            <ChevronRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        <div 
          onClick={openScoutingRoster}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
        >
          <div className="w-16 h-16 bg-blue-400/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-400/30 transition-all">
            <BarChart3 size={32} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3 drop-shadow-lg">Scouting</h2>
          <p className="text-white/80 mb-6 drop-shadow">Track opponent pitchers separately</p>
          <div className="flex items-center text-blue-400 font-medium">
            <span>Start Scouting</span>
            <ChevronRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>


        <div 
          onClick={createBullpenSession}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-all">
            <Target size={32} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3 drop-shadow-lg">Execution Pen</h2>
          <p className="text-white/80 mb-6 drop-shadow">Bullpen-focused pitch execution tracking</p>
          <div className="flex items-center text-blue-400 font-medium">
            <span>Start Bullpen</span>
            <ChevronRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
        <div 
          onClick={() => setView('team-dashboard')}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
        >
          <div className="w-16 h-16 bg-blue-400/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-400/30 transition-all">
            <BarChart3 size={32} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3 drop-shadow-lg">Season Dashboard</h2>
          <p className="text-white/80 mb-6 drop-shadow">View comprehensive analytics and season statistics</p>
          <div className="flex items-center text-blue-400 font-medium">
            <span>View Analytics</span>
            <ChevronRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>
    </div>

    {/* Pitcher Select Modal */}
    {showPitcherSelect && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white text-2xl font-semibold">Select Pitcher</h3>
            <button
              onClick={() => setScoutingMode(!scoutingMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                scoutingMode ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {scoutingMode ? 'Switch to My Team' : 'Switch to Opponent'}
            </button>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            {scoutingMode ? 'Track an opponent pitcher (saved separately)' : 'Choose which pitcher will be throwing in this game'}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {(scoutingMode ? loadScoutPitchers() : pitchers).filter(p => p.name.toLowerCase().includes(pitcherSearch.toLowerCase())).map(pitcher => (
              <button
                key={pitcher.id}
                onClick={() => startGameWithPitcher(pitcher)}
                className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl p-4 sm:p-6 text-left transition-all group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-lime-400/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-lime-400">#{pitcher.number}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-white">{pitcher.name}</div>
                    <div className="text-sm text-slate-400">{pitcher.handedness} • {pitcher.role}</div>
                  </div>
                  <ChevronRight size={24} className="text-slate-600 group-hover:text-lime-400 transition-colors" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {pitcher.pitchTypes.slice(0, 6).map(type => (
                    <span key={type} className="px-2 py-1 bg-slate-800/50 rounded text-slate-400 text-xs">
                      {type}
                    </span>
                  ))}
                  {pitcher.pitchTypes.length > 6 && (
                    <span className="px-2 py-1 text-slate-500 text-xs">
                      +{pitcher.pitchTypes.length - 6}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setShowPitcherSelect(false);
                setShowAddPitcherModal(true);
            }}
            className="w-full h-12 bg-lime-400 hover:bg-lime-300 rounded-xl text-slate-900 font-semibold transition-all mb-3"
          >
            {scoutingMode ? 'Add Opponent Pitcher' : 'Add Pitcher'}
          </button>
          <button
            onClick={() => setShowPitcherSelect(false)}
            className="w-full h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
);
 

}

if (view === 'rotation') {
return (
<div className="min-h-screen text-[16px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 text-[16px]" style={{ fontSize: '16px' }}>
<div className="w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6">
<div className="flex justify-between items-center mb-8">
<div>
<button
onClick={() => setView('landing')}
className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
>
← Back
</button>
<h1 className="text-3xl font-medium text-white mb-1">Pitching Rotation</h1>
<p className="text-slate-400 text-sm">Manage your team roster</p>
</div>
<div className="flex gap-3">
<button
onClick={createNewGame}
disabled={pitchers.length === 0}
className="bg-blue-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
>
<Plus size={18} /> Start New Game
</button>
<button
onClick={() => setShowAddPitcherModal(true)}
className="bg-lime-400 text-slate-900 px-6 py-2.5 rounded-full font-medium hover:bg-lime-300 transition-all flex items-center gap-2"
>
<Plus size={18} /> Add Pitcher
</button>
</div>
</div>

 
      {pitchers.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={40} className="text-slate-500" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">No Pitchers Yet</h3>
          <p className="text-slate-400 mb-6">Add your first pitcher to get started</p>
          <button
            onClick={() => setShowAddPitcherModal(true)}
            className="bg-lime-400 text-slate-900 px-8 py-3 rounded-full font-medium hover:bg-lime-300 transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} /> Add Pitcher
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:p-6">
          {pitchers.map(pitcher => (
            <div
              key={pitcher.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 sm:p-6 hover:bg-slate-800/70 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-lime-400/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-lime-400">#{pitcher.number}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditPitcher(pitcher);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-blue-500/10 rounded-lg"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => deletePitcher(pitcher.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">{pitcher.name}</h3>
              <div className="text-sm text-slate-400 mb-3">
                {pitcher.handedness} • {pitcher.role}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {pitcher.pitchTypes.map(type => (
                  <span key={type} className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 text-sm font-medium">
                    {type}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedPitcher(pitcher);
                  setView('dashboard');
                }}
                className="w-full py-2 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 rounded-lg text-lime-400 font-medium transition-all flex items-center justify-center gap-2"
              >
                View Dashboard
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddPitcherModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-2xl font-semibold mb-6">Add New Pitcher</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Name</label>
                <input
                  type="text"
                  value={newPitcher.name}
                  onChange={(e) => setNewPitcher({...newPitcher, name: e.target.value})}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Jersey Number</label>
                <input
                  type="text"
                  value={newPitcher.number}
                  onChange={(e) => setNewPitcher({...newPitcher, number: e.target.value})}
                  placeholder="42"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setNewPitcher({...newPitcher, role: 'Starter'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.role === 'Starter' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Starter
                    </button>
                    <button
                      onClick={() => setNewPitcher({...newPitcher, role: 'Reliever'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.role === 'Reliever' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Reliever
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Handedness</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setNewPitcher({...newPitcher, handedness: 'LHP'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.handedness === 'LHP' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      LHP
                    </button>
                    <button
                      onClick={() => setNewPitcher({...newPitcher, handedness: 'RHP'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.handedness === 'RHP' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      RHP
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium mb-3 block">Pitch Arsenal</label>
                
                <div className="mb-4">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Fastballs</div>
                  <div className="grid grid-cols-4 gap-2">
                    {allPitchTypes.fastballs.map(pitch => (
                      <button
                        key={pitch.abbr}
                        onClick={() => togglePitchType(pitch.abbr)}
                        className={`py-3 rounded-lg font-medium transition-all flex flex-col items-center ${
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="text-lg font-bold">{pitch.abbr}</div>
                        <div className="text-xs mt-1 opacity-70">{pitch.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Breaking Balls</div>
                  <div className="grid grid-cols-4 gap-2">
                    {allPitchTypes.breaking.map(pitch => (
                      <button
                        key={pitch.abbr}
                        onClick={() => togglePitchType(pitch.abbr)}
                        className={`py-3 rounded-lg font-medium transition-all flex flex-col items-center ${
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="text-lg font-bold">{pitch.abbr}</div>
                        <div className="text-xs mt-1 opacity-70">{pitch.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Changeups</div>
                  <div className="grid grid-cols-3 gap-2">
                    {allPitchTypes.changeups.map(pitch => (
                      <button
                        key={pitch.abbr}
                        onClick={() => togglePitchType(pitch.abbr)}
                        className={`py-3 rounded-lg font-medium transition-all flex flex-col items-center ${
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="text-lg font-bold">{pitch.abbr}</div>
                        <div className="text-xs mt-1 opacity-70">{pitch.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddPitcherModal(false);
                  setNewPitcher({ name: '', number: '', pitchTypes: [], role: '', handedness: '' });
                }}
                className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addPitcher}
                disabled={!newPitcher.name || newPitcher.pitchTypes.length === 0 || (!isScoutContext && (!newPitcher.number || !newPitcher.role || !newPitcher.handedness))}
                className="flex-1 h-12 bg-lime-400 hover:bg-lime-300 rounded-xl text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Pitcher
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditPitcherModal && editingPitcher && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-2xl font-semibold mb-6">Edit Pitcher</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Name</label>
                <input
                  type="text"
                  value={editingPitcher.name}
                  onChange={(e) => setEditingPitcher({...editingPitcher, name: e.target.value})}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Jersey Number</label>
                <input
                  type="text"
                  value={editingPitcher.number}
                  onChange={(e) => setEditingPitcher({...editingPitcher, number: e.target.value})}
                  placeholder="42"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEditingPitcher({...editingPitcher, role: 'Starter'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        editingPitcher.role === 'Starter' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Starter
                    </button>
                    <button
                      onClick={() => setEditingPitcher({...editingPitcher, role: 'Reliever'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        editingPitcher.role === 'Reliever' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Reliever
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Handedness</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEditingPitcher({...editingPitcher, handedness: 'LHP'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        editingPitcher.handedness === 'LHP' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      LHP
                    </button>
                    <button
                      onClick={() => setEditingPitcher({...editingPitcher, handedness: 'RHP'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        editingPitcher.handedness === 'RHP' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      RHP
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium mb-3 block">Pitch Arsenal</label>
                
                <div className="mb-4">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Fastballs</div>
                  <div className="grid grid-cols-4 gap-2">
                    {allPitchTypes.fastballs.map(pitch => (
                      <button
                        key={pitch.abbr}
                        onClick={() => toggleEditPitchType(pitch.abbr)}
                        className={`py-3 rounded-lg font-medium transition-all flex flex-col items-center ${
                          editingPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="text-lg font-bold">{pitch.abbr}</div>
                        <div className="text-xs mt-1 opacity-70">{pitch.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Breaking Balls</div>
                  <div className="grid grid-cols-4 gap-2">
                    {allPitchTypes.breaking.map(pitch => (
                      <button
                        key={pitch.abbr}
                        onClick={() => toggleEditPitchType(pitch.abbr)}
                        className={`py-3 rounded-lg font-medium transition-all flex flex-col items-center ${
                          editingPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="text-lg font-bold">{pitch.abbr}</div>
                        <div className="text-xs mt-1 opacity-70">{pitch.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Changeups</div>
                  <div className="grid grid-cols-3 gap-2">
                    {allPitchTypes.changeups.map(pitch => (
                      <button
                        key={pitch.abbr}
                        onClick={() => toggleEditPitchType(pitch.abbr)}
                        className={`py-3 rounded-lg font-medium transition-all flex flex-col items-center ${
                          editingPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="text-lg font-bold">{pitch.abbr}</div>
                        <div className="text-xs mt-1 opacity-70">{pitch.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditPitcherModal(false);
                  setEditingPitcher(null);
                }}
                className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedPitcher}
                disabled={!editingPitcher.name || !editingPitcher.number || editingPitcher.pitchTypes.length === 0 || !editingPitcher.role || !editingPitcher.handedness}
                className="flex-1 h-12 bg-lime-400 hover:bg-lime-300 rounded-xl text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showPitcherSelect && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-2xl font-semibold mb-2">Select Pitcher</h3>
            <p className="text-slate-400 text-sm mb-4">Choose which pitcher will be throwing in this game</p>
          <input
            type="text"
            value={pitcherSearch}
            onChange={(e) => setPitcherSearch(e.target.value)}
            placeholder="Search pitchers..."
            className="w-full px-4 py-3 mb-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {pitchers.map(pitcher => (
                <button
                  key={pitcher.id}
                  onClick={() => startGameWithPitcher(pitcher)}
                  className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl p-4 sm:p-6 text-left transition-all group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-lime-400/10 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-lime-400">#{pitcher.number}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">{pitcher.name}</div>
                      <div className="text-sm text-slate-400">{pitcher.handedness} • {pitcher.role}</div>
                    </div>
                    <ChevronRight size={24} className="text-slate-600 group-hover:text-lime-400 transition-colors" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pitcher.pitchTypes.slice(0, 6).map(type => (
                      <span key={type} className="px-2 py-1 bg-slate-800/50 rounded text-slate-400 text-xs">
                        {type}
                      </span>
                    ))}
                    {pitcher.pitchTypes.length > 6 && (
                      <span className="px-2 py-1 text-slate-500 text-xs">
                        +{pitcher.pitchTypes.length - 6}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPitcherSelect(false)}
            className="w-full h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
 

}

// Team Dashboard View

if (view === 'scouting-rotation') {
const scoutPitchers = loadScoutPitchers();
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6" style={{ fontSize: '16px' }}>
<BroadcastStyle />
<div className="w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
  <div className="flex justify-between items-center mb-8">
    <div>
      <button
        onClick={() => setView('landing')}
        className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-medium text-white mb-1">Scouting Roster</h1>
      <p className="text-slate-400 text-sm">Opponent pitchers (separate from your team)</p>
    </div>
    <div className="flex gap-3">
      <button
        onClick={() => { setScoutingMode(true); setShowAddPitcherModal(true); }}
        className="bg-lime-400 text-slate-900 px-6 py-2.5 rounded-full font-medium hover:bg-lime-300 transition-all flex items-center gap-2"
      >
        <Plus size={18} /> Add Opponent
      </button>
    </div>
  </div>

  {scoutPitchers.length === 0 ? (
    <div className="text-center py-24">
      <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Users size={40} className="text-slate-500" />
      </div>
      <h3 className="text-2xl font-semibold text-white mb-2">No Opponents Yet</h3>
      <p className="text-slate-400 mb-6">Add the opposing pitcher to start scouting</p>
      <button
        onClick={() => { setScoutingMode(true); setShowAddPitcherModal(true); }}
        className="bg-lime-400 text-slate-900 px-8 py-3 rounded-full font-medium hover:bg-lime-300 transition-all inline-flex items-center gap-2"
      >
        <Plus size={20} /> Add Opponent
      </button>
    </div>
  ) : (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scoutPitchers.map(pitcher => (
        <div
          key={pitcher.id}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 bg-lime-400/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-lime-400">#{pitcher.number || '--'}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsScouting(true);
                  openEditPitcher(pitcher);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-blue-500/10 rounded-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button
                onClick={() => deletePitcher(pitcher.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 size={18} className="text-red-400" />
              </button>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{pitcher.name}</h3>
          <div className="text-sm text-slate-400 mb-3">
            {pitcher.handedness || '--'} • {pitcher.role || 'Opponent'}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(pitcher.pitchTypes || []).map(type => (
              <span key={type} className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 text-sm font-medium">
                {type}
              </span>
            ))}
          </div>
          <button
            onClick={() => {
              setIsScouting(true);
              setSelectedPitcher(pitcher);
              setView('dashboard');
            }}
            className="w-full py-2 bg-lime-400/10 hover:bg-cyan-400/20 border border-lime-400/30 rounded-lg text-lime-400 font-medium transition-all flex items-center justify-center gap-2"
          >
            View Scouting Dashboard
            <ChevronRight size={16} />
          </button>
        </div>
      ))}
    </div>
  )}
{showAddPitcherModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-2xl font-semibold mb-6">Add New Pitcher</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Name</label>
                <input
                  type="text"
                  value={newPitcher.name}
                  onChange={(e) => setNewPitcher({...newPitcher, name: e.target.value})}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Jersey Number</label>
                <input
                  type="text"
                  value={newPitcher.number}
                  onChange={(e) => setNewPitcher({...newPitcher, number: e.target.value})}
                  placeholder="42"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setNewPitcher({...newPitcher, role: 'Starter'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.role === 'Starter' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Starter
                    </button>
                    <button
                      onClick={() => setNewPitcher({...newPitcher, role: 'Reliever'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.role === 'Reliever' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Reliever
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Handedness</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setNewPitcher({...newPitcher, handedness: 'LHP'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.handedness === 'LHP' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      LHP
                    </button>
                    <button
                      onClick={() => setNewPitcher({...newPitcher, handedness: 'RHP'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.handedness === 'RHP' ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      RHP
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium mb-3 block">Pitch Arsenal</label>
                
                <div className="mb-4">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Fastballs</div>
                  <div className="grid grid-cols-4 gap-2">
                    {allPitchTypes.fastballs.map(pitch => (
                      <button
                        key={pitch.abbr}
                        onClick={() => togglePitchType(pitch.abbr)}
                        className={`py-3 rounded-lg font-medium transition-all flex flex-col items-center ${
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="text-lg font-bold">{pitch.abbr}</div>
                        <div className="text-xs mt-1 opacity-70">{pitch.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Breaking Balls</div>
                  <div className="grid grid-cols-4 gap-2">
                    {allPitchTypes.breaking.map(pitch => (
                      <button
                        key={pitch.abbr}
                        onClick={() => togglePitchType(pitch.abbr)}
                        className={`py-3 rounded-lg font-medium transition-all flex flex-col items-center ${
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="text-lg font-bold">{pitch.abbr}</div>
                        <div className="text-xs mt-1 opacity-70">{pitch.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Changeups</div>
                  <div className="grid grid-cols-3 gap-2">
                    {allPitchTypes.changeups.map(pitch => (
                      <button
                        key={pitch.abbr}
                        onClick={() => togglePitchType(pitch.abbr)}
                        className={`py-3 rounded-lg font-medium transition-all flex flex-col items-center ${
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="text-lg font-bold">{pitch.abbr}</div>
                        <div className="text-xs mt-1 opacity-70">{pitch.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddPitcherModal(false);
                  setNewPitcher({ name: '', number: '', pitchTypes: [], role: '', handedness: '' });
                }}
                className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addPitcher}
                disabled={!newPitcher.name || newPitcher.pitchTypes.length === 0 || (!isScoutContext && (!newPitcher.number || !newPitcher.role || !newPitcher.handedness))}
                className="flex-1 h-12 bg-lime-400 hover:bg-lime-300 rounded-xl text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Pitcher
              </button>
            </div>
          </div>
        </div>
      )}
</div>
</div>
);
}

if (view === 'team-dashboard') {
const filteredPitchers = pitchers.filter(p => {
if (filterRole !== 'all' && p.role !== filterRole) return false;
if (filterHandedness !== 'all' && p.handedness !== filterHandedness) return false;
return true;
});

const allGames = JSON.parse(localStorage.getItem('baseball_games') || '{}');
const filteredPitcherIds = filteredPitchers.map(p => p.id);
const filteredGames = filteredPitcherIds.flatMap(id => allGames[id] || []);
const filteredTeamStats = calculateStatsFromGames(filteredGames);

return (
  <div className="min-h-screen text-[16px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
    <div className="w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button 
            onClick={() => setView('landing')}
            className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-medium text-white mb-1">Team Season Dashboard</h1>
          <p className="text-slate-400 text-sm">Comprehensive team analytics and performance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterRole === 'all'
                ? 'bg-lime-400 text-slate-900'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Pitchers
          </button>
          <button
            onClick={() => setFilterRole('Starter')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterRole === 'Starter'
                ? 'bg-lime-400 text-slate-900'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Starters
          </button>
          <button
            onClick={() => setFilterRole('Reliever')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterRole === 'Reliever'
                ? 'bg-lime-400 text-slate-900'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Relievers
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterHandedness('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterHandedness === 'all'
                ? 'bg-blue-400 text-slate-900'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Both
          </button>
          <button
            onClick={() => setFilterHandedness('LHP')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterHandedness === 'LHP'
                ? 'bg-blue-400 text-slate-900'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            LHP
          </button>
          <button
            onClick={() => setFilterHandedness('RHP')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterHandedness === 'RHP'
                ? 'bg-blue-400 text-slate-900'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            RHP
          </button>
        </div>
      </div>

      {/* Team Stats */}
      {filteredTeamStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Team Games</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">{filteredTeamStats.gamesPlayed}</div>
              <div className="text-xs text-lime-400 font-medium">Season Total</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Strike Rate</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">{filteredTeamStats.strikePercentage}%</div>
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-lime-400" />
                <span className="text-xs text-lime-400 font-medium">Team Average</span>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">First Pitch Strike</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">{filteredTeamStats.firstPitchStrikeRate}%</div>
              <div className="text-xs text-slate-500">Target: 65%</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">K/BB Ratio</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">
                {filteredTeamStats.strikeouts}/{filteredTeamStats.walks}
              </div>
              <div className="text-xs text-slate-500">{(filteredTeamStats.strikeouts / Math.max(filteredTeamStats.walks, 1)).toFixed(2)} ratio</div>
            </div>
          </div>

          {/* Removed: Total Pitches / Strikeouts / Walks from Team Dashboard */}
        </>
      )}

      {/* Filtered Pitchers List */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          {filterRole === 'all' ? 'All Pitchers' : filterRole === 'Starter' ? 'Starters' : 'Relievers'}
          {filterHandedness !== 'all' && ` (${filterHandedness})`}
          <span className="text-slate-400 font-normal ml-2">({filteredPitchers.length})</span>
        </h2>
        
        {filteredPitchers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No pitchers match the selected filters
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPitchers.map(pitcher => (
              <div
                key={pitcher.id}
                onClick={() => {
                  setSelectedPitcher(pitcher);
                  setView('dashboard');
                }}
                className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 hover:bg-slate-700/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-lime-400/10 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-lime-400">#{pitcher.number}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{pitcher.name}</div>
                    <div className="text-xs text-slate-400">{pitcher.handedness} • {pitcher.role}</div>
                  </div>
                  <ChevronRight size={20} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {pitcher.pitchTypes.slice(0, 4).map(type => (
                    <span key={type} className="px-2 py-1 bg-slate-800/50 rounded text-slate-400 text-xs">
                      {type}
                    </span>
                  ))}
                  {pitcher.pitchTypes.length > 4 && (
                    <span className="px-2 py-1 text-slate-500 text-xs">
                      +{pitcher.pitchTypes.length - 4}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
 

}

// Individual Pitcher Dashboard View
if (view === 'dashboard' && selectedPitcher) {
const { zoneCounts, max: zoneMax } = getZoneStats(games, zoneFilterHandedness, zoneFilterPitch);
const pitchTypeOptions = ['all', ...(selectedPitcher?.pitchTypes || [])];
return (
<div className="min-h-screen text-[16px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
<div className="w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6">
<div className="flex justify-between items-center mb-8">
<div>
<button
onClick={() => setView('team-dashboard')}
className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
>
← Back to Team Dashboard
</button>
<h1 className="text-3xl font-medium text-white mb-1">{selectedPitcher.name} Dashboard</h1>
<p className="text-slate-400 text-sm">#{selectedPitcher.number} • {selectedPitcher.handedness} • {selectedPitcher.role}</p>
</div>
<div className="flex gap-3">
<button
            onClick={() => {
              const report = generateSeasonReport(selectedPitcher, games);
              const id = saveReport(report);
              setReportId(id);
              setReportText(report);
              setView('report');
            }}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-2"
          >
            Advance Report
          </button>
          {currentGame && (
<button
onClick={() => setView('pitch-entry')}
className="bg-blue-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-400 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
>
Continue Game
</button>
)}
<button
onClick={createNewGame}
className="bg-lime-400 text-slate-900 px-6 py-2.5 rounded-full font-medium hover:bg-lime-300 transition-all flex items-center gap-2 shadow-lg shadow-lime-400/20"
>
<Plus size={18} /> New Game
</button>
</div>
</div>

 
      {/* Season Stats Grid */}
      {seasonStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Games Played</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">{seasonStats.gamesPlayed}</div>
              <div className="text-xs text-lime-400 font-medium">Active</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Strike Rate</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">{seasonStats.strikePercentage}%</div>
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-lime-400" />
                <span className="text-xs text-lime-400 font-medium">Good</span>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">First Pitch Strike</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">{seasonStats.firstPitchStrikeRate}%</div>
              <div className="text-xs text-slate-500">Target: 65%</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">K/BB Ratio</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">
                {seasonStats.strikeouts}/{seasonStats.walks}
              </div>
              <div className="text-xs text-slate-500">{(seasonStats.strikeouts / Math.max(seasonStats.walks, 1)).toFixed(2)} ratio</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Total Pitches</div>
              <div className="text-3xl font-semibold text-white">{seasonStats.totalPitches}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Strikeouts</div>
              <div className="text-3xl font-semibold text-white">{seasonStats.strikeouts}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Walks</div>
              <div className="text-3xl font-semibold text-white">{seasonStats.walks}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">2 of 3 Strikes</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold text-white">{seasonStats.twoOfThreeRate}%</div>
                <Target size={20} className="text-lime-400 mb-1" />
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">3 Pitch Outs</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold text-white">{seasonStats.threeOrLessRate}%</div>
                <TrendingUp size={20} className="text-blue-400 mb-1" />
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Total Pitches</div>
              <div className="text-3xl font-semibold text-white">{seasonStats.totalPitches}</div>
            </div>
          </div>
        </>
      )}

      {/* Pitch Type Breakdown */}
      {seasonStats && seasonStats.pitchTypeCounts && Object.keys(seasonStats.pitchTypeCounts).length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Pitch Type Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(seasonStats.pitchTypeCounts).map(([type, count]) => {
              const strikes = seasonStats.pitchTypeStrikes[type] || 0;
              const strikePercentage = count > 0 ? ((strikes / count) * 100).toFixed(1) : 0;
              
              return (
                <div key={type} className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-white">{type}</span>
                    <span className="text-lime-400 text-sm font-medium">{strikePercentage}%</span>
                  </div>
                  <div className="text-slate-400 text-sm mb-2">
                    {count} pitch{count !== 1 ? 'es' : ''}
                  </div>
                  <div className="w-full bg-slate-600/50 rounded-full h-2">
                    <div 
                      className="bg-lime-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${strikePercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {strikes} strikes / {count - strikes} balls
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pitch Location Heatmap */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-white">Pitch Location (9‑Box)</h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setZoneFilterHandedness('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  zoneFilterHandedness === 'all' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setZoneFilterHandedness('L')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  zoneFilterHandedness === 'L' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                LHB
              </button>
              <button
                onClick={() => setZoneFilterHandedness('R')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  zoneFilterHandedness === 'R' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                RHB
              </button>
            </div>
            <select
              value={zoneFilterPitch}
              onChange={(e) => setZoneFilterPitch(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-700 text-slate-200 border border-slate-600"
            >
              {pitchTypeOptions.map(p => (
                <option key={p} value={p}>
                  {p === 'all' ? 'All Pitches' : p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-sm">
          {zoneGrid.map((row, rIdx) =>
            row.map((zone, cIdx) => {
              if (!zone) return <div key={`hz-${rIdx}-${cIdx}`} />;
              const count = zoneCounts[zone] || 0;
              const intensity = count / zoneMax;
              const label = `Z${zone}`;
              return (
                <div
                  key={`hz-${rIdx}-${cIdx}-${zone}`}
                  className="h-16 rounded-lg border border-slate-600/70 flex flex-col items-center justify-center text-[11px] font-semibold"
                  style={{
                    background: `rgba(163, 230, 53, ${0.1 + intensity * 0.6})`,
                    color: intensity > 0.45 ? '#0f172a' : '#e2e8f0'
                  }}
                >
                  <div className="text-[11px]">{label}</div>
                  <div className="opacity-80">{count}</div>
                </div>
              );
            })
          )}
        </div>
        <div className="text-xs text-slate-500 mt-3">
          Filters apply to saved games for this pitcher.
        </div>
      </div>

      {/* Pitch Pairing Impact */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-white">Pitch Pairing Impact</h3>
          <select
            value={pairFilterFirst}
            onChange={(e) => setPairFilterFirst(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-700 text-slate-200 border border-slate-600"
          >
            {['all', ...(selectedPitcher?.pitchTypes || [])].map(p => (
              <option key={p} value={p}>{p === 'all' ? 'All First Pitches' : p}</option>
            ))}
          </select>
        </div>
        {(() => {
          const pairs = getPitchPairingImpact(games, pairFilterFirst).slice(0, 6);
          return pairs.length === 0 ? (
            <div className="text-slate-500 text-sm">No pairing data yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pairs.map(p => (
                <div key={p.pair} className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
                  <div className="text-white font-semibold">{p.pair}</div>
                  <div className="text-xs text-slate-400">{p.total} sequences</div>
                  <div className="text-xs text-slate-300 mt-2">K% {p.kPct} · BB% {p.bbPct} · H% {p.hPct}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Zone-Result Overlay */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-white">Zone‑Result Overlay</h3>
          <select
            value={zoneResultFilter}
            onChange={(e) => setZoneResultFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-700 text-slate-200 border border-slate-600"
          >
            {['all','K','BB','H','OUT'].map(o => (
              <option key={o} value={o}>{o === 'all' ? 'All Results' : o}</option>
            ))}
          </select>
        </div>
        {(() => {
          const { zoneCounts, max } = getZoneResultStats(games, zoneResultFilter);
          return (
            <div className="grid grid-cols-3 gap-2 max-w-sm">
              {zoneLabels.map((zone) => {
                const count = zoneCounts[zone] || 0;
                const intensity = count / max;
                return (
                  <div
                    key={zone}
                    className="h-16 rounded-lg border border-slate-600/70 flex flex-col items-center justify-center text-[11px] font-semibold"
                    style={{
                      background: `rgba(163, 230, 53, ${0.1 + intensity * 0.6})`,
                      color: intensity > 0.45 ? '#0f172a' : '#e2e8f0'
                    }}
                  >
                    <div className="text-[11px]">Z{zone}</div>
                    <div className="opacity-80">{count}</div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Put-Away Efficiency */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Put‑Away Efficiency (2‑Strike Counts)</h3>
        {(() => {
          const stats = getPutAwayStats(games);
          return stats.opportunities === 0 ? (
            <div className="text-slate-500 text-sm">No 2‑strike opportunities yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
                <div className="text-xs text-slate-400">Opportunities</div>
                <div className="text-2xl font-semibold text-white">{stats.opportunities}</div>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
                <div className="text-xs text-slate-400">K%</div>
                <div className="text-2xl font-semibold text-white">{stats.kRate}%</div>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
                <div className="text-xs text-slate-400">BB%</div>
                <div className="text-2xl font-semibold text-white">{stats.bbRate}%</div>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
                <div className="text-xs text-slate-400">Whiff%</div>
                <div className="text-2xl font-semibold text-white">{stats.whiffRate}%</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Games List */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Games</h2>
        
        {games.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚾</span>
            </div>
            <p className="text-slate-400 mb-2">No games recorded yet</p>
            <p className="text-slate-500 text-sm">Start tracking by creating a new game</p>
          </div>
        ) : (
          <div className="space-y-2">
            {games.map(game => (
              <div
                key={game.id}
                className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 hover:bg-slate-700/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-lime-400/10 rounded-xl flex items-center justify-center">
                      <span className="text-lime-400 font-bold text-lg">⚾</span>
                    </div>
                    <div>
                      <div className="text-white font-medium mb-1">
                        {new Date(game.date).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-slate-400 text-sm">
                        vs {game.opponent || 'Unknown'} • {game.innings?.length || 0} innings •
                        {game.innings?.reduce((sum, i) => sum + (i.atBats?.length || 0), 0) || 0} at-bats
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openReport(game);
                      }}
                      className="px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 rounded-md text-xs text-white"
                    >
                      Report
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyShareLink(game);
                      }}
                      className="px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 rounded-md text-xs text-white"
                    >
                      Share
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const report = generateGameReport(game);
                        const blob = new Blob([report], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `game-${game.id}.txt`;
                        a.click();
                      }}
                      className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors"
                    >
                      <Download size={18} className="text-slate-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGame(game.id);
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                    <ChevronRight size={20} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
 

}

if (view === 'report') {
const shareLink = reportId ? `${window.location.origin}?report=${reportId}` : '';
const reportLines = (reportText || '').split('\n');
return (
<div className="min-h-screen text-[16px] bg-slate-900 text-white p-4 sm:p-6">
<div className="w-full w-full w-full md:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 px-2 sm:px-0 px-2 sm:px-0">
  <div className="flex justify-between items-center mb-6">
    <button
      onClick={() => setView('dashboard')}
      className="text-slate-400 hover:text-white flex items-center gap-2"
    >
      ← Back
    </button>
    <div className="flex gap-2">
      <button
        onClick={() => {
          if (shareLink && navigator.clipboard?.writeText) navigator.clipboard.writeText(shareLink);
        }}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
      >
        Copy Share Link
      </button>
      <button
        onClick={() => window.print()}
        className="px-4 py-2 bg-lime-400 hover:bg-lime-300 rounded-lg text-slate-900 text-sm font-semibold"
      >
        Print / Save PDF
      </button>
    </div>
  </div>
  <div className="bg-white border border-slate-300 rounded-2xl p-6 text-slate-900 shadow-xl">
    <div className="border-b border-slate-300 pb-4 mb-4">
      <div className="text-2xl font-semibold tracking-wide">Pitch Report</div>
      <div className="text-sm text-slate-600">Formatted for printing and export</div>
    </div>
    <div style={{ fontFamily: 'Times New Roman', fontSize: '12pt', lineHeight: '2' }}>
      {reportLines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;
        const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && trimmed.length < 40;
        if (isAllCaps) return <h2 key={idx} className="text-lg font-semibold mt-4 mb-1">{trimmed}</h2>;
        if (trimmed.endsWith(':')) return <h3 key={idx} className="text-base font-semibold mt-3">{trimmed}</h3>;
        if (trimmed.startsWith('- ')) return <p key={idx} className="pl-4">{trimmed}</p>;
        const splitIdx = trimmed.indexOf(': ');
        if (splitIdx > 0 && splitIdx < 30) {
          const label = trimmed.slice(0, splitIdx);
          const value = trimmed.slice(splitIdx + 2);
          return (
            <div key={idx} className="grid grid-cols-[220px_1fr] gap-2">
              <span className="font-semibold">{label}:</span>
              <span>{value}</span>
            </div>
          );
        }
        return <p key={idx}>{trimmed}</p>;
      })}
    </div>
  </div>
  {shareLink && (
    <div className="text-xs text-slate-500 mt-4">
      Share link works on this device: {shareLink}
    </div>
  )}
</div>
</div>
);
}

if (view === 'bullpen') {
const inGameStats = getInGamePitchStats();
const fastballSet = new Set(['4S', '2S', 'SNK', 'CT']);
return (
<div className="min-h-screen text-[16px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
<div className="w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6">
  <div className="flex justify-between items-center mb-6">
    <button
      onClick={() => setView('landing')}
      className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
    >
      ← Back
    </button>
    <div className="text-sm text-slate-400">Bullpen Session</div>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Total Pitches</div>
      <div className="text-5xl font-semibold text-white">{getTotalPitchCount()}</div>
    </div>
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Count</div>
      <div className="text-5xl font-semibold text-white tracking-wider">{getCount()}</div>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-6 mb-6">
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Pitch Location (Optional)</div>
        <button
          onClick={() => setSelectedZone(null)}
          className="text-xs text-slate-400 hover:text-white"
        >
          Clear
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {zoneGrid.map((row, rIdx) =>
          row.map((zone, cIdx) => {
            if (!zone) return <div key={`z-${rIdx}-${cIdx}`} />;
            const label = zone;
            const isSelected = selectedZone === zone;
            return (
              <button
                key={`z-${rIdx}-${cIdx}-${zone}`}
                onClick={() => setSelectedZone(zone)}
                className={`rounded-lg border font-semibold ${oneHandMode ? 'h-14 text-sm' : 'h-10 text-xs'} ${
                  isSelected
                    ? 'bg-lime-400 text-slate-900 border-lime-300'
                    : 'bg-slate-700/70 text-slate-200 border-slate-600/60 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })
        )}
      </div>
      <div className="text-xs text-slate-500 mt-2">Selected: {selectedZone || 'None'}</div>
    </div>

    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Pitch Trail (Last 8)</div>
      <div className="flex flex-wrap gap-2">
        {pitchTrail.length === 0 ? (
          <div className="text-slate-500 text-sm">No pitches yet</div>
        ) : (
          pitchTrail.map((p, i) => (
            <div
              key={`${p.type}-${i}`}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                p.isStrike ? 'border-lime-400/50 text-lime-400 bg-lime-400/10' : 'border-red-400/50 text-red-400 bg-red-400/10'
              }`}
            >
              {p.type} {p.zone ? `@${p.zone}` : ''}
            </div>
          ))
        )}
      </div>
    </div>
  </div>

  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-4 sm:p-6 mb-6">
    <button
      onClick={() => setShowPitchEffectiveness(!showPitchEffectiveness)}
      className="w-full flex items-center justify-between text-left"
    >
      <div className="text-slate-300 text-sm font-medium uppercase tracking-wider">In‑Game Pitch Effectiveness</div>
      <div className="text-xs text-slate-500">{showPitchEffectiveness ? 'Hide' : 'Show'} • FB highlighted</div>
    </button>
    {showPitchEffectiveness && (
      <div className="mt-4">
        {inGameStats.length === 0 ? (
          <div className="text-slate-500 text-sm">No pitches recorded yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {inGameStats.map((p) => (
              <div
                key={p.type}
                className={`rounded-xl border p-3 ${
                  fastballSet.has(p.type)
                    ? 'border-blue-400/60 bg-blue-400/10 text-blue-200'
                    : 'border-slate-700/60 bg-slate-800/40 text-slate-200'
                }`}
              >
                <div className="text-lg font-bold">{p.type}</div>
                <div className="text-xs opacity-70">{p.total} pitches</div>
                <div className="text-2xl font-semibold mt-1">{p.strikePct}%</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  C {p.called} · Sw {p.swinging} · F {p.foul}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:p-6 mb-6">
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
        <div className="text-slate-300 text-sm font-medium uppercase tracking-wider">Strike</div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
        {selectedPitcher?.pitchTypes.map(type => (
          <button
            key={type}
            onClick={() => selectPitchType(type, true)}
            className="h-24 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 rounded-xl text-lime-400 text-2xl font-bold active:scale-95 transition-all"
          >
            {type}
          </button>
        ))}
      </div>
      {pendingPitch && pendingPitch.isStrike && (
        <div className="mt-4 p-4 bg-lime-400/5 border border-lime-400/20 rounded-xl">
          <div className="text-slate-300 text-xs font-medium uppercase tracking-wider mb-3">Strike Type</div>
          <div className="grid grid-cols-3 gap-2">
            {strikeTypes.map(strikeType => (
              <button
                key={strikeType}
                onClick={() => recordPitch(pendingPitch.type, true, strikeType)}
                className="py-3 bg-lime-400/20 hover:bg-lime-400/30 border border-lime-400/40 rounded-lg text-lime-400 font-medium text-sm active:scale-95 transition-all"
              >
                {strikeType}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
        <div className="text-slate-300 text-sm font-medium uppercase tracking-wider">Ball</div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
        {selectedPitcher?.pitchTypes.map(type => (
          <button
            key={type}
            onClick={() => selectPitchType(type, false)}
            className={`bg-red-400/10 hover:bg-red-400/20 border border-red-400/30 rounded-xl text-red-400 font-bold active:scale-95 transition-all ${oneHandMode ? 'h-28 text-3xl' : 'h-24 text-2xl'}`}
          >
            {type}
          </button>
        ))}
      </div>
      {pendingPitch && !pendingPitch.isStrike && (
        <div className="mt-4 p-4 bg-red-400/5 border border-red-400/20 rounded-xl">
          <div className="text-slate-300 text-xs font-medium uppercase tracking-wider mb-3">Ball Type</div>
          <div className="grid grid-cols-2 gap-2">
            {ballTypes.map(ballType => (
              <button
                key={ballType}
                onClick={() => recordPitch(pendingPitch.type, false, null, ballType)}
                className="py-3 bg-red-400/20 hover:bg-red-400/30 border border-red-400/40 rounded-lg text-red-400 font-medium text-sm active:scale-95 transition-all"
              >
                {ballType}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <button
          onClick={() => setView('landing')}
          className="h-16 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white font-medium transition-all"
        >
          Home
        </button>
    <button
      onClick={undoLastPitch}
      disabled={actionHistory.length === 0}
      className="h-16 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    >
      Undo
    </button>
    <button
      onClick={nextBatter}
      className="h-16 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white font-medium transition-all"
    >
      Next Set
    </button>
    <button
      onClick={saveGame}
      className="h-16 bg-lime-400 hover:bg-lime-300 rounded-xl text-slate-900 font-semibold transition-all shadow-lg shadow-lime-400/20"
    >
      Save Session
    </button>
  </div>
</div>
</div>
);
}

if (view === 'pitch-entry') {
const inGameStats = getInGamePitchStats();
const fastballSet = new Set(['4S', '2S', 'SNK', 'CT']);
return (
<div className="min-h-screen text-[16px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
<div className="w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6">
<div className="sticky top-0 z-30 mb-4">
  <div className="flex flex-wrap items-center gap-4 bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl px-4 py-2">
    <button onClick={() => setOneHandMode(!oneHandMode)} className="text-xs px-2 py-1 rounded-full border border-lime-400/40 text-lime-300 bg-lime-400/10">{oneHandMode ? 'One-Hand: On' : 'One-Hand: Off'}</button>
    <div className="text-xs text-slate-400">INN <span className="text-white font-semibold">{currentInning}</span></div>
    <div className="text-xs text-slate-400">COUNT <span className="text-white font-semibold">{getCount()}</span></div>
    <div className="text-xs text-slate-400">LAST PITCH <span className="text-white font-semibold">{atBatPitches.at(-1)?.type || '--'}</span></div>
    <div className="text-xs text-slate-400">VELO <span className="text-white font-semibold">--</span></div>
    <div className="flex items-center gap-2 text-xs text-slate-400">LAST 3
      {getRecentOutcomes().length === 0 ? (
        <span className="text-slate-500">--</span>
      ) : (
        getRecentOutcomes().map((o, i) => (
          <span key={`${o}-${i}`} className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-300 border border-lime-400/30">{o}</span>
        ))
      )}
    </div>
  </div>
</div>

{/* Top Stats Bar */}
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
<div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Inning</div>
<div className="text-5xl font-semibold text-white">{currentInning}</div>
</div>
<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
<div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Batter</div>
<div className="text-5xl font-semibold text-white">{currentBatter}</div>
</div>
<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
<div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Count</div>
<div className="text-5xl font-semibold text-white tracking-wider">{getCount()}</div>
</div>
<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
<div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Outs</div>
<div className="text-5xl font-semibold text-white">{currentOuts}</div>
</div>
<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
<div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Total Pitches</div>
<div className="text-5xl font-semibold text-white">{getTotalPitchCount()}</div>
</div>
</div>

      {/* Batter Handedness */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Batter Handedness</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentBatterHandedness('L')}
              className={`px-4 py-2 rounded-lg font-semibold ${currentBatterHandedness === 'L' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              L
            </button>
            <button
              onClick={() => setCurrentBatterHandedness('R')}
              className={`px-4 py-2 rounded-lg font-semibold ${currentBatterHandedness === 'R' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              R
            </button>
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-2">Applies to this at-bat.</div>
      </div>

      {/* Pitch Location + Trail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-6 mb-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Pitch Location (Optional)</div>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {zoneGrid.map((row, rIdx) =>
              row.map((zone, cIdx) => {
                if (!zone) return <div key={`z-${rIdx}-${cIdx}`} />;
                const label = zone;
                const isSelected = selectedZone === zone;
                return (
                  <button
                    key={`z-${rIdx}-${cIdx}-${zone}`}
                    onClick={() => setSelectedZone(zone)}
                    className={`rounded-lg border font-semibold ${oneHandMode ? 'h-14 text-sm' : 'h-10 text-xs'} ${
                      isSelected
                        ? 'bg-lime-400 text-slate-900 border-lime-300'
                        : 'bg-slate-700/70 text-slate-200 border-slate-600/60 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })
            )}
          </div>
          <div className="text-xs text-slate-500 mt-2">Selected: {selectedZone || 'None'}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Pitch Trail (Last 8)</div>
          <div className="flex flex-wrap gap-2">
            {pitchTrail.length === 0 ? (
              <div className="text-slate-500 text-sm">No pitches yet</div>
            ) : (
              pitchTrail.map((p, i) => (
                <div
                  key={`${p.type}-${i}`}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                    p.isStrike ? 'border-lime-400/50 text-lime-400 bg-lime-400/10' : 'border-red-400/50 text-red-400 bg-red-400/10'
                  }`}
                >
                  {p.type} {p.zone ? `@${p.zone}` : ''}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* In-Game Pitch Effectiveness */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-4 sm:p-6 mb-6">
        <button
          onClick={() => setShowPitchEffectiveness(!showPitchEffectiveness)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="text-slate-300 text-sm font-medium uppercase tracking-wider">In‑Game Pitch Effectiveness</div>
          <div className="text-xs text-slate-500">{showPitchEffectiveness ? 'Hide' : 'Show'} • FB highlighted</div>
        </button>
        {showPitchEffectiveness && (
          <div className="mt-4">
            {inGameStats.length === 0 ? (
              <div className="text-slate-500 text-sm">No pitches recorded yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {inGameStats.map((p) => (
                  <div
                    key={p.type}
                    className={`rounded-xl border p-3 ${
                      fastballSet.has(p.type)
                        ? 'border-blue-400/60 bg-blue-400/10 text-blue-200'
                        : 'border-slate-700/60 bg-slate-800/40 text-slate-200'
                    }`}
                  >
                    <div className="text-lg font-bold">{p.type}</div>
                    <div className="text-xs opacity-70">{p.total} pitches</div>
                    <div className="text-2xl font-semibold mt-1">{p.strikePct}%</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      C {p.called} · Sw {p.swinging} · F {p.foul}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pitch Sequence */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-4 sm:p-6 mb-6">
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-4">Current At-Bat</div>
        {atBatPitches.length === 0 ? (
          <div className="flex items-center justify-center w-full h-full text-slate-500 text-sm">
            No pitches recorded
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {atBatPitches.map((pitch, idx) => {
              const { balls, strikes } = getCountFromPitches(atBatPitches.slice(0, idx + 1));
              const callLabel = pitch.isStrike
                ? (pitch.strikeType === 'Called' ? 'C' : pitch.strikeType === 'Swinging' ? 'Sw' : 'F')
                : (pitch.ballType === 'Check Swing' ? 'CS' : 'B');
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 border ${
                    pitch.isStrike
                      ? 'border-lime-400/50 text-lime-300 bg-lime-400/10'
                      : 'border-red-400/50 text-red-300 bg-red-400/10'
                  }`}
                >
                  <span className="text-sm font-bold">{pitch.type}</span>
                  <span className="text-xs opacity-80">{callLabel}</span>
                  <span className="text-xs text-slate-300">{balls}-{strikes}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pitch Entry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:p-6 mb-6">
        {/* Strikes */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
            <div className="text-slate-300 text-sm font-medium uppercase tracking-wider">Strike</div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
            {selectedPitcher?.pitchTypes.map(type => (
              <button
                key={type}
                onClick={() => selectPitchType(type, true)}
                className="h-24 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 rounded-xl text-lime-400 text-2xl font-bold active:scale-95 transition-all"
              >
                {type}
              </button>
            ))}
          </div>
          
          {/* Strike Type Selection */}
          {pendingPitch && pendingPitch.isStrike && (
            <div className="mt-4 p-4 bg-lime-400/5 border border-lime-400/20 rounded-xl">
              <div className="text-slate-300 text-xs font-medium uppercase tracking-wider mb-3">Strike Type</div>
              <div className="grid grid-cols-3 gap-2">
                {strikeTypes.map(strikeType => (
                  <button
                    key={strikeType}
                    onClick={() => recordPitch(pendingPitch.type, true, strikeType)}
                    className="py-3 bg-lime-400/20 hover:bg-lime-400/30 border border-lime-400/40 rounded-lg text-lime-400 font-medium text-sm active:scale-95 transition-all"
                  >
                    {strikeType}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Balls */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="text-slate-300 text-sm font-medium uppercase tracking-wider">Ball</div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
            {selectedPitcher?.pitchTypes.map(type => (
              <button
                key={type}
                onClick={() => selectPitchType(type, false)}
                className={`bg-red-400/10 hover:bg-red-400/20 border border-red-400/30 rounded-xl text-red-400 font-bold active:scale-95 transition-all ${oneHandMode ? 'h-28 text-3xl' : 'h-24 text-2xl'}`}
              >
                {type}
              </button>
            ))}
          </div>
          
          {/* Ball Type Selection */}
          {pendingPitch && !pendingPitch.isStrike && (
            <div className="mt-4 p-4 bg-red-400/5 border border-red-400/20 rounded-xl">
              <div className="text-slate-300 text-xs font-medium uppercase tracking-wider mb-3">Ball Type</div>
              <div className="grid grid-cols-2 gap-2">
                {ballTypes.map(ballType => (
                  <button
                    key={ballType}
                    onClick={() => recordPitch(pendingPitch.type, false, null, ballType)}
                    className="py-3 bg-red-400/20 hover:bg-red-400/30 border border-red-400/40 rounded-lg text-red-400 font-medium text-sm active:scale-95 transition-all"
                  >
                    {ballType}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Outcomes */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-4 sm:p-6 mb-6">
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-4">At-Bat Result</div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {outcomes.map(outcome => (
            <button
              key={outcome}
              onClick={() => outcome === 'OUT' ? handleOutClick() : completeAtBat(outcome)}
              disabled={atBatPitches.length === 0}
              className={`bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/30 rounded-xl text-blue-400 font-semibold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all ${oneHandMode ? 'h-24 text-lg' : 'h-20'}`}
            >
              {outcome}
            </button>
          ))}
        </div>
      </div>

      {/* Out Location Modal */}
      {showOutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-semibold mb-4">Out Location</h3>
            <input
              type="text"
              value={outLocation}
              onChange={(e) => setOutLocation(e.target.value)}
              placeholder="e.g., F8, 6-3, K"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 mb-4 focus:outline-none focus:ring-2 focus:ring-lime-400"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOutModal(false);
                  setOutLocation('');
                }}
                className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitOut}
                disabled={!outLocation.trim()}
                className="flex-1 h-12 bg-lime-400 hover:bg-lime-300 rounded-xl text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setView('rotation')}
          className="h-16 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white font-medium transition-all"
        >
          Home
        </button>
        <button
          onClick={undoLastPitch}
          disabled={actionHistory.length === 0}
          className="h-16 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Undo
        </button>
        <button
          onClick={nextBatter}
          className="h-16 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white font-medium transition-all"
        >
          Next Batter
        </button>
        <button
          onClick={pitchingChange}
          className="h-16 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white font-medium transition-all"
        >
          Pitching Change
        </button>
        <button
          onClick={saveGame}
          className="h-16 bg-lime-400 hover:bg-lime-300 rounded-xl text-slate-900 font-semibold transition-all shadow-lg shadow-lime-400/20"
        >
          Save Game
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-white text-2xl font-semibold mb-4">
              {showConfirmModal === 'saveGame' ? 'Save Game' : 'Are you sure?'}
            </h3>
            <p className="text-slate-400 mb-6">
              {showConfirmModal === 'undo' && 'This will undo the last action (pitch, at-bat completion, or batter change).'}
              {showConfirmModal === 'nextBatter' && 'This will clear the current at-bat and move to the next batter.'}
              {showConfirmModal === 'pitchChange' && 'This will save the current pitcher and prompt you to select the next pitcher.'}
              {showConfirmModal === 'saveGame' && 'Do you want to save and continue the game, or save and end the game?'}
            </p>
            {showConfirmModal === 'saveGame' ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => confirmSaveGame(true)}
                  className="h-14 bg-lime-400 hover:bg-lime-300 rounded-xl text-slate-900 font-semibold transition-all text-lg"
                >
                  Save & Continue
                </button>
                <button
                  onClick={() => confirmSaveGame(false)}
                  className="h-14 bg-blue-500 hover:bg-blue-400 rounded-xl text-white font-semibold transition-all text-lg"
                >
                  Save & End Game
                </button>
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className="h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className="flex-1 h-14 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showConfirmModal === 'undo') confirmUndo();
                    else if (showConfirmModal === 'nextBatter') confirmNextBatter();
                    else if (showConfirmModal === 'pitchChange') confirmPitchingChange();
                  }}
                  className="flex-1 h-14 bg-lime-400 hover:bg-lime-300 rounded-xl text-slate-900 font-semibold transition-all text-lg"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pitcher Select Modal */}
      {showPitcherSelect && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white text-2xl font-semibold">Select Pitcher</h3>
              <button
                onClick={() => setScoutingMode(!scoutingMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  scoutingMode ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {scoutingMode ? 'Switch to My Team' : 'Switch to Opponent'}
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              {scoutingMode ? 'Track an opponent pitcher (saved separately)' : 'Choose which pitcher will be throwing in this game'}
            </p>
            <input
              type="text"
              value={pitcherSearch}
              onChange={(e) => setPitcherSearch(e.target.value)}
              placeholder="Search pitchers..."
              className="w-full px-4 py-3 mb-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {(scoutingMode ? loadScoutPitchers() : pitchers)
                .filter(p => p.name.toLowerCase().includes(pitcherSearch.toLowerCase()))
                .map(pitcher => (
                <button
                  key={pitcher.id}
                  onClick={() => startGameWithPitcher(pitcher)}
                  className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl p-4 sm:p-6 text-left transition-all group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-lime-400/10 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-lime-400">#{pitcher.number || '--'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">{pitcher.name}</div>
                      <div className="text-sm text-slate-400">{pitcher.handedness || '--'} • {pitcher.role || 'Opponent'}</div>
                    </div>
                    <ChevronRight size={24} className="text-slate-600 group-hover:text-lime-400 transition-colors" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pitcher.pitchTypes.slice(0, 6).map(type => (
                      <span key={type} className="px-2 py-1 bg-slate-800/50 rounded text-slate-400 text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowPitcherSelect(false);
                setShowAddPitcherModal(true);
              }}
              className="w-full h-12 bg-lime-400 hover:bg-lime-300 rounded-xl text-slate-900 font-semibold transition-all mb-3"
            >
              {scoutingMode ? 'Add Opponent Pitcher' : 'Add Pitcher'}
            </button>
            <button
              onClick={() => setShowPitcherSelect(false)}
              className="w-full h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
     </div> 

    ); 
 

}

return <div className="min-h-screen text-[16px] bg-slate-900 text-white p-4 sm:p-6">Loading...</div>;
};

export default PitchTrackerApp;
