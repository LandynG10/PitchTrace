import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Plus, Trash2, Download, ChevronRight, TrendingUp, Target, BarChart3, Users } from 'lucide-react';


const BroadcastStyle = () => (
  <style>{`
:root {
  --broadcast-primary: #22d3ee;
  --broadcast-accent: #f59e0b;
  --app-primary: #22d3ee;
  --app-accent: #f59e0b;
  --app-font-size: 16px;
}
.app-theme {
  font-size: var(--app-font-size, 16px);
}
.app-theme .bg-cyan-400 { background-color: var(--app-primary) !important; }
.app-theme .bg-cyan-300 { background-color: var(--app-primary) !important; }
.app-theme .text-cyan-400 { color: var(--app-primary) !important; }
.app-theme .text-cyan-300 { color: var(--app-primary) !important; }
.app-theme .border-cyan-400 { border-color: var(--app-primary) !important; }
.app-theme .border-cyan-300 { border-color: var(--app-primary) !important; }
.app-theme .bg-amber-400 { background-color: var(--app-accent) !important; }
.app-theme .bg-amber-500 { background-color: var(--app-accent) !important; }
.app-theme .text-amber-400 { color: var(--app-accent) !important; }
.app-theme .text-amber-500 { color: var(--app-accent) !important; }
.app-theme .border-amber-400 { border-color: var(--app-accent) !important; }
.app-theme .border-amber-500 { border-color: var(--app-accent) !important; }
.cover-start-btn {
  animation: coverPulseFade 2.1s ease-in-out infinite;
}
@keyframes coverPulseFade {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 0.88; }
}
`}</style>
);

const Breadcrumbs = ({ text }) => (
  <div className="text-xs text-slate-400 mb-3">{text}</div>
);

const shellClass = 'min-h-screen bg-transparent text-slate-50';
const readDisplayPrefs = () => {
  if (typeof window === 'undefined') {
    return {
      theme: 'cyan',
      fontSize: 'normal',
      highContrast: false,
      reduceMotion: false
    };
  }
  try {
    const stored = JSON.parse(window.localStorage.getItem('pitchtrace_display_prefs') || '{}');
    const safeTheme = stored.theme === 'rose' ? 'indigo' : (stored.theme || 'cyan');
    return {
      theme: safeTheme,
      fontSize: stored.fontSize || 'normal',
      highContrast: Boolean(stored.highContrast),
      reduceMotion: Boolean(stored.reduceMotion)
    };
  } catch {
    return {
      theme: 'cyan',
      fontSize: 'normal',
      highContrast: false,
      reduceMotion: false
    };
  }
};

const BSBL101 = () => {
const displayPrefs = readDisplayPrefs();
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
const [pitchCountBaseline, setPitchCountBaseline] = useState(0);
const [view, setView] = useState('landing');
const [seasonStats, setSeasonStats] = useState(null);
const [pendingPitch, setPendingPitch] = useState(null);
const [showOutModal, setShowOutModal] = useState(false);
const [outLocation, setOutLocation] = useState('');
const [pendingDefensiveOutcome, setPendingDefensiveOutcome] = useState(null);
const [showHitLocationModal, setShowHitLocationModal] = useState(false);
const [hitLocation, setHitLocation] = useState('');
const [pendingHitOutcome, setPendingHitOutcome] = useState(null);
const [currentBases, setCurrentBases] = useState({ first: null, second: null, third: null });
const [totalRunsAllowed, setTotalRunsAllowed] = useState(0);
const [showBasesModal, setShowBasesModal] = useState(false);
const [basesDraft, setBasesDraft] = useState({ first: '', second: '', third: '', runs: '0' });
const [showConfirmModal, setShowConfirmModal] = useState(null);
const [currentOuts, setCurrentOuts] = useState(0);
const [actionHistory, setActionHistory] = useState([]);
const [showAddPitcherModal, setShowAddPitcherModal] = useState(false);
const [newPitcher, setNewPitcher] = useState({ name: '', number: '', pitchTypes: [], role: '', handedness: '' });
const [editingPitcher, setEditingPitcher] = useState(null);
const [showEditPitcherModal, setShowEditPitcherModal] = useState(false);
const [filterRole, setFilterRole] = useState('all');
const [filterHandedness, setFilterHandedness] = useState('all');
const [teamReportSearch, setTeamReportSearch] = useState('');
const [teamReportSelectedIds, setTeamReportSelectedIds] = useState([]);
const [showPitcherSelect, setShowPitcherSelect] = useState(false);
const [pitcherSearch, setPitcherSearch] = useState('');
const [pendingPitchingChangeGame, setPendingPitchingChangeGame] = useState(null);
const [reportText, setReportText] = useState('');
const [reportId, setReportId] = useState(null);
const [reportGame, setReportGame] = useState(null);
const [reportPitcher, setReportPitcher] = useState(null);
const [reportSprayFilter, setReportSprayFilter] = useState(null);
const [reportBackView, setReportBackView] = useState('landing');
const [dashboardBackView, setDashboardBackView] = useState('team-dashboard');
const [reportOpponentDraft, setReportOpponentDraft] = useState('');
const [oneHandMode, setOneHandMode] = useState(false);
const [showPitchEffectiveness, setShowPitchEffectiveness] = useState(false);
const [showInGameDetails, setShowInGameDetails] = useState(false);
const [showBullpenCount, setShowBullpenCount] = useState(true);
const [_lastBullpenZone, setLastBullpenZone] = useState(null);
const [bullpenNotes, setBullpenNotes] = useState('');
const [currentVelocity, setCurrentVelocity] = useState('');
const [bullpenMode, setBullpenMode] = useState(false);
const [scoutingMode, setScoutingMode] = useState(false);
const [isScouting, setIsScouting] = useState(false);
const [pendingOpponent, setPendingOpponent] = useState('');
const [showHomeMenu, setShowHomeMenu] = useState(false);
const [showAdvancedTools, setShowAdvancedTools] = useState(false);
const [theme, setTheme] = useState(displayPrefs.theme);
const [fontSize, setFontSize] = useState(displayPrefs.fontSize);
const [highContrast, setHighContrast] = useState(displayPrefs.highContrast);
const [reduceMotion, setReduceMotion] = useState(displayPrefs.reduceMotion);
const [bullpenSessions, setBullpenSessions] = useState([]);
const [dashboardMode, setDashboardMode] = useState('live');
const [showContinueModal, setShowContinueModal] = useState(false);
const [showLineupModal, setShowLineupModal] = useState(false);
const [lineupDraft, setLineupDraft] = useState([]);
const [showRecentGameActions, setShowRecentGameActions] = useState(false);
const [recentGameActionItem, setRecentGameActionItem] = useState(null);
const [recentGameOpponentDraft, setRecentGameOpponentDraft] = useState('');
const [confirmingRecentGameDelete, setConfirmingRecentGameDelete] = useState(false);
const [showRosterShareModal, setShowRosterShareModal] = useState(false);
const [rosterShareMode, setRosterShareMode] = useState('export'); // export | import
const [rosterShareType, setRosterShareType] = useState('team'); // team | scout
const [rosterImportText, setRosterImportText] = useState('');
const [rosterShareMessage, setRosterShareMessage] = useState('');
const [shareContent, setShareContent] = useState('roster'); // roster | data
const [showQuickSearch, setShowQuickSearch] = useState(false);
const [quickSearchQuery, setQuickSearchQuery] = useState('');
const [zoneFilterHandedness, setZoneFilterHandedness] = useState('all');
const [zoneFilterPitch, setZoneFilterPitch] = useState('all');
const [zoneResultFilter, setZoneResultFilter] = useState('all');
const [hidePitchLocationPanel, setHidePitchLocationPanel] = useState(false);
const [pitchLocationTouchStartY, setPitchLocationTouchStartY] = useState(null);
const [showCoverPage, setShowCoverPage] = useState(true);
const [homeTeamView, setHomeTeamView] = useState('team');
const [printPreview, setPrintPreview] = useState(null);
const [voiceCommandText, setVoiceCommandText] = useState('');
const [voiceCommandPreview, setVoiceCommandPreview] = useState(null);
const [voiceCommandError, setVoiceCommandError] = useState('');
const [isVoiceListening, setIsVoiceListening] = useState(false);
const [sharedGameImport, setSharedGameImport] = useState(null);
const [sharedGameImportStatus, setSharedGameImportStatus] = useState('');
const [isLoadingSharedGame, setIsLoadingSharedGame] = useState(false);
const [isSharingGameLink, setIsSharingGameLink] = useState(false);
const [showOnboarding, setShowOnboarding] = useState(() => {
  if (typeof window === 'undefined') return false;
  return !window.localStorage.getItem('pitchtrace_onboarding_seen');
});
const [onboardingStep, setOnboardingStep] = useState(0);
const teamReportPrintRef = useRef(null);
const gameReportPrintRef = useRef(null);
const pitchLogPrintRef = useRef(null);
const salesPrintRef = useRef(null);
const compliancePrintRef = useRef(null);
const recentGameHoldTimerRef = useRef(null);
const recentGameHoldTriggeredRef = useRef(false);
const voiceRecognitionRef = useRef(null);

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

const themePalettes = {
  cyan: { primary: '#22d3ee', accent: '#f59e0b' },
  emerald: { primary: '#10b981', accent: '#f59e0b' },
  indigo: { primary: '#6366f1', accent: '#22d3ee' },
  amber: { primary: '#f59e0b', accent: '#22d3ee' }
};

const themeOptions = [
  { id: 'cyan', label: 'Cyan', swatch: '#22d3ee' },
  { id: 'emerald', label: 'Emerald', swatch: '#10b981' },
  { id: 'indigo', label: 'Indigo', swatch: '#6366f1' },
  { id: 'amber', label: 'Amber', swatch: '#f59e0b' }
];

const fontSizes = {
  compact: '14px',
  normal: '16px',
  large: '18px'
};

const appStyle = {
  '--app-primary': themePalettes[theme]?.primary || '#22d3ee',
  '--app-accent': themePalettes[theme]?.accent || '#f59e0b',
  '--app-font-size': fontSizes[fontSize] || '16px'
};

const appClass = `app-theme ${highContrast ? 'app-contrast' : ''} ${reduceMotion ? 'reduce-motion' : ''}`;

const autosaveKey = isScouting ? 'baseball_autosave_scout' : 'baseball_autosave';

const outcomes = ['1B', '2B', '3B', 'HR', 'HBP', 'E', 'SAC', 'DP', 'OUT'];
const defensiveResultPresets = {
  OUT: ['6-3', '5-3', '4-3', 'F7', 'F8', 'F9', 'P3', 'K'],
  E: ['E5', 'E6', 'E4', 'E3', 'E1', 'E7', 'E8', 'E9'],
  SAC: ['SAC 1-3', 'SAC 2-3', 'SAC F8', 'SAC F9'],
  DP: ['6-4-3', '4-6-3', '5-4-3', '3-6-3', 'F8 DP', 'L6 DP']
};
const createEmptyBases = () => ({ first: null, second: null, third: null });

const runnerLabel = (runner) => {
  if (!runner) return '';
  const name = (runner.name || '').trim();
  const number = (runner.number || '').toString().trim();
  if (name && number) return `${name} #${number}`;
  if (name) return name;
  if (number) return `#${number}`;
  return `Spot ${runner.slot || '--'}`;
};

const buildRunner = (hitter, batterSlot) => ({
  name: hitter?.name || '',
  number: hitter?.number || '',
  slot: batterSlot
});

const cloneBases = (bases = {}) => ({
  first: bases.first || null,
  second: bases.second || null,
  third: bases.third || null
});

const getHitSprayPoint = (location = '') => {
  const key = location.toLowerCase();
  if (!key) return { x: 50, y: 70 };
  if (key.includes('lf line')) return { x: 24, y: 52 };
  if (key.includes('left center') || key.includes('lc gap')) return { x: 38, y: 46 };
  if (key.includes('cf') || key.includes('center')) return { x: 50, y: 42 };
  if (key.includes('right center') || key.includes('rc gap')) return { x: 62, y: 46 };
  if (key.includes('rf line')) return { x: 76, y: 52 };
  if (key.includes('3b') || key.includes('5-6') || key.includes('5 hole')) return { x: 28, y: 58 };
  if (key.includes('ss') || key.includes('6 hole') || key.includes('6-4')) return { x: 42, y: 52 };
  if (key.includes('2b') || key.includes('4 hole') || key.includes('4-3')) return { x: 58, y: 52 };
  if (key.includes('1b') || key.includes('3-4') || key.includes('3 hole')) return { x: 72, y: 58 };
  if (key.includes('pitcher') || key.includes('1-3')) return { x: 50, y: 72 };
  return { x: 50, y: 38 };
};
const strikeTypes = ['Called', 'Swinging', 'Foul', 'In Play'];
const zoneLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const zoneGrid = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9']
];

const voicePitchAliases = [
  { type: '4S', aliases: ['4s', '4 seam', '4-seam', 'four seam', 'fourseam', 'for seam', 'forcing', 'fastball', 'heater'] },
  { type: '2S', aliases: ['2s', '2 seam', '2-seam', 'two seam', 'twoseam'] },
  { type: 'SNK', aliases: ['snk', 'sinker'] },
  { type: 'CT', aliases: ['ct', 'cutter', 'cut fastball'] },
  { type: 'SL', aliases: ['sl', 'slider'] },
  { type: 'CB', aliases: ['cb', 'curve', 'curveball'] },
  { type: 'SW', aliases: ['sw', 'sweeper'] },
  { type: 'SLV', aliases: ['slv', 'slurve'] },
  { type: 'CH', aliases: ['ch', 'change', 'changeup', 'change up'] },
  { type: 'SP', aliases: ['sp', 'split', 'splitter'] },
  { type: 'CCH', aliases: ['cch', 'circle change', 'circle changeup'] }
];

const voiceCanonicalWords = [
  'error', 'ball', 'strike', 'called', 'swinging', 'foul', 'play', 'in', 'out',
  'single', 'double', 'triple', 'walk', 'home', 'run', 'sac', 'doubleplay',
  'left', 'right', 'center', 'field', 'gap', 'line', 'shortstop', 'pitcher',
  'changeup', 'curveball', 'slider', 'sinker', 'splitter', 'slurve', 'sweeper',
  'cutter', 'fastball', 'four', 'seam', 'two', 'down', 'up', 'away', 'inside',
  'hit', 'pitch', 'fouled', 'looking', 'ground', 'grounder', 'popup', 'lineout',
  'flyout', 'comebacker'
];

const voicePitchWords = new Set(
  voicePitchAliases.flatMap((entry) => [entry.type.toLowerCase(), ...entry.aliases.map((alias) => alias.toLowerCase())])
);
const voiceLocationWords = new Set(['up', 'down', 'away', 'in', 'inside', 'outside', 'low', 'high']);
const voiceResultWords = new Set([
  'ball', 'strike', 'called', 'swinging', 'foul', 'play', 'out', 'single', 'double',
  'triple', 'walk', 'home', 'run', 'sac', 'doubleplay', 'error', 'hit', 'pitch'
]);
const voiceDefensiveWords = new Set([
  'shortstop', 'pitcher', 'catcher', 'left', 'center', 'right', 'field', 'first',
  'second', 'third', 'base', 'comebacker', 'lf', 'cf', 'rf', 'ss'
]);

const getEditDistance = (left = '', right = '') => {
  if (left === right) return 0;
  const rows = left.length + 1;
  const cols = right.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[left.length][right.length];
};

const autoCorrectVoiceWord = (word) => {
  if (!word || /\d/.test(word) || word.length < 3) return word;
  let best = word;
  let bestDistance = Number.POSITIVE_INFINITY;
  voiceCanonicalWords.forEach((candidate) => {
    const distance = getEditDistance(word, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  });
  if (bestDistance <= 1) return best;
  return word;
};

const autoCorrectVoiceText = (text = '') => (
  text
    .split(/\s+/)
    .map((token) => autoCorrectVoiceWord(token))
    .join(' ')
);

const applyContextualVoiceCorrections = (text = '') => {
  const tokens = text.split(/\s+/).filter(Boolean);
  return tokens.map((token, index) => {
    const previous = tokens[index - 1] || '';
    const next = tokens[index + 1] || '';
    const previousTwo = tokens[index - 2] || '';
    const nextTwo = tokens[index + 2] || '';
    const previousLooksLikePitch = voicePitchWords.has(previous) || voicePitchWords.has(`${previous} ${token}`);
    const nextLooksLikeResult = voiceResultWords.has(next) || voiceLocationWords.has(next);
    const nextLooksDefensive = voiceDefensiveWords.has(next) || voiceDefensiveWords.has(`${next} ${nextTwo}`);

    if (['air', 'era', 'eror', 'erro', 'ear'].includes(token)) {
      if (
        nextLooksDefensive
        || previous === 'play'
        || previous === 'in'
        || previousTwo === 'in'
        || previous === 'ball'
      ) {
        return 'error';
      }
    }

    if (['and', 'end', 'inn', 'inner'].includes(token)) {
      const isSwingPhrase = previous === 'swing' || next === 'miss';
      if (!isSwingPhrase && (next === 'play' || next === 'field' || next === 'side')) {
        return 'in';
      }
      if (!isSwingPhrase && previousLooksLikePitch && (!next || nextLooksLikeResult || nextLooksDefensive)) {
        return 'in';
      }
    }

    if (token === 'are') {
      if (previousLooksLikePitch && (!next || nextLooksLikeResult)) {
        return 'away';
      }
      if (nextLooksDefensive || previous === 'play' || previousTwo === 'in') {
        return 'error';
      }
    }

    return token;
  }).join(' ');
};

const normalizeVoiceText = (value = '') => (
  autoCorrectVoiceText(
    applyContextualVoiceCorrections(
      value
        .toLowerCase()
        .replace(/[^a-z0-9#\-\s]/g, ' ')
        .replace(/\bcan you hear me\b/g, ' ')
        .replace(/\bokay\b/g, ' ')
        .replace(/\bbut\b/g, ' ')
        .replace(/\b(and|end|inn|inner)\s+play\b/g, ' in play ')
        .replace(/\b(and|end|inn|inner)\s+(field|side)\b/g, ' in $2 ')
        .replace(/\band play\b/g, ' in play ')
        .replace(/\bn play\b/g, ' in play ')
        .replace(/\bon play\b/g, ' in play ')
        .replace(/\b(air|era|eror|erro)\b/g, ' error ')
        .replace(/\bball and play\b/g, ' ball in play ')
        .replace(/\bball n play\b/g, ' ball in play ')
        .replace(/\bball on play\b/g, ' ball in play ')
        .replace(/\bout 63\b/g, ' out 6-3 ')
        .replace(/\bout 53\b/g, ' out 5-3 ')
        .replace(/\bout 43\b/g, ' out 4-3 ')
        .replace(/\bout 13\b/g, ' out 1-3 ')
        .replace(/\b63\b/g, ' 6-3 ')
        .replace(/\b53\b/g, ' 5-3 ')
        .replace(/\b43\b/g, ' 4-3 ')
        .replace(/\b13\b/g, ' 1-3 ')
        .replace(/\b643\b/g, ' 6-4-3 ')
        .replace(/\b543\b/g, ' 5-4-3 ')
        .replace(/\b363\b/g, ' 3-6-3 ')
        .replace(/\s+/g, ' ')
        .trim()
    )
  )
);

const hasStandaloneWord = (text, word) => {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|\\s)${escaped}($|\\s)`).test(text);
};

const detectVoicePitchType = (text, allowedPitchTypes = []) => {
  const allowed = new Set((allowedPitchTypes || []).map((type) => normalizePitchTypeAbbr(type)));
  for (const entry of voicePitchAliases) {
    if (allowed.size && !allowed.has(entry.type)) continue;
    if (entry.aliases.some((alias) => text.includes(alias))) return entry.type;
  }
  return null;
};

const detectVoiceHitLocation = (text) => {
  if (text.includes('left center') || text.includes('lc gap')) return 'LC gap';
  if (text.includes('right center') || text.includes('rc gap')) return 'RC gap';
  if (text.includes('left field line') || text.includes('left line') || text.includes('lf line')) return 'LF line';
  if (text.includes('right field line') || text.includes('right line') || text.includes('rf line')) return 'RF line';
  if (text.includes('center field') || text.includes('cf') || text.includes('center')) return 'CF';
  if (text.includes('left field') || text.includes('left')) return 'LF line';
  if (text.includes('right field') || text.includes('right')) return 'RF line';
  if (text.includes('5 6 hole') || text.includes('5-6 hole')) return '5-6 hole';
  if (text.includes('6 hole') || text.includes('6-hole') || text.includes('six hole')) return 'SS';
  if (text.includes('3b')) return '3B';
  if (text.includes('ss') || text.includes('shortstop')) return 'SS';
  if (text.includes('2b') || text.includes('second base')) return '2B';
  if (text.includes('1b') || text.includes('first base')) return '1B';
  if (text.includes('pitcher') || text.includes('comebacker')) return 'Pitcher';
  return null;
};

const detectVoiceBallLocation = (text) => {
  if (text.includes('hit by pitch') || text.includes('hbp')) return 'HBP';
  if (text.includes('down') || text.includes('low')) return 'Down';
  if (text.includes('up') || text.includes('high')) return 'Up';
  if (text.includes('away') || text.includes('outside')) return 'Away';
  if ((text.includes(' and ') || text.startsWith('and ') || text.endsWith(' and')) && !text.includes('swing and miss') && !text.includes('ball in play')) return 'In';
  if (text.includes(' in ') || text.startsWith('in ') || text.endsWith(' in') || text.includes('inside')) return 'In';
  return null;
};

const detectVoiceStrikeType = (text) => {
  if (text.includes('called strike') || text.includes('looking')) return 'Called';
  if (text.includes('swinging strike') || text.includes('swing and miss') || text.includes('swinging') || text.includes('whiff')) return 'Swinging';
  if (text.includes('fouled off') || text.includes('foul') || text.includes('fouled')) return 'Foul';
  if (text.includes('in play') || text.includes('put in play')) return 'In Play';
  return null;
};

const detectVoiceOutcome = (text) => {
  if (text.includes('double play') || text.includes(' dp ')) return 'DP';
  if (text.includes('sac') || text.includes('sacrifice')) return 'SAC';
  if (text.includes('error') || text === 'e' || text.includes(' e ')) return 'E';
  if (text.includes('home run') || text.includes('homer') || text === 'hr' || text.includes(' hr ')) return 'HR';
  if (text.includes('triple')) return '3B';
  if (text.includes('double')) return '2B';
  if (text.includes('single')) return '1B';
  if (text.includes('hit by pitch') || text.includes('hbp')) return 'HBP';
  if (text.includes('walk') || text.includes('ball four') || text === 'bb' || text.includes(' bb ')) return 'BB';
  if (text.includes('strikeout') || text.includes('struck out') || text.includes(' punch out') || text === 'k' || text.includes(' k ')) return 'K';
  if (text.includes('groundout') || text.includes('ground out') || text.includes('fly out') || text.includes('popup') || text.includes('pop out') || text.includes('line out') || text === 'out' || text.includes(' out ')) return 'OUT';
  return null;
};

const shouldTreatAsPitchOnly = (text, outcome) => {
  if (!outcome) return false;
  if (outcome === 'BB' && text.includes('ball') && !text.includes('walk')) return true;
  if (outcome === 'OUT' && !text.includes('in play') && !text.includes('hit in play') && !text.includes('put in play')) return true;
  return false;
};

const detectVoiceDefensiveDetail = (text) => {
  const presetMatch = text.match(/\b\d-\d(?:-\d)?\b/);
  if (presetMatch) return presetMatch[0];
  const compactThreeDigitMatch = text.match(/\b([1-9])([1-9])([1-9])\b/);
  if (compactThreeDigitMatch) return `${compactThreeDigitMatch[1]}-${compactThreeDigitMatch[2]}-${compactThreeDigitMatch[3]}`;
  const compactTwoDigitMatch = text.match(/\b([1-9])([1-9])\b/);
  if (compactTwoDigitMatch) return `${compactTwoDigitMatch[1]}-${compactTwoDigitMatch[2]}`;
  if (text.includes('doubled up')) {
    if (text.includes('center fielder') || text.includes('center field') || text.includes('to eight') || text.includes('cf')) return 'F8 DP';
    if (text.includes('left fielder') || text.includes('left field') || text.includes('to seven') || text.includes('lf')) return 'F7 DP';
    if (text.includes('right fielder') || text.includes('right field') || text.includes('to nine') || text.includes('rf')) return 'F9 DP';
    if (text.includes('third base') || text.includes('third baseman')) return 'L5 DP';
    if (text.includes('shortstop')) return 'L6 DP';
    if (text.includes('second base')) return 'L4 DP';
  }
  if (text.includes('error')) {
    if (text.includes('shortstop') || text.includes('ss')) return 'E6';
    if (text.includes('third baseman') || text.includes('third base') || text.includes('3b')) return 'E5';
    if (text.includes('second baseman') || text.includes('second base') || text.includes('2b')) return 'E4';
    if (text.includes('first baseman') || text.includes('first base') || text.includes('1b')) return 'E3';
    if (text.includes('pitcher') || text.includes('comebacker')) return 'E1';
    if (text.includes('left fielder') || text.includes('left field') || text.includes('lf')) return 'E7';
    if (text.includes('center fielder') || text.includes('center field') || text.includes('cf') || text.includes('center')) return 'E8';
    if (text.includes('right fielder') || text.includes('right field') || text.includes('rf')) return 'E9';
  }
  if (text.includes('line out')) {
    if (text.includes('to eight') || text.includes('center fielder') || text.includes('center field') || text.includes('cf')) return 'L8';
    if (text.includes('to seven') || text.includes('left fielder') || text.includes('left field') || text.includes('lf')) return 'L7';
    if (text.includes('to nine') || text.includes('right fielder') || text.includes('right field') || text.includes('rf')) return 'L9';
    if (text.includes('to five') || text.includes('third base') || text.includes('third baseman')) return 'L5';
    if (text.includes('to six') || text.includes('shortstop') || text.includes('ss')) return 'L6';
    if (text.includes('to four') || text.includes('second base') || text.includes('second baseman')) return 'L4';
    if (text.includes('to three') || text.includes('first base') || text.includes('first baseman')) return 'L3';
  }
  if (text.includes('fly out') || text.includes('sac fly')) {
    if (text.includes('to eight') || text.includes('center fielder') || text.includes('center field') || text.includes('cf')) return 'F8';
    if (text.includes('to seven') || text.includes('left fielder') || text.includes('left field') || text.includes('lf')) return 'F7';
    if (text.includes('to nine') || text.includes('right fielder') || text.includes('right field') || text.includes('rf')) return 'F9';
  }
  if (text.includes('ground ball') || text.includes('grounder')) {
    if (text.includes('third base') || text.includes('third baseman') || text.includes('3b')) return '5-3';
    if (text.includes('shortstop') || text.includes('ss')) return '6-3';
    if (text.includes('second base') || text.includes('second baseman') || text.includes('2b')) return '4-3';
    if (text.includes('first base') || text.includes('first baseman') || text.includes('1b')) return '3-1';
    if (text.includes('pitcher') || text.includes('comebacker')) return '1-3';
  }
  if (text.includes('left field') || text.includes('lf')) return 'F7';
  if (text.includes('center field') || text.includes('cf') || text.includes('center')) return 'F8';
  if (text.includes('right field') || text.includes('rf')) return 'F9';
  if (text.includes('shortstop') || text.includes('ss')) return '6-3';
  if (text.includes('second base') || text.includes('2b')) return '4-3';
  if (text.includes('third base') || text.includes('3b')) return '5-3';
  if (text.includes('first base') || text.includes('1b')) return '3-1';
  if (text.includes('pitcher') || text.includes('comebacker')) return '1-3';
  return null;
};

const detectVoiceVelocity = (rawValue = '') => {
  const lower = rawValue.toLowerCase();
  const explicitMatch = lower.match(/\b(\d{2,3}(?:\.\d)?)\s*(?:mph|mp h|m p h|mile per hour|miles per hour)\b/);
  if (explicitMatch) return explicitMatch[1];
  return null;
};

const parseVoiceCommand = (rawValue, allowedPitchTypes = [], options = {}) => {
  const text = normalizeVoiceText(rawValue);
  if (!text) {
    return { error: 'Say or type a pitch command first.' };
  }

  const pitchType = detectVoicePitchType(text, allowedPitchTypes);
  const strikeType = detectVoiceStrikeType(text);
  const outcome = detectVoiceOutcome(text);
  const hitLocation = detectVoiceHitLocation(text);
  const ballLocation = detectVoiceBallLocation(text);
  const defensiveDetail = detectVoiceDefensiveDetail(text);
  const velocity = detectVoiceVelocity(rawValue);
  const mentionsBallInPlayPhrase = text.includes('ball in play');
  const mentionsBall = (hasStandaloneWord(text, 'ball') || hasStandaloneWord(text, 'miss')) && !mentionsBallInPlayPhrase;
  const mentionsStrike = text.includes('strike') || text.includes('called') || text.includes('looking') || text.includes('swinging') || text.includes('foul');
  const mentionsInPlay = text.includes('in play') || text.includes('hit in play') || text.includes('put in play') || mentionsBallInPlayPhrase;
  const treatAsPitchOnly = shouldTreatAsPitchOnly(text, outcome);
  const inferredOutcome = outcome || (mentionsInPlay && defensiveDetail ? 'OUT' : null);

  if (inferredOutcome && !treatAsPitchOnly && (pitchType || options.allowResultWithoutPitchType)) {
    const summaryParts = [pitchType, outcome];
    if (hitLocation) summaryParts.push(hitLocation);
    if (defensiveDetail && !hitLocation) summaryParts.push(defensiveDetail);
    return {
      kind: 'result',
      pitchType,
      outcome: inferredOutcome,
      strikeType: inferredOutcome === 'K' ? (strikeType || 'Swinging') : (['1B', '2B', '3B', 'HR', 'OUT', 'E', 'SAC', 'DP'].includes(inferredOutcome) ? 'In Play' : null),
      ballType: inferredOutcome === 'HBP' ? 'HBP' : ballLocation,
      detail: ['1B', '2B', '3B', 'HR'].includes(inferredOutcome) ? hitLocation : defensiveDetail,
      velocity,
      summary: [pitchType, velocity ? `${velocity} mph` : null, inferredOutcome, hitLocation || defensiveDetail].filter(Boolean).join(' • ')
    };
  }

  if (mentionsInPlay && pitchType) {
    return {
      kind: 'pitch',
      pitchType,
      isStrike: true,
      strikeType: 'In Play',
      velocity,
      summary: [pitchType, velocity ? `${velocity} mph` : null, 'In Play'].filter(Boolean).join(' • ')
    };
  }

  if (!pitchType) {
    return { error: 'Include the pitch type so I know what to log.' };
  }

  if ((mentionsBall || ballLocation) && strikeType !== 'Foul' && !mentionsInPlay) {
    return {
      kind: 'pitch',
      pitchType,
      isStrike: false,
      ballType: ballLocation || 'Away',
      velocity,
      summary: [pitchType, velocity ? `${velocity} mph` : null, 'Ball', ballLocation || 'Away'].filter(Boolean).join(' • ')
    };
  }

  const resolvedStrikeType = strikeType || (mentionsStrike ? 'Called' : null);
  if (resolvedStrikeType) {
    return {
      kind: 'pitch',
      pitchType,
      isStrike: true,
      strikeType: resolvedStrikeType,
      velocity,
      summary: [pitchType, velocity ? `${velocity} mph` : null, resolvedStrikeType === 'In Play' ? 'In Play' : `${resolvedStrikeType} Strike`].filter(Boolean).join(' • ')
    };
  }

  return { error: 'Try: pitch type, result, then location. Example: "slider called strike away".' };
};

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

const createEmptyLineup = () => Array.from({ length: 9 }, (_, idx) => ({
  slot: idx + 1,
  name: '',
  number: '',
  handedness: 'R',
  isSub: false,
  replacedPlayer: ''
}));

const normalizeLineup = (lineup = []) => createEmptyLineup().map((slot, idx) => ({
  ...slot,
  ...(lineup[idx] || {}),
  slot: idx + 1,
  handedness: lineup[idx]?.handedness || 'R',
  isSub: Boolean(lineup[idx]?.isSub),
  replacedPlayer: lineup[idx]?.replacedPlayer || ''
}));

const getNextBatterSlot = (slot) => (slot >= 9 ? 1 : slot + 1);

const handlePitchLocationTouchStart = (e) => {
  setPitchLocationTouchStartY(e.touches?.[0]?.clientY ?? null);
};

const handlePitchLocationTouchEnd = (e) => {
  if (pitchLocationTouchStartY === null) return;
  const endY = e.changedTouches?.[0]?.clientY ?? pitchLocationTouchStartY;
  const swipeUpDistance = pitchLocationTouchStartY - endY;
  if (swipeUpDistance > 60) {
    setHidePitchLocationPanel(true);
  }
  setPitchLocationTouchStartY(null);
};

const buildPrintableDocument = (title, html, autoPrint = false) => {
  const headMarkup = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');
  const rootStyle = document.documentElement.getAttribute('style') || '';
  const bodyClassName = document.body.className || '';
  const isPitchLogDocument = title === 'PitchTrace Pitch Log';

  return `
    <!doctype html>
    <html lang="en" style="${rootStyle}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        ${headMarkup}
        <style>
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            box-sizing: border-box;
          }
          body {
            margin: 0;
            min-height: auto;
            background: ${isPitchLogDocument ? '#ffffff' : '#020617'};
            color: ${isPitchLogDocument ? '#0f172a' : 'inherit'};
          }
          .print-shell {
            max-width: 1100px;
            margin: 0 auto;
            padding: 24px;
            background: ${isPitchLogDocument ? '#ffffff' : 'transparent'};
            color: ${isPitchLogDocument ? '#0f172a' : 'inherit'};
          }
          .no-print {
            display: none !important;
          }
          ${isPitchLogDocument ? `
          .print-shell,
          .print-shell * {
            color: #0f172a !important;
          }
          .print-shell .bg-slate-900,
          .print-shell .bg-slate-100,
          .print-shell .bg-white,
          .print-shell .bg-cyan-50\\/60,
          .print-shell .bg-rose-50\\/60 {
            background: #ffffff !important;
          }
          .print-shell .border-slate-300,
          .print-shell .border-slate-200,
          .print-shell .border-slate-100 {
            border-color: #cbd5e1 !important;
          }
          ` : ''}
          @media print {
            body {
              background: #ffffff !important;
            }
            .print-shell {
              padding: 0;
              max-width: none;
            }
            .overflow-hidden {
              overflow: visible !important;
            }
            .pitch-log-export-card,
            .pitch-log-ab,
            .pitch-log-table {
              break-inside: avoid-page;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body class="${bodyClassName}">
        <div class="print-shell">${html}</div>
        ${autoPrint ? `
        <script>
          window.addEventListener('load', () => {
            setTimeout(() => {
              window.focus();
              window.print();
            }, 250);
          });
        </script>
        ` : ''}
      </body>
    </html>
  `;
};

const openPrintableDocument = (title, html) => {
  const printableHtml = buildPrintableDocument(title, html, true);
  const blob = new Blob([printableHtml], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');
  if (!printWindow) {
    window.print();
    return;
  }
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
};

const exportPrintableContent = async (title, html) => {
  if (Capacitor.isNativePlatform() && navigator.share) {
    const printableHtml = buildPrintableDocument(title, html);
    const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const file = new File([printableHtml], `${safeName}.html`, { type: 'text/html' });

    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title,
          files: [file]
        });
        return;
      }
    } catch {
      // Fall back to browser-style printing when native sharing is unavailable.
    }
  }

  openPrintableDocument(title, html);
};

const savePrintableContentToFile = async (title, html) => {
  const printableHtml = buildPrintableDocument(title, html, false);
  const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const file = new File([printableHtml], `${safeName}.html`, { type: 'text/html' });

  if (navigator.share) {
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title,
          files: [file]
        });
        return;
      }
    } catch {
      // Fall through to download fallback.
    }
  }

  const blob = new Blob([printableHtml], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `${safeName}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

const printElementContent = (title, ref) => {
  const html = ref?.current?.outerHTML;
  if (!html) {
    window.print();
    return;
  }

  setPrintPreview({ title, html });
};

const shareOrCopyLink = async (title, url) => {
  if (!url) return;

  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch {
      // Fall back to clipboard when share is cancelled or unavailable in-webview.
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }

  window.prompt('Copy this link:', url);
};

const getShareApiBase = () => {
  if (typeof window === 'undefined') return 'https://pitchtrace.com';
  const { origin, protocol } = window.location;
  if (protocol === 'http:' || protocol === 'https:') {
    return origin.replace(/\/$/, '');
  }
  return 'https://pitchtrace.com';
};

const getShareApiUrl = () => `${getShareApiBase()}/.netlify/functions/share-game`;

const getSharedImportFingerprint = (payload) => {
  const firstGame = payload?.games?.[0]?.game;
  return [
    payload?.baseGameId || 'no-base',
    payload?.exportedAt || 'no-export',
    payload?.opponent || 'unknown',
    firstGame?.date || 'no-date',
    payload?.scouting ? 'scout' : 'team'
  ].join('::');
};

const readImportedSharedGameFingerprints = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem('pitchtrace_imported_shared_games') || '[]');
  } catch {
    return [];
  }
};

const saveImportedSharedGameFingerprint = (fingerprint) => {
  if (!fingerprint || typeof window === 'undefined') return;
  const current = new Set(readImportedSharedGameFingerprints());
  current.add(fingerprint);
  window.localStorage.setItem('pitchtrace_imported_shared_games', JSON.stringify([...current]));
};

const getFriendlySharedGameError = (message, action = 'load') => {
  const text = String(message || '').toLowerCase();
  if (text.includes('shared game not found')) {
    return 'That share link is invalid, expired, or no longer available.';
  }
  if (text.includes('fetch failed') || text.includes('load failed')) {
    return action === 'save'
      ? 'Could not create the share link right now. Please try again in a moment.'
      : 'Could not load that shared game right now. Please try the link again in a moment.';
  }
  if (text.includes('missing share id')) {
    return 'That share link is incomplete.';
  }
  return message || (action === 'save' ? 'Could not create a share link for that game.' : 'Could not load that shared game.');
};

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
return { balls: Math.min(balls, 4), strikes: Math.min(strikes, 3) };
};

useEffect(() => {
loadPitchers();
localStorage.removeItem(autosaveKey);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  return () => {
    if (recentGameHoldTimerRef.current) {
      clearTimeout(recentGameHoldTimerRef.current);
    }
  };
}, []);

useEffect(() => {
  if (view !== 'pitch-entry' || !currentGame || currentGame.isBullpen) return;
  const lineup = normalizeLineup(currentGame.lineup);
  const hasCompleteLineup = lineup.every((spot) => spot.name.trim());
  if (!hasCompleteLineup) {
    setLineupDraft(lineup);
    setShowLineupModal(true);
  }
}, [view, currentGame]);

useEffect(() => {
  if (!currentGame || currentGame.isBullpen) return;
  const nextHandedness = currentGame.lineup?.[(currentBatter || 1) - 1]?.handedness;
  if (nextHandedness && nextHandedness !== currentBatterHandedness) {
    setCurrentBatterHandedness(nextHandedness);
  }
}, [currentBatter, currentGame, currentBatterHandedness]);

useEffect(() => {
const reportParam = new URLSearchParams(window.location.search).get('report');
if (reportParam) {
  const stored = JSON.parse(localStorage.getItem('baseball_reports') || '{}');
  if (stored[reportParam]) {
    setReportId(reportParam);
    setReportText(stored[reportParam]);
    setReportGame(null);
    setReportPitcher(null);
    setReportBackView('landing');
    setReportOpponentDraft('');
    setView('report');
  }
}
}, []);

useEffect(() => {
  const sharedGameParam = new URLSearchParams(window.location.search).get('sharedGame');
  if (!sharedGameParam) return;

  let cancelled = false;
  const loadSharedGame = async () => {
    setIsLoadingSharedGame(true);
    setSharedGameImportStatus('');
    try {
      const response = await fetch(`${getShareApiUrl()}?id=${encodeURIComponent(sharedGameParam)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Could not load that shared game.');
      }
      if (cancelled) return;
      setSharedGameImport(data);
      setShowCoverPage(false);
      setView('landing');
    } catch (error) {
      if (cancelled) return;
      setSharedGameImport(null);
      setSharedGameImportStatus(getFriendlySharedGameError(error.message, 'load'));
    } finally {
      if (!cancelled) {
        setIsLoadingSharedGame(false);
      }
    }
  };

  loadSharedGame();
  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
if (selectedPitcher) {
  if (isScouting) loadScoutGames(selectedPitcher.id);
  else loadGames(selectedPitcher.id);
  const bullpen = loadBullpenSessions(selectedPitcher.id);
  setBullpenSessions(bullpen);
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedPitcher]);

useEffect(() => {
  if (atBatPitches.at(-1)?.strikeType === 'In Play') {
    setPendingPitch(null);
  }
}, [atBatPitches]);

useEffect(() => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('pitchtrace_display_prefs', JSON.stringify({
    theme,
    fontSize,
    highContrast,
    reduceMotion
  }));
}, [theme, fontSize, highContrast, reduceMotion]);

useEffect(() => {
  if (!currentGame || currentGame.isBullpen) {
    saveAutosave();
    return;
  }
  const state = {
    currentInning,
    currentBatter,
    currentOuts,
    currentBatterHandedness,
    atBatPitches,
    pitchCountBaseline,
    selectedZone,
    pitchTrail,
    currentBases,
    totalRunsAllowed
  };
  const updatedGame = { ...currentGame, state };
  setCurrentGame(updatedGame);

  const existingIndex = games.findIndex(g => g.id === updatedGame.id);
  let updatedGames;
  if (existingIndex >= 0) {
    updatedGames = [...games];
    updatedGames[existingIndex] = updatedGame;
  } else {
    updatedGames = [...games, updatedGame];
  }

  const storageKey = isScouting ? 'baseball_scout_games' : 'baseball_games';
  const allGames = readGameStore(storageKey);
  allGames[selectedPitcher.id] = updatedGames;
  localStorage.setItem(storageKey, JSON.stringify(allGames));
  setGames(updatedGames);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentInning, currentBatter, currentOuts, currentBatterHandedness, atBatPitches, pitchCountBaseline, selectedZone, pitchTrail, currentBases, totalRunsAllowed]);


const saveAutosave = () => {
  if (!currentGame || !selectedPitcher) return;
  if (currentGame.isBullpen) return;
  const payload = {
    selectedPitcher,
    currentGame,
    currentInning,
    currentBatter,
    currentBatterHandedness,
    atBatPitches,
    pitchCountBaseline,
    currentOuts,
    pitchTrail,
    selectedZone,
    currentBases,
    totalRunsAllowed,
    view
  };
  localStorage.setItem(autosaveKey, JSON.stringify(payload));
};

const clearAutosave = () => {
  localStorage.removeItem(autosaveKey);
};

const sameCalendarDay = (firstDate, secondDate) => (
  new Date(firstDate || '').toDateString() === new Date(secondDate || '').toDateString()
);

const sameOpponentLabel = (firstOpponent, secondOpponent) => (
  String(firstOpponent || '').trim().toLowerCase() === String(secondOpponent || '').trim().toLowerCase()
);

const buildAtBatSignature = (atBat, inningNumber, idx) => {
  const pitchSignature = (atBat?.pitches || [])
    .map((pitch) => `${pitch.type}:${pitch.isStrike ? 'S' : 'B'}:${pitch.strikeType || pitch.ballType || ''}:${pitch.zone || ''}:${pitch.velocity || ''}`)
    .join('|');
  return [
    inningNumber,
    atBat?.batter || idx,
    atBat?.batterName || '',
    atBat?.batterNumber || '',
    atBat?.outcome || '',
    atBat?.outDetails || '',
    pitchSignature
  ].join('::');
};

const getGameAtBatSignatureSet = (game) => {
  const signatures = new Set();
  (game?.innings || []).forEach((inning) => {
    (inning.atBats || []).forEach((atBat, idx) => {
      signatures.add(buildAtBatSignature(atBat, inning.number, idx));
    });
  });
  return signatures;
};

const signatureSetsOverlap = (leftSet, rightSet) => {
  if (!leftSet?.size || !rightSet?.size) return false;
  for (const signature of leftSet) {
    if (rightSet.has(signature)) return true;
  }
  return false;
};

const isSameGameGroup = (baseGame, candidateGame) => {
  const baseGroupId = baseGame?.gameGroupId || baseGame?.id;
  const candidateGroupId = candidateGame?.gameGroupId || candidateGame?.id;
  if (baseGame?.gameGroupId || candidateGame?.gameGroupId) {
    return baseGroupId === candidateGroupId;
  }
  return (
    sameCalendarDay(baseGame?.date, candidateGame?.date) &&
    sameOpponentLabel(baseGame?.opponent, candidateGame?.opponent)
  );
};

const readGameStore = (storageKey) => {
  const raw = JSON.parse(localStorage.getItem(storageKey) || '{}');
  if (storageKey === 'baseball_games' && raw?.teamGames && typeof raw.teamGames === 'object') {
    localStorage.setItem('baseball_games', JSON.stringify(raw.teamGames));
    if (raw.scoutGames && !localStorage.getItem('baseball_scout_games')) {
      localStorage.setItem('baseball_scout_games', JSON.stringify(raw.scoutGames));
    }
    return raw.teamGames;
  }
  if (storageKey === 'baseball_scout_games' && raw?.scoutGames && typeof raw.scoutGames === 'object') {
    localStorage.setItem('baseball_scout_games', JSON.stringify(raw.scoutGames));
    return raw.scoutGames;
  }
  return raw && typeof raw === 'object' ? raw : {};
};

const getGameReportGroupEntries = (game) => {
  const storageKey = game?.scouting ? 'baseball_scout_games' : 'baseball_games';
  const allGames = readGameStore(storageKey);
  const pitcherById = Object.fromEntries(pitchers.map((p) => [String(p.id), p]));
  const scoutById = Object.fromEntries(loadScoutPitchers().map((p) => [String(p.id), p]));
  const entries = [];
  Object.entries(allGames).forEach(([pid, gamesList]) => {
    gamesList.forEach((g) => {
      if (!g?.isBullpen && isSameGameGroup(game, g)) {
        const pitcher = game?.scouting ? scoutById[String(pid)] : pitcherById[String(pid)];
        entries.push({
          pitcherId: String(pid),
          pitcherName: pitcher?.name || g.pitcherName || 'Unknown',
          game: g,
          signatureSet: getGameAtBatSignatureSet(g)
        });
      }
    });
  });
  const hasRealGroupId = entries.some((entry) => entry.game?.gameGroupId);
  const baseStarterId = String(game?.starterPitcherId || '');
  const baseStarterName = String(game?.starterPitcherName || '').trim().toLowerCase();
  const sameStarter = (entry) => {
    const candidateStarterId = String(entry.game?.starterPitcherId || '');
    const candidateStarterName = String(entry.game?.starterPitcherName || '').trim().toLowerCase();
    return (
      (baseStarterId && candidateStarterId && baseStarterId === candidateStarterId) ||
      (baseStarterName && candidateStarterName && baseStarterName === candidateStarterName)
    );
  };

  let groupedEntries = entries;
  if (!hasRealGroupId) {
    const acceptedEntries = [];
    const acceptedIds = new Set();
    const mergedSignatures = new Set(getGameAtBatSignatureSet(game));
    const seedEntry = entries.find((entry) => String(entry.game?.id) === String(game?.id));
    if (seedEntry) {
      acceptedEntries.push(seedEntry);
      acceptedIds.add(String(seedEntry.game?.id));
      seedEntry.signatureSet.forEach((signature) => mergedSignatures.add(signature));
    }

    let changed = true;
    while (changed) {
      changed = false;
      entries.forEach((entry) => {
        const entryId = String(entry.game?.id);
        if (acceptedIds.has(entryId)) return;
        const overlapsAccepted = signatureSetsOverlap(entry.signatureSet, mergedSignatures);
        if (sameStarter(entry) || overlapsAccepted) {
          acceptedEntries.push(entry);
          acceptedIds.add(entryId);
          entry.signatureSet.forEach((signature) => mergedSignatures.add(signature));
          changed = true;
        }
      });
    }

    groupedEntries = acceptedEntries.length > 0 ? acceptedEntries : entries;
  }

  const sortedEntries = groupedEntries.sort((a, b) => {
    const aTime = new Date(a.game.updatedAt || a.game.date || 0).getTime();
    const bTime = new Date(b.game.updatedAt || b.game.date || 0).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return Number(a.game.id || 0) - Number(b.game.id || 0);
  });
  const seenAtBats = new Set();

  return sortedEntries.map((entry) => {
    const exclusiveInnings = (entry.game.innings || [])
      .map((inning) => {
        const atBats = (inning.atBats || []).map((atBat, idx) => {
          const signature = buildAtBatSignature(atBat, inning.number, idx);
          if (seenAtBats.has(signature)) return null;
          return {
            ...atBat,
            pitcherId: atBat?.pitcherId ?? entry.pitcherId,
            pitcherName: atBat?.pitcherName || entry.pitcherName
          };
        }).filter(Boolean);
        return atBats.length ? { ...inning, atBats } : null;
      })
      .filter(Boolean);

    exclusiveInnings.forEach((inning) => {
      (inning.atBats || []).forEach((atBat, idx) => {
        seenAtBats.add(buildAtBatSignature(atBat, inning.number, idx));
      });
    });

    return {
      ...entry,
      game: {
        ...entry.game,
        innings: exclusiveInnings
      }
    };
  }).filter((entry) => {
    const pitcherOwnedGame = getPitcherOwnedGame(entry.game);
    entry.game = pitcherOwnedGame;
    const totalTrackedPitches = getPitcherOwnedPitchTotal(pitcherOwnedGame);
    return totalTrackedPitches > 0;
  });
};

const getCompactGameStats = (game) => {
  const base = calculateStatsFromGames([game]);
  return {
    ...base,
    balls: Math.max((base.totalPitches || 0) - (base.totalStrikes || 0), 0)
  };
};

const getPitchResultLabel = (pitch) => {
  if (!pitch) return '--';
  if (pitch.isStrike) {
    if (pitch.strikeType === 'Called') return 'Called Strike';
    if (pitch.strikeType === 'Swinging') return 'Swinging Strike';
    if (pitch.strikeType === 'Foul') return 'Foul';
    if (pitch.strikeType === 'In Play') return 'In Play';
    return 'Strike';
  }
  if (pitch.ballType === 'Check Swing') return 'Check Swing';
  return 'Ball';
};

const getPitchLocationLabel = (pitch) => {
  if (!pitch) return '--';
  return pitch.zone || pitch.ballType || '--';
};

const getAtBatHitterLabel = (atBat) => {
  const name = (atBat?.batterName || '').trim();
  const number = (atBat?.batterNumber || '').toString().trim();
  if (name && number) return `${name} (#${number})`;
  if (name) return name;
  if (number) return `#${number}`;
  return `Batter ${atBat?.batter || '--'}`;
};

const doesAtBatBelongToGamePitcher = (atBat, game) => {
  if (!atBat || !game) return true;
  if (atBat.pitcherId !== undefined && atBat.pitcherId !== null) {
    return String(atBat.pitcherId) === String(game.pitcherId);
  }
  return String(game.starterPitcherId || game.pitcherId) === String(game.pitcherId);
};

const getPitcherOwnedInnings = (game) => (
  (game?.innings || [])
    .map((inning) => {
      const atBats = (inning.atBats || []).filter((atBat) => doesAtBatBelongToGamePitcher(atBat, game));
      return atBats.length ? { ...inning, atBats } : null;
    })
    .filter(Boolean)
);

const getPitcherOwnedGame = (game) => ({
  ...game,
  innings: getPitcherOwnedInnings(game)
});

const getPitcherOwnedPitchTotal = (game) => (
  getPitcherOwnedInnings(game).reduce((sum, inning) => {
    return sum + (inning.atBats || []).reduce((atBatSum, atBat) => atBatSum + getTrackedAtBatPitchCount(atBat), 0);
  }, 0)
);

const formatAtBatOutcomeLabel = (atBat) => {
  if (!atBat) return '--';
  return atBat.outDetails ? `${atBat.outcome} • ${atBat.outDetails}` : atBat.outcome;
};

const getRunsAllowedFromGame = (game) => {
  let runs = 0;
  (game?.innings || []).forEach((inning) => {
    (inning.atBats || []).forEach((atBat) => {
      runs += atBat.runsScored || 0;
    });
  });
  return runs;
};

const generateGameReport = (game) => {
let report = 'GAME REPORT\n';
report += `Date: ${new Date(game.date).toLocaleDateString()}\n`;
report += `Opponent: ${game.opponent || 'Unknown'}\n\n`;

const groupGames = getGameReportGroupEntries(game);

if (groupGames.length > 0) {
  report += 'PITCHER GAME LOG\n';
  report += `${'='.repeat(40)}\n`;
  groupGames.forEach(entry => {
    const stats = getCompactGameStats(entry.game);
    report += `${entry.pitcherName}\n`;
    report += `Total Pitches: ${stats.totalPitches} | Strikes: ${stats.totalStrikes} | Balls: ${stats.balls} | Strike%: ${stats.strikePercentage}%\n`;
    report += `Avg Pitches/BF: ${stats.avgPitchesPerBF} | OB or Out in 4: ${stats.resolveIn4Rate}% | 2 of First 3 Strikes: ${stats.twoOfThreeRate}%\n`;
    report += `1-1 Count Strike%: ${stats.oneOneStrikeRate}% | Whiff%: ${stats.whiffRate}%\n`;
    if (stats.pitchTypeCounts && Object.keys(stats.pitchTypeCounts).length > 0) {
      report += 'Pitch Mix:\n';
      Object.entries(stats.pitchTypeCounts).forEach(([type, count]) => {
        const strikes = stats.pitchTypeStrikes?.[type] || 0;
        const pct = count ? ((strikes / count) * 100).toFixed(1) : '0.0';
        report += `- ${type}: ${count} pitches, ${pct}% strikes\n`;
      });
    }
    report += '\n';
  });
}

// Advance report summary (season-level)
if (seasonStats) {
  report += 'ADVANCE REPORT SUMMARY\n';
  report += `Strike%: ${seasonStats.strikePercentage || 0}%\n`;
  report += `First Pitch Strike%: ${seasonStats.firstPitchStrikeRate || 0}%\n`;
  report += `K: ${seasonStats.strikeouts || 0}\n`;
  report += `BB: ${seasonStats.walks || 0}\n`;
  report += `HBP: ${seasonStats.hbps || 0}\n`;
  report += `Total Pitches: ${seasonStats.totalPitches || 0}\n`;
  report += `Avg Pitches / Batter Faced: ${seasonStats.avgPitchesPerBF || '0.0'}\n`;
  report += `OB or Out in 4: ${seasonStats.resolveIn4Rate || '0.0'}%\n`;
  report += `1-1 Count Strike%: ${seasonStats.oneOneStrikeRate || '0.0'}%\n`;
  report += `2 of First 3 Pitches Strikes: ${seasonStats.twoOfThreeRate || '0.0'}%\n`;
  report += `Whiff%: ${seasonStats.whiffRate || '0.0'}%\n\n`;

  if (seasonStats.pitchTypeCounts) {
    report += 'Pitch Mix:\n';
    Object.entries(seasonStats.pitchTypeCounts).forEach(([type, count]) => {
      const strikes = seasonStats.pitchTypeStrikes?.[type] || 0;
      const pct = count ? ((strikes / count) * 100).toFixed(1) : '0.0';
      report += `- ${type}: ${count} pitches, ${pct}% strikes\n`;
    });
    report += '\n';
  }
}

// Pitch pairing impact (this game)
const gamePairs = getPitchPairingImpact([game], 'all').slice(0, 6);
report += 'Pitch Pairing Impact (This Game):\n';
if (gamePairs.length === 0) {
  report += 'No pairing data yet.\n\n';
} else {
  gamePairs.forEach(p => {
    report += `- ${p.pair}: ${p.total} seq | K% ${p.kPct} BB% ${p.bbPct} H% ${p.hPct}\n`;
  });
  report += '\n';
}

// Put-Away Efficiency (this game)
const gamePutAway = getPutAwayStats([game]);
report += 'Put-Away Efficiency (2-Strike Counts):\n';
if (gamePutAway.opportunities === 0) {
  report += 'No 2-strike opportunities yet.\n\n';
} else {
  report += `Opportunities: ${gamePutAway.opportunities}\n`;
  report += `K%: ${gamePutAway.kRate}%\n`;
  report += `BB%: ${gamePutAway.bbRate}%\n`;
  report += `Whiff%: ${gamePutAway.whiffRate}%\n\n`;
}

const keyHitters = getKeyHittersFaced(game, 5);
report += 'KEY HITTERS FACED\n';
if (keyHitters.length === 0) {
  report += 'No hitter data yet.\n\n';
} else {
  keyHitters.forEach((hitter) => {
    report += `- ${hitter.label} (${hitter.handedness}): ${hitter.appearances} AB | H ${hitter.hits} | K ${hitter.strikeouts} | BB/HBP ${hitter.walks}\n`;
  });
  report += '\n';
}

game.innings?.forEach((inning) => {
  report += `Inning ${inning.number}\n`;
  report += `${'='.repeat(40)}\n`;

  inning.atBats?.forEach((atBat) => {
    report += `${getAtBatHitterLabel(atBat)} (${atBat.batterHandedness || 'R'}): `;
    atBat.pitches.forEach((p) => {
      if (p.isStrike) {
        report += `${p.type}S(${p.strikeType})${p.zone ? `@${p.zone}` : ''}${p.velocity ? ` [${p.velocity}]` : ''} `;
      } else {
        report += `${p.type}B${p.ballType ? `(${p.ballType})` : ''}${p.zone ? `@${p.zone}` : ''}${p.velocity ? ` [${p.velocity}]` : ''} `;
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

const generateBullpenReport = (session, pitcher) => {
  let report = 'BULLPEN SESSION REPORT\n';
  report += `Pitcher: ${pitcher?.name || 'Unknown'}\n`;
  report += `Session: Bullpen ${session.number}\n`;
  report += `Date: ${new Date(session.date).toLocaleDateString()}\n\n`;

  if (session.notes && session.notes.trim()) {
    report += `Bullpen Focus: ${session.notes.trim()}\n\n`;
  }

  report += `Total Pitches: ${session.totalPitches}\n`;
  report += `Strikes: ${session.strikes}\n`;
  report += `Balls: ${session.balls}\n`;
  report += `Strike%: ${session.strikePercentage}%\n\n`;

  if (session.pitchTypeCounts) {
    report += 'Pitch Type Breakdown:\n';
    Object.entries(session.pitchTypeCounts).forEach(([type, count]) => {
      const strikes = session.pitchTypeStrikes?.[type] || 0;
      const pct = count ? ((strikes / count) * 100).toFixed(1) : '0.0';
      report += `- ${type}: ${count} pitches, ${pct}% strikes\n`;
    });
    report += '\n';
  }

  return report;
};


const generateSeasonReport = (pitcher, gamesList) => {
  let report = 'ADVANCE REPORT\n';
  report += `Pitcher: ${pitcher?.name || 'Unknown'}\n`;
  report += `Games: ${gamesList?.length || 0}\n\n`;

  const stats = seasonStats || {};
  report += `Strike%: ${stats.strikePercentage || 0}%\n`;
  report += `First Pitch Strike%: ${stats.firstPitchStrikeRate || 0}%\n`;
  report += `K: ${stats.strikeouts || 0}\n`;
  report += `BB: ${stats.walks || 0}\n`;
  report += `HBP: ${stats.hbps || 0}\n`;
  report += `Total Pitches: ${stats.totalPitches || 0}\n\n`;
  report += `Avg Pitches / Batter Faced: ${stats.avgPitchesPerBF || '0.0'}\n`;
  report += `OB or Out in 4: ${stats.resolveIn4Rate || '0.0'}%\n`;
  report += `1-1 Count Strike%: ${stats.oneOneStrikeRate || '0.0'}%\n`;
  report += `2 of First 3 Pitches Strikes: ${stats.twoOfThreeRate || '0.0'}%\n`;
  report += `Whiff%: ${stats.whiffRate || '0.0'}%\n\n`;

  if (stats.pitchTypeCounts) {
    report += 'Pitch Mix:\n';
    Object.entries(stats.pitchTypeCounts).forEach(([type, count]) => {
      const strikes = stats.pitchTypeStrikes?.[type] || 0;
      const pct = count ? ((strikes / count) * 100).toFixed(1) : '0.0';
      report += `- ${type}: ${count} pitches, ${pct}% strikes\n`;
    });
    report += '\n';
  }

  const seasonPairs = getPitchPairingImpact(gamesList || [], 'all').slice(0, 6);
  report += 'Pitch Pairing Impact:\n';
  if (seasonPairs.length === 0) {
    report += 'No pairing data yet.\n\n';
  } else {
    seasonPairs.forEach((p) => {
      report += `- ${p.pair}: ${p.total} seq | K% ${p.kPct} BB% ${p.bbPct} H% ${p.hPct}\n`;
    });
    report += '\n';
  }

  const putAway = getPutAwayStats(gamesList || []);
  report += 'Put-Away Efficiency (2-Strike Counts):\n';
  if (putAway.opportunities === 0) {
    report += 'No 2-strike opportunities yet.\n\n';
  } else {
    report += `Opportunities: ${putAway.opportunities}\n`;
    report += `K%: ${putAway.kRate}%\n`;
    report += `BB%: ${putAway.bbRate}%\n`;
    report += `Whiff%: ${putAway.whiffRate}%\n\n`;
  }

  const seasonHandStats = getPitchEffectivenessByHandedness(gamesList || []);
  const seasonPitchTypes = getPitchTypesFromGames(gamesList || [], pitcher?.pitchTypes || []);
  report += 'Pitch Effectiveness by Batter Handedness:\n';
  if (!seasonPitchTypes.length) {
    report += 'No pitches recorded yet.\n\n';
  } else {
    seasonPitchTypes.forEach((type) => {
      const L = seasonHandStats[type]?.L || { total: 0, strikes: 0 };
      const R = seasonHandStats[type]?.R || { total: 0, strikes: 0 };
      const lPct = L.total ? Math.round((L.strikes / L.total) * 100) : 0;
      const rPct = R.total ? Math.round((R.strikes / R.total) * 100) : 0;
      report += `- ${type}: LHB ${L.total ? `${lPct}% (${L.total})` : '--'} | RHB ${R.total ? `${rPct}% (${R.total})` : '--'}\n`;
    });
    report += '\n';
  }

  return report;
};
const deleteGame = (gameId) => {
const updatedGames = games.filter(g => g.id !== gameId);
saveGames(updatedGames);
};

const deleteGameByPitcher = (pitcherId, gameId) => {
  const teamGames = readGameStore('baseball_games');
  const scoutGames = readGameStore('baseball_scout_games');
  const targetGame = [...Object.values(teamGames), ...Object.values(scoutGames)]
    .flatMap((gamesList) => gamesList || [])
    .find((g) => g.id === gameId);

  if (!targetGame) return;

  const storageKey = targetGame.scouting ? 'baseball_scout_games' : 'baseball_games';
  const allGames = readGameStore(storageKey);

  Object.keys(allGames).forEach((pid) => {
    allGames[pid] = (allGames[pid] || []).filter((g) => !isSameGameGroup(targetGame, g));
  });

  localStorage.setItem(storageKey, JSON.stringify(allGames));

  if (!!targetGame.scouting === !!isScouting && selectedPitcher?.id) {
    const refreshedGames = allGames[selectedPitcher.id] || [];
    setGames(refreshedGames);
    calculateSeasonStats(refreshedGames);
  }

  if (currentGame && isSameGameGroup(targetGame, currentGame)) {
    setCurrentGame(null);
    setAtBatPitches([]);
    setPitchTrail([]);
  }

  if (reportGame && isSameGameGroup(targetGame, reportGame)) {
    setReportGame(null);
    setReportText('');
    setReportId(null);
  }
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
setReportGame(game);
setReportPitcher(null);
setReportSprayFilter(null);
setReportBackView(view);
setReportOpponentDraft((game?.opponent && game.opponent !== 'Unknown') ? game.opponent : '');
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

const shareGameLink = async (game) => {
  if (!game) return;
  setIsSharingGameLink(true);
  setSharedGameImportStatus('');
  try {
    const payload = buildSharedGamePayload(game);
    const response = await fetch(getShareApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Could not create a share link for that game.');
    }
    await shareOrCopyLink('PitchTrace Shared Game', data.url);
    setSharedGameImportStatus('Share link ready. Open it on another device to import this game into Game Log.');
  } catch (error) {
    setSharedGameImportStatus(getFriendlySharedGameError(error.message, 'save'));
  } finally {
    setIsSharingGameLink(false);
  }
};

const saveReportOpponentName = () => {
  const nextOpponent = reportOpponentDraft.trim();
  if (!reportGame || !nextOpponent) return;

  const storageKey = reportGame.scouting ? 'baseball_scout_games' : 'baseball_games';
  const allGames = readGameStore(storageKey);
  let updatedPrimaryGame = null;

  Object.keys(allGames).forEach((pid) => {
    allGames[pid] = (allGames[pid] || []).map((g) => {
      if (!g?.isBullpen && isSameGameGroup(reportGame, g)) {
        const updated = { ...g, opponent: nextOpponent };
        if (g.id === reportGame.id) updatedPrimaryGame = updated;
        return updated;
      }
      return g;
    });
  });

  localStorage.setItem(storageKey, JSON.stringify(allGames));

  const nextGame = updatedPrimaryGame || { ...reportGame, opponent: nextOpponent };
  if (currentGame && isSameGameGroup(reportGame, currentGame)) {
    setCurrentGame({ ...currentGame, opponent: nextOpponent });
  }
  setReportGame(nextGame);

  const nextReport = generateGameReport(nextGame);
  setReportText(nextReport);
  if (reportId) {
    const stored = JSON.parse(localStorage.getItem('baseball_reports') || '{}');
    stored[reportId] = nextReport;
    localStorage.setItem('baseball_reports', JSON.stringify(stored));
  }

  if (selectedPitcher?.id && !!reportGame.scouting === !!isScouting) {
    loadGames(selectedPitcher.id);
  }
};

const updateGameOpponentName = (baseGame, nextOpponent) => {
  const trimmedOpponent = nextOpponent.trim();
  if (!baseGame || !trimmedOpponent) return;

  const storageKey = baseGame.scouting ? 'baseball_scout_games' : 'baseball_games';
  const allGames = readGameStore(storageKey);
  let updatedPrimaryGame = null;

  Object.keys(allGames).forEach((pid) => {
    allGames[pid] = (allGames[pid] || []).map((g) => {
      if (!g?.isBullpen && isSameGameGroup(baseGame, g)) {
        const updated = { ...g, opponent: trimmedOpponent };
        if (g.id === baseGame.id) updatedPrimaryGame = updated;
        return updated;
      }
      return g;
    });
  });

  localStorage.setItem(storageKey, JSON.stringify(allGames));

  if (selectedPitcher?.id && !!baseGame.scouting === !!isScouting) {
    loadGames(selectedPitcher.id);
  }

  if (currentGame && isSameGameGroup(baseGame, currentGame)) {
    setCurrentGame({ ...currentGame, opponent: trimmedOpponent });
  }

  if (reportGame && isSameGameGroup(baseGame, reportGame)) {
    const nextGame = updatedPrimaryGame || { ...reportGame, opponent: trimmedOpponent };
    setReportGame(nextGame);
    const nextReport = generateGameReport(nextGame);
    setReportText(nextReport);
    if (reportId) {
      const stored = JSON.parse(localStorage.getItem('baseball_reports') || '{}');
      stored[reportId] = nextReport;
      localStorage.setItem('baseball_reports', JSON.stringify(stored));
    }
  }
};

const openRecentGameActions = (item) => {
  recentGameHoldTriggeredRef.current = true;
  setRecentGameActionItem(item);
  setRecentGameOpponentDraft(
    item?.game?.opponent && item.game.opponent !== 'Unknown' ? item.game.opponent : ''
  );
  setShowRecentGameActions(true);
};

const closeRecentGameActions = () => {
  setShowRecentGameActions(false);
  setRecentGameActionItem(null);
  setRecentGameOpponentDraft('');
  setConfirmingRecentGameDelete(false);
};

const startRecentGameHold = (item) => {
  recentGameHoldTriggeredRef.current = false;
  recentGameHoldTimerRef.current = setTimeout(() => {
    openRecentGameActions(item);
  }, 550);
};

const cancelRecentGameHold = () => {
  if (recentGameHoldTimerRef.current) {
    clearTimeout(recentGameHoldTimerRef.current);
    recentGameHoldTimerRef.current = null;
  }
};

const currentLineup = normalizeLineup(currentGame?.lineup);
const currentHitter = currentLineup[(currentBatter || 1) - 1] || null;

const openLineupEditor = () => {
  setLineupDraft(normalizeLineup(currentGame?.lineup));
  setShowLineupModal(true);
};

const updateLineupDraftSpot = (slot, field, value) => {
  setLineupDraft((prev) => normalizeLineup(prev).map((spot) => (
    spot.slot === slot ? { ...spot, [field]: value } : spot
  )));
};

const toggleLineupSpotSub = (slot) => {
  setLineupDraft((prev) => normalizeLineup(prev).map((spot) => {
    if (spot.slot !== slot) return spot;
    if (!spot.isSub) {
      return {
        ...spot,
        isSub: true,
        replacedPlayer: spot.replacedPlayer || spot.name || ''
      };
    }
    return {
      ...spot,
      isSub: false,
      replacedPlayer: ''
    };
  }));
};

const getBaseEditorValue = (runner) => runnerLabel(runner);

const openBasesEditor = () => {
  setBasesDraft({
    first: getBaseEditorValue(currentBases.first),
    second: getBaseEditorValue(currentBases.second),
    third: getBaseEditorValue(currentBases.third),
    runs: String(totalRunsAllowed)
  });
  setShowBasesModal(true);
};

const saveBasesEditor = () => {
  const parseRunner = (value, slot) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return { name: trimmed, number: '', slot };
  };
  setCurrentBases({
    first: parseRunner(basesDraft.first, 1),
    second: parseRunner(basesDraft.second, 2),
    third: parseRunner(basesDraft.third, 3)
  });
  setTotalRunsAllowed(Math.max(Number(basesDraft.runs) || 0, 0));
  setShowBasesModal(false);
};

const saveLineup = () => {
  const nextLineup = normalizeLineup(lineupDraft);
  if (!nextLineup.every((spot) => spot.name.trim())) return;
  setCurrentGame((prev) => prev ? { ...prev, lineup: nextLineup } : prev);
  setCurrentBatterHandedness(nextLineup[(currentBatter || 1) - 1]?.handedness || 'R');
  setShowLineupModal(false);
};

useEffect(() => () => {
  if (voiceRecognitionRef.current) {
    stopVoiceListeningSession();
  }
}, []);

const clearVoiceCommandState = () => {
  setVoiceCommandPreview(null);
  setVoiceCommandError('');
};

const previewVoiceCommand = (inputValue = voiceCommandText) => {
  const parsed = parseVoiceCommand(inputValue, selectedPitcher?.pitchTypes || [], {
    allowResultWithoutPitchType: atBatPitches.length > 0
  });
  if (parsed.error) {
    setVoiceCommandPreview(null);
    setVoiceCommandError(parsed.error);
    return null;
  }
  if (!parsed.pitchType && atBatPitches.length === 0) {
    setVoiceCommandPreview(null);
    setVoiceCommandError('Start the phrase with the pitch type so I can finish the at-bat cleanly.');
    return null;
  }
  setVoiceCommandPreview(parsed);
  setVoiceCommandError('');
  return parsed;
};

const applyVoiceCommand = (parsedAction = voiceCommandPreview) => {
  if (!parsedAction) return;

  if (parsedAction.kind === 'pitch') {
    recordPitch(
      parsedAction.pitchType,
      parsedAction.isStrike,
      parsedAction.isStrike ? parsedAction.strikeType : null,
      !parsedAction.isStrike ? parsedAction.ballType : null,
      null,
      parsedAction.velocity || null
    );
  } else if (parsedAction.kind === 'result') {
    setActionHistory([...actionHistory, {
      type: 'voiceResult',
      atBatPitches: [...atBatPitches],
      pitchCountBaseline,
      currentBatter,
      currentInning,
      currentOuts,
      currentBatterHandedness,
      selectedZone,
      pitchTrail: [...pitchTrail],
      currentGame: JSON.parse(JSON.stringify(currentGame))
    }]);

    if (parsedAction.pitchType) {
      const velocity = parsedAction.velocity || currentVelocity.trim();
      const appendedPitch = {
        type: parsedAction.pitchType,
        isStrike: parsedAction.outcome === 'BB' || parsedAction.outcome === 'HBP' ? false : true,
        strikeType: parsedAction.outcome === 'BB' || parsedAction.outcome === 'HBP' ? null : parsedAction.strikeType,
        ballType: parsedAction.outcome === 'BB' ? (parsedAction.ballType || 'Away') : (parsedAction.outcome === 'HBP' ? 'HBP' : null),
        zone: selectedZone,
        velocity: velocity || null,
        count: atBatPitches.length + 1
      };
      completeAtBatWithPitches(parsedAction.outcome, [...atBatPitches, appendedPitch], parsedAction.detail || null);
      setCurrentVelocity('');
      setSelectedZone(null);
    } else {
      completeAtBat(parsedAction.outcome, parsedAction.detail || null);
    }
  }

  setVoiceCommandText('');
  setVoiceCommandPreview(null);
  setVoiceCommandError('');
};

const stopNativeVoiceListening = async () => {
  try {
    await SpeechRecognition.stop();
  } catch {
    // iOS can throw here if the recognizer already ended.
  }
  try {
    await SpeechRecognition.removeAllListeners();
  } catch {
    // Ignore listener cleanup failures during shutdown.
  }
  voiceRecognitionRef.current = null;
  setIsVoiceListening(false);
};

const stopVoiceListeningSession = async () => {
  if (!voiceRecognitionRef.current) {
    setIsVoiceListening(false);
    return;
  }

  if (voiceRecognitionRef.current.kind === 'native') {
    await stopNativeVoiceListening();
    return;
  }

  try {
    voiceRecognitionRef.current.onresult = null;
    voiceRecognitionRef.current.onerror = null;
    voiceRecognitionRef.current.onend = null;
    voiceRecognitionRef.current.stop();
  } catch {
    // Ignore browser speech shutdown errors when recognition already ended.
  }
  voiceRecognitionRef.current = null;
  setIsVoiceListening(false);
};

const resetLiveEntryTransientState = async ({ clearVoiceText = true, clearUndoHistory = false } = {}) => {
  await stopVoiceListeningSession();
  setPendingPitch(null);
  setShowOutModal(false);
  setOutLocation('');
  setPendingDefensiveOutcome(null);
  setShowHitLocationModal(false);
  setHitLocation('');
  setPendingHitOutcome(null);
  setShowConfirmModal(null);
  setCurrentVelocity('');
  setVoiceCommandPreview(null);
  setVoiceCommandError('');
  if (clearVoiceText) setVoiceCommandText('');
  if (clearUndoHistory) setActionHistory([]);
};

const startNativeVoiceListening = async () => {
  try {
    const { available } = await SpeechRecognition.available();
    if (!available) {
      setVoiceCommandError('Speech input is not available on this device right now.');
      return;
    }

    const currentPermissions = await SpeechRecognition.checkPermissions();
    let permissionState = currentPermissions?.speechRecognition;
    if (permissionState !== 'granted') {
      const requestedPermissions = await SpeechRecognition.requestPermissions();
      permissionState = requestedPermissions?.speechRecognition;
    }

    if (permissionState !== 'granted') {
      setVoiceCommandError('Allow microphone and speech recognition access to use Speak to Text.');
      return;
    }

    await SpeechRecognition.removeAllListeners();
    const listeningHandle = await SpeechRecognition.addListener('listeningState', ({ status }) => {
      if (status === 'stopped') {
        setIsVoiceListening(false);
      }
    });

    voiceRecognitionRef.current = {
      kind: 'native',
      stop: async () => {
        try {
          await SpeechRecognition.stop();
        } catch {
          // Safe to ignore if recognition already stopped.
        }
        try {
          await listeningHandle.remove();
        } catch {
          // Ignore listener removal issues.
        }
        try {
          await SpeechRecognition.removeAllListeners();
        } catch {
          // Ignore cleanup failures.
        }
        voiceRecognitionRef.current = null;
        setIsVoiceListening(false);
      }
    };

    setIsVoiceListening(true);
    setVoiceCommandError('');

    const result = await SpeechRecognition.start({
      language: 'en-US',
      maxResults: 1,
      prompt: 'Describe the pitch',
      partialResults: false,
      popup: false
    });

    const transcript = result?.matches?.[0] || '';
    if (transcript) {
      setVoiceCommandText(transcript);
      setVoiceCommandError('');
      setTimeout(() => previewVoiceCommand(transcript), 0);
    } else {
      setVoiceCommandError('No speech was captured. Try again or type the command below.');
    }

    await listeningHandle.remove();
    await SpeechRecognition.removeAllListeners();
    voiceRecognitionRef.current = null;
    setIsVoiceListening(false);
  } catch {
    setVoiceCommandError('Mic capture failed. You can still type the command below.');
    stopNativeVoiceListening();
  }
};

const toggleVoiceListening = async () => {
  if (typeof window === 'undefined') return;
  const isNativePlatform = Capacitor.getPlatform() !== 'web';

  if (isVoiceListening && voiceRecognitionRef.current) {
    await stopVoiceListeningSession();
    return;
  }

  if (isNativePlatform) {
    await startNativeVoiceListening();
    return;
  }

  const RecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!RecognitionClass) {
    setVoiceCommandError('Mic input is not supported here, but typed smart input still works.');
    return;
  }

  const recognition = new RecognitionClass();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    setVoiceCommandText(transcript);
    setVoiceCommandError('');
    setTimeout(() => previewVoiceCommand(transcript), 0);
  };
  recognition.onerror = () => {
    setVoiceCommandError('Mic capture failed. You can still type the command below.');
    setIsVoiceListening(false);
  };
  recognition.onend = () => {
    setIsVoiceListening(false);
    voiceRecognitionRef.current = null;
  };
  voiceRecognitionRef.current = recognition;
  setIsVoiceListening(true);
  setVoiceCommandError('');
  recognition.start();
};

const getRecentAtBatsForCurrentHitter = (limit = 3) => {
  if (!currentGame?.innings?.length || !currentHitter) return [];
  const matches = [];
  currentGame.innings.forEach((inning) => {
    inning.atBats?.forEach((atBat) => {
      const sameSlot = atBat.batter === currentBatter;
      const sameHitterName = (atBat.batterName || '').trim() && (currentHitter.name || '').trim()
        ? (atBat.batterName || '').trim().toLowerCase() === (currentHitter.name || '').trim().toLowerCase()
        : true;
      const sameHitterNumber = (atBat.batterNumber || '').trim() && (currentHitter.number || '').trim()
        ? (atBat.batterNumber || '').trim() === (currentHitter.number || '').trim()
        : true;

      if (sameSlot && sameHitterName && sameHitterNumber) {
        matches.push({
          ...atBat,
          inning: inning.number
        });
      }
    });
  });
  return matches.slice(-limit).reverse();
};

const getLastAtBatForCurrentHitter = () => {
  return getRecentAtBatsForCurrentHitter(1)[0] || null;
};

const getKeyHittersFaced = (game, limit = 6) => {
  const hitterMap = new Map();
  (game?.innings || []).forEach((inning) => {
    (inning.atBats || []).forEach((atBat) => {
      const key = `${(atBat.batterName || '').trim().toLowerCase()}__${(atBat.batterNumber || '').trim()}__${atBat.batter}`;
      const label = getAtBatHitterLabel(atBat);
      const existing = hitterMap.get(key) || {
        label,
        handedness: atBat.batterHandedness || 'R',
        appearances: 0,
        hits: 0,
        strikeouts: 0,
        walks: 0
      };
      existing.appearances += 1;
      if (['1B', '2B', '3B', 'HR'].includes(atBat.outcome)) existing.hits += 1;
      if (atBat.outcome === 'K') existing.strikeouts += 1;
      if (atBat.outcome === 'BB' || atBat.outcome === 'HBP') existing.walks += 1;
      hitterMap.set(key, existing);
    });
  });
  return Array.from(hitterMap.values())
    .sort((a, b) => b.appearances - a.appearances || b.hits - a.hits)
    .slice(0, limit);
};

const getSprayChartEvents = (game) => {
  const events = [];
  (game?.innings || []).forEach((inning) => {
    (inning.atBats || []).forEach((atBat) => {
      if (!['1B', '2B', '3B', 'HR'].includes(atBat.outcome)) return;
      const location = atBat.outDetails || '';
      events.push({
        ...getHitSprayPoint(location),
        location,
        outcome: atBat.outcome,
        hitter: getAtBatHitterLabel(atBat)
      });
    });
  });
  return events;
};

const applyOutcomeToBases = (bases, outcome, hitter, batterSlot) => {
  const nextBases = cloneBases(bases);
  const batterRunner = buildRunner(hitter, batterSlot);
  let runsScored = 0;

  const scoreRunner = () => {
    runsScored += 1;
  };

  if (outcome === 'BB' || outcome === 'HBP') {
    if (nextBases.first && nextBases.second && nextBases.third) scoreRunner();
    if (nextBases.second && nextBases.first) nextBases.third = nextBases.second;
    if (nextBases.first) nextBases.second = nextBases.first;
    nextBases.first = batterRunner;
    return { nextBases, runsScored, rbi: runsScored };
  }

  if (outcome === '1B') {
    if (nextBases.third) scoreRunner();
    nextBases.third = nextBases.second;
    nextBases.second = nextBases.first;
    nextBases.first = batterRunner;
    return { nextBases, runsScored, rbi: runsScored };
  }

  if (outcome === '2B') {
    if (nextBases.third) scoreRunner();
    if (nextBases.second) scoreRunner();
    nextBases.third = nextBases.first;
    nextBases.second = batterRunner;
    nextBases.first = null;
    return { nextBases, runsScored, rbi: runsScored };
  }

  if (outcome === '3B') {
    if (nextBases.third) scoreRunner();
    if (nextBases.second) scoreRunner();
    if (nextBases.first) scoreRunner();
    nextBases.first = null;
    nextBases.second = null;
    nextBases.third = batterRunner;
    return { nextBases, runsScored, rbi: runsScored };
  }

  if (outcome === 'HR') {
    if (nextBases.third) scoreRunner();
    if (nextBases.second) scoreRunner();
    if (nextBases.first) scoreRunner();
    scoreRunner();
    return { nextBases: createEmptyBases(), runsScored, rbi: runsScored };
  }

  if (outcome === 'SAC') {
    if (nextBases.third) scoreRunner();
    nextBases.third = nextBases.second;
    nextBases.second = nextBases.first;
    nextBases.first = null;
    return { nextBases, runsScored, rbi: runsScored };
  }

  return { nextBases, runsScored, rbi: 0 };
};

const openDefensiveOutcomeModal = (outcome) => {
  setPendingDefensiveOutcome(outcome);
  setOutLocation('');
  setShowOutModal(true);
};

const submitDefensiveDetail = (detailOverride = null) => {
  const detail = (detailOverride || outLocation).trim();
  if (!detail || !pendingDefensiveOutcome) return;
  completeAtBat(pendingDefensiveOutcome, detail);
  setOutLocation('');
  setPendingDefensiveOutcome(null);
  setShowOutModal(false);
};

const applyQuickDefensiveResult = (outcome, detail) => {
  setPendingDefensiveOutcome(outcome);
  completeAtBat(outcome, detail);
  setOutLocation('');
  setPendingDefensiveOutcome(null);
  setShowOutModal(false);
};

const handleHitOutcomeClick = (outcome) => {
  setPendingHitOutcome(outcome);
  setHitLocation('');
  setShowHitLocationModal(true);
};

const submitHitLocation = () => {
  if (!hitLocation.trim() || !pendingHitOutcome) return;
  completeAtBat(pendingHitOutcome, hitLocation.trim());
  setShowHitLocationModal(false);
  setPendingHitOutcome(null);
  setHitLocation('');
};

const loadPitchers = () => {
const stored = localStorage.getItem('baseball_pitchers');
if (stored) {
  const loaded = JSON.parse(stored).map(normalizePitcherRecord);
  localStorage.setItem('baseball_pitchers', JSON.stringify(loaded));
  setPitchers(loaded);
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
  const allGames = readGameStore('baseball_scout_games');
  const pitcherGames = allGames[pitcherId] || [];
  setGames(pitcherGames);
  calculateSeasonStats(pitcherGames);
};

const savePitchers = (updatedPitchers) => {
const normalizedPitchers = updatedPitchers.map(normalizePitcherRecord);
localStorage.setItem('baseball_pitchers', JSON.stringify(normalizedPitchers));
setPitchers(normalizedPitchers);
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

if (showPitcherSelect && scoutingMode) {
  startGameWithPitcher(pitcher);
}
 

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
const allGames = readGameStore('baseball_games');
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
const storageKey = isScoutContext ? 'baseball_scout_games' : 'baseball_games';
const allGames = readGameStore(storageKey);
const pitcherGames = allGames[pitcherId] || [];
setGames(pitcherGames);
calculateSeasonStats(pitcherGames);
};

const saveGames = (updatedGames) => {
const storageKey = isScoutContext ? 'baseball_scout_games' : 'baseball_games';
const allGames = readGameStore(storageKey);
allGames[selectedPitcher.id] = updatedGames;
localStorage.setItem(storageKey, JSON.stringify(allGames));
setGames(updatedGames);
calculateSeasonStats(updatedGames);
};

const loadBullpenSessions = (pitcherId) => {
  const all = JSON.parse(localStorage.getItem('baseball_bullpen_sessions') || '{}');
  return all[pitcherId] || [];
};

const saveBullpenSessions = (pitcherId, sessions) => {
  const all = JSON.parse(localStorage.getItem('baseball_bullpen_sessions') || '{}');
  all[pitcherId] = sessions;
  localStorage.setItem('baseball_bullpen_sessions', JSON.stringify(all));
  setBullpenSessions(sessions);
};

const deleteBullpenSession = (pitcherId, sessionId) => {
  const existing = loadBullpenSessions(pitcherId);
  const updated = existing.filter(s => s.id !== sessionId);
  // Re-number sessions in order
  const renumbered = updated.map((s, idx) => ({ ...s, number: idx + 1 }));
  saveBullpenSessions(pitcherId, renumbered);
};

const collectBullpenPitches = () => {
  const pitches = [];
  currentGame?.innings?.forEach(inning => {
    inning.atBats?.forEach(atBat => {
      atBat.pitches?.forEach(p => pitches.push(p));
    });
  });
  atBatPitches.forEach(p => pitches.push(p));
  return pitches;
};

const normalizeRosterKey = (p) => {
  const name = (p.name || '').trim().toLowerCase();
  const number = (p.number || '').toString().trim().toLowerCase();
  return `${name}__${number}`;
};

const getRosterByType = (type) => {
  return type === 'scout' ? loadScoutPitchers() : pitchers;
};

const setRosterByType = (type, roster) => {
  if (type === 'scout') saveScoutPitchers(roster);
  else savePitchers(roster);
};

const buildRosterPayload = (type) => {
  const roster = getRosterByType(type);
  const cleaned = roster.map((p) => ({
    name: p.name || '',
    number: p.number || '',
    handedness: p.handedness || '',
    role: p.role || '',
    pitchTypes: Array.isArray(p.pitchTypes) ? p.pitchTypes : []
  }));
  return {
    rosterType: type,
    exportedAt: new Date().toISOString(),
    pitchers: cleaned
  };
};

const getAllGamesStore = () => {
  const teamGames = readGameStore('baseball_games');
  const scoutGames = readGameStore('baseball_scout_games');
  return { teamGames, scoutGames };
};

const getAllBullpenStore = () => {
  return JSON.parse(localStorage.getItem('baseball_bullpen_sessions') || '{}');
};

const buildAllDataPayload = () => {
  const { teamGames: allGames } = getAllGamesStore();
  const allBullpens = getAllBullpenStore();
  const scoutPitchers = loadScoutPitchers();
  const scoutGames = readGameStore('baseball_scout_games');
  const reports = JSON.parse(localStorage.getItem('baseball_reports') || '{}');
  const cleanedPitchers = pitchers.map((p) => ({
    name: p.name || '',
    number: p.number || '',
    handedness: p.handedness || '',
    role: p.role || '',
    pitchTypes: Array.isArray(p.pitchTypes) ? p.pitchTypes : []
  }));
  const cleanedScoutPitchers = scoutPitchers.map((p) => ({
    name: p.name || '',
    number: p.number || '',
    handedness: p.handedness || '',
    role: p.role || '',
    pitchTypes: Array.isArray(p.pitchTypes) ? p.pitchTypes : []
  }));
  const pitcherKeyById = Object.fromEntries(
    pitchers.map(p => [p.id, normalizeRosterKey(p)])
  );
  const scoutKeyById = Object.fromEntries(
    scoutPitchers.map(p => [p.id, normalizeRosterKey(p)])
  );
  const gamesByPitcher = Object.entries(allGames).map(([pid, gamesList]) => ({
    pitcherKey: pitcherKeyById[pid] || '',
    games: gamesList || []
  }));
  const bullpensByPitcher = Object.entries(allBullpens).map(([pid, sessions]) => ({
    pitcherKey: pitcherKeyById[pid] || '',
    sessions: sessions || []
  }));
  const scoutGamesByPitcher = Object.entries(scoutGames).map(([pid, gamesList]) => ({
    pitcherKey: scoutKeyById[pid] || '',
    games: gamesList || []
  }));
  return {
    exportType: 'all',
    exportedAt: new Date().toISOString(),
    pitchers: cleanedPitchers,
    scoutPitchers: cleanedScoutPitchers,
    gamesByPitcher,
    bullpensByPitcher,
    scoutGamesByPitcher,
    reports
  };
};

const rewriteGamePitcherReferences = (game, idMap = {}) => {
  const nextPitcherId = idMap[game?.pitcherId] ?? game?.pitcherId;
  const nextStarterId = idMap[game?.starterPitcherId] ?? game?.starterPitcherId;
  return {
    ...game,
    pitcherId: nextPitcherId,
    starterPitcherId: nextStarterId,
    state: game?.state ? {
      ...game.state,
      currentPitcherId: idMap[game.state.currentPitcherId] ?? game.state.currentPitcherId
    } : game?.state,
    innings: (game?.innings || []).map((inning) => ({
      ...inning,
      atBats: (inning.atBats || []).map((atBat) => ({
        ...atBat,
        pitcherId: idMap[atBat?.pitcherId] ?? atBat?.pitcherId
      }))
    }))
  };
};

const buildSharedGamePayload = (baseGame) => {
  const groupEntries = getGameReportGroupEntries(baseGame).filter((entry) => getPitcherOwnedPitchTotal(entry.game) > 0);
  const sourcePitchers = baseGame?.scouting ? loadScoutPitchers() : pitchers;
  const sourceById = Object.fromEntries(sourcePitchers.map((pitcher) => [String(pitcher.id), pitcher]));
  return {
    exportType: 'shared-game',
    exportedAt: new Date().toISOString(),
    scouting: Boolean(baseGame?.scouting),
    baseGameId: baseGame?.id,
    opponent: baseGame?.opponent || '',
    games: groupEntries.map((entry) => {
      const pitcher = sourceById[String(entry.pitcherId)];
      return {
        pitcher: pitcher ? {
          id: pitcher.id,
          name: pitcher.name || '',
          number: pitcher.number || '',
          handedness: pitcher.handedness || '',
          role: pitcher.role || '',
          pitchTypes: Array.isArray(pitcher.pitchTypes) ? pitcher.pitchTypes : []
        } : {
          id: entry.pitcherId,
          name: entry.pitcherName || '',
          number: '',
          handedness: '',
          role: '',
          pitchTypes: []
        },
        game: entry.game
      };
    }),
    report: generateGameReport(baseGame)
  };
};

const gameKey = (g) => {
  const opponent = (g.opponent || '').trim().toLowerCase();
  const date = g.date || '';
  const innings = g.innings?.length || 0;
  let totalPitches = 0;
  g.innings?.forEach(i => {
    i.atBats?.forEach(ab => { totalPitches += ab.totalPitches || 0; });
  });
  return `${date}__${opponent}__${innings}__${totalPitches}`;
};

const bullpenKey = (s) => {
  const date = s.date || '';
  return `${date}__${s.totalPitches || 0}__${s.strikes || 0}__${s.balls || 0}`;
};

const handleImportRoster = (importText = rosterImportText) => {
  setRosterShareMessage('');
  let parsed;
  try {
    parsed = JSON.parse(importText);
  } catch {
    setRosterShareMessage('Invalid JSON file. Please choose a valid roster export.');
    return;
  }
  const incoming = Array.isArray(parsed?.pitchers) ? parsed.pitchers : [];
  if (!incoming.length) {
    setRosterShareMessage('No pitchers found in this file.');
    return;
  }

  const targetType = rosterShareType;
  const existing = getRosterByType(targetType);
  const existingKeys = new Set(existing.map(normalizeRosterKey));

  const merged = [...existing];
  let added = 0;
  incoming.forEach(p => {
    const key = normalizeRosterKey(p);
    if (!key || existingKeys.has(key)) return;
    existingKeys.add(key);
    merged.push({
      id: Date.now() + Math.random(),
      name: p.name || '',
      number: p.number || '',
      handedness: p.handedness || '',
      role: p.role || '',
      pitchTypes: Array.isArray(p.pitchTypes) ? p.pitchTypes : []
    });
    added += 1;
  });

  setRosterByType(targetType, merged);
  setRosterShareMessage(added === 0 ? 'No new pitchers were added (duplicates skipped).' : `Imported ${added} new pitchers.`);
};

const handleImportAllData = (importText = rosterImportText) => {
  setRosterShareMessage('');
  let parsed;
  try {
    parsed = JSON.parse(importText);
  } catch {
    setRosterShareMessage('Invalid JSON file. Please choose a valid data export.');
    return;
  }
  if (!Array.isArray(parsed?.pitchers)) {
    setRosterShareMessage('No pitchers found in this file.');
    return;
  }

  const existing = [...pitchers];
  const existingKeys = new Map(existing.map(p => [normalizeRosterKey(p), p.id]));

  // Merge pitchers first
  parsed.pitchers.forEach(p => {
    const key = normalizeRosterKey(p);
    if (!key || existingKeys.has(key)) return;
    const newId = Date.now() + Math.random();
    existing.push({
      id: newId,
      name: p.name || '',
      number: p.number || '',
      handedness: p.handedness || '',
      role: p.role || '',
      pitchTypes: Array.isArray(p.pitchTypes) ? p.pitchTypes : []
    });
    existingKeys.set(key, newId);
  });
  savePitchers(existing);

  // Merge games
  const { teamGames: allGames } = getAllGamesStore();
  (parsed.gamesByPitcher || []).forEach((entry) => {
    const key = entry.pitcherKey;
    if (!key || !existingKeys.has(key)) return;
    const pid = existingKeys.get(key);
    const current = allGames[pid] || [];
    const currentKeys = new Set(current.map(gameKey));
    const incoming = entry.games || [];
    const merged = [...current];
    incoming.forEach(g => {
      const k = gameKey(g);
      if (!k || currentKeys.has(k)) return;
      currentKeys.add(k);
      merged.push(g);
    });
    allGames[pid] = merged;
  });
  localStorage.setItem('baseball_games', JSON.stringify(allGames));

  // Merge bullpen sessions
  const allBullpens = getAllBullpenStore();
  (parsed.bullpensByPitcher || []).forEach((entry) => {
    const key = entry.pitcherKey;
    if (!key || !existingKeys.has(key)) return;
    const pid = existingKeys.get(key);
    const current = allBullpens[pid] || [];
    const currentKeys = new Set(current.map(bullpenKey));
    const incoming = entry.sessions || [];
    const merged = [...current];
    incoming.forEach(s => {
      const k = bullpenKey(s);
      if (!k || currentKeys.has(k)) return;
      currentKeys.add(k);
      merged.push(s);
    });
    // Re-number in chronological order
    const renumbered = merged
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      .map((s, idx) => ({ ...s, number: idx + 1 }));
    allBullpens[pid] = renumbered;
  });
  localStorage.setItem('baseball_bullpen_sessions', JSON.stringify(allBullpens));

  // Merge scouting roster and scouting games
  const existingScout = [...loadScoutPitchers()];
  const existingScoutKeys = new Map(existingScout.map(p => [normalizeRosterKey(p), p.id]));
  (parsed.scoutPitchers || []).forEach(p => {
    const key = normalizeRosterKey(p);
    if (!key || existingScoutKeys.has(key)) return;
    const newId = Date.now() + Math.random();
    existingScout.push({
      id: newId,
      name: p.name || '',
      number: p.number || '',
      handedness: p.handedness || '',
      role: p.role || '',
      pitchTypes: Array.isArray(p.pitchTypes) ? p.pitchTypes : []
    });
    existingScoutKeys.set(key, newId);
  });
  saveScoutPitchers(existingScout);

  const allScoutGames = readGameStore('baseball_scout_games');
  (parsed.scoutGamesByPitcher || []).forEach((entry) => {
    const key = entry.pitcherKey;
    if (!key || !existingScoutKeys.has(key)) return;
    const pid = existingScoutKeys.get(key);
    const current = allScoutGames[pid] || [];
    const currentKeys = new Set(current.map(gameKey));
    const incoming = entry.games || [];
    const merged = [...current];
    incoming.forEach(g => {
      const k = gameKey(g);
      if (!k || currentKeys.has(k)) return;
      currentKeys.add(k);
      merged.push(g);
    });
    allScoutGames[pid] = merged;
  });
  localStorage.setItem('baseball_scout_games', JSON.stringify(allScoutGames));

  const existingReports = JSON.parse(localStorage.getItem('baseball_reports') || '{}');
  Object.entries(parsed.reports || {}).forEach(([id, text]) => {
    if (!existingReports[id]) {
      existingReports[id] = text;
    }
  });
  localStorage.setItem('baseball_reports', JSON.stringify(existingReports));

  setRosterShareMessage('Data imported. Duplicates were skipped.');
};

const importSharedGamePayload = (payload) => {
  if (!payload || !Array.isArray(payload.games) || payload.games.length === 0) {
    setSharedGameImportStatus('That shared game is missing its data.');
    return;
  }

  const sharedFingerprint = getSharedImportFingerprint(payload);
  if (readImportedSharedGameFingerprints().includes(sharedFingerprint)) {
    setSharedGameImportStatus('That shared game was already imported into Game Log.');
    setSharedGameImport(null);
    return;
  }

  const targetType = payload.scouting ? 'scout' : 'team';
  const existingRoster = targetType === 'scout' ? [...loadScoutPitchers()] : [...pitchers];
  const existingKeys = new Map(existingRoster.map((pitcher) => [normalizeRosterKey(pitcher), pitcher.id]));
  const importedIdMap = {};

  payload.games.forEach((entry) => {
    const pitcher = entry.pitcher || {};
    const key = normalizeRosterKey(pitcher);
    if (!key) return;
    if (!existingKeys.has(key)) {
      const newId = Date.now() + Math.random();
      existingRoster.push({
        id: newId,
        name: pitcher.name || '',
        number: pitcher.number || '',
        handedness: pitcher.handedness || '',
        role: pitcher.role || '',
        pitchTypes: Array.isArray(pitcher.pitchTypes) ? pitcher.pitchTypes : []
      });
      existingKeys.set(key, newId);
    }
    importedIdMap[pitcher.id] = existingKeys.get(key);
  });

  if (targetType === 'scout') {
    saveScoutPitchers(existingRoster);
  } else {
    savePitchers(existingRoster);
  }

  const storageKey = targetType === 'scout' ? 'baseball_scout_games' : 'baseball_games';
  const allGames = readGameStore(storageKey);
  let addedGames = 0;

  payload.games.forEach((entry) => {
    const pitcher = entry.pitcher || {};
    const localPitcherId = importedIdMap[pitcher.id];
    if (!localPitcherId) return;
    const rewrittenGame = {
      ...rewriteGamePitcherReferences(entry.game, importedIdMap),
      sharedImport: true,
      sharedImportFingerprint: sharedFingerprint
    };
    const current = allGames[localPitcherId] || [];
    const currentKeys = new Set(current.map(gameKey));
    const incomingKey = gameKey(rewrittenGame);
    if (!incomingKey || currentKeys.has(incomingKey)) return;
    allGames[localPitcherId] = [...current, rewrittenGame];
    addedGames += 1;
  });

  if (addedGames === 0) {
    setSharedGameImportStatus('That shared game is already in Game Log. Duplicates were skipped.');
    setSharedGameImport(null);
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(allGames));
  saveImportedSharedGameFingerprint(sharedFingerprint);

  if (payload.report) {
    const storedReports = JSON.parse(localStorage.getItem('baseball_reports') || '{}');
    storedReports[`shared-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`] = payload.report;
    localStorage.setItem('baseball_reports', JSON.stringify(storedReports));
  }

  setSharedGameImportStatus(`Game imported to Game Log. Added ${addedGames} pitcher appearance${addedGames === 1 ? '' : 's'}.`);
  setSharedGameImport(null);
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.delete('sharedGame');
    window.history.replaceState({}, '', url.toString());
  }
  if (view === 'game-log' || view === 'landing') {
    setView('game-log');
  }
};

const downloadTextFile = (filename, text) => {
  const type = filename.toLowerCase().endsWith('.csv') ? 'text/csv;charset=utf-8' : 'application/json';
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const shareTextFile = async (filename, text) => {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false;
  }

  try {
    const type = filename.toLowerCase().endsWith('.csv') ? 'text/csv;charset=utf-8' : 'application/json';
    const file = new File([text], filename, { type });
    const payload = {
      title: filename,
      files: [file]
    };

    if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: [file] })) {
      return false;
    }

    await navigator.share(payload);
    return true;
  } catch (error) {
    if (error?.name === 'AbortError') return true;
    return false;
  }
};

const escapeCsvCell = (value) => {
  const stringValue = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const buildPitchByPitchCsv = (reportGame, reportEntries) => {
  const headers = [
    'Game Date',
    'Opponent',
    'Pitcher',
    'Inning',
    'Batter Spot',
    'Batter Name',
    'Batter Number',
    'Batter Handedness',
    'At-Bat Outcome',
    'Pitch Number',
    'Pitch Type',
    'Pitch Result',
    'Pitch Location',
    'Velocity',
    'Out Detail'
  ];

  const rows = [];
  reportEntries.forEach((entry) => {
    (entry.game.innings || []).forEach((inning) => {
      (inning.atBats || []).forEach((atBat) => {
        (atBat.pitches || []).forEach((pitch, pitchIdx) => {
          rows.push([
            reportGame?.date ? new Date(reportGame.date).toLocaleDateString('en-US') : '',
            reportGame?.opponent || '',
            entry.pitcherName || '',
            inning.number || '',
            atBat?.batter || '',
            atBat?.batterName || '',
            atBat?.batterNumber || '',
            atBat?.batterHandedness || '',
            formatAtBatOutcomeLabel(atBat),
            pitchIdx + 1,
            pitch?.type || '',
            getPitchResultLabel(pitch),
            getPitchLocationLabel(pitch),
            pitch?.velocity || '',
            atBat?.outDetails || ''
          ]);
        });
      });
    });
  });

  return [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(','))
  ].join('\n');
};

const handleDownloadShareFile = () => {
  const payload = shareContent === 'roster'
    ? buildRosterPayload(rosterShareType)
    : buildAllDataPayload();
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = shareContent === 'roster'
    ? `pitch-tracker-${rosterShareType}-roster-${stamp}.json`
    : `pitch-tracker-all-data-${stamp}.json`;
  downloadTextFile(filename, JSON.stringify(payload, null, 2));
  setRosterShareMessage(shareContent === 'roster' ? 'Roster JSON downloaded.' : 'Data JSON downloaded.');
};

const handleNativeShareFile = async () => {
  const payload = shareContent === 'roster'
    ? buildRosterPayload(rosterShareType)
    : buildAllDataPayload();
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = shareContent === 'roster'
    ? `pitchtrace-${rosterShareType}-roster-${stamp}.json`
    : `pitchtrace-all-data-${stamp}.json`;
  const text = JSON.stringify(payload, null, 2);
  const shared = await shareTextFile(filename, text);

  if (shared) {
    setRosterShareMessage(shareContent === 'roster' ? 'Roster file shared.' : 'Data file shared.');
  } else {
    downloadTextFile(filename, text);
    setRosterShareMessage('Native share is not available here, so the file was downloaded instead.');
  }
};

const shareOrDownloadTextFile = async (filename, text) => {
  const shared = await shareTextFile(filename, text);
  if (!shared) {
    downloadTextFile(filename, text);
  }
};

const handleImportFile = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    setRosterImportText(text);
    if (shareContent === 'roster') {
      handleImportRoster(text);
    } else {
      handleImportAllData(text);
    }
  } catch {
    setRosterShareMessage('Could not read that file.');
  } finally {
    event.target.value = '';
  }
};

const getAllPitcherMaps = () => {
  const team = pitchers || [];
  const scout = loadScoutPitchers();
  const all = [...team, ...scout];
  const byId = Object.fromEntries(all.map(p => [p.id, p]));
  const byKey = Object.fromEntries(all.map(p => [normalizeRosterKey(p), p]));
  return { all, byId, byKey };
};

const getAllRecentGames = () => {
  const { teamGames, scoutGames } = getAllGamesStore();
  const { byId } = getAllPitcherMaps();
  const groupedItems = new Map();
  [
    ['team', teamGames],
    ['opponent', scoutGames]
  ].forEach(([sourceType, store]) => {
    Object.entries(store).forEach(([pid, gamesList]) => {
      const pitcher = byId[pid];
      (gamesList || []).forEach(g => {
        if (g.isBullpen) return;
        const resolvedSide = typeof g.scouting === 'boolean'
          ? (g.scouting ? 'opponent' : 'team')
          : sourceType;
        const nextItem = {
          game: { ...g, scouting: g.scouting ?? (resolvedSide === 'opponent') },
          pitcherId: pitcher?.id,
          pitcherName: pitcher?.name || 'Unknown',
          starterPitcherName: g.starterPitcherName || pitcher?.name || 'Unknown',
          side: resolvedSide
        };
        const key = `${resolvedSide}-${g.gameGroupId || g.id}`;
        const existing = groupedItems.get(key);
        const existingStamp = existing?.game?.updatedAt || existing?.game?.date || '';
        const nextStamp = g.updatedAt || g.date || '';
        if (!existing || nextStamp >= existingStamp) {
          groupedItems.set(key, nextItem);
        }
      });
    });
  });
  return Array.from(groupedItems.values()).sort((a, b) => {
    const left = b.game.updatedAt || b.game.date || '';
    const right = a.game.updatedAt || a.game.date || '';
    return left.localeCompare(right);
  });
};

const getAllRecentBullpens = () => {
  const allBullpens = getAllBullpenStore();
  const { byId } = getAllPitcherMaps();
  const items = [];
  Object.entries(allBullpens).forEach(([pid, sessions]) => {
    const pitcher = byId[pid];
    (sessions || []).forEach(s => {
      items.push({
        session: s,
        pitcherId: pitcher?.id,
        pitcherName: pitcher?.name || 'Unknown'
      });
    });
  });
  return items.sort((a, b) => (b.session.date || '').localeCompare(a.session.date || ''));
};

const continueGameWithPitcher = (pitcher, game) => {
  setSelectedPitcher(pitcher);
  setCurrentGame(game);
  const state = game.state || {};
  setCurrentInning(state.currentInning || 1);
  setCurrentBatter(state.currentBatter || 1);
  setCurrentOuts(state.currentOuts || 0);
  setCurrentBatterHandedness(game.lineup?.[(state.currentBatter || 1) - 1]?.handedness || state.currentBatterHandedness || 'R');
  setAtBatPitches(state.atBatPitches || []);
  setPitchCountBaseline(state.pitchCountBaseline || 0);
  setPitchTrail(state.pitchTrail || []);
  setSelectedZone(state.selectedZone || null);
  setCurrentBases(cloneBases(state.currentBases));
  setTotalRunsAllowed(state.totalRunsAllowed || 0);
  setBullpenMode(false);
  setIsScouting(false);
  setScoutingMode(false);
  setView('pitch-entry');
};

const openPitcherDashboard = (pitcher, backView = 'team-dashboard') => {
  setSelectedPitcher(pitcher);
  setDashboardMode('live');
  setDashboardBackView(backView);
  setView('dashboard');
};

const getBreadcrumbs = () => {
  const map = {
    landing: 'Home',
    help: 'Home / Help & Settings',
    sales: 'Home / Sales',
    compliance: 'Home / NCAA Handout',
    rotation: 'Home / Team Rotation',
    'scouting-rotation': 'Home / Scouting',
    'team-dashboard': 'Home / Season Dashboard',
    'team-report': 'Home / Team Report',
    'game-log': 'Home / Game Log',
    dashboard: 'Home / Player Dashboard',
    'pitch-entry': 'Home / Game',
    bullpen: 'Home / Bullpen',
    report: 'Home / Report'
  };
  return map[view] || 'Home';
};

const onboardingSteps = [
  {
    eyebrow: 'Quick Start',
    title: 'Track in four taps.',
    body: 'Start simple: pick a pitch type, choose strike or ball, add the result, then move to the next hitter.'
  },
  {
    eyebrow: 'Home Modes',
    title: 'Keep team and opponent work separate.',
    body: 'Use My Team for your own pitchers, Opponent for scouting, and Execution Pen for bullpen-only sessions.'
  },
  {
    eyebrow: 'Game Speed',
    title: 'Stay in one screen.',
    body: 'Use the tap guide, Smart Input, and the sticky scoreboard so you can log fast without scrolling around.'
  },
  {
    eyebrow: 'Reports',
    title: 'Track first, review later.',
    body: 'Recent Games keeps open games ready to resume. Game Log holds finished work, reports, and edits.'
  }
];

const dismissOnboarding = () => {
  setShowOnboarding(false);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('pitchtrace_onboarding_seen', '1');
  }
};

const reopenOnboarding = () => {
  setOnboardingStep(0);
  setShowOnboarding(true);
};

const getLatestLoggedAtBat = (game = currentGame) => {
  const innings = [...(game?.innings || [])].reverse();
  for (const inning of innings) {
    const atBat = [...(inning.atBats || [])].reverse().find(Boolean);
    if (atBat) return atBat;
  }
  return null;
};

const getLatestLoggedAtBatReference = (game = currentGame) => {
  const innings = game?.innings || [];
  for (let inningIndex = innings.length - 1; inningIndex >= 0; inningIndex -= 1) {
    const atBats = innings[inningIndex]?.atBats || [];
    for (let atBatIndex = atBats.length - 1; atBatIndex >= 0; atBatIndex -= 1) {
      if (atBats[atBatIndex]) {
        return { inningIndex, atBatIndex, atBat: atBats[atBatIndex] };
      }
    }
  }
  return null;
};

const getUndoSummary = () => {
  if (actionHistory.length === 0) return 'Undo';
  const lastAction = actionHistory[actionHistory.length - 1];

  if (lastAction.type === 'pitch') {
    const latestPitch = atBatPitches[atBatPitches.length - 1];
    if (!latestPitch) return 'Undo Last Pitch';
    const detail = latestPitch.isStrike
      ? latestPitch.strikeType || 'Strike'
      : latestPitch.ballType === 'HBP'
        ? 'Hit By Pitch'
        : `${latestPitch.ballType || 'Ball'}`;
    return `Undo: ${latestPitch.type} ${detail}`;
  }

  if (lastAction.type === 'completeAtBat' || lastAction.type === 'voiceResult') {
    const lastAtBat = getLatestLoggedAtBat();
    if (!lastAtBat) return 'Undo Last Result';
    return `Undo: ${lastAtBat.outcome}${lastAtBat.outDetails ? ` ${lastAtBat.outDetails}` : ''}`;
  }

  if (lastAction.type === 'nextBatter') return 'Undo: Next Batter';
  return 'Undo Last Action';
};

const voiceCorrectionTokens = {
  result: ['called strike', 'swinging strike', 'foul ball', 'ball', 'in play'],
  location: ['up', 'away', 'in', 'down'],
  outcome: ['out', 'single', 'double', 'triple', 'home run', 'error', 'double play', 'sac', 'hit by pitch'],
  detail: ['6-3', '5-3', '4-3', '1-3', 'left field', 'center field', 'right field', 'left center', 'right center']
};

const applyVoiceCorrectionToken = (token) => {
  const nextText = `${voiceCommandText || ''} ${token}`.trim();
  setVoiceCommandText(nextText);
  clearVoiceCommandState();
  setTimeout(() => previewVoiceCommand(nextText), 0);
};

const getModeBadge = () => {
  if (view === 'bullpen') {
    return { label: 'Bullpen', className: 'border-amber-400/30 text-amber-200 bg-amber-400/10' };
  }
  if (view === 'pitch-entry') {
    const isOpponentGame = currentGame?.scouting || isScouting;
    return {
      label: `${isOpponentGame ? 'Opponent' : 'My Team'} • Live Game`,
      className: isOpponentGame
        ? 'border-cyan-400/30 text-cyan-200 bg-cyan-400/10'
        : 'border-violet-300/30 text-violet-100 bg-violet-300/10'
    };
  }
  if (view === 'scouting-rotation' || homeTeamView === 'opponent') {
    return { label: 'Opponent', className: 'border-cyan-400/30 text-cyan-200 bg-cyan-400/10' };
  }
  return { label: 'My Team', className: 'border-violet-300/30 text-violet-100 bg-violet-300/10' };
};

const ModeBadge = () => {
  const badge = getModeBadge();
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${badge.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {badge.label}
    </div>
  );
};

const BottomNav = () => (
  (view === 'pitch-entry' || view === 'bullpen') ? null : (
  <div className="fixed bottom-3 left-0 right-0 z-40 flex justify-center sm:hidden">
    <div className="flex gap-2 bg-slate-900/90 border border-slate-700/60 rounded-full px-3 py-2 backdrop-blur">
      <button
        onClick={() => setView('landing')}
        className={`px-3 py-2 text-xs rounded-full ${view === 'landing' ? 'bg-cyan-400 text-slate-900' : 'text-slate-300'}`}
      >
        Home
      </button>
      <button
        onClick={createBullpenSession}
        className={`px-3 py-2 text-xs rounded-full ${view === 'bullpen' ? 'bg-cyan-400 text-slate-900' : 'text-slate-300'}`}
      >
        Bullpen
      </button>
      <button
        onClick={() => setView('rotation')}
        className={`px-3 py-2 text-xs rounded-full ${view === 'rotation' ? 'bg-cyan-400 text-slate-900' : 'text-slate-300'}`}
      >
        Roster
      </button>
      <button
        onClick={() => setShowQuickSearch(true)}
        className="px-3 py-2 text-xs rounded-full text-slate-300"
      >
        Search
      </button>
    </div>
  </div>
  )
);

const QuickSearchModal = () => {
  if (!showQuickSearch) return null;
  const q = quickSearchQuery.trim().toLowerCase();
  const { all, byId } = getAllPitcherMaps();
  const games = getAllRecentGames();
  const bullpens = getAllRecentBullpens();

  const pitcherResults = q
    ? all.filter(p => (p.name || '').toLowerCase().includes(q))
    : all.slice(0, 8);
  const gameResults = q
    ? games.filter(g => (g.pitcherName || '').toLowerCase().includes(q) || (g.game.opponent || '').toLowerCase().includes(q))
    : games.slice(0, 8);
  const bullpenResults = q
    ? bullpens.filter(b => (b.pitcherName || '').toLowerCase().includes(q))
    : bullpens.slice(0, 8);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-xl font-semibold">Quick Search</h3>
          <button
            onClick={() => setShowQuickSearch(false)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <input
          type="text"
          value={quickSearchQuery}
          onChange={(e) => setQuickSearchQuery(e.target.value)}
          placeholder="Search players, opponents, games..."
          className="w-full px-4 py-3 mb-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />

        <div className="space-y-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Players</div>
            {pitcherResults.length === 0 ? (
              <div className="text-slate-500 text-sm">No players found.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {pitcherResults.map(p => (
                  <button
                    key={`p-${p.id}`}
                    onClick={() => {
                      openPitcherDashboard(p, 'landing');
                      setShowQuickSearch(false);
                    }}
                    className="text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg p-3"
                  >
                    <div className="text-white font-medium">{p.name}</div>
                    <div className="text-slate-400 text-xs">#{p.number || '--'} • {p.handedness || '--'} • {p.role || 'Opponent'}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Games</div>
            {gameResults.length === 0 ? (
              <div className="text-slate-500 text-sm">No games found.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {gameResults.map(item => {
                  const pitcher = byId[item.pitcherId];
                  return (
                    <button
                      key={`g-${item.game.id}`}
                      onClick={() => {
                        if (pitcher) continueGameWithPitcher(pitcher, item.game);
                        setShowQuickSearch(false);
                      }}
                      className="text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg p-3"
                    >
                      <div className="text-white font-medium">
                        {item.pitcherName} vs {item.game.opponent || 'Unknown'}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {new Date(item.game.date).toLocaleDateString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Bullpen Sessions</div>
            {bullpenResults.length === 0 ? (
              <div className="text-slate-500 text-sm">No bullpens found.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {bullpenResults.map(item => (
                  <button
                    key={`b-${item.session.id}`}
                    onClick={() => {
                      const pitcher = byId[item.pitcherId];
                      if (pitcher) openPitcherDashboard(pitcher, 'landing');
                      setDashboardMode('bullpen');
                      setShowQuickSearch(false);
                    }}
                    className="text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg p-3"
                  >
                    <div className="text-white font-medium">
                      {item.pitcherName} • Bullpen {item.session.number}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {new Date(item.session.date).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const computeBullpenStats = (pitches) => {
  const totalPitches = pitches.length;
  const strikes = pitches.filter(p => p.isStrike).length;
  const balls = totalPitches - strikes;
  const pitchTypeCounts = {};
  const pitchTypeStrikes = {};
  pitches.forEach(p => {
    pitchTypeCounts[p.type] = (pitchTypeCounts[p.type] || 0) + 1;
    if (p.isStrike) pitchTypeStrikes[p.type] = (pitchTypeStrikes[p.type] || 0) + 1;
  });
  return {
    totalPitches,
    strikes,
    balls,
    strikePercentage: totalPitches ? ((strikes / totalPitches) * 100).toFixed(1) : 0,
    pitchTypeCounts,
    pitchTypeStrikes
  };
};

const saveBullpenSet = () => {
  if (!currentGame || atBatPitches.length === 0) return;
  const updatedGame = { ...currentGame };
  const inningData = updatedGame.innings.find(i => i.number === currentInning) || {
    number: currentInning,
    atBats: []
  };
  const atBat = {
    batter: currentBatter,
    batterName: currentHitter?.name || `Batter ${currentBatter}`,
    batterNumber: currentHitter?.number || '',
    batterHandedness: currentBatterHandedness,
    pitcherId: currentGame.pitcherId,
    pitcherName: currentGame.pitcherName,
    pitches: [...atBatPitches],
    outcome: 'BP',
    runsScored: 0,
    outDetails: null,
    totalPitches: atBatPitches.length
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
};

const createNewGame = () => {
setScoutingMode(homeTeamView === 'opponent');
setIsScouting(false);
setBullpenMode(false);
setShowPitcherSelect(true);
setPendingOpponent('');
};

const createBullpenSession = () => {
setScoutingMode(false);
setBullpenMode(true);
setBullpenNotes('');
setShowPitcherSelect(true);
setPendingOpponent('');
};

const returnToHome = () => {
resetLiveEntryTransientState({ clearUndoHistory: true });
setShowPitcherSelect(false);
setShowAddPitcherModal(false);
setShowContinueModal(false);
setPendingPitchingChangeGame(null);
setPitcherSearch('');
setPendingOpponent('');
setBullpenMode(false);
setScoutingMode(false);
setIsScouting(false);
setView('landing');
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
const gameGroupId = carryOver?.gameGroupId || carryOver?.id || Date.now();
const starterPitcherId = carryOver?.starterPitcherId || pitcher.id;
const starterPitcherName = carryOver?.starterPitcherName || carryOver?.pitcherName || pitcher.name;
const carriedState = carryOver?.state || null;
const carriedPitchCountBaseline = carryOver ? (carriedState?.atBatPitches?.length || 0) : 0;
const newGame = carryOver ? {
  ...carryOver,
  id: Date.now(),
  gameGroupId,
  pitcherId: pitcher.id,
  pitcherName: pitcher.name,
  starterPitcherId,
  starterPitcherName,
  scouting: carryOver?.scouting ?? scoutingMode ?? isScouting,
  lineup: normalizeLineup(carryOver?.lineup),
  completed: false,
  updatedAt: new Date().toISOString(),
  state: {
    currentInning: carriedState?.currentInning || 1,
    currentBatter: carriedState?.currentBatter || 1,
    currentOuts: carriedState?.currentOuts || 0,
    currentBatterHandedness: carriedState?.currentBatterHandedness || 'R',
    atBatPitches: carriedState?.atBatPitches || [],
    pitchCountBaseline: carriedPitchCountBaseline,
    selectedZone: carriedState?.selectedZone || null,
    pitchTrail: carriedState?.pitchTrail || [],
    currentBases: cloneBases(carriedState?.currentBases),
    totalRunsAllowed: carriedState?.totalRunsAllowed || 0
  }
} : {
  id: Date.now(),
  gameGroupId,
  pitcherId: pitcher.id,
  pitcherName: pitcher.name,
  starterPitcherId,
  starterPitcherName,
  scouting: scoutingMode || isScouting,
  date: new Date().toISOString(),
  opponent: pendingOpponent || '',
  isBullpen: !!bullpenMode,
  lineup: createEmptyLineup(),
  innings: [],
  completed: false,
  updatedAt: new Date().toISOString(),
  state: {
    currentInning: 1,
    currentBatter: 1,
    currentOuts: 0,
    currentBatterHandedness: 'R',
    atBatPitches: [],
    pitchCountBaseline: 0,
    selectedZone: null,
    pitchTrail: [],
    currentBases: createEmptyBases(),
    totalRunsAllowed: 0
  }
};
setCurrentGame(newGame);
setCurrentInning(newGame.state.currentInning || 1);
setCurrentBatter(newGame.state.currentBatter || 1);
setCurrentBatterHandedness(newGame.lineup?.[(newGame.state.currentBatter || 1) - 1]?.handedness || newGame.state.currentBatterHandedness || 'R');
setAtBatPitches(newGame.state.atBatPitches || []);
setPitchCountBaseline(newGame.state.pitchCountBaseline || 0);
setPitchTrail(newGame.state.pitchTrail || []);
setSelectedZone(newGame.state.selectedZone || null);
setCurrentBases(cloneBases(newGame.state.currentBases));
setTotalRunsAllowed(newGame.state.totalRunsAllowed || 0);
resetLiveEntryTransientState({ clearUndoHistory: true });
setCurrentOuts(newGame.state.currentOuts || 0);
setShowPitcherSelect(false);
setView(bullpenMode ? 'bullpen' : (scoutingMode ? 'pitch-entry' : 'pitch-entry'));
if (bullpenMode) {
  setBullpenNotes('');
}
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
let totalAtBats = 0;
let resolvedIn3 = 0;
let resolvedIn4 = 0;
let oneOneCountTotal = 0;
let oneOneCountStrikes = 0;
let twoOfThreeStrikes = 0;
let totalThreePitchSequences = 0;
let totalSwings = 0;
let totalWhiffs = 0;
let strikeouts = 0;
let walks = 0;
let hbps = 0;
let hits = 0;
let totalGames = 0;
const pitchTypeCounts = {};
const pitchTypeStrikes = {};

gamesList.forEach(game => {
  totalGames++;
  game.innings?.forEach(inning => {
    inning.atBats?.forEach(atBat => {
      if (!doesAtBatBelongToGamePitcher(atBat, game)) return;
      const trackedPitches = getTrackedAtBatPitches(atBat);
      const trackedPitchCount = getTrackedAtBatPitchCount(atBat);
      totalAtBats++;
      totalPitches += trackedPitchCount;
      if (trackedPitchCount <= 3) resolvedIn3++;
      if (trackedPitchCount <= 4) resolvedIn4++;
      
      if (trackedPitches.length > 0) {
        totalFirstPitches++;
        if (trackedPitches[0].isStrike) firstPitchStrikes++;
      }
      if (trackedPitches.length >= 3) {
        totalThreePitchSequences++;
        const firstThree = trackedPitches.slice(0, 3);
        const strikesInFirstThree = firstThree.filter((p) => p.isStrike).length;
        if (strikesInFirstThree >= 2) twoOfThreeStrikes++;
      }

      // 1-1 count strike%: evaluate pitch thrown when the pre-pitch count is 1-1
      let balls = 0;
      let strikes = 0;
      trackedPitches.forEach((pitch) => {
        if (balls === 1 && strikes === 1) {
          oneOneCountTotal++;
          if (pitch.isStrike) oneOneCountStrikes++;
        }
        if (pitch.isStrike) {
          if (pitch.strikeType === 'Foul') {
            if (strikes < 2) strikes++;
          } else {
            strikes = Math.min(strikes + 1, 3);
          }
        } else {
          balls = Math.min(balls + 1, 4);
        }
      });

      trackedPitches.forEach(pitch => {
        if (pitch.isStrike) totalStrikes++;
        if (pitch.strikeType === 'Swinging' || pitch.strikeType === 'Foul' || pitch.strikeType === 'In Play') {
          totalSwings++;
        }
        if (pitch.strikeType === 'Swinging') {
          totalWhiffs++;
        }
        pitchTypeCounts[pitch.type] = (pitchTypeCounts[pitch.type] || 0) + 1;
        if (pitch.isStrike) {
          pitchTypeStrikes[pitch.type] = (pitchTypeStrikes[pitch.type] || 0) + 1;
        }
      });

      if (atBat.outcome === 'K') strikeouts++;
      if (atBat.outcome === 'BB') walks++;
      if (atBat.outcome === 'HBP') hbps++;
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
  hbps,
  hits,
  gamesPlayed: totalGames,
  avgPitchesPerBF: totalAtBats > 0 ? (totalPitches / totalAtBats).toFixed(1) : '0.0',
  resolveIn3Rate: totalAtBats > 0 ? ((resolvedIn3 / totalAtBats) * 100).toFixed(1) : '0.0',
  resolveIn4Rate: totalAtBats > 0 ? ((resolvedIn4 / totalAtBats) * 100).toFixed(1) : '0.0',
  oneOneStrikeRate: oneOneCountTotal > 0 ? ((oneOneCountStrikes / oneOneCountTotal) * 100).toFixed(1) : '0.0',
  twoOfThreeRate: totalThreePitchSequences > 0 ? ((twoOfThreeStrikes / totalThreePitchSequences) * 100).toFixed(1) : '0.0',
  whiffRate: totalSwings > 0 ? ((totalWhiffs / totalSwings) * 100).toFixed(1) : '0.0',
  pitchTypeCounts,
  pitchTypeStrikes
};
};

const getTeamReportRows = () => {
const allGames = readGameStore('baseball_games');
return pitchers.map((pitcher) => {
  const pitcherGames = allGames[pitcher.id] || [];
  const stats = calculateStatsFromGames(pitcherGames);
  return {
    ...pitcher,
    ...stats,
    kbbRatio: (stats.strikeouts / Math.max(stats.walks, 1)).toFixed(2)
  };
}).sort((a, b) => b.totalPitches - a.totalPitches);
};

const recordPitch = (type, isStrike, strikeType = null, ballType = null, zoneOverride = null, velocityOverride = null) => {
if (atBatPitches.at(-1)?.strikeType === 'In Play') {
  setPendingPitch(null);
  return;
}
const currentCount = getCountFromPitches(atBatPitches);
if (!currentGame?.isBullpen && (currentCount.balls >= 4 || currentCount.strikes >= 3)) {
  setPendingPitch(null);
  return;
}
const velocity = velocityOverride || currentVelocity.trim();
const pitch = {
type,
isStrike,
strikeType: isStrike ? strikeType : null,
ballType: !isStrike ? ballType : null,
  zone: zoneOverride ?? selectedZone,
velocity: velocity || null,
count: atBatPitches.length + 1
};
const newPitches = [...atBatPitches, pitch];
const newTrail = [{ type, isStrike, zone: zoneOverride ?? selectedZone, velocity: velocity || null }, ...pitchTrail].slice(0, 8);

 
setActionHistory([...actionHistory, {
  type: 'pitch',
  atBatPitches: [...atBatPitches],
  pitchCountBaseline,
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
setCurrentVelocity('');

const { balls, strikes } = getCountFromPitches(newPitches);
if (ballType === 'HBP') {
  setTimeout(() => completeAtBatWithPitches('HBP', newPitches, 'Hit By Pitch'), 0);
} else if (balls >= 4) {
  setTimeout(() => completeAtBatWithPitches('BB', newPitches), 0);
}
if (!currentGame?.isBullpen && strikes >= 3 && (strikeType === 'Called' || strikeType === 'Swinging')) {
  setTimeout(() => completeAtBatWithPitches('K', newPitches), 0);
}
 

};

const selectPitchType = (type, isStrike) => {
if (atBatPitches.at(-1)?.strikeType === 'In Play') return;
setPendingPitch({ type, isStrike });
};

const completeAtBatWithPitches = (outcome, pitchesArray, outDetails = null) => {
const { nextBases, runsScored, rbi } = applyOutcomeToBases(currentBases, outcome, currentHitter, currentBatter);
const pitcherEntryOffset = pitchCountBaseline || 0;
const atBat = {
batter: currentBatter,
batterName: currentHitter?.name || `Batter ${currentBatter}`,
batterNumber: currentHitter?.number || '',
 batterHandedness: currentBatterHandedness,
pitcherId: currentGame?.pitcherId,
pitcherName: currentGame?.pitcherName,
pitches: pitchesArray,
outcome,
runsScored,
rbi,
basesBefore: cloneBases(currentBases),
basesAfter: cloneBases(nextBases),
outDetails,
totalPitches: pitchesArray.length,
pitcherEntryOffset,
pitcherPitchCount: Math.max(pitchesArray.length - pitcherEntryOffset, 0)
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
setPitchCountBaseline(0);
setPitchTrail([]);
setCurrentVelocity('');
setCurrentBatter(getNextBatterSlot(currentBatter));
setCurrentBases(nextBases);
setTotalRunsAllowed((prev) => prev + runsScored);
setPendingPitch(null);

const outOutcomes = ['K', 'OUT', 'SAC', 'DP'];
if (outOutcomes.includes(outcome)) {
  const newOuts = currentOuts + (outcome === 'DP' ? 2 : 1);
  setCurrentOuts(newOuts);
  
  if (newOuts >= 3) {
    setTimeout(() => {
      setCurrentInning(currentInning + 1);
      setCurrentOuts(0);
      setCurrentBases(createEmptyBases());
    }, 500);
  }
}
 

};

const completeAtBat = (outcome, outDetails = null) => {
if (atBatPitches.length === 0 && outcome !== 'K' && outcome !== 'BB' && outcome !== 'HBP') return;

 
setActionHistory([...actionHistory, {
  type: 'completeAtBat',
  atBatPitches: [...atBatPitches],
  pitchCountBaseline,
  currentBatter,
  currentInning,
  currentOuts,
  currentBatterHandedness,
  selectedZone,
  pitchTrail: [...pitchTrail],
  currentGame: JSON.parse(JSON.stringify(currentGame))
}]);

completeAtBatWithPitches(outcome, atBatPitches, outDetails);
 

};

const handleOutClick = () => {
setShowOutModal(true);
};

const submitOut = () => {
submitDefensiveDetail();
};

const undoLastPitch = () => {
if (currentGame?.isBullpen) {
  confirmUndo();
  return;
}
setShowConfirmModal('undo');
};

const confirmUndo = () => {
if (actionHistory.length > 0) {
const lastAction = actionHistory[actionHistory.length - 1];

 
  setAtBatPitches(lastAction.atBatPitches);
  setPitchCountBaseline(lastAction.pitchCountBaseline || 0);
  setCurrentBatter(lastAction.currentBatter);
  setCurrentInning(lastAction.currentInning);
  setCurrentOuts(lastAction.currentOuts);
  setCurrentBatterHandedness(lastAction.currentBatterHandedness || 'R');
  setSelectedZone(lastAction.selectedZone || null);
  setPitchTrail(lastAction.pitchTrail || []);
  setCurrentBases(cloneBases(lastAction.currentGame?.state?.currentBases));
  setTotalRunsAllowed(lastAction.currentGame?.state?.totalRunsAllowed || 0);
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
pitchCountBaseline,
currentBatter,
currentInning,
currentOuts,
currentBatterHandedness,
selectedZone,
pitchTrail: [...pitchTrail],
currentGame: JSON.parse(JSON.stringify(currentGame))
}]);

if (currentGame?.isBullpen) {
  saveBullpenSet();
}
 
setAtBatPitches([]);
setPitchCountBaseline(0);
setPitchTrail([]);
setSelectedZone(null);
setCurrentVelocity('');
setPendingPitch(null);
setVoiceCommandPreview(null);
setVoiceCommandError('');
setCurrentBatter(getNextBatterSlot(currentBatter));
setShowConfirmModal(null);
 

};

const saveGame = () => {
if (currentGame?.isBullpen) {
  confirmSaveGame(false);
  return;
}
setShowConfirmModal('saveGame');
};

const confirmPitchingChange = () => {
if (currentGame) {
  const updatedGame = { ...currentGame, completed: false, updatedAt: new Date().toISOString() };
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
  resetLiveEntryTransientState({ clearUndoHistory: true });
  setShowPitcherSelect(true);
}
setShowConfirmModal(null);
};

const confirmSaveGame = (shouldContinue = false) => {
if (currentGame) {
const updatedGame = { ...currentGame, completed: !shouldContinue, updatedAt: new Date().toISOString() };
const existingIndex = games.findIndex(g => g.id === currentGame.id);

  if (updatedGame.isBullpen) {
    const pitches = collectBullpenPitches();
    const stats = computeBullpenStats(pitches);
    const existing = loadBullpenSessions(selectedPitcher.id);
    const sessionNumber = existing.length + 1;
    const session = {
      id: Date.now(),
      number: sessionNumber,
      date: updatedGame.date,
      notes: bullpenNotes.trim(),
      totalPitches: stats.totalPitches,
      strikes: stats.strikes,
      balls: stats.balls,
      strikePercentage: stats.strikePercentage,
      pitchTypeCounts: stats.pitchTypeCounts,
      pitchTypeStrikes: stats.pitchTypeStrikes
    };
    saveBullpenSessions(selectedPitcher.id, [...existing, session]);
    if (!shouldContinue) {
      clearAutosave();
      setView('landing');
    }
  } else {
    let updatedGames;
    if (existingIndex >= 0) {
      updatedGames = [...games];
      updatedGames[existingIndex] = updatedGame;
    } else {
      updatedGames = [...games, updatedGame];
    }
    saveGames(updatedGames);
    if (!shouldContinue) {
      clearAutosave();
      resetLiveEntryTransientState({ clearUndoHistory: true });
      setCurrentGame(null);
      setAtBatPitches([]);
      setPitchTrail([]);
      setCurrentBases(createEmptyBases());
      setTotalRunsAllowed(0);
      setSelectedZone(null);
      setView('landing');
    }
  }
}
setShowConfirmModal(null);
 

};

const getCount = () => {
const { balls, strikes } = getCountFromPitches(atBatPitches);
return `${balls}-${strikes}`;
};

const getOpenGames = () => {
  const open = games.filter(g => !g.completed);
  if (currentGame && !open.find(g => g.id === currentGame.id)) {
    open.unshift(currentGame);
  }
  return open;
};

const continueGame = (game) => {
  const scoutPitcherIds = new Set(loadScoutPitchers().map((p) => String(p.id)));
  const resumeScouting = !!game?.scouting || scoutPitcherIds.has(String(game?.pitcherId));
  setCurrentGame(game);
  const state = game.state || {};
  setCurrentInning(state.currentInning || 1);
  setCurrentBatter(state.currentBatter || 1);
  setCurrentOuts(state.currentOuts || 0);
  setCurrentBatterHandedness(game.lineup?.[(state.currentBatter || 1) - 1]?.handedness || state.currentBatterHandedness || 'R');
  setAtBatPitches(state.atBatPitches || []);
  setPitchCountBaseline(state.pitchCountBaseline || 0);
  setPitchTrail(state.pitchTrail || []);
  setSelectedZone(state.selectedZone || null);
  setCurrentBases(cloneBases(state.currentBases));
  setTotalRunsAllowed(state.totalRunsAllowed || 0);
  resetLiveEntryTransientState({ clearUndoHistory: true });
  setBullpenMode(false);
  setIsScouting(resumeScouting);
  setScoutingMode(false);
  setShowContinueModal(false);
  setView('pitch-entry');
};

const getTrackedAtBatPitches = (atBat) => {
  const pitches = atBat?.pitches || [];
  const offset = Math.max(atBat?.pitcherEntryOffset || 0, 0);
  return offset > 0 ? pitches.slice(offset) : pitches;
};

const getTrackedAtBatPitchCount = (atBat) => {
  if (typeof atBat?.pitcherPitchCount === 'number') return atBat.pitcherPitchCount;
  return getTrackedAtBatPitches(atBat).length;
};

const getTotalPitchCount = () => {
if (!currentGame || !currentGame.innings) return Math.max(atBatPitches.length - pitchCountBaseline, 0);
let total = 0;
currentGame.innings.forEach(inning => {
inning.atBats?.forEach(atBat => {
  const belongsToCurrentPitcher = atBat.pitcherId
    ? atBat.pitcherId === currentGame.pitcherId
    : currentGame.starterPitcherId === currentGame.pitcherId;
  if (belongsToCurrentPitcher) {
    total += getTrackedAtBatPitchCount(atBat);
  }
});
});
total += Math.max(atBatPitches.length - pitchCountBaseline, 0);
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
let resolvedIn3 = 0;
let resolvedIn4 = 0;
let oneOneCountTotal = 0;
let oneOneCountStrikes = 0;
let strikeouts = 0;
let walks = 0;
let hbps = 0;
let hits = 0;
let runsAllowed = 0;
let totalSwings = 0;
let totalWhiffs = 0;
const pitchTypeCounts = {};
const pitchTypeStrikes = {};

gamesList.forEach(game => {
  game.innings?.forEach(inning => {
    inning.atBats?.forEach(atBat => {
      if (!doesAtBatBelongToGamePitcher(atBat, game)) return;
      totalAtBats++;
      const abPitches = getTrackedAtBatPitches(atBat);
      const abTotal = getTrackedAtBatPitchCount(atBat);
      totalPitches += abTotal;
      if (abTotal <= 3) resolvedIn3++;
      if (abTotal <= 4) resolvedIn4++;
      runsAllowed += atBat.runsScored || 0;

      if (abPitches.length > 0) {
        totalFirstPitches++;
        if (abPitches[0].isStrike) firstPitchStrikes++;
      }

      if (abPitches.length >= 3) {
        totalThreePitchSequences++;
        const firstThree = abPitches.slice(0, 3);
        const strikesInFirstThree = firstThree.filter(p => p.isStrike).length;
        if (strikesInFirstThree >= 2) twoOfThreeStrikes++;
      }

      if (abTotal <= 3 && ['OUT', 'SAC', 'DP'].includes(atBat.outcome)) {
        threeOrLessOuts++;
      }

      let balls = 0;
      let strikes = 0;
      abPitches.forEach((pitch) => {
        if (balls === 1 && strikes === 1) {
          oneOneCountTotal++;
          if (pitch.isStrike) oneOneCountStrikes++;
        }
        if (pitch.isStrike) {
          if (pitch.strikeType === 'Foul') {
            if (strikes < 2) strikes++;
          } else {
            strikes = Math.min(strikes + 1, 3);
          }
        } else {
          balls = Math.min(balls + 1, 4);
        }
      });

      abPitches.forEach(pitch => {
        if (pitch.isStrike) totalStrikes++;
        if (pitch.strikeType === 'Swinging' || pitch.strikeType === 'Foul' || pitch.strikeType === 'In Play') {
          totalSwings++;
        }
        if (pitch.strikeType === 'Swinging') {
          totalWhiffs++;
        }
        
        pitchTypeCounts[pitch.type] = (pitchTypeCounts[pitch.type] || 0) + 1;
        if (pitch.isStrike) {
          pitchTypeStrikes[pitch.type] = (pitchTypeStrikes[pitch.type] || 0) + 1;
        }
      });

      if (atBat.outcome === 'K') strikeouts++;
      if (atBat.outcome === 'BB') walks++;
      if (atBat.outcome === 'HBP') hbps++;
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
  avgPitchesPerBF: totalAtBats > 0 ? (totalPitches / totalAtBats).toFixed(1) : '0.0',
  resolveIn3Rate: totalAtBats > 0 ? ((resolvedIn3 / totalAtBats) * 100).toFixed(1) : '0.0',
  resolveIn4Rate: totalAtBats > 0 ? ((resolvedIn4 / totalAtBats) * 100).toFixed(1) : '0.0',
  oneOneStrikeRate: oneOneCountTotal > 0 ? ((oneOneCountStrikes / oneOneCountTotal) * 100).toFixed(1) : '0.0',
  whiffRate: totalSwings > 0 ? ((totalWhiffs / totalSwings) * 100).toFixed(1) : '0.0',
  strikeouts,
  walks,
  hbps,
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
  if (outcome === 'HBP') return 'HBP';
  if (['1B','2B','3B','HR'].includes(outcome)) return 'H';
  if (['OUT','SAC','DP'].includes(outcome)) return 'OUT';
  return 'OTHER';
};

const getPitchPairingImpact = (gamesList, firstFilter = 'all') => {
  const pairs = {};
  gamesList.forEach(game => {
    game.innings?.forEach(inning => {
      inning.atBats?.forEach(atBat => {
        if (!doesAtBatBelongToGamePitcher(atBat, game)) return;
        const outcomeClass = classifyOutcome(atBat.outcome);
        const trackedPitches = getTrackedAtBatPitches(atBat);
        for (let i = 0; i < trackedPitches.length - 1; i++) {
          const a = trackedPitches[i].type;
          const b = trackedPitches[i + 1].type;
          if (firstFilter !== 'all' && a !== firstFilter) continue;
          const key = `${a}→${b}`;
          if (!pairs[key]) pairs[key] = { total: 0, K: 0, BB: 0, HBP: 0, H: 0, OUT: 0, OTHER: 0 };
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
  let hbps = 0;
  let ballsInPlay = 0;
  let swingingStrikes = 0;
  let twoStrikePitches = 0;
  const byType = {};

  gamesList.forEach(game => {
    game.innings?.forEach(inning => {
      inning.atBats?.forEach(atBat => {
        if (!doesAtBatBelongToGamePitcher(atBat, game)) return;
        let strikes = 0;
        let strikesSoFar = 0;
        let reachedTwo = false;
        for (const p of getTrackedAtBatPitches(atBat)) {
          if (p.isStrike) {
            if (p.strikeType === 'Foul') {
              if (strikesSoFar < 2) { strikes += 1; strikesSoFar += 1; }
            } else { strikes += 1; strikesSoFar += 1; }
          }
          if (strikes >= 2) {
            reachedTwo = true;
            twoStrikePitches += 1;
            if (p.strikeType === 'Swinging') swingingStrikes += 1;
            if (!byType[p.type]) {
              byType[p.type] = { total: 0, swinging: 0, strikes: 0 };
            }
            byType[p.type].total += 1;
            if (p.strikeType === 'Swinging') byType[p.type].swinging += 1;
            if (p.isStrike) byType[p.type].strikes += 1;
          }
        }
        if (reachedTwo) {
          opportunities += 1;
          if (atBat.outcome === 'K') strikeouts += 1;
          else if (atBat.outcome === 'BB') walks += 1;
          else if (atBat.outcome === 'HBP') hbps += 1;
          else ballsInPlay += 1;
        }
      });
    });
  });

  return {
    opportunities,
    strikeouts,
    walks,
    hbps,
    ballsInPlay,
    byType,
    whiffRate: twoStrikePitches ? Math.round((swingingStrikes / twoStrikePitches) * 100) : 0,
    kRate: opportunities ? Math.round((strikeouts / opportunities) * 100) : 0,
    bbRate: opportunities ? Math.round((walks / opportunities) * 100) : 0
  };
};

const getPitchTypesFromGames = (gamesList, fallbackPitchTypes = []) => {
  const found = new Set(Array.isArray(fallbackPitchTypes) ? fallbackPitchTypes : []);
  gamesList.forEach((game) => {
    game.innings?.forEach((inning) => {
      inning.atBats?.forEach((atBat) => {
        if (!doesAtBatBelongToGamePitcher(atBat, game)) return;
        getTrackedAtBatPitches(atBat).forEach((pitch) => {
          if (pitch?.type) found.add(pitch.type);
        });
      });
    });
  });
  return Array.from(found);
};

const getZoneStats = (gamesList, handednessFilter, pitchFilter) => {
const zoneCounts = Object.fromEntries(zoneLabels.map(z => [z, 0]));
gamesList.forEach(game => {
  game.innings?.forEach(inning => {
    inning.atBats?.forEach(atBat => {
      if (!doesAtBatBelongToGamePitcher(atBat, game)) return;
      if (handednessFilter !== 'all' && atBat.batterHandedness !== handednessFilter) return;
      getTrackedAtBatPitches(atBat).forEach(pitch => {
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

const getPitchEffectivenessByHandedness = (gamesList) => {
  const stats = {};
  gamesList.forEach(game => {
    game.innings?.forEach(inning => {
      inning.atBats?.forEach(atBat => {
        if (!doesAtBatBelongToGamePitcher(atBat, game)) return;
        const handed = atBat.batterHandedness || 'R';
        getTrackedAtBatPitches(atBat).forEach(p => {
          if (!stats[p.type]) {
            stats[p.type] = {
              L: { total: 0, strikes: 0 },
              R: { total: 0, strikes: 0 }
            };
          }
          if (!stats[p.type][handed]) {
            stats[p.type][handed] = { total: 0, strikes: 0 };
          }
          stats[p.type][handed].total += 1;
          if (p.isStrike) stats[p.type][handed].strikes += 1;
        });
      });
    });
  });
  return stats;
};

const getPitchUsageByCount = (gamesList, counts) => {
  const byType = {};
  const totalsByCount = Object.fromEntries(counts.map(c => [c, 0]));

  gamesList.forEach(game => {
    game.innings?.forEach(inning => {
      inning.atBats?.forEach(atBat => {
        if (!doesAtBatBelongToGamePitcher(atBat, game)) return;
        const pitches = getTrackedAtBatPitches(atBat);
        pitches.forEach((pitch, idx) => {
          const { balls, strikes } = getCountFromPitches(pitches.slice(0, idx));
          const countKey = `${balls}-${strikes}`;
          if (!(countKey in totalsByCount)) return;

          totalsByCount[countKey] += 1;
          if (!byType[pitch.type]) byType[pitch.type] = {};
          if (!byType[pitch.type][countKey]) byType[pitch.type][countKey] = { total: 0, strikes: 0 };
          byType[pitch.type][countKey].total += 1;
          if (pitch.isStrike) byType[pitch.type][countKey].strikes += 1;
        });
      });
    });
  });

  return { byType, totalsByCount };
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

if (showCoverPage) {
return (
  <div className={`min-h-screen relative overflow-hidden ${appClass}`} style={appStyle}>
    <BroadcastStyle />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,0.2),transparent_36%),linear-gradient(160deg,#020617_0%,#0f172a_50%,#020617_100%)]"></div>
    <div className="absolute inset-0 opacity-25 [background:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:26px_26px]"></div>
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-cyan-300 text-xs uppercase tracking-[0.4em] mb-5">Baseball Pitch Intelligence</div>
      <h1 className="text-6xl sm:text-7xl font-bold text-white leading-none mb-3 tracking-tight">PitchTrace</h1>
      <p className="text-slate-300 text-sm sm:text-base mb-10 max-w-xl">
        Track every pitch, shape your next decision, and see your game in real time.
      </p>
      <button
        onClick={() => setShowCoverPage(false)}
        className="cover-start-btn px-10 py-4 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-300/70 text-cyan-100 font-semibold tracking-wide shadow-[0_0_35px_rgba(34,211,238,0.35)] transition-all"
      >
        Tap To Start
      </button>
    </div>
  </div>
);
}

const printPreviewMarkup = printPreview ? buildPrintableDocument(printPreview.title, printPreview.html, false) : '';
const sharedGameImportModal = sharedGameImport ? (
  <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
      <div className="text-white text-xl font-semibold mb-2">Import Shared Game</div>
      <div className="text-slate-400 text-sm mb-4">
        This link includes a shared game report and pitch-by-pitch game data.
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-white font-medium">
            {sharedGameImport?.opponent || 'Unknown Opponent'}
          </div>
          <div className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${
            sharedGameImport?.scouting
              ? 'border-cyan-400/40 text-cyan-200 bg-cyan-400/10'
              : 'border-violet-300/30 text-violet-100 bg-violet-300/10'
          }`}>
            {sharedGameImport?.scouting ? 'Opponent' : 'My Team'}
          </div>
        </div>
        <div className="text-slate-300 text-sm mt-2">
          {sharedGameImport?.opponent || 'Unknown Opponent'}
        </div>
        <div className="text-slate-400 text-sm mt-1">
          {(sharedGameImport?.games?.[0]?.game?.date && !Number.isNaN(new Date(sharedGameImport.games[0].game.date).getTime()))
            ? new Date(sharedGameImport.games[0].game.date).toLocaleDateString()
            : 'Date unavailable'}
          {' • '}
          {sharedGameImport?.games?.length || 0} pitcher appearance{sharedGameImport?.games?.length === 1 ? '' : 's'}
        </div>
        <div className="text-slate-500 text-xs mt-2">
          Importing will add this game to your Game Log and skip duplicate entries if it was already imported.
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => importSharedGamePayload(sharedGameImport)}
          className="flex-1 h-12 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold transition-all"
        >
          Import to Game Log
        </button>
        <button
          onClick={() => {
            setSharedGameImport(null);
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.delete('sharedGame');
              window.history.replaceState({}, '', url.toString());
            }
          }}
          className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
        >
          Not Now
        </button>
      </div>
    </div>
  </div>
) : null;

// Landing Page
if (view === 'landing') {
return (
<div className={`min-h-screen relative overflow-hidden ${appClass}`} style={appStyle}>
<BroadcastStyle />
{sharedGameImportModal}
<div
className="absolute inset-0 bg-cover bg-center bg-no-repeat"
style={{
backgroundImage: "url('/mnt/user-data/uploads/Screenshot_2025-11-16_165624.png')"
}}
>
<div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/40 to-slate-950/80"></div>
</div>

    <div className="relative z-10 w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6 p-4 sm:p-4 sm:p-6">
      {showHomeMenu && (
        <button
          onClick={() => setShowHomeMenu(false)}
          className="fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-[1px]"
          aria-label="Close menu"
        />
      )}
      <div className="fixed top-10 right-4 sm:top-4 z-30">
        <button
          onClick={() => setShowHomeMenu(!showHomeMenu)}
          className="w-12 h-12 rounded-full bg-slate-900/70 border border-white/20 text-white hover:bg-slate-800/80 transition-all flex items-center justify-center"
          aria-label="Open menu"
        >
          <div className="space-y-1">
            <span className="block w-5 h-0.5 bg-white"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
          </div>
        </button>
        {showHomeMenu && (
          <div className="absolute right-0 top-14 w-[min(18rem,calc(100vw-2rem))] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border border-white/20 bg-slate-900/95 backdrop-blur p-3 shadow-2xl">
            <div className="flex items-center justify-between px-2 py-2">
              <div className="text-xs uppercase tracking-wider text-slate-400">Quick Menu</div>
              <button
                onClick={() => setShowHomeMenu(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="px-2 py-2 text-xs uppercase tracking-wider text-slate-400">Home View</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  setHomeTeamView('team');
                  setScoutingMode(false);
                  setShowHomeMenu(false);
                }}
                className={`px-2 py-2 rounded-lg border text-xs transition-all ${
                  homeTeamView === 'team'
                    ? 'border-white/30 bg-slate-800/80 text-white'
                    : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                My Team
              </button>
              <button
                onClick={() => {
                  setHomeTeamView('opponent');
                  setScoutingMode(true);
                  setShowHomeMenu(false);
                }}
                className={`px-2 py-2 rounded-lg border text-xs transition-all ${
                  homeTeamView === 'opponent'
                    ? 'border-cyan-300/40 bg-cyan-400/15 text-cyan-100'
                    : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                Opponent
              </button>
            </div>
            <button
              onClick={() => {
                setView('help');
                setShowHomeMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-slate-800/80 transition-all"
            >
              Help & Settings
            </button>
            <button
              onClick={() => {
                reopenOnboarding();
                setShowHomeMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-slate-800/80 transition-all"
            >
              Replay First-Use Guide
            </button>
            <button
              onClick={() => {
                setShowQuickSearch(true);
                setShowHomeMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-slate-800/80 transition-all"
            >
              Quick Search
            </button>
            <div className="px-2 pt-3 pb-2 text-xs uppercase tracking-wider text-slate-400">Roster Share</div>
            <button
              onClick={() => {
                setRosterShareMode('export');
                setRosterShareType('team');
                setRosterShareMessage('');
                setRosterImportText('');
                setShareContent('roster');
                setShowRosterShareModal(true);
                setShowHomeMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-slate-800/80 transition-all"
            >
              Share / Import Roster
            </button>
            <button
              onClick={() => {
                setRosterShareMode('export');
                setRosterShareMessage('');
                setRosterImportText('');
                setShareContent('data');
                setShowRosterShareModal(true);
                setShowHomeMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-slate-800/80 transition-all"
            >
              Share / Import All Data
            </button>
          </div>
        )}
      </div>
      <div className="text-center mb-6 pt-14">
      <div className="text-4xl sm:text-5xl mb-3">⚾</div>
      <div className="flex justify-center mb-3">
        <ModeBadge />
      </div>
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 drop-shadow-2xl tracking-tight">PitchTrace</h1>
      <p className="text-sm sm:text-xl text-white/90 mb-5 drop-shadow-lg font-light">
          Track every pitch. Analyze every game. Elevate your team. Built for game day.
        </p>
        <div className="flex justify-center mb-5">
          <div className="inline-flex rounded-full border border-white/20 bg-slate-900/55 p-1 backdrop-blur">
            <button
              onClick={() => {
                setHomeTeamView('team');
                setScoutingMode(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                homeTeamView === 'team' ? 'bg-white text-slate-900' : 'text-white/75 hover:text-white'
              }`}
            >
              My Team
            </button>
            <button
              onClick={() => {
                setHomeTeamView('opponent');
                setScoutingMode(true);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                homeTeamView === 'opponent' ? 'bg-cyan-400 text-slate-900' : 'text-white/75 hover:text-white'
              }`}
            >
              Opponent
            </button>
          </div>
        </div>
        
        {/* Start Game + Bullpen Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-5">
          <button
            onClick={createNewGame}
            disabled={homeTeamView === 'team' && pitchers.length === 0}
            className="bg-cyan-400 text-slate-900 px-6 sm:px-8 py-3.5 rounded-full font-bold text-base sm:text-xl hover:bg-cyan-300 transition-all inline-flex items-center justify-center gap-3 shadow-2xl shadow-cyan-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={22} />
            {homeTeamView === 'opponent' ? 'Start Opponent Game' : 'Start Game'}
          </button>
          <button
            onClick={createBullpenSession}
            disabled={pitchers.length === 0}
            className="bg-amber-400 text-slate-900 px-6 sm:px-8 py-3.5 rounded-full font-bold text-base sm:text-xl hover:bg-amber-300 transition-all inline-flex items-center justify-center gap-3 shadow-2xl shadow-amber-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Target size={20} />
            Start Bullpen
          </button>
        </div>
        {homeTeamView === 'team' && pitchers.length === 0 && (
          <p className="text-white/70 text-sm mb-5">Add a pitcher first to start tracking games</p>
        )}
        {homeTeamView === 'opponent' && (
          <p className="text-cyan-100/80 text-sm mb-5">Opponent games save separately from your team games.</p>
        )}
      </div>

      {showOnboarding && (
        <div className="fixed inset-0 z-[55] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <div className="text-cyan-300 text-xs uppercase tracking-[0.3em] mb-1">First Use Guide</div>
                <div className="text-white text-2xl font-semibold">{onboardingSteps[onboardingStep].title}</div>
              </div>
              <button
                onClick={dismissOnboarding}
                className="text-slate-400 hover:text-white text-sm"
              >
                Skip
              </button>
            </div>
            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/80 p-4 mb-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-2">{onboardingSteps[onboardingStep].eyebrow}</div>
              <p className="text-slate-200 leading-relaxed">{onboardingSteps[onboardingStep].body}</p>
            </div>
            <div className="flex items-center gap-2 mb-5">
              {onboardingSteps.map((_, idx) => (
                <span
                  key={`onboard-${idx}`}
                  className={`h-2 flex-1 rounded-full ${idx === onboardingStep ? 'bg-cyan-300' : 'bg-slate-700'}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setOnboardingStep((prev) => Math.max(prev - 1, 0))}
                disabled={onboardingStep === 0}
                className="flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (onboardingStep === onboardingSteps.length - 1) {
                    dismissOnboarding();
                  } else {
                    setOnboardingStep((prev) => prev + 1);
                  }
                }}
                className="flex-1 h-11 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 text-sm font-semibold"
              >
                {onboardingStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Banner + Recent Items */}
      {(() => {
        const allRecentGames = getAllRecentGames().filter((item) => item.side === homeTeamView);
        const recentGames = allRecentGames.filter(i => !i.game.completed).slice(0, 3);
        return (
          <div className="max-w-5xl mx-auto mb-6">
            {recentGames.length > 0 && (
              <div className="bg-slate-900/70 border border-slate-700/60 rounded-2xl p-3 mb-4 flex flex-wrap items-center gap-3">
                <div className="text-slate-200 font-semibold">Resume game</div>
                {recentGames.map((item) => (
                  <button
                    key={`resume-${item.game.id}`}
                    onClick={() => {
                      const { byId } = getAllPitcherMaps();
                      const pitcher = byId[item.pitcherId];
                      if (pitcher) continueGameWithPitcher(pitcher, item.game);
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-white text-sm"
                  >
                    {item.game.opponent || 'Unknown'} • {item.starterPitcherName || item.pitcherName}
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="text-white font-semibold">Recent Games</div>
                  <div className="text-[11px] text-white/55 uppercase tracking-[0.18em]">Hold for edit</div>
                </div>
                {recentGames.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/25 p-4">
                    <div className="text-white/80 text-sm font-medium mb-1">No open games yet.</div>
                    <div className="text-white/55 text-xs">Use Quick Start below: add or pick a pitcher, start a game, then this becomes your resume spot.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentGames.map(item => (
                      <button
                        key={`rg-${item.game.id}`}
                        onClick={() => {
                          if (recentGameHoldTriggeredRef.current) {
                            recentGameHoldTriggeredRef.current = false;
                            return;
                          }
                          const { byId } = getAllPitcherMaps();
                          const pitcher = byId[item.pitcherId];
                          if (pitcher) continueGameWithPitcher(pitcher, item.game);
                        }}
                        onMouseDown={() => startRecentGameHold(item)}
                        onMouseUp={cancelRecentGameHold}
                        onMouseLeave={cancelRecentGameHold}
                        onTouchStart={() => startRecentGameHold(item)}
                        onTouchEnd={cancelRecentGameHold}
                        onTouchMove={cancelRecentGameHold}
                        className={`w-full text-left rounded-xl p-3 border ${
                          item.side === 'opponent'
                            ? 'bg-cyan-950/35 hover:bg-cyan-950/50 border-cyan-400/25'
                            : 'bg-slate-900/50 hover:bg-slate-900/70 border-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="text-white text-sm font-medium truncate">
                              {item.game.opponent || 'Unknown'}
                            </div>
                            {item.game.sharedImport ? (
                              <div className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-amber-400/40 text-amber-200 bg-amber-400/10">
                                Shared Import
                              </div>
                            ) : null}
                          </div>
                          <div className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${
                            item.side === 'opponent'
                              ? 'border-cyan-400/40 text-cyan-200 bg-cyan-400/10'
                              : 'border-violet-300/30 text-violet-100 bg-violet-300/10'
                          }`}>
                            {item.side === 'opponent' ? 'Opponent' : 'My Team'}
                          </div>
                        </div>
                        <div className="text-white/60 text-xs mt-1">
                          Starter: {item.starterPitcherName || item.pitcherName} • {new Date(item.game.date).toLocaleDateString()} • Hold for edit
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        );
      })()}

      {showRecentGameActions && recentGameActionItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            onClick={closeRecentGameActions}
            className="absolute inset-0"
            aria-label="Close recent game actions"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="text-white text-xl font-semibold mb-1">Recent Game Options</div>
            <div className="text-slate-400 text-sm mb-4">
              {recentGameActionItem.pitcherName} vs {recentGameActionItem.game.opponent || 'Unknown'}
            </div>
            <div className="space-y-3">
              {confirmingRecentGameDelete && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
                  <div className="text-red-200 font-semibold mb-2">Delete this game permanently?</div>
                  <div className="text-red-100/80 text-sm">
                    This will permanently delete the game and all stats tied to it. You will not be able to get it back.
                  </div>
                </div>
              )}
              <input
                type="text"
                value={recentGameOpponentDraft}
                onChange={(e) => setRecentGameOpponentDraft(e.target.value)}
                placeholder={recentGameActionItem?.game?.scouting ? 'Team name' : 'Opponent name'}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={() => {
                  updateGameOpponentName(recentGameActionItem.game, recentGameOpponentDraft);
                  closeRecentGameActions();
                }}
                disabled={!recentGameOpponentDraft.trim()}
                className="w-full h-12 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {recentGameActionItem?.game?.scouting ? 'Save Team Name' : 'Save Opponent Name'}
              </button>
              <button
                onClick={() => {
                  if (!confirmingRecentGameDelete) {
                    setConfirmingRecentGameDelete(true);
                    return;
                  }
                  deleteGameByPitcher(recentGameActionItem.pitcherId, recentGameActionItem.game.id);
                  closeRecentGameActions();
                }}
                className="w-full h-12 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-semibold transition-all"
              >
                {confirmingRecentGameDelete ? 'Yes, Delete Game Forever' : 'Delete Game'}
              </button>
              <button
                onClick={closeRecentGameActions}
                className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {printPreview && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-800">
              <div>
                <div className="text-white font-semibold">{printPreview.title} Preview</div>
                <div className="text-slate-400 text-sm">Review before printing or saving.</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={async () => {
                    await exportPrintableContent(printPreview.title, printPreview.html);
                    setPrintPreview(null);
                  }}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 rounded-lg text-slate-900 text-sm font-semibold"
                >
                  Print / Save
                </button>
                <button
                  onClick={() => setPrintPreview(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe
              title={`${printPreview.title} preview`}
              srcDoc={printPreviewMarkup}
              className="flex-1 w-full bg-white"
            />
          </div>
        </div>
      )}

      <div className="w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="bg-slate-900/70 border border-slate-700/60 rounded-2xl p-3 sm:p-4 mb-4">
          <div className="text-white font-semibold mb-1 text-sm">Quick Start</div>
          <div className="text-slate-300 text-xs mb-3">1. Add pitcher  2. Start game  3. Track pitches  4. Open report</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Step 1</div>
              <div className="text-white text-sm font-semibold">Add Pitcher</div>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Step 2</div>
              <div className="text-white text-sm font-semibold">Start Game</div>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Step 3</div>
              <div className="text-white text-sm font-semibold">Track</div>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Step 4</div>
              <div className="text-white text-sm font-semibold">Report</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setView('rotation')}
              className="h-11 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium"
            >
              Add / Pick Pitcher
            </button>
            <button
              onClick={createNewGame}
              disabled={pitchers.length === 0}
              className="h-11 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 text-sm font-semibold disabled:opacity-50"
            >
              Start Game
            </button>
            <button
              onClick={() => setView('team-report')}
              className="h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-sm font-semibold"
            >
              Open Team Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div
            onClick={() => setView('game-log')}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
          >
            <div className="w-9 h-9 bg-violet-300/15 rounded-xl flex items-center justify-center mb-2 group-hover:bg-violet-300/25 transition-all">
              <Download size={18} className="text-violet-100" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Game Log</h2>
            <p className="text-white/70 text-[11px] mb-2">All saved games.</p>
            <div className="flex items-center text-violet-100 font-medium text-xs">
              <span>Open Log</span>
              <ChevronRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={createBullpenSession}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
          >
            <div className="w-9 h-9 bg-amber-400/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-amber-400/30 transition-all">
              <Target size={18} className="text-amber-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Execution Pen</h2>
            <p className="text-white/70 text-[11px] mb-2">Bullpen tracking.</p>
            <div className="flex items-center text-amber-400 font-medium text-xs">
              <span>Start Bullpen</span>
              <ChevronRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => setView('team-dashboard')}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
          >
            <div className="w-9 h-9 bg-cyan-400/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-cyan-400/30 transition-all">
              <BarChart3 size={18} className="text-cyan-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Season Dashboard</h2>
            <p className="text-white/70 text-[11px] mb-2">View trends fast.</p>
            <div className="flex items-center text-cyan-400 font-medium text-xs">
              <span>View Analytics</span>
              <ChevronRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div
            onClick={() => setView('help')}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
          >
            <div className="w-9 h-9 bg-slate-200/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-slate-200/20 transition-all">
              <span className="text-slate-100 text-lg">?</span>
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Help & Settings</h2>
            <p className="text-white/70 text-[11px] mb-2">Guide, theme, tips.</p>
            <div className="flex items-center text-slate-100 font-medium text-xs">
              <span>Open</span>
              <ChevronRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAdvancedTools(!showAdvancedTools)}
          className="w-full mb-4 h-11 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700/90 transition-all"
        >
          {showAdvancedTools ? 'Hide Advanced Tools' : 'Show Advanced Tools'}
        </button>

        {showAdvancedTools && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setView('rotation')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
            >
              <div className="w-9 h-9 bg-cyan-400/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-cyan-400/30 transition-all">
                <Users size={18} className="text-cyan-400" />
              </div>
              <h2 className="text-base font-semibold text-white mb-1">Team Rotation</h2>
              <p className="text-white/70 text-xs mb-2">Edit roster and roles.</p>
              <div className="flex items-center text-cyan-400 font-medium text-xs">
                <span>Manage Roster</span>
                <ChevronRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={openScoutingRoster}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
            >
              <div className="w-9 h-9 bg-cyan-400/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-cyan-400/30 transition-all">
                <BarChart3 size={18} className="text-cyan-400" />
              </div>
              <h2 className="text-base font-semibold text-white mb-1">Scouting</h2>
              <p className="text-white/70 text-xs mb-2">Track opponent pitchers separately.</p>
              <div className="flex items-center text-cyan-400 font-medium text-xs">
                <span>Open Scouting</span>
                <ChevronRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => setView('team-report')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 hover:bg-white/15 transition-all cursor-pointer group shadow-2xl"
            >
              <div className="w-9 h-9 bg-cyan-400/20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-cyan-400/30 transition-all">
                <Download size={18} className="text-cyan-400" />
              </div>
              <h2 className="text-base font-semibold text-white mb-1">Team Report PDF</h2>
              <p className="text-white/70 text-xs mb-2">Filtered export for coaches.</p>
              <div className="flex items-center text-cyan-400 font-medium text-xs">
                <span>Open Report</span>
                <ChevronRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    <BottomNav />
    <QuickSearchModal />

    {/* Pitcher Select Modal */}
    {showPitcherSelect && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white text-2xl font-semibold">Select Pitcher</h3>
            <button
              onClick={() => setScoutingMode(!scoutingMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                scoutingMode ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {scoutingMode ? 'Switch to My Team' : 'Switch to Opponent'}
            </button>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            {scoutingMode ? 'Track an opponent pitcher (saved separately)' : (bullpenMode ? 'Choose which pitcher will be throwing in this bullpen' : 'Choose which pitcher will be throwing in this game')}
          </p>

          <button
            onClick={() => setShowPitcherSelect(false)}
            className="text-slate-400 hover:text-white mb-3 flex items-center gap-2"
          >
            ← Back
          </button>

          {!bullpenMode && (
            <input
              type="text"
              value={pendingOpponent}
              onChange={(e) => setPendingOpponent(e.target.value)}
              placeholder={scoutingMode ? 'Your team name...' : 'Opponent team name...'}
              className="w-full px-4 py-3 mb-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          )}

          <input
            type="text"
            value={pitcherSearch}
            onChange={(e) => setPitcherSearch(e.target.value)}
            placeholder={scoutingMode ? 'Search opponent pitchers...' : 'Search pitchers...'}
            className="w-full px-4 py-3 mb-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {(scoutingMode ? loadScoutPitchers() : pitchers).filter(p => p.name.toLowerCase().includes(pitcherSearch.toLowerCase())).map(pitcher => (
              <button
                key={pitcher.id}
                onClick={() => startGameWithPitcher(pitcher)}
                className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl p-4 sm:p-6 text-left transition-all group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-cyan-400">#{pitcher.number}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-white">{pitcher.name}</div>
                    <div className="text-sm text-slate-400">{pitcher.handedness} • {pitcher.role}</div>
                  </div>
                  <ChevronRight size={24} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
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
            className="w-full h-12 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all mb-3"
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

    {/* Roster Share Modal */}
    {showRosterShareModal && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-xl font-semibold">
              {shareContent === 'roster' ? 'Share Roster' : 'Share All Data'}
            </h3>
            <button
              onClick={() => setShowRosterShareModal(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setRosterShareMode('export'); setRosterShareMessage(''); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                rosterShareMode === 'export'
                  ? 'bg-cyan-400 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Export
            </button>
            <button
              onClick={() => { setRosterShareMode('import'); setRosterShareMessage(''); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                rosterShareMode === 'import'
                  ? 'bg-cyan-400 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Import
            </button>
            {shareContent === 'roster' && (
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setRosterShareType('team')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    rosterShareType === 'team' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Team
                </button>
                <button
                  onClick={() => setRosterShareType('scout')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    rosterShareType === 'scout' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Scouting
                </button>
              </div>
            )}
          </div>

          {rosterShareMode === 'export' ? (
            <div>
              <p className="text-slate-400 text-sm mb-2">
                {shareContent === 'roster'
                  ? 'Share a roster file by AirDrop, Files, text, or email. Download and copy still work as backup options.'
                  : 'Share a full data file to move games, reports, and bullpens to another device.'}
              </p>
              <button
                onClick={handleNativeShareFile}
                className="mt-3 w-full h-11 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all"
              >
                Share File
              </button>
              <button
                onClick={handleDownloadShareFile}
                className="mt-3 w-full h-11 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-all"
              >
                Download File
              </button>
              <button
                onClick={() => {
                  const text = shareContent === 'roster'
                    ? JSON.stringify(buildRosterPayload(rosterShareType), null, 2)
                    : JSON.stringify(buildAllDataPayload(), null, 2);
                  navigator.clipboard?.writeText(text);
                  setRosterShareMessage('JSON copied to clipboard.');
                }}
                className="mt-3 w-full h-11 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-semibold transition-all"
              >
                Copy JSON
              </button>
            </div>
          ) : (
            <div>
              <p className="text-slate-400 text-sm mb-2">
                {shareContent === 'roster'
                  ? 'Upload a roster JSON file. Duplicates will be skipped.'
                  : 'Upload a data JSON file. Duplicates will be skipped.'}
              </p>
              <label className="mt-3 flex items-center justify-center w-full h-16 bg-slate-900 border border-dashed border-slate-600 rounded-xl text-slate-300 text-sm cursor-pointer hover:border-cyan-400 hover:text-white transition-all">
                Choose JSON File
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-slate-500 mt-3">Paste still works if you need it.</div>
              <textarea
                value={rosterImportText}
                onChange={(e) => setRosterImportText(e.target.value)}
                placeholder={shareContent === 'roster' ? 'Or paste roster JSON here...' : 'Or paste data JSON here...'}
                className="w-full h-32 mt-3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
              />
              <button
                onClick={shareContent === 'roster' ? handleImportRoster : handleImportAllData}
                className="mt-3 w-full h-11 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all"
              >
                {shareContent === 'roster' ? 'Import JSON' : 'Import JSON'}
              </button>
            </div>
          )}

          {rosterShareMessage && (
            <div className="mt-3 text-sm text-slate-300">{rosterShareMessage}</div>
          )}
        </div>
      </div>
    )}
  </div>
);

}

if (view === 'help') {
return (
<div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
<div className="w-full md:max-w-5xl mx-auto px-3 sm:px-4 md:px-6 pb-24">
  <Breadcrumbs text={getBreadcrumbs()} />
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div>
      <button
        onClick={() => setView('landing')}
        className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
      >
        ← Back to Home
      </button>
      <h1 className="text-3xl font-medium text-white mb-1">Help & Settings</h1>
      <p className="text-slate-400 text-sm">Keep setup, onboarding, and workflow tips in one place.</p>
    </div>
    <ModeBadge />
  </div>

  <BottomNav />
  <QuickSearchModal />

  <div className="grid gap-4">
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
      <div className="text-white font-semibold mb-1">Quick Workflow</div>
      <div className="text-slate-300 text-sm">Add pitcher to start game to track to report.</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        {['Add Pitcher', 'Start Game', 'Track', 'Report'].map((step, idx) => (
          <div key={step} className="rounded-xl border border-slate-700/60 bg-slate-950/35 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Step {idx + 1}</div>
            <div className="text-white text-sm font-semibold">{step}</div>
          </div>
        ))}
      </div>
      <button
        onClick={reopenOnboarding}
        className="mt-4 h-10 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 text-sm font-semibold"
      >
        Replay First-Use Guide
      </button>
    </div>

    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
      <div className="text-white font-semibold mb-3">Theme</div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {themeOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
              theme === opt.id
                ? 'border-white/30 bg-slate-800/80 text-white'
                : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:bg-slate-800/70'
            }`}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.swatch }}></span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
        <div className="text-white font-semibold mb-3">Text Size</div>
        <div className="grid grid-cols-3 gap-2">
          {['compact', 'normal', 'large'].map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                fontSize === size
                  ? 'border-white/30 bg-slate-800/80 text-white'
                  : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
        <div className="text-white font-semibold mb-3">Accessibility</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-2 rounded-xl border text-sm transition-all ${
              highContrast
                ? 'border-white/30 bg-slate-800/80 text-white'
                : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:bg-slate-800/70'
            }`}
          >
            Contrast: {highContrast ? 'On' : 'Off'}
          </button>
          <button
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`px-3 py-2 rounded-xl border text-sm transition-all ${
              reduceMotion
                ? 'border-white/30 bg-slate-800/80 text-white'
                : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:bg-slate-800/70'
            }`}
          >
            Motion: {reduceMotion ? 'Off' : 'On'}
          </button>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
      <div className="text-white font-semibold mb-3">Coach Notes</div>
      <div className="space-y-2 text-sm text-slate-300">
        <div>Live game flow: pick pitch type, choose strike or ball, then finish the at-bat.</div>
        <div>Recent Games and Game Log cards support a hold gesture for edit actions.</div>
        <div>Opponent mode keeps scouting work separate from your own team.</div>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      <button
        onClick={() => setView('sales')}
        className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-left hover:bg-cyan-400/10 transition-all"
      >
        <div className="text-cyan-200 text-xs uppercase tracking-[0.18em] mb-2">Sales Page</div>
        <div className="text-white font-semibold mb-1">Pricing + coach-facing pitch</div>
        <div className="text-slate-300 text-sm">Season pricing ideas, positioning, and a simple one-page sales layout.</div>
      </button>
      <button
        onClick={() => setView('compliance')}
        className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-left hover:bg-amber-400/10 transition-all"
      >
        <div className="text-amber-200 text-xs uppercase tracking-[0.18em] mb-2">NCAA Handout</div>
        <div className="text-white font-semibold mb-1">Printable compliance sheet</div>
        <div className="text-slate-300 text-sm">A quick explainer you can share with teams before games when using PitchTrace.</div>
      </button>
    </div>
  </div>
</div>
</div>
);
}

if (view === 'sales') {
return (
<div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
<div className="w-full md:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pb-24">
  <Breadcrumbs text={getBreadcrumbs()} />
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div>
      <button
        onClick={() => setView('help')}
        className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
      >
        ← Back to Help
      </button>
      <h1 className="text-3xl font-medium text-white mb-1">PitchTrace Sales Page</h1>
      <p className="text-slate-400 text-sm">Coach-friendly positioning, pricing, and a one-page product pitch.</p>
    </div>
    <div className="flex gap-2">
      <ModeBadge />
      <button
        onClick={() => printElementContent('PitchTrace Sales Page', salesPrintRef)}
        className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 rounded-lg text-slate-900 text-sm font-semibold"
      >
        Print / Save
      </button>
    </div>
  </div>

  <BottomNav />
  <QuickSearchModal />
  {printPreview && (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-800">
          <div>
            <div className="text-white font-semibold">{printPreview.title} Preview</div>
            <div className="text-slate-400 text-sm">Review before printing or saving.</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={async () => {
                await exportPrintableContent(printPreview.title, printPreview.html);
                setPrintPreview(null);
              }}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 rounded-lg text-slate-900 text-sm font-semibold"
            >
              Print / Save
            </button>
            {printPreview?.title === 'PitchTrace Pitch Log' ? (
              <button
                onClick={() => savePrintableContentToFile(printPreview.title, printPreview.html)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 rounded-lg text-slate-900 text-sm font-semibold"
              >
                Save to Files
              </button>
            ) : null}
            <button
              onClick={() => setPrintPreview(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm"
            >
              Close
            </button>
          </div>
        </div>
        <iframe
          title={`${printPreview.title} preview`}
          srcDoc={printPreviewMarkup}
          className="flex-1 w-full bg-white"
        />
      </div>
    </div>
  )}

  <div ref={salesPrintRef} className="space-y-5">
    <div className="rounded-[2rem] border border-cyan-400/25 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,47,73,0.88))] p-6 sm:p-8 overflow-hidden relative">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
      <div className="relative grid lg:grid-cols-[1.5fr_0.9fr] gap-6 items-start">
        <div>
          <div className="text-cyan-300 text-xs uppercase tracking-[0.3em] mb-3">PitchTrace</div>
          <h2 className="text-4xl sm:text-5xl font-semibold text-white leading-tight mb-4">NCAA-approved pitch tracking built for real dugout speed.</h2>
          <p className="text-slate-300 max-w-3xl text-base leading-relaxed">
            PitchTrace gives programs one fast workflow for live games, rosters, season reporting, and scouting review without dragging staff through extra screens, paper notes, or postgame cleanup.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {['One device workflow', 'Offline-friendly game flow', 'Coach-ready reports', 'Built for college baseball'].map((item) => (
              <span key={item} className="px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/8 text-cyan-100 text-xs uppercase tracking-[0.14em]">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-3">Best Fit</div>
          <div className="space-y-3 text-sm text-slate-200">
            <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">College programs that want faster live pitch entry and cleaner reports.</div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">Staffs that need one app for game use, roster setup, and postgame review.</div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">Teams that want a direct team license instead of an app-store workflow.</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      <div className="rounded-[1.75rem] border border-slate-700/60 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
        <div className="text-cyan-300 text-xs uppercase tracking-[0.18em] mb-2">Starter</div>
        <div className="flex items-end gap-2 mb-1">
          <div className="text-white text-3xl font-semibold">$499</div>
          <div className="text-slate-400 text-sm mb-1">/ team / season</div>
        </div>
        <div className="text-slate-500 text-xs uppercase tracking-[0.16em] mb-4">Core workflow</div>
        <div className="space-y-2 text-sm text-slate-300">
          {['Live games', 'Roster', 'Season dashboard', 'Reports'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[1.75rem] border border-cyan-400/35 bg-gradient-to-br from-cyan-400/14 to-cyan-950/30 p-5 shadow-lg shadow-cyan-950/30">
        <div className="text-cyan-200 text-xs uppercase tracking-[0.18em] mb-2">Most Popular</div>
        <div className="flex items-end gap-2 mb-1">
          <div className="text-white text-3xl font-semibold">$999</div>
          <div className="text-slate-200 text-sm mb-1">/ program / season</div>
        </div>
        <div className="text-cyan-100 text-xs uppercase tracking-[0.16em] mb-4">Most teams start here</div>
        <div className="space-y-2 text-sm text-slate-100">
          {['Everything in Starter', 'Opponent scouting workflow', 'Coach onboarding + support', 'Shared compliance handout'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-200" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[1.75rem] border border-slate-700/60 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
        <div className="text-amber-300 text-xs uppercase tracking-[0.18em] mb-2">Department</div>
        <div className="flex items-end gap-2 mb-1">
          <div className="text-white text-3xl font-semibold">Custom</div>
        </div>
        <div className="text-slate-400 text-sm mb-4">Multi-team / annual</div>
        <div className="space-y-2 text-sm text-slate-300">
          {['Multiple teams or staff', 'Custom rollout support', 'Department pricing'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-4">
      <div className="rounded-[1.75rem] border border-slate-700/60 bg-slate-900/70 p-5">
        <div className="text-white font-semibold mb-4">What coaches actually buy</div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-3">Fast live tracking that does not slow down input.</div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-3">One device workflow for games, rosters, season review, and scouting.</div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-3">Offline-friendly app flow built for real game environments.</div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-3">Coach-ready reports that are easy to review and share after games.</div>
        </div>
      </div>
      <div className="rounded-[1.75rem] border border-slate-700/60 bg-slate-900/70 p-5">
        <div className="text-white font-semibold mb-4">Coach-facing pitch</div>
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <div>PitchTrace helps programs capture every pitch, review every outing, and organize scouting in one NCAA-approved workflow.</div>
          <div>It is built for speed first: fewer taps, faster reports, and less game-day friction for the staff actually entering the data.</div>
          <div>Best fit: direct team sales, seasonal licensing, and demo-led onboarding.</div>
        </div>
      </div>
    </div>

  </div>
</div>
</div>
);
}

if (view === 'compliance') {
return (
<div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
<div className="w-full md:max-w-5xl mx-auto px-3 sm:px-4 md:px-6 pb-24">
  <Breadcrumbs text={getBreadcrumbs()} />
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div>
      <button
        onClick={() => setView('help')}
        className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
      >
        ← Back to Help
      </button>
      <h1 className="text-3xl font-medium text-white mb-1">NCAA / Opponent Handout</h1>
      <p className="text-slate-400 text-sm">A one-page explainer to share before games when PitchTrace is in use.</p>
    </div>
    <div className="flex gap-2">
      <ModeBadge />
      <button
        onClick={() => printElementContent('PitchTrace NCAA Handout', compliancePrintRef)}
        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 rounded-lg text-slate-900 text-sm font-semibold"
      >
        Print / Save
      </button>
    </div>
  </div>

  <BottomNav />
  <QuickSearchModal />
  {printPreview && (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-800">
          <div>
            <div className="text-white font-semibold">{printPreview.title} Preview</div>
            <div className="text-slate-400 text-sm">Review before printing or saving.</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={async () => {
                await exportPrintableContent(printPreview.title, printPreview.html);
                setPrintPreview(null);
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 rounded-lg text-slate-900 text-sm font-semibold"
            >
              Print / Save
            </button>
            <button
              onClick={() => setPrintPreview(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm"
            >
              Close
            </button>
          </div>
        </div>
        <iframe
          title={`${printPreview.title} preview`}
          srcDoc={printPreviewMarkup}
          className="flex-1 w-full bg-white"
        />
      </div>
    </div>
  )}

  <div ref={compliancePrintRef} className="rounded-[2rem] border border-slate-700/60 bg-white text-slate-900 p-6 sm:p-8 space-y-6 shadow-xl">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-300 pb-5">
      <div>
        <div className="text-sm uppercase tracking-[0.24em] text-slate-500 mb-2">Game-Day Compliance Notice</div>
        <h2 className="text-3xl font-semibold">PitchTrace Notification Sheet</h2>
        <p className="text-slate-600 mt-2 max-w-2xl">Use this sheet to notify opponents, site administrators, or event staff that PitchTrace is being used as part of your bench workflow during competition.</p>
      </div>
      <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 min-w-[220px]">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">Status</div>
        <div className="text-lg font-semibold">Pre-Game Notice</div>
        <div className="text-sm text-slate-500">Share before first pitch.</div>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">App Name</div>
        <div className="font-semibold text-lg">PitchTrace</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">Primary Use</div>
        <div className="font-semibold text-lg">In-game pitch tracking, bullpen tracking, and post-game reporting.</div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="font-semibold mb-3">Scope of Use</div>
      <div className="space-y-3 text-sm leading-relaxed">
        <div>PitchTrace is used by team staff for pitch tracking, bullpen tracking, scouting entry, and postgame reporting.</div>
        <div>The app records pitch type, result, location, velocity, at-bat outcome, and related staff-entered reporting notes.</div>
        <div>Opponent scouting sessions are stored separately from the team’s own game data.</div>
        <div>PitchTrace is used as a bench workflow and reporting tool. It is not an on-field player communication system.</div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="font-semibold mb-3">Suggested Notification Language</div>
      <div className="space-y-3 text-sm leading-relaxed">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">“Our staff is using PitchTrace for pitch tracking and reporting during today’s game.”</div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">“PitchTrace is being used as a stats and scouting workflow on the bench, and we are notifying you of its use before the game.”</div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">“If you need the app name listed for your game notes, please list PitchTrace.”</div>
      </div>
    </div>

    <div className="grid md:grid-cols-[1fr_0.85fr] gap-4">
      <div className="rounded-2xl border border-slate-200 p-5">
        <div className="font-semibold mb-3">Program Notes</div>
        <div className="space-y-3 text-sm">
          <div>School / Program: ________________________________</div>
          <div>Sport Administrator / Coach Contact: ________________________________</div>
          <div>Game Date / Opponent: ________________________________</div>
          <div>Additional Notes: ________________________________</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="font-semibold mb-3">Staff Reminder</div>
        <div className="space-y-3 text-sm leading-relaxed">
          <div>Share this sheet before the game begins.</div>
          <div>Keep the app name consistent: PitchTrace.</div>
          <div>Use this handout for opponents, site staff, or administrators who request bench-app details.</div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
);
}

if (view === 'rotation') {
return (
<>
<div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
<div className="w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6 pb-32 md:pb-8">
<Breadcrumbs text={getBreadcrumbs()} />
<div className="mb-4"><ModeBadge /></div>
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
className="bg-amber-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-amber-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
>
<Plus size={18} /> Start New Game
</button>
<button
onClick={() => setShowAddPitcherModal(true)}
className="bg-cyan-400 text-slate-900 px-6 py-2.5 rounded-full font-medium hover:bg-cyan-300 transition-all flex items-center gap-2"
>
<Plus size={18} /> Add Pitcher
</button>
</div>
</div>

      <BottomNav />
      <QuickSearchModal />

 
      {pitchers.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={40} className="text-slate-500" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">No Pitchers Yet</h3>
          <p className="text-slate-400 mb-6">Add your first pitcher to get started</p>
          <button
            onClick={() => setShowAddPitcherModal(true)}
            className="bg-cyan-400 text-slate-900 px-8 py-3 rounded-full font-medium hover:bg-cyan-300 transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} /> Add Pitcher
          </button>
        </div>
      ) : (
        <>
        <input
          type="text"
          value={pitcherSearch}
          onChange={(e) => setPitcherSearch(e.target.value)}
          placeholder="Search pitchers..."
          className="w-full px-4 py-3 mb-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        {pitchers.filter(p => p.name.toLowerCase().includes(pitcherSearch.toLowerCase())).length === 0 ? (
          <div className="text-center py-16 text-slate-400">No pitchers match your search.</div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:p-6">
          {pitchers.filter(p => p.name.toLowerCase().includes(pitcherSearch.toLowerCase())).map(pitcher => (
            <div
              key={pitcher.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 sm:p-6 hover:bg-slate-800/70 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-cyan-400/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-cyan-400">#{pitcher.number}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditPitcher(pitcher);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-amber-500/10 rounded-lg"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
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
                className="w-full py-2 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 rounded-lg text-cyan-400 font-medium transition-all flex items-center justify-center gap-2"
              >
                View Dashboard
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
        )}
        </>
      )}

      {showAddPitcherModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-2xl font-semibold mb-2">{scoutingMode ? 'Add Opponent Pitcher' : 'Add New Pitcher'}</h3>
            {scoutingMode && showPitcherSelect && (
              <p className="text-slate-400 text-sm mb-6">Save this opponent pitcher and the scouting game will start automatically.</p>
            )}
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Name</label>
                <input
                  type="text"
                  value={newPitcher.name}
                  onChange={(e) => setNewPitcher({...newPitcher, name: e.target.value})}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Jersey Number</label>
                <input
                  type="text"
                  value={newPitcher.number}
                  onChange={(e) => setNewPitcher({...newPitcher, number: e.target.value})}
                  placeholder="42"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setNewPitcher({...newPitcher, role: 'Starter'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.role === 'Starter' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Starter
                    </button>
                    <button
                      onClick={() => setNewPitcher({...newPitcher, role: 'Reliever'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.role === 'Reliever' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                        newPitcher.handedness === 'LHP' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      LHP
                    </button>
                    <button
                      onClick={() => setNewPitcher({...newPitcher, handedness: 'RHP'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.handedness === 'RHP' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                className="flex-1 h-12 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Jersey Number</label>
                <input
                  type="text"
                  value={editingPitcher.number}
                  onChange={(e) => setEditingPitcher({...editingPitcher, number: e.target.value})}
                  placeholder="42"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEditingPitcher({...editingPitcher, role: 'Starter'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        editingPitcher.role === 'Starter' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Starter
                    </button>
                    <button
                      onClick={() => setEditingPitcher({...editingPitcher, role: 'Reliever'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        editingPitcher.role === 'Reliever' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                        editingPitcher.handedness === 'LHP' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      LHP
                    </button>
                    <button
                      onClick={() => setEditingPitcher({...editingPitcher, handedness: 'RHP'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        editingPitcher.handedness === 'RHP' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                          editingPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                          editingPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                          editingPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                className="flex-1 h-12 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-slate-400 text-sm mb-4">
              {bullpenMode ? 'Choose which pitcher will be throwing in this bullpen' : 'Choose which pitcher will be throwing in this game'}
            </p>
          <button
            onClick={() => setShowPitcherSelect(false)}
            className="text-slate-400 hover:text-white mb-3 flex items-center gap-2"
          >
            ← Back
          </button>
          {!bullpenMode && (
          <input
            type="text"
            value={pendingOpponent}
            onChange={(e) => setPendingOpponent(e.target.value)}
            placeholder={scoutingMode ? 'Your team name...' : 'Opponent team name...'}
            className="w-full px-4 py-3 mb-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          )}
          <input
            type="text"
            value={pitcherSearch}
            onChange={(e) => setPitcherSearch(e.target.value)}
            placeholder="Search pitchers..."
            className="w-full px-4 py-3 mb-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {pitchers
                .filter(p => p.name.toLowerCase().includes(pitcherSearch.toLowerCase()))
                .map(pitcher => (
                <button
                  key={pitcher.id}
                  onClick={() => startGameWithPitcher(pitcher)}
                  className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl p-4 sm:p-6 text-left transition-all group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-cyan-400">#{pitcher.number}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">{pitcher.name}</div>
                      <div className="text-sm text-slate-400">{pitcher.handedness} • {pitcher.role}</div>
                    </div>
                    <ChevronRight size={24} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
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
</>
);
 

}

// Team Dashboard View

if (view === 'scouting-rotation') {
const scoutPitchers = loadScoutPitchers();
return (
<>
<div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
<div className="w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
  <Breadcrumbs text={getBreadcrumbs()} />
  <div className="mb-4"><ModeBadge /></div>
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
        className="bg-cyan-400 text-slate-900 px-6 py-2.5 rounded-full font-medium hover:bg-cyan-300 transition-all flex items-center gap-2"
      >
        <Plus size={18} /> Add Opponent
      </button>
    </div>
  </div>

  <BottomNav />
  <QuickSearchModal />
  <QuickSearchModal />

  {scoutPitchers.length === 0 ? (
    <div className="text-center py-24">
      <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Users size={40} className="text-slate-500" />
      </div>
      <h3 className="text-2xl font-semibold text-white mb-2">No Opponents Yet</h3>
      <p className="text-slate-400 mb-6">Add the opposing pitcher to start scouting</p>
      <button
        onClick={() => { setScoutingMode(true); setShowAddPitcherModal(true); }}
        className="bg-cyan-400 text-slate-900 px-8 py-3 rounded-full font-medium hover:bg-cyan-300 transition-all inline-flex items-center gap-2"
      >
        <Plus size={20} /> Add Opponent
      </button>
    </div>
  ) : (
    <>
    <input
      type="text"
      value={pitcherSearch}
      onChange={(e) => setPitcherSearch(e.target.value)}
      placeholder="Search opponents..."
      className="w-full px-4 py-3 mb-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
    />
    {scoutPitchers.filter(p => p.name.toLowerCase().includes(pitcherSearch.toLowerCase())).length === 0 ? (
      <div className="text-center py-16 text-slate-400">No opponents match your search.</div>
    ) : (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scoutPitchers.filter(p => p.name.toLowerCase().includes(pitcherSearch.toLowerCase())).map(pitcher => (
        <div
          key={pitcher.id}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 bg-cyan-400/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-cyan-400">#{pitcher.number || '--'}</span>
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
              setDashboardMode('live');
              setView('dashboard');
            }}
            className="w-full py-2 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 rounded-lg text-cyan-400 font-medium transition-all flex items-center justify-center gap-2"
          >
            View Scouting Dashboard
            <ChevronRight size={16} />
          </button>
        </div>
      ))}
    </div>
    )}
    </>
  )}
{showAddPitcherModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-2xl font-semibold mb-2">{scoutingMode ? 'Add Opponent Pitcher' : 'Add New Pitcher'}</h3>
            {scoutingMode && showPitcherSelect && (
              <p className="text-slate-400 text-sm mb-6">Save this opponent pitcher and the scouting game will start automatically.</p>
            )}
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Name</label>
                <input
                  type="text"
                  value={newPitcher.name}
                  onChange={(e) => setNewPitcher({...newPitcher, name: e.target.value})}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Jersey Number</label>
                <input
                  type="text"
                  value={newPitcher.number}
                  onChange={(e) => setNewPitcher({...newPitcher, number: e.target.value})}
                  placeholder="42"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setNewPitcher({...newPitcher, role: 'Starter'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.role === 'Starter' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Starter
                    </button>
                    <button
                      onClick={() => setNewPitcher({...newPitcher, role: 'Reliever'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.role === 'Reliever' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                        newPitcher.handedness === 'LHP' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      LHP
                    </button>
                    <button
                      onClick={() => setNewPitcher({...newPitcher, handedness: 'RHP'})}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        newPitcher.handedness === 'RHP' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                          newPitcher.pitchTypes.includes(pitch.abbr) ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                className="flex-1 h-12 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Pitcher
              </button>
            </div>
          </div>
        </div>
      )}
  </div>
</div>
</>
);
}

if (view === 'team-dashboard') {
const filteredPitchers = pitchers.filter(p => {
if (filterRole !== 'all' && p.role !== filterRole) return false;
if (filterHandedness !== 'all' && p.handedness !== filterHandedness) return false;
return true;
});

const allGames = readGameStore('baseball_games');
const filteredPitcherIds = filteredPitchers.map(p => p.id);
const filteredGames = filteredPitcherIds.flatMap(id => allGames[id] || []);
const filteredTeamStats = calculateStatsFromGames(filteredGames);

return (
  <div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
    <div className="w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6">
      <Breadcrumbs text={getBreadcrumbs()} />
      <div className="mb-4"><ModeBadge /></div>
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
        <button
          onClick={() => setView('team-report')}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 rounded-lg text-slate-900 text-sm font-semibold"
        >
          Team Report PDF
        </button>
      </div>

      <BottomNav />
      <QuickSearchModal />

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterRole === 'all'
                ? 'bg-cyan-400 text-slate-900'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Pitchers
          </button>
          <button
            onClick={() => setFilterRole('Starter')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterRole === 'Starter'
                ? 'bg-cyan-400 text-slate-900'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Starters
          </button>
          <button
            onClick={() => setFilterRole('Reliever')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterRole === 'Reliever'
                ? 'bg-cyan-400 text-slate-900'
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
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Both
          </button>
          <button
            onClick={() => setFilterHandedness('LHP')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterHandedness === 'LHP'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            LHP
          </button>
          <button
            onClick={() => setFilterHandedness('RHP')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterHandedness === 'RHP'
                ? 'bg-amber-400 text-slate-900'
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
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Team Games</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">{filteredTeamStats.gamesPlayed}</div>
              <div className="text-xs text-cyan-400 font-medium">Season Total</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Strike Rate</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">{filteredTeamStats.strikePercentage}%</div>
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-cyan-400" />
                <span className="text-xs text-cyan-400 font-medium">Team Average</span>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-fuchsia-400 rounded-full"></div>
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
                  setDashboardMode('live');
                  setView('dashboard');
                }}
                className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 hover:bg-slate-700/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-cyan-400">#{pitcher.number}</span>
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

if (view === 'team-report') {
const reportRows = getTeamReportRows();
const filteredByGroup = reportRows.filter((row) => {
  if (filterRole !== 'all' && row.role !== filterRole) return false;
  if (filterHandedness !== 'all' && row.handedness !== filterHandedness) return false;
  return true;
});
const query = teamReportSearch.trim().toLowerCase();
const visibleRows = filteredByGroup.filter((row) => {
  if (!query) return true;
  return (
    row.name.toLowerCase().includes(query) ||
    String(row.number || '').toLowerCase().includes(query)
  );
});
const selectedSet = new Set(teamReportSelectedIds);
const hasSelection = teamReportSelectedIds.length > 0;
const displayedRows = hasSelection
  ? visibleRows.filter((row) => selectedSet.has(row.id))
  : visibleRows;
const allGames = readGameStore('baseball_games');
const totals = calculateStatsFromGames(
  displayedRows.flatMap((row) => {
    return allGames[row.id] || [];
  })
);

const togglePitcher = (pitcherId) => {
  setTeamReportSelectedIds((prev) =>
    prev.includes(pitcherId) ? prev.filter((id) => id !== pitcherId) : [...prev, pitcherId]
  );
};

return (
<div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
<style>{`
@media print {
  body { background: #fff !important; }
  .no-print { display: none !important; }
  .team-report-print {
    background: #fff !important;
    color: #000 !important;
    border: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .team-report-print table {
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 2;
  }
}
`}</style>
  <div className="w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
    <div className="no-print">
      <Breadcrumbs text={getBreadcrumbs()} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <button
            onClick={() => setView('landing')}
            className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-medium text-white mb-1">Team Report</h1>
          <p className="text-slate-400 text-sm">All pitcher season stats with coach filters</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => printElementContent('PitchTrace Team Report', teamReportPrintRef)}
            className="w-full sm:w-auto px-4 py-2 bg-cyan-400 hover:bg-cyan-300 rounded-lg text-slate-900 text-sm font-semibold"
          >
            Download PDF
          </button>
        </div>
      </div>

      <BottomNav />

      {printPreview && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-800">
              <div>
                <div className="text-white font-semibold">{printPreview.title} Preview</div>
                <div className="text-slate-400 text-sm">Review before printing or saving.</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={async () => {
                    await exportPrintableContent(printPreview.title, printPreview.html);
                    setPrintPreview(null);
                  }}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 rounded-lg text-slate-900 text-sm font-semibold"
                >
                  Print / Save
                </button>
                <button
                  onClick={() => setPrintPreview(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe
              title={`${printPreview.title} preview`}
              srcDoc={printPreviewMarkup}
              className="flex-1 w-full bg-white"
            />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <input
          value={teamReportSearch}
          onChange={(e) => setTeamReportSearch(e.target.value)}
          placeholder="Search pitcher name or #"
          className="w-full h-11 bg-slate-800/60 border border-slate-700 rounded-lg px-3 text-white"
        />
        <button
          onClick={() => setTeamReportSelectedIds([])}
          className="h-11 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
        >
          Show All Matching Pitchers
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterRole('all')}
          className={`px-3 py-2 rounded-lg text-sm ${filterRole === 'all' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-800 text-slate-300'}`}
        >
          All Roles
        </button>
        <button
          onClick={() => setFilterRole('Starter')}
          className={`px-3 py-2 rounded-lg text-sm ${filterRole === 'Starter' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-800 text-slate-300'}`}
        >
          Starters
        </button>
        <button
          onClick={() => setFilterRole('Reliever')}
          className={`px-3 py-2 rounded-lg text-sm ${filterRole === 'Reliever' ? 'bg-cyan-400 text-slate-900' : 'bg-slate-800 text-slate-300'}`}
        >
          Relievers
        </button>
        <button
          onClick={() => setFilterHandedness('all')}
          className={`px-3 py-2 rounded-lg text-sm ${filterHandedness === 'all' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-300'}`}
        >
          Both Hands
        </button>
        <button
          onClick={() => setFilterHandedness('LHP')}
          className={`px-3 py-2 rounded-lg text-sm ${filterHandedness === 'LHP' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-300'}`}
        >
          LHP
        </button>
        <button
          onClick={() => setFilterHandedness('RHP')}
          className={`px-3 py-2 rounded-lg text-sm ${filterHandedness === 'RHP' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-300'}`}
        >
          RHP
        </button>
      </div>

      <div className="text-xs text-slate-400 mb-4">
        {hasSelection ? `Showing ${displayedRows.length} selected pitcher(s)` : `Showing all ${displayedRows.length} matching pitcher(s)`}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {visibleRows.map((row) => {
          const active = selectedSet.has(row.id);
          return (
            <button
              key={`sel-${row.id}`}
              onClick={() => togglePitcher(row.id)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                active
                  ? 'bg-cyan-400 text-slate-900 border-cyan-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {row.name} #{row.number}
            </button>
          );
        })}
      </div>
    </div>

    <div ref={teamReportPrintRef} className="team-report-print bg-white border border-slate-300 rounded-2xl p-4 sm:p-6 text-slate-900 shadow-xl">
      <div className="border-b border-slate-300 pb-3 mb-4">
        <div className="text-2xl font-semibold">Team Pitching Report</div>
        <div className="text-sm text-slate-600">
          Generated {new Date().toLocaleDateString()} • Pitchers: {displayedRows.length}
        </div>
      </div>

      <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-300 sticky top-0 bg-white z-10">
              <th className="py-2 pr-2">Pitcher</th>
              <th className="py-2 pr-2">Role</th>
              <th className="py-2 pr-2">Hand</th>
              <th className="py-2 pr-2">Games</th>
              <th className="py-2 pr-2">Total Pitches</th>
              <th className="py-2 pr-2">Strike%</th>
              <th className="py-2 pr-2">First Pitch Strike%</th>
              <th className="py-2 pr-2">K</th>
              <th className="py-2 pr-2">BB</th>
              <th className="py-2 pr-2">HBP</th>
              <th className="py-2 pr-2">Hits</th>
              <th className="py-2 pr-2">K/BB</th>
              <th className="py-2 pr-2">Avg P/BF</th>
              <th className="py-2 pr-2">OB/Out {'<='}4</th>
              <th className="py-2 pr-2">2 of 3 Strikes%</th>
              <th className="py-2 pr-2">Whiff%</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-5 text-slate-500">No pitchers found for current filters.</td>
              </tr>
            ) : (
              displayedRows.map((row) => (
                <tr key={`print-${row.id}`} className="border-b border-slate-200">
                  <td className="py-2 pr-2">{row.name} #{row.number}</td>
                  <td className="py-2 pr-2">{row.role || '-'}</td>
                  <td className="py-2 pr-2">{row.handedness || '-'}</td>
                  <td className="py-2 pr-2">{row.gamesPlayed}</td>
                  <td className="py-2 pr-2">{row.totalPitches}</td>
                  <td className="py-2 pr-2">{row.strikePercentage}%</td>
                  <td className="py-2 pr-2">{row.firstPitchStrikeRate}%</td>
                  <td className="py-2 pr-2">{row.strikeouts}</td>
                  <td className="py-2 pr-2">{row.walks}</td>
                  <td className="py-2 pr-2">{row.hbps || 0}</td>
                  <td className="py-2 pr-2">{row.hits}</td>
                  <td className="py-2 pr-2">{row.kbbRatio}</td>
                  <td className="py-2 pr-2">{row.avgPitchesPerBF}</td>
                  <td className="py-2 pr-2">{row.resolveIn4Rate}%</td>
                  <td className="py-2 pr-2">{row.twoOfThreeRate}%</td>
                  <td className="py-2 pr-2">{row.whiffRate}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-300 grid grid-cols-2 md:grid-cols-10 gap-2 text-sm">
        <div><span className="font-semibold">Pitchers:</span> {displayedRows.length}</div>
        <div><span className="font-semibold">Games:</span> {totals.gamesPlayed}</div>
        <div><span className="font-semibold">Pitches:</span> {totals.totalPitches}</div>
        <div><span className="font-semibold">Strike%:</span> {totals.strikePercentage}%</div>
        <div><span className="font-semibold">K:</span> {totals.strikeouts}</div>
        <div><span className="font-semibold">BB:</span> {totals.walks}</div>
        <div><span className="font-semibold">HBP:</span> {totals.hbps || 0}</div>
        <div><span className="font-semibold">Avg P/BF:</span> {totals.avgPitchesPerBF}</div>
        <div><span className="font-semibold">Whiff%:</span> {totals.whiffRate}%</div>
      </div>
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
<>
<div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
<div className="w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6 pb-32 md:pb-8">
<Breadcrumbs text={getBreadcrumbs()} />
<div className="flex justify-between items-center mb-8">
<div>
<button
onClick={() => setView(dashboardBackView)}
className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
>
← {dashboardBackView === 'landing' ? 'Back to Home' : 'Back to Team Dashboard'}
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
              setReportGame(null);
              setReportPitcher({
                pitcher: selectedPitcher,
                games: [...games],
                stats: seasonStats ? { ...seasonStats } : null
              });
              setReportBackView('dashboard');
              setReportOpponentDraft('');
              setView('report');
            }}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-2"
          >
            Advance Report
          </button>
          {currentGame && (
<button
onClick={() => setShowContinueModal(true)}
className="bg-amber-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
>
Continue Game
</button>
)}
<button
onClick={createNewGame}
className="bg-cyan-400 text-slate-900 px-6 py-2.5 rounded-full font-medium hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-lg shadow-cyan-400/20"
>
<Plus size={18} /> New Game
</button>
</div>
</div>

      <BottomNav />
      <QuickSearchModal />

      <div className="sticky top-16 sm:top-2 z-20 mb-6">
        <div className="inline-flex gap-2 p-2 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur">
        <button
          onClick={() => setDashboardMode('live')}
          className={`px-5 py-3 rounded-full text-sm font-semibold transition-all ${
            dashboardMode === 'live'
              ? 'bg-cyan-400 text-slate-900'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Live Dashboard
        </button>
        <button
          onClick={() => setDashboardMode('bullpen')}
          className={`px-5 py-3 rounded-full text-sm font-semibold transition-all ${
            dashboardMode === 'bullpen'
              ? 'bg-cyan-400 text-slate-900'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Bullpen Dashboard
        </button>
        </div>
      </div>

 
      {dashboardMode === 'live' && (
        <div className="space-y-6">
      {/* Season Stats Grid */}
      {seasonStats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Games Played</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">{seasonStats.gamesPlayed}</div>
              <div className="text-xs text-cyan-400 font-medium">Active</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Strike Rate</span>
              </div>
              <div className="text-4xl font-semibold text-white mb-1">{seasonStats.strikePercentage}%</div>
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-cyan-400" />
                <span className="text-xs text-cyan-400 font-medium">Good</span>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-fuchsia-400 rounded-full"></div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">2 of 3 Strikes</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold text-white">{seasonStats.twoOfThreeRate}%</div>
                <Target size={20} className="text-cyan-400 mb-1" />
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">3 Pitch Outs</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold text-white">{seasonStats.threeOrLessRate}%</div>
                <TrendingUp size={20} className="text-amber-400 mb-1" />
              </div>
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
                    <span className="text-cyan-400 text-sm font-medium">{strikePercentage}%</span>
                  </div>
                  <div className="text-slate-400 text-sm mb-2">
                    {count} pitch{count !== 1 ? 'es' : ''}
                  </div>
                  <div className="w-full bg-slate-600/50 rounded-full h-2">
                    <div 
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
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

      {/* Pitch Effectiveness by Batter Handedness */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pitch Effectiveness by Batter Handedness</h3>
        {(() => {
          const handStats = getPitchEffectivenessByHandedness(games);
          const types = getPitchTypesFromGames(games, selectedPitcher?.pitchTypes || []);
          if (!types.length) {
            return <div className="text-slate-500 text-sm">No pitches recorded yet.</div>;
          }
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-3 text-xs text-slate-400 uppercase tracking-wider">
                <div>Pitch</div>
                <div>LHB Strike%</div>
                <div>RHB Strike%</div>
              </div>
              {types.map((type) => {
                const L = handStats[type]?.L || { total: 0, strikes: 0 };
                const R = handStats[type]?.R || { total: 0, strikes: 0 };
                const lPct = L.total ? Math.round((L.strikes / L.total) * 100) : 0;
                const rPct = R.total ? Math.round((R.strikes / R.total) * 100) : 0;
                return (
                  <div key={type} className="grid grid-cols-3 items-center rounded-xl border border-slate-700/60 bg-slate-800/40 p-3">
                    <div className="text-white font-semibold">{type}</div>
                    <div className="text-slate-200">
                      {L.total ? `${lPct}%` : '--'} <span className="text-xs text-slate-500">({L.total})</span>
                    </div>
                    <div className="text-slate-200">
                      {R.total ? `${rPct}%` : '--'} <span className="text-xs text-slate-500">({R.total})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Pitch Usage + Strike% by Count */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pitch Usage + Strike% by Count</h3>
        {(() => {
          const counts = ['0-0', '1-1', '2-2', '3-2'];
          const { byType, totalsByCount } = getPitchUsageByCount(games, counts);
          const types = getPitchTypesFromGames(games, selectedPitcher?.pitchTypes || []);
          const hasData = counts.some(c => (totalsByCount[c] || 0) > 0);
          if (!hasData || !types.length) {
            return <div className="text-slate-500 text-sm">No pitch data for these counts yet.</div>;
          }
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-5 text-xs text-slate-400 uppercase tracking-wider">
                <div>Pitch</div>
                {counts.map(c => (
                  <div key={c}>{c}</div>
                ))}
              </div>
              {types.map((type) => (
                <div key={type} className="grid grid-cols-5 items-center rounded-xl border border-slate-700/60 bg-slate-800/40 p-3 text-sm">
                  <div className="text-white font-semibold">{type}</div>
                  {counts.map((c) => {
                    const bucket = byType[type]?.[c] || { total: 0, strikes: 0 };
                    const totalAtCount = totalsByCount[c] || 0;
                    const usage = totalAtCount ? Math.round((bucket.total / totalAtCount) * 100) : 0;
                    const strikePct = bucket.total ? Math.round((bucket.strikes / bucket.total) * 100) : 0;
                    return (
                      <div key={`${type}-${c}`} className="text-slate-200">
                        {totalAtCount === 0 ? '—' : `${usage}% / ${strikePct}%`}
                        <span className="text-xs text-slate-500"> ({bucket.total})</span>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="text-xs text-slate-500">Format: Usage% / Strike% (pitch count)</div>
            </div>
          );
        })()}
      </div>

      {/* Pitch Location Heatmap */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-white">Pitch Location (9‑Box)</h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setZoneFilterHandedness('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  zoneFilterHandedness === 'all' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setZoneFilterHandedness('L')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  zoneFilterHandedness === 'L' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'
                }`}
              >
                LHB
              </button>
              <button
                onClick={() => setZoneFilterHandedness('R')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  zoneFilterHandedness === 'R' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'
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
                    background: `rgba(34, 211, 238, ${0.1 + intensity * 0.6})`,
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
        <h3 className="text-lg font-semibold text-white mb-4">Pitch Pairing Impact</h3>
        {(() => {
          const pairs = getPitchPairingImpact(games, 'all').slice(0, 6);
          return pairs.length === 0 ? (
            <div className="text-slate-500 text-sm">No pairing data yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pairs.map((p) => (
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
                      background: `rgba(34, 211, 238, ${0.1 + intensity * 0.6})`,
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
        <h3 className="text-lg font-semibold text-white mb-4">Put-Away Efficiency (2-Strike Counts)</h3>
        {(() => {
          const stats = getPutAwayStats(games);
          const types = getPitchTypesFromGames(games, selectedPitcher?.pitchTypes || []);
          return stats.opportunities === 0 ? (
            <div className="text-slate-500 text-sm">No 2-strike opportunities yet.</div>
          ) : (
            <div className="space-y-3">
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
              {types.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {types.map((type) => {
                    const bucket = stats.byType?.[type] || { total: 0, swinging: 0, strikes: 0 };
                    const whiffPct = bucket.total ? Math.round((bucket.swinging / bucket.total) * 100) : 0;
                    return (
                      <div key={`dashboard-putaway-${type}`} className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3">
                        <div className="text-white font-semibold">{type}</div>
                        <div className="text-sm text-slate-400">{bucket.total} two-strike pitches</div>
                        <div className="text-sm text-slate-200">Whiff {whiffPct}%</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
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
                    <div className="w-12 h-12 bg-cyan-400/10 rounded-xl flex items-center justify-center">
                      <span className="text-cyan-400 font-bold text-lg">⚾</span>
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
                      {(() => {
                        const pairs = getPitchPairingImpact([game], 'all').slice(0, 2);
                        return pairs.length === 0 ? null : (
                          <div className="text-xs text-slate-500 mt-1">
                            Top pairs: {pairs.map(p => `${p.pair} (K${p.kPct}% BB${p.bbPct}% H${p.hPct}%)`).join(' · ')}
                          </div>
                        );
                      })()}
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
      )}

      {/* Bullpen Sessions */}
      {dashboardMode === 'bullpen' && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Bullpen Sessions</h2>
          {bullpenSessions.length === 0 ? (
            <div className="text-slate-500 text-sm">No bullpen sessions recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {bullpenSessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Bullpen Session {s.number}</div>
                      <div className="text-slate-400 text-sm">
                        {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const report = generateBullpenReport(s, selectedPitcher);
                          const id = saveReport(report);
                          setReportId(id);
                          setReportText(report);
                          setReportGame(null);
                          setReportPitcher(null);
                          setReportBackView('dashboard');
                          setReportOpponentDraft('');
                          setView('report');
                        }}
                        className="px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 rounded-md text-xs text-white"
                      >
                        Report
                      </button>
                      <button
                        onClick={() => deleteBullpenSession(selectedPitcher.id, s.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete session"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                  {s.notes && (
                    <div className="mt-3 rounded-lg border border-slate-700/60 bg-slate-800/40 p-3 text-sm text-slate-200">
                      <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Bullpen Focus</div>
                      <div className="text-slate-100">{s.notes}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3 text-sm">
                    <div className="rounded-lg bg-slate-800/50 border border-slate-700/60 p-2">
                      <div className="text-xs text-slate-400">Total</div>
                      <div className="text-white font-semibold">{s.totalPitches}</div>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 border border-slate-700/60 p-2">
                      <div className="text-xs text-slate-400">Strikes</div>
                      <div className="text-white font-semibold">{s.strikes}</div>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 border border-slate-700/60 p-2">
                      <div className="text-xs text-slate-400">Balls</div>
                      <div className="text-white font-semibold">{s.balls}</div>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 border border-slate-700/60 p-2">
                      <div className="text-xs text-slate-400">Strike%</div>
                      <div className="text-white font-semibold">{s.strikePercentage}%</div>
                    </div>
                  </div>
                  {s.pitchTypeCounts && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                      {Object.entries(s.pitchTypeCounts).map(([type, count]) => {
                        const strikes = s.pitchTypeStrikes?.[type] || 0;
                        const pct = count ? Math.round((strikes / count) * 100) : 0;
                        return (
                          <div key={type} className="rounded-lg bg-slate-800/40 border border-slate-700/60 p-2 text-xs">
                            <div className="text-slate-300 font-semibold">{type}</div>
                            <div className="text-slate-400">{count} pitches</div>
                            <div className="text-slate-200">{pct}% strikes</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Continue Game Modal */}
      {showContinueModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-semibold mb-2">Continue Game</h3>
            <p className="text-slate-400 text-sm mb-4">Select a game to resume.</p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {getOpenGames().length === 0 ? (
                <div className="text-slate-500 text-sm">No open games found.</div>
              ) : (
                getOpenGames().map(g => (
                  <button
                    key={g.id}
                    onClick={() => continueGame(g)}
                    className="w-full text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl p-3 transition-all"
                  >
                    <div className="text-white font-medium">
                      {new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-slate-400 text-sm">
                      vs {g.opponent || 'Unknown'} • {g.innings?.length || 0} innings
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowContinueModal(false)}
              className="w-full h-12 mt-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</>
);
 

}

if (view === 'game-log') {
const gameLogItems = getAllRecentGames().filter((item) => item.side === homeTeamView);
return (
<div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
{sharedGameImportModal}
<div className="w-full md:max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
  <Breadcrumbs text={getBreadcrumbs()} />
  <div className="mb-4"><ModeBadge /></div>
  <div className="flex items-center justify-between gap-3 mb-5">
    <div>
      <button
        onClick={() => setView('landing')}
        className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
      >
        ← Back to Home
      </button>
      <h1 className="text-2xl sm:text-3xl font-medium text-white">Game Log</h1>
      <p className="text-slate-400 text-sm">All saved {homeTeamView === 'opponent' ? 'opponent' : 'team'} games.</p>
    </div>
    <div className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded-full border ${
      homeTeamView === 'opponent'
        ? 'border-cyan-400/40 text-cyan-200 bg-cyan-400/10'
        : 'border-violet-300/30 text-violet-100 bg-violet-300/10'
    }`}>
      {homeTeamView === 'opponent' ? 'Opponent View' : 'My Team View'}
    </div>
  </div>

  <BottomNav />
  <QuickSearchModal />

  <div className="space-y-3">
    {gameLogItems.length === 0 ? (
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
        <div className="text-white font-medium mb-1">No games logged yet.</div>
        <div className="text-slate-400 text-sm">Start a game from Home, save it, and it will show up here for reports, edits, and cleanup.</div>
      </div>
    ) : (
      gameLogItems.map((item) => (
        <div
          key={`game-log-page-${item.game.id}`}
          className={`rounded-2xl p-4 border ${
            item.side === 'opponent'
              ? 'bg-cyan-950/35 border-cyan-400/25'
              : 'bg-slate-900/50 border-slate-700/60'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-white font-medium">
                  {item.game.opponent || 'Unknown'}
                </div>
                {item.game.sharedImport ? (
                  <div className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-amber-400/40 text-amber-200 bg-amber-400/10">
                    Shared Import
                  </div>
                ) : null}
              </div>
              <div className="text-white/60 text-xs mt-1">
                Starter: {item.starterPitcherName || item.pitcherName} • {new Date(item.game.date).toLocaleDateString()}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${
                item.side === 'opponent'
                  ? 'border-cyan-400/40 text-cyan-200 bg-cyan-400/10'
                  : 'border-violet-300/30 text-violet-100 bg-violet-300/10'
              }`}>
                {item.side === 'opponent' ? 'Opponent' : 'My Team'}
              </div>
              <div className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${
                item.game.completed
                  ? 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10'
                  : 'border-amber-400/40 text-amber-300 bg-amber-400/10'
              }`}>
                {item.game.completed ? 'Final' : 'Open'}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                const { byId } = getAllPitcherMaps();
                const pitcher = byId[item.pitcherId];
                if (item.game.completed) {
                  openReport(item.game);
                } else if (pitcher) {
                  continueGameWithPitcher(pitcher, item.game);
                }
              }}
              className="px-3 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-white text-xs"
            >
              {item.game.completed ? 'View Report' : 'Resume'}
            </button>
            <button
              onClick={() => openRecentGameActions(item)}
              className="px-3 py-2 rounded-lg bg-cyan-400/15 hover:bg-cyan-400/25 border border-cyan-400/30 text-cyan-200 text-xs"
            >
              Edit
            </button>
          </div>
          <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">Hold for edit also works on Recent Games.</div>
        </div>
      ))
    )}
  </div>

  {showRecentGameActions && recentGameActionItem && (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <button
        onClick={closeRecentGameActions}
        className="absolute inset-0"
        aria-label="Close recent game actions"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="text-white text-xl font-semibold mb-1">Recent Game Options</div>
        <div className="text-slate-400 text-sm mb-4">
          {recentGameActionItem.pitcherName} vs {recentGameActionItem.game.opponent || 'Unknown'}
        </div>
        <div className="space-y-3">
          {confirmingRecentGameDelete && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
              <div className="text-red-200 font-semibold mb-2">Delete this game permanently?</div>
              <div className="text-red-100/80 text-sm">
                This will permanently delete the game and all stats tied to it. You will not be able to get it back.
              </div>
            </div>
          )}
          <input
            type="text"
            value={recentGameOpponentDraft}
            onChange={(e) => setRecentGameOpponentDraft(e.target.value)}
            placeholder={recentGameActionItem?.game?.scouting ? 'Team name' : 'Opponent name'}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            onClick={() => {
              updateGameOpponentName(recentGameActionItem.game, recentGameOpponentDraft);
              closeRecentGameActions();
            }}
            disabled={!recentGameOpponentDraft.trim()}
            className="w-full h-12 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {recentGameActionItem?.game?.scouting ? 'Save Team Name' : 'Save Opponent Name'}
          </button>
          <button
            onClick={() => {
              if (!confirmingRecentGameDelete) {
                setConfirmingRecentGameDelete(true);
                return;
              }
              deleteGameByPitcher(recentGameActionItem.pitcherId, recentGameActionItem.game.id);
              closeRecentGameActions();
            }}
            className="w-full h-12 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-semibold transition-all"
          >
            {confirmingRecentGameDelete ? 'Yes, Delete Game Forever' : 'Delete Game'}
          </button>
          <button
            onClick={closeRecentGameActions}
            className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}
</div>
</div>
);
}

if (view === 'report') {
const shareLink = reportId ? `${window.location.origin}?report=${reportId}` : '';
const reportLines = (reportText || '').split('\n');
const reportGroupEntries = reportGame ? getGameReportGroupEntries(reportGame) : [];
const visibleReportGroupEntries = reportGroupEntries.filter((entry) => getPitcherOwnedPitchTotal(entry.game) > 0);
const reportStats = reportGame ? getCompactGameStats(reportGame) : null;
const reportKeyHitters = reportGame ? getKeyHittersFaced(reportGame, 6) : [];
const reportSprayEvents = reportGame ? getSprayChartEvents(reportGame) : [];
const filteredReportSprayEvents = reportSprayFilter
  ? reportSprayEvents.filter((event) => event.hitter === reportSprayFilter)
  : reportSprayEvents;
const reportGamePitcherBreakdowns = reportGame
  ? visibleReportGroupEntries.map((entry) => {
      const pitcher = pitchers.find((p) => String(p.id) === String(entry.pitcherId));
      return {
        ...entry,
        compactStats: getCompactGameStats(entry.game),
        pitchTypes: getPitchTypesFromGames([entry.game], pitcher?.pitchTypes || []),
        putAway: getPutAwayStats([entry.game]),
        handedness: getPitchEffectivenessByHandedness([entry.game]),
        pairs: getPitchPairingImpact([entry.game], 'all').slice(0, 4)
      };
    })
  : [];
const reportPitcherStats = reportPitcher?.stats || null;
const reportPitcherGames = reportPitcher?.games || [];
const reportPitcherPairs = reportPitcher ? getPitchPairingImpact(reportPitcherGames, 'all').slice(0, 4) : [];
const reportPitcherPutAway = reportPitcher ? getPutAwayStats(reportPitcherGames) : null;
const reportPitcherHandedness = reportPitcher ? getPitchEffectivenessByHandedness(reportPitcherGames) : {};
const reportPitcherUsage = reportPitcher ? getPitchUsageByCount(reportPitcherGames, ['0-0', '1-1', '2-2', '3-2']) : { byType: {}, totalsByCount: {} };
const reportPitchTypes = reportPitcher ? getPitchTypesFromGames(reportPitcherGames, reportPitcher.pitcher?.pitchTypes || []) : [];
return (
<div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
{sharedGameImportModal}
<div className="w-full w-full w-full md:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 px-2 sm:px-0 px-2 sm:px-0">
  <Breadcrumbs text={getBreadcrumbs()} />
  <div className="mb-4"><ModeBadge /></div>
  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
    <button
      onClick={() => setView(reportBackView === 'dashboard' && !selectedPitcher ? 'landing' : reportBackView)}
      className="text-slate-400 hover:text-white flex items-center gap-2"
    >
      ← Back
    </button>
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <button
        onClick={() => reportGame ? shareGameLink(reportGame) : shareOrCopyLink('PitchTrace Report', shareLink)}
        className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
      >
        {isSharingGameLink ? 'Sharing...' : 'Copy Share Link'}
      </button>
      <button
        onClick={() => printElementContent('PitchTrace Pitch Log', pitchLogPrintRef)}
        className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
      >
        Export Pitch Log
      </button>
      <button
        onClick={() => printElementContent('PitchTrace Report', gameReportPrintRef)}
        className="w-full sm:w-auto px-4 py-2 bg-cyan-400 hover:bg-cyan-300 rounded-lg text-slate-900 text-sm font-semibold"
      >
        Print / Save PDF
      </button>
    </div>
  </div>

  {sharedGameImportStatus ? (
    <div className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
      {sharedGameImportStatus}
    </div>
  ) : null}

  <div className="mb-4 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3">
    <div className="text-white text-sm font-semibold mb-2">Report Color Legend</div>
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="px-2 py-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">Strike / strike pitch</span>
      <span className="px-2 py-1 rounded-full border border-red-400/40 bg-red-400/10 text-red-300">Ball / non-strike pitch</span>
      <span className="px-2 py-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">1B</span>
      <span className="px-2 py-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">2B</span>
      <span className="px-2 py-1 rounded-full border border-violet-400/40 bg-violet-400/10 text-violet-300">3B</span>
      <span className="px-2 py-1 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">HR</span>
    </div>
  </div>

  <BottomNav />
  {printPreview && (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-800">
          <div>
            <div className="text-white font-semibold">{printPreview.title} Preview</div>
            <div className="text-slate-400 text-sm">Review before printing or saving.</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={async () => {
                await exportPrintableContent(printPreview.title, printPreview.html);
                setPrintPreview(null);
              }}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 rounded-lg text-slate-900 text-sm font-semibold"
            >
              Print / Save
            </button>
            <button
              onClick={() => setPrintPreview(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm"
            >
              Close
            </button>
          </div>
        </div>
        <iframe
          title={`${printPreview.title} preview`}
          srcDoc={printPreviewMarkup}
          className="flex-1 w-full bg-white"
        />
      </div>
    </div>
  )}
  <div ref={gameReportPrintRef} className="bg-white border border-slate-300 rounded-2xl p-6 text-slate-900 shadow-xl">
    {reportGame ? (
      <div className="space-y-6">
        <div className="border-b border-slate-300 pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Game Report</div>
              <div className="text-3xl font-semibold tracking-tight mt-1">
                vs {reportGame.opponent || 'Unknown'}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {new Date(reportGame.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {reportGame.innings?.length || 0} innings
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:min-w-[520px]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Total Pitches</div>
                <div className="text-2xl font-semibold">{reportStats?.totalPitches || 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Strike%</div>
                <div className="text-2xl font-semibold">{reportStats?.strikePercentage || 0}%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">K</div>
                <div className="text-2xl font-semibold">{reportStats?.strikeouts || 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">BB</div>
                <div className="text-2xl font-semibold">{reportStats?.walks || 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">HBP</div>
                <div className="text-2xl font-semibold">{reportStats?.hbps || 0}</div>
              </div>
            </div>
          </div>
          {(!reportGame.opponent || reportGame.opponent === 'Unknown') && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm font-semibold text-slate-900 mb-2">
                {reportGame?.scouting ? 'Team name missing' : 'Opponent name missing'}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={reportOpponentDraft}
                  onChange={(e) => setReportOpponentDraft(e.target.value)}
                  placeholder={reportGame?.scouting ? 'Add team name' : 'Add opponent name'}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  onClick={saveReportOpponentName}
                  disabled={!reportOpponentDraft.trim()}
                  className="px-5 py-3 bg-slate-900 text-white rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {reportGame?.scouting ? 'Save Team' : 'Save Opponent'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Pitcher Game Log</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visibleReportGroupEntries.map((entry) => {
              const stats = getCompactGameStats(entry.game);
              return (
                <div key={`${entry.pitcherId}-${entry.game.id}`} className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                    <div className="text-lg font-semibold">{entry.pitcherName}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Appearance</div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                        <div className="text-[11px] uppercase tracking-wider text-slate-500">Pitches</div>
                        <div className="text-xl font-semibold">{stats.totalPitches}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                        <div className="text-[11px] uppercase tracking-wider text-slate-500">Strikes</div>
                        <div className="text-xl font-semibold">{stats.totalStrikes}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                        <div className="text-[11px] uppercase tracking-wider text-slate-500">Balls</div>
                        <div className="text-xl font-semibold">{stats.balls}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                        <div className="text-[11px] uppercase tracking-wider text-slate-500">Strike%</div>
                        <div className="text-xl font-semibold">{stats.strikePercentage}%</div>
                      </div>
                    </div>
                    {stats.pitchTypeCounts && Object.keys(stats.pitchTypeCounts).length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Pitch Mix</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(stats.pitchTypeCounts).map(([type, count]) => {
                            const strikes = stats.pitchTypeStrikes?.[type] || 0;
                            const pct = count ? Math.round((strikes / count) * 100) : 0;
                            return (
                              <div key={type} className="rounded-xl border border-slate-200 bg-white p-3">
                                <div className="text-base font-semibold">{type}</div>
                                <div className="text-sm text-slate-600">{count} pitches</div>
                                <div className="text-sm text-slate-900">{pct}% strikes</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {reportGamePitcherBreakdowns.length > 0 && (
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Pitch Breakdown By Pitcher</div>
            <div className="space-y-3">
              {reportGamePitcherBreakdowns.map((entry, idx) => (
                <details key={`report-breakdown-${entry.pitcherId}-${entry.game.id}`} className="rounded-2xl border border-slate-200 bg-slate-50/70" open={idx === 0}>
                  <summary className="cursor-pointer list-none px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{entry.pitcherName}</div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mt-1">
                        {entry.compactStats.totalPitches || 0} pitches • {entry.compactStats.strikePercentage || 0}% strikes
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">{idx === 0 ? 'Tap to collapse' : 'Tap to expand'}</div>
                  </summary>
                  <div className="border-t border-slate-200 px-4 py-4 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Put-Away</div>
                        {entry.putAway?.opportunities ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                              <div className="text-[11px] uppercase tracking-wider text-slate-500">Opps</div>
                              <div className="text-xl font-semibold">{entry.putAway.opportunities}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                              <div className="text-[11px] uppercase tracking-wider text-slate-500">K%</div>
                              <div className="text-xl font-semibold">{entry.putAway.kRate}%</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                              <div className="text-[11px] uppercase tracking-wider text-slate-500">BB%</div>
                              <div className="text-xl font-semibold">{entry.putAway.bbRate}%</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                              <div className="text-[11px] uppercase tracking-wider text-slate-500">Whiff%</div>
                              <div className="text-xl font-semibold">{entry.putAway.whiffRate}%</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">No 2-strike opportunities yet.</div>
                        )}
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Pitch Pairing Impact</div>
                        {entry.pairs.length > 0 ? (
                          <div className="space-y-2">
                            {entry.pairs.map((pair) => (
                              <div key={`${entry.pitcherId}-${pair.pair}`} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 flex items-center justify-between gap-4">
                                <div className="font-semibold">{pair.pair}</div>
                                <div className="text-sm text-slate-600">{pair.total} seq</div>
                                <div className="text-sm text-slate-900">K {pair.kPct}% • BB {pair.bbPct}% • H {pair.hPct}%</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">No pairing data yet.</div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Pitch Effectiveness by Batter Handedness</div>
                      {entry.pitchTypes.length ? (
                        <div className="space-y-2">
                          {entry.pitchTypes.map((type) => {
                            const L = entry.handedness[type]?.L || { total: 0, strikes: 0 };
                            const R = entry.handedness[type]?.R || { total: 0, strikes: 0 };
                            const lPct = L.total ? Math.round((L.strikes / L.total) * 100) : 0;
                            const rPct = R.total ? Math.round((R.strikes / R.total) * 100) : 0;
                            return (
                              <div key={`${entry.pitcherId}-${type}`} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 grid grid-cols-3 gap-3">
                                <div className="font-semibold">{type}</div>
                                <div className="text-sm">LHB {L.total ? `${lPct}% (${L.total})` : '--'}</div>
                                <div className="text-sm">RHB {R.total ? `${rPct}% (${R.total})` : '--'}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">No pitch data yet.</div>
                      )}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Key Hitters Faced</div>
          {reportKeyHitters.length > 0 ? (
            <div className="space-y-2">
              {reportKeyHitters.map((hitter) => (
                <div key={`${hitter.label}-${hitter.handedness}`} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{hitter.label}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mt-1">{hitter.handedness} hitter</div>
                  </div>
                  <div className="text-sm text-slate-700 text-right">
                    <div>{hitter.appearances} AB</div>
                    <div>H {hitter.hits} • K {hitter.strikeouts} • BB/HBP {hitter.walks}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No hitter data yet.</div>
          )}
        </div>

        <div ref={pitchLogPrintRef} className="space-y-4">
          <div className="border-b border-slate-300 pb-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Pitch Log</div>
            <div className="text-2xl font-semibold tracking-tight mt-1">
              vs {reportGame.opponent || 'Unknown'}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              {new Date(reportGame.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • inning by inning • pitch by pitch
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Pitch By Pitch</div>
          {visibleReportGroupEntries.flatMap((entry) =>
            (entry.game.innings || []).map((inning, inningIdx) => {
              const pitcherAtBats = (inning.atBats || []).filter((atBat) => doesAtBatBelongToGamePitcher(atBat, entry.game));
              const inningPitches = pitcherAtBats.reduce((sum, ab) => sum + getTrackedAtBatPitchCount(ab), 0) || 0;
              if (pitcherAtBats.length === 0) return null;
              return (
              <div key={`${entry.game.id}-${inning.number}-${inningIdx}`} className="pitch-log-export-card rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">Inning {inning.number}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1">{entry.pitcherName}</div>
                  </div>
                  <div className="text-sm text-slate-600">{inningPitches} pitches</div>
                </div>
                <div className="divide-y divide-slate-200">
                  {pitcherAtBats.map((atBat, idx) => (
                    <div key={`${entry.game.id}-${inning.number}-${idx}`} className="pitch-log-ab p-4 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 items-start">
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{getAtBatHitterLabel(atBat)}</div>
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1">
                            Inning {inning.number} • Spot {atBat.batter} • {atBat.batterHandedness || 'R'} hitter • {getTrackedAtBatPitchCount(atBat)} pitches
                          </div>
                        </div>
                        <div className="inline-flex px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-[0.12em]">
                          At-Bat Outcome: {formatAtBatOutcomeLabel(atBat)}
                        </div>
                      </div>
                      <div className="pitch-log-table rounded-xl border border-slate-200 overflow-hidden">
                        <div className="hidden sm:grid grid-cols-[72px_56px_88px_1fr_92px_82px] gap-3 bg-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          <div>Inning</div>
                          <div>Pitch</div>
                          <div>Type</div>
                          <div>Result</div>
                          <div>Location</div>
                          <div>Velo</div>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {(atBat.pitches || []).map((pitch, pitchIdx) => (
                            <div
                              key={`${inning.number}-${idx}-${pitchIdx}`}
                              className={`grid grid-cols-1 sm:grid-cols-[72px_56px_88px_1fr_92px_82px] gap-2 sm:gap-3 px-3 py-3 text-sm ${
                                pitch.isStrike ? 'bg-cyan-50/60' : 'bg-rose-50/60'
                              }`}
                            >
                              <div className="font-semibold text-slate-500">IN {inning.number}</div>
                              <div className="font-semibold text-slate-500">#{pitchIdx + 1}</div>
                              <div className="font-semibold text-slate-900">{pitch.type}</div>
                              <div className="text-slate-800">{getPitchResultLabel(pitch)}</div>
                              <div className="text-slate-700">{getPitchLocationLabel(pitch)}</div>
                              <div className="font-semibold text-slate-900">{pitch.velocity || '--'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>
    ) : reportPitcher ? (
      <div className="space-y-6">
        <div className="border-b border-slate-300 pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Pitch Report</div>
              <div className="text-3xl font-semibold tracking-tight mt-1">{reportPitcher.pitcher?.name || 'Unknown Pitcher'}</div>
              <div className="text-sm text-slate-600 mt-1">
                #{reportPitcher.pitcher?.number || '--'} • {reportPitcher.pitcher?.handedness || '--'} • {reportPitcher.pitcher?.role || '--'} • {reportPitcherGames.length} games
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:min-w-[520px]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Total Pitches</div>
                <div className="text-2xl font-semibold">{reportPitcherStats?.totalPitches || 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Strike%</div>
                <div className="text-2xl font-semibold">{reportPitcherStats?.strikePercentage || 0}%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">K</div>
                <div className="text-2xl font-semibold">{reportPitcherStats?.strikeouts || 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">BB</div>
                <div className="text-2xl font-semibold">{reportPitcherStats?.walks || 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">HBP</div>
                <div className="text-2xl font-semibold">{reportPitcherStats?.hbps || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">First Pitch Strike%</div>
            <div className="text-xl font-semibold">{reportPitcherStats?.firstPitchStrikeRate || 0}%</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Avg P/BF</div>
            <div className="text-xl font-semibold">{reportPitcherStats?.avgPitchesPerBF || '0.0'}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">OB or Out in 4</div>
            <div className="text-xl font-semibold">{reportPitcherStats?.resolveIn4Rate || '0.0'}%</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">2 of First 3 Strikes</div>
            <div className="text-xl font-semibold">{reportPitcherStats?.twoOfThreeRate || '0.0'}%</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Whiff%</div>
            <div className="text-xl font-semibold">{reportPitcherStats?.whiffRate || '0.0'}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Pitch Mix</div>
            {reportPitcherStats?.pitchTypeCounts && Object.keys(reportPitcherStats.pitchTypeCounts).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(reportPitcherStats.pitchTypeCounts).map(([type, count]) => {
                  const strikes = reportPitcherStats.pitchTypeStrikes?.[type] || 0;
                  const pct = count ? Math.round((strikes / count) * 100) : 0;
                  return (
                    <div key={type} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-base font-semibold">{type}</div>
                      <div className="text-sm text-slate-600">{count} pitches</div>
                      <div className="text-sm text-slate-900">{pct}% strikes</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No pitch data yet.</div>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Pitch Pairing Impact</div>
            {reportPitcherPairs.length > 0 ? (
              <div className="space-y-2">
                {reportPitcherPairs.map((pair) => (
                  <div key={`season-pair-${pair.pair}`} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 flex items-center justify-between gap-4">
                    <div className="font-semibold">{pair.pair}</div>
                    <div className="text-sm text-slate-600">{pair.total} seq</div>
                    <div className="text-sm text-slate-900">K {pair.kPct}% • BB {pair.bbPct}% • H {pair.hPct}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No pairing data yet.</div>
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Put-Away</div>
            {reportPitcherPutAway?.opportunities ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500">Opps</div>
                    <div className="text-xl font-semibold">{reportPitcherPutAway.opportunities}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500">K%</div>
                    <div className="text-xl font-semibold">{reportPitcherPutAway.kRate}%</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500">BB%</div>
                    <div className="text-xl font-semibold">{reportPitcherPutAway.bbRate}%</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500">Whiff%</div>
                    <div className="text-xl font-semibold">{reportPitcherPutAway.whiffRate}%</div>
                  </div>
                </div>
                {reportPitchTypes.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {reportPitchTypes.map((type) => {
                      const bucket = reportPitcherPutAway.byType?.[type] || { total: 0, swinging: 0, strikes: 0 };
                      const whiffPct = bucket.total ? Math.round((bucket.swinging / bucket.total) * 100) : 0;
                      const strikePct = bucket.total ? Math.round((bucket.strikes / bucket.total) * 100) : 0;
                      return (
                        <div key={`putaway-${type}`} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                          <div className="font-semibold">{type}</div>
                          <div className="text-sm text-slate-600">{bucket.total} two-strike pitches</div>
                          <div className="text-sm text-slate-900">Whiff {whiffPct}%</div>
                          <div className="text-xs text-slate-500">Strike {strikePct}%</div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No 2-strike opportunities yet.</div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">By Batter Handedness</div>
            {reportPitchTypes.length ? (
              <div className="space-y-2">
                {reportPitchTypes.map((type) => {
                  const L = reportPitcherHandedness[type]?.L || { total: 0, strikes: 0 };
                  const R = reportPitcherHandedness[type]?.R || { total: 0, strikes: 0 };
                  const lPct = L.total ? Math.round((L.strikes / L.total) * 100) : 0;
                  const rPct = R.total ? Math.round((R.strikes / R.total) * 100) : 0;
                  return (
                    <div key={`handedness-${type}`} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 grid grid-cols-3 gap-3">
                      <div className="font-semibold">{type}</div>
                      <div className="text-sm">LHB {L.total ? `${lPct}% (${L.total})` : '--'}</div>
                      <div className="text-sm">RHB {R.total ? `${rPct}% (${R.total})` : '--'}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No pitch data yet.</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Usage By Count</div>
            {reportPitchTypes.length ? (
              <div className="space-y-2">
                {reportPitchTypes.map((type) => (
                <div key={type} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                  <div className="font-semibold mb-2">{type}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    {['0-0', '1-1', '2-2', '3-2'].map((count) => {
                      const bucket = reportPitcherUsage.byType?.[type]?.[count] || { total: 0, strikes: 0 };
                      const totalAtCount = reportPitcherUsage.totalsByCount?.[count] || 0;
                      const usage = totalAtCount ? Math.round((bucket.total / totalAtCount) * 100) : 0;
                      const strikePct = bucket.total ? Math.round((bucket.strikes / bucket.total) * 100) : 0;
                      return (
                        <div key={`${type}-${count}`} className="rounded-lg border border-slate-200 bg-white p-2">
                          <div className="text-[11px] uppercase tracking-wider text-slate-500">{count}</div>
                          <div>{totalAtCount === 0 ? '--' : `${usage}% / ${strikePct}%`}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No pitch data yet.</div>
            )}
          </div>
        </div>
      </div>
    ) : (
      <>
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
      </>
    )}
  </div>
</div>
</div>
);
}

if (view === 'bullpen') {
const inGameStats = getInGamePitchStats();
const fastballSet = new Set(['4S', '2S', 'SNK', 'CT']);
return (
<div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>
<BroadcastStyle />
<div className="w-full w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 px-4 sm:px-6">
  <Breadcrumbs text={getBreadcrumbs()} />
  <div className="mb-4"><ModeBadge /></div>
  <div className="flex justify-between items-center mb-6">
    <button
      onClick={() => setView('landing')}
      className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
    >
      ← Back
    </button>
    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowBullpenCount(!showBullpenCount)}
        className="text-xs px-3 py-1.5 rounded-full border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition-all"
      >
        Count: {showBullpenCount ? 'On' : 'Off'}
      </button>
      <div className="text-sm text-slate-400">Bullpen Session</div>
    </div>
  </div>

  <BottomNav />
  <QuickSearchModal />

  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Total Pitches</div>
      <div className="text-5xl font-semibold text-white">{getTotalPitchCount()}</div>
    </div>
    {showBullpenCount && (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Count</div>
        <div className="text-5xl font-semibold text-white tracking-wider">{getCount()}</div>
      </div>
    )}
  </div>

  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Velocity</div>
        <div className="text-xs text-slate-500">Enter velo before logging the pitch</div>
      </div>
      <div className="w-32">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          value={currentVelocity}
          onChange={(e) => setCurrentVelocity(e.target.value)}
          placeholder="mph"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-center placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-6 mb-6">
    {hidePitchLocationPanel ? (
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 flex items-center justify-between">
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Pitch Location Hidden</div>
        <button
          onClick={() => setHidePitchLocationPanel(false)}
          className="text-xs px-3 py-1.5 rounded-full border border-slate-600 text-slate-200 hover:text-white hover:border-slate-400 transition-all"
        >
          Show Pitch Location
        </button>
      </div>
    ) : (
      <div
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6"
        onTouchStart={handlePitchLocationTouchStart}
        onTouchEnd={handlePitchLocationTouchEnd}
      >
        <div className="flex flex-col items-center mb-2">
          <div className="w-10 h-1 rounded-full bg-slate-500/60 mb-1"></div>
          <div className="text-[11px] text-slate-500">Drag up to hide</div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Pitch Location (Optional)</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedZone(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
            <button
              onClick={() => setHidePitchLocationPanel(true)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Hide
            </button>
          </div>
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
                  onClick={() => {
                    setSelectedZone(zone);
                    setLastBullpenZone(zone);
                  }}
                  className={`rounded-lg border font-semibold ${oneHandMode ? 'h-14 text-sm' : 'h-10 text-xs'} ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-900 border-cyan-300'
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
    )}

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
                p.isStrike ? 'border-cyan-400/50 text-cyan-400 bg-cyan-400/10' : 'border-red-400/50 text-red-400 bg-red-400/10'
              }`}
            >
              {p.type} {p.zone ? `@${p.zone}` : p.ballType ? `(${p.ballType})` : ''}{p.velocity ? ` ${p.velocity}` : ''}
            </div>
          ))
        )}
      </div>
    </div>
  </div>

  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
    <div className="text-slate-300 text-sm font-medium uppercase tracking-wider mb-3">Bullpen Focus (Notes)</div>
    <textarea
      value={bullpenNotes}
      onChange={(e) => setBullpenNotes(e.target.value)}
      placeholder="Ex: Stayed closed toward the plate, set up pitches, swing-and-miss focus."
      className="w-full min-h-[110px] px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
    />
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
                    ? 'border-amber-400/60 bg-amber-400/10 text-amber-200'
                    : 'border-slate-700/60 bg-slate-800/40 text-slate-200'
                }`}
              >
                <div className="text-lg font-bold">{p.type}</div>
                <div className="text-xs opacity-70">{p.total} pitches</div>
                <div className="text-2xl font-semibold mt-1">{p.strikePct}%</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {p.strikes} strikes · {Math.max(p.total - p.strikes, 0)} balls
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>

  {/* Pitch Entry Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:p-6 mb-6">
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
        <div className="text-slate-300 text-sm font-medium uppercase tracking-wider">Strike</div>
      </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
            {selectedPitcher?.pitchTypes.map(type => (
              <button
                key={type}
                onClick={() => recordPitch(type, true)}
                className={`bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 rounded-xl text-cyan-400 font-bold active:scale-95 transition-all ${oneHandMode ? 'h-28 text-3xl' : 'h-24 text-2xl'}`}
              >
                {type}
              </button>
            ))}
          </div>
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
                onClick={() => {
                  setPendingPitch({ type, isStrike: false });
                }}
                className={`bg-red-400/10 hover:bg-red-400/20 border border-red-400/30 rounded-xl text-red-400 font-bold active:scale-95 transition-all ${oneHandMode ? 'h-28 text-3xl' : 'h-24 text-2xl'}`}
              >
                {type}
              </button>
            ))}
          </div>
          {pendingPitch && !pendingPitch.isStrike && (
            <div className="mt-4 p-4 bg-red-400/5 border border-red-400/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-slate-300 text-xs font-medium uppercase tracking-wider">Ball Location</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Up', 'Away', 'In', 'Down'].map((edge) => (
                  <button
                    key={edge}
                    onClick={() => {
                      setLastBullpenZone(edge);
                      recordPitch(pendingPitch.type, false, null, edge);
                    }}
                    className="py-3 bg-red-400/20 hover:bg-red-400/30 border border-red-400/40 rounded-lg text-red-300 font-medium text-sm active:scale-95 transition-all"
                  >
                    {edge}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
  </div>

  <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-700/60 backdrop-blur p-2">
    <div className="w-full md:max-w-7xl mx-auto grid grid-cols-4 gap-2">
      <button
        onClick={returnToHome}
        className="h-14 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white text-xs font-medium transition-all"
      >
        Home
      </button>
      <button
        onClick={undoLastPitch}
        disabled={actionHistory.length === 0}
        className="h-14 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Undo
      </button>
      <button
        onClick={nextBatter}
        className="h-14 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white text-xs font-medium transition-all"
      >
        Next Set
      </button>
      <button
        onClick={saveGame}
        className="h-14 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 text-xs font-semibold transition-all shadow-lg shadow-cyan-400/20"
      >
        Save Session
      </button>
    </div>
  </div>
</div>
</div>
);
}

if (view === 'pitch-entry') {
const inGameStats = getInGamePitchStats();
const fastballSet = new Set(['4S', '2S', 'SNK', 'CT']);
const recentAtBatsForCurrentHitter = getRecentAtBatsForCurrentHitter(3);
const currentPitchCount = getCountFromPitches(atBatPitches);
const isAwaitingAtBatResult = atBatPitches.at(-1)?.strikeType === 'In Play';
const supportsVoiceRecognition = typeof window !== 'undefined' && (
  Capacitor.getPlatform() !== 'web'
  || Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
);
return (
<div className={`${shellClass} p-2.5 sm:p-3 pb-24 ${appClass}`} style={appStyle}>
<BroadcastStyle />
<div className="w-full md:max-w-7xl mx-auto px-1.5 sm:px-2.5 md:px-3">
<Breadcrumbs text={getBreadcrumbs()} />
<div className="mb-1.5"><ModeBadge /></div>
<div className="sticky top-16 sm:top-0 z-30 mb-2">
  <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/88 backdrop-blur border border-slate-700/50 rounded-xl px-2 py-1.5">
    <button onClick={() => setOneHandMode(!oneHandMode)} className="text-[11px] px-2 py-1 rounded-full border border-cyan-400/40 text-cyan-300 bg-cyan-400/10">{oneHandMode ? 'One-Hand: On' : 'One-Hand: Off'}</button>
    <div className="text-xs text-slate-400">INN <span className="text-white font-semibold">{currentInning}</span></div>
    <div className="text-xs text-slate-400">COUNT <span className="text-white font-semibold">{getCount()}</span></div>
    <div className="text-xs text-slate-400">LAST PITCH <span className="text-white font-semibold">{atBatPitches.at(-1)?.type || '--'}</span></div>
    <div className="text-xs text-slate-400">VELO <span className="text-white font-semibold">{atBatPitches.at(-1)?.velocity || '--'}</span></div>
    <div className="flex items-center gap-2 text-xs text-slate-400">LAST 3
      {getRecentOutcomes().length === 0 ? (
        <span className="text-slate-500">--</span>
      ) : (
        getRecentOutcomes().map((o, i) => (
          <span key={`${o}-${i}`} className="px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">{o}</span>
        ))
      )}
    </div>
  </div>
</div>

<BottomNav />
<QuickSearchModal />

<div className="bg-slate-800/45 border border-slate-700/50 rounded-xl p-2 mb-1.5">
  <div className="flex items-center justify-between gap-4">
    <div>
      <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-0.5">Velocity</div>
      <div className="text-[10px] text-slate-500">Optional</div>
    </div>
    <div className="w-24">
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        min="0"
        value={currentVelocity}
        onChange={(e) => setCurrentVelocity(e.target.value)}
        placeholder="mph"
        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-center text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />
    </div>
  </div>
</div>

{/* Compact Game Scoreboard */}
<div className="grid grid-cols-1 gap-1.5 mb-2">
  <div className="rounded-xl border border-cyan-400/30 bg-slate-900/88 p-2 shadow-lg">
    <div className="grid grid-cols-3 gap-1 items-end">
      <div className="text-center">
        <div className="text-cyan-100 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] mb-0.5">Batter</div>
        <div className="rounded-lg border border-cyan-400/20 bg-slate-950 px-2 py-1 shadow-inner">
          <div className="font-bold text-cyan-300 text-3xl sm:text-4xl leading-none" style={{ fontFamily: "'Teko', sans-serif" }}>
            {String(currentBatter).padStart(2, '0')}
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-cyan-100 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] mb-0.5">Inning</div>
        <div className="rounded-lg border border-cyan-400/20 bg-slate-950 px-2 py-1 shadow-inner">
          <div className="font-bold text-cyan-300 text-4xl sm:text-5xl leading-none" style={{ fontFamily: "'Teko', sans-serif" }}>
            {currentInning}
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-cyan-100 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] mb-0.5">Pitches</div>
        <div className="rounded-lg border border-cyan-400/20 bg-slate-950 px-2 py-1 shadow-inner">
          <div className="font-bold text-cyan-300 text-3xl sm:text-4xl leading-none" style={{ fontFamily: "'Teko', sans-serif" }}>
            {String(getTotalPitchCount()).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1 mt-1">
      {[
        ['Ball', currentPitchCount.balls, 4],
        ['Strike', currentPitchCount.strikes, 3],
        ['Out', currentOuts, 3]
      ].map(([label, value, max]) => (
        <div key={label} className="rounded-lg border border-cyan-400/20 bg-slate-950/60 px-1.5 py-1 text-center">
          <div className="text-cyan-100 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em]">{label}</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            {Array.from({ length: max }).map((_, idx) => (
              <span
                key={`${label}-${idx}`}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-cyan-400/20 ${
                  idx < value ? 'bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7)]' : 'bg-slate-950/70'
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
  <div className="grid grid-cols-3 gap-1">
    <div className="rounded-lg border border-cyan-400/20 bg-slate-900/75 p-1.5">
      <div className="text-cyan-100 text-[10px] font-semibold uppercase tracking-[0.12em] mb-0.5">Pitcher</div>
      <div className="rounded-lg border border-cyan-400/15 bg-slate-950 px-2 py-1 shadow-inner">
        <div className="text-xs sm:text-sm font-semibold text-white leading-tight">
          {currentGame?.pitcherName || selectedPitcher?.name || 'Unknown Pitcher'}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          #{selectedPitcher?.number || '--'} • {selectedPitcher?.handedness || '--'} • {selectedPitcher?.role || 'Pitcher'}
        </div>
      </div>
    </div>

    <div className="rounded-lg border border-cyan-400/20 bg-slate-900/75 p-1.5">
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <div className="text-cyan-100 text-[10px] font-semibold uppercase tracking-[0.12em]">Hitter</div>
        <button
          onClick={openLineupEditor}
          className="text-[9px] px-1.5 py-0.5 rounded-full border border-cyan-400/20 text-cyan-100/80 hover:text-white hover:border-cyan-300/40 transition-all"
        >
          Lineup
        </button>
      </div>
      <div className="rounded-lg border border-cyan-400/15 bg-slate-950 px-2 py-1 shadow-inner">
        <div className="text-xs sm:text-sm font-semibold text-white leading-tight">
          {currentHitter?.name?.trim() || `Spot ${currentBatter}`}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          #{currentHitter?.number || '--'} • Spot {currentBatter}{currentHitter?.isSub ? ' • SUB' : ''}
        </div>
      </div>
    </div>

    <div className="rounded-lg border border-cyan-400/20 bg-slate-900/75 p-1.5">
      <div className="text-cyan-100 text-[10px] font-semibold uppercase tracking-[0.12em] mb-0.5">Last AB</div>
      {recentAtBatsForCurrentHitter[0] ? (
        <div className="rounded-lg border border-cyan-400/15 bg-slate-950 px-2 py-1 shadow-inner">
          <div className="flex items-center justify-between gap-1">
            <div className="text-xs sm:text-sm font-semibold text-white">
              {recentAtBatsForCurrentHitter[0].outcome || 'Unknown'}
            </div>
            <div className="text-[10px] text-slate-400">
              Inning {recentAtBatsForCurrentHitter[0].inning}
            </div>
          </div>
          {recentAtBatsForCurrentHitter[0].outDetails ? (
            <div className="text-[10px] text-slate-400 mt-0.5">
              {recentAtBatsForCurrentHitter[0].outDetails}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-1 mt-1">
            {(recentAtBatsForCurrentHitter[0].pitches || []).slice(0, 4).map((pitch, idx) => (
              <div
                key={`${pitch.type}-${idx}`}
                className={`px-1 py-0.5 rounded-md text-[9px] font-semibold border ${
                  pitch.isStrike
                    ? 'border-cyan-400/50 text-cyan-400 bg-cyan-400/10'
                    : 'border-red-400/50 text-red-400 bg-red-400/10'
                }`}
              >
                {pitch.type}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-cyan-400/15 bg-slate-950 px-2 py-1.5 text-slate-500 text-xs shadow-inner">
          First AB.
        </div>
      )}
    </div>
  </div>
</div>

<div className="rounded-xl border border-cyan-400/20 bg-slate-900/70 p-2 mb-1.5">
  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
    <div>
      <div className="text-cyan-100 text-[11px] font-semibold uppercase tracking-[0.14em]">Smart Input</div>
      <div className="text-[10px] text-slate-400">Speak or type. Best order: pitch type, result, location.</div>
    </div>
    <div className="text-[10px] text-slate-500 text-right">
      Try: <span className="text-slate-300">slider called strike away</span>
    </div>
  </div>
  <div className="flex flex-wrap gap-1.5">
    <input
      type="text"
      value={voiceCommandText}
      onChange={(e) => {
        setVoiceCommandText(e.target.value);
        clearVoiceCommandState();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (voiceCommandPreview) {
            applyVoiceCommand();
          } else {
            previewVoiceCommand();
          }
        }
      }}
      placeholder="Type or speak: slider called strike away"
      className="flex-1 min-w-[170px] px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
    />
    {supportsVoiceRecognition && (
      <button
        onClick={toggleVoiceListening}
        className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all min-w-[108px] ${
          isVoiceListening
            ? 'bg-red-400/15 border-red-400/40 text-red-300'
            : 'bg-cyan-400/10 border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/20'
        }`}
      >
        {isVoiceListening ? 'Listening...' : 'Speak to Text'}
      </button>
    )}
    <button
      onClick={() => previewVoiceCommand()}
      className="px-2.5 py-2 rounded-lg text-xs font-semibold border border-cyan-400/30 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 transition-all"
    >
      Preview
    </button>
    <button
      onClick={() => applyVoiceCommand()}
      disabled={!voiceCommandPreview}
      className="px-2.5 py-2 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-900 hover:bg-cyan-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Confirm
    </button>
  </div>
  {voiceCommandError ? (
    <div className="mt-2 text-xs text-red-300">{voiceCommandError}</div>
  ) : null}
  {voiceCommandPreview ? (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="text-[11px] text-slate-400 uppercase tracking-[0.14em]">Preview</span>
      <span className="px-2 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/25 text-cyan-200 text-[11px] font-semibold">
        {voiceCommandPreview.summary}
      </span>
    </div>
  ) : null}
  {(voiceCommandPreview || voiceCommandText) ? (
      <div className="mt-2 space-y-1.5">
      <div className="text-[10px] text-slate-500 uppercase tracking-[0.14em]">Correction Chips</div>
      <div className="flex flex-wrap gap-1.5">
        {voiceCorrectionTokens.result.map((token) => (
          <button
            key={`voice-result-${token}`}
            onClick={() => applyVoiceCorrectionToken(token)}
            className="px-2 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-200 text-[11px] font-medium"
          >
            {token}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {voiceCorrectionTokens.location.map((token) => (
          <button
            key={`voice-location-${token}`}
            onClick={() => applyVoiceCorrectionToken(token)}
            className="px-2 py-1 rounded-full border border-red-400/20 bg-red-400/5 text-red-200 text-[11px] font-medium"
          >
            {token}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {voiceCorrectionTokens.outcome.map((token) => (
          <button
            key={`voice-outcome-${token}`}
            onClick={() => applyVoiceCorrectionToken(token)}
            className="px-2 py-1 rounded-full border border-amber-400/20 bg-amber-400/5 text-amber-200 text-[11px] font-medium"
          >
            {token}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {voiceCorrectionTokens.detail.map((token) => (
          <button
            key={`voice-detail-${token}`}
            onClick={() => applyVoiceCorrectionToken(token)}
            className="px-2 py-1 rounded-full border border-slate-600 bg-slate-800/60 text-slate-200 text-[11px] font-medium"
          >
            {token}
          </button>
        ))}
      </div>
    </div>
  ) : null}
</div>

      {/* Pitch Location + Trail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-2.5">
        {hidePitchLocationPanel ? (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 flex items-center justify-between">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Pitch Location Hidden</div>
            <button
              onClick={() => setHidePitchLocationPanel(false)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-600 text-slate-200 hover:text-white hover:border-slate-400 transition-all"
            >
              Show Pitch Location
            </button>
          </div>
        ) : (
          <div
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2"
            onTouchStart={handlePitchLocationTouchStart}
            onTouchEnd={handlePitchLocationTouchEnd}
          >
            <div className="flex flex-col items-center mb-2">
              <div className="w-10 h-1 rounded-full bg-slate-500/60 mb-1"></div>
              <div className="text-[11px] text-slate-500">Drag up to hide</div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Pitch Location (Optional)</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
                <button
                  onClick={() => setHidePitchLocationPanel(true)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Hide
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
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
                          ? 'bg-cyan-400 text-slate-900 border-cyan-300'
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
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Pitch Trail (Last 8)</div>
          <div className="flex flex-wrap gap-1.5">
            {pitchTrail.length === 0 ? (
              <div className="text-slate-500 text-sm">No pitches yet</div>
            ) : (
              pitchTrail.map((p, i) => (
                <div
                  key={`${p.type}-${i}`}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border ${
                    p.isStrike ? 'border-cyan-400/50 text-cyan-400 bg-cyan-400/10' : 'border-red-400/50 text-red-400 bg-red-400/10'
                  }`}
                >
                  {p.type} {p.zone ? `@${p.zone}` : p.ballType ? `(${p.ballType})` : ''}{p.velocity ? ` ${p.velocity}` : ''}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mb-2.5">
        <button
          onClick={() => setShowInGameDetails(!showInGameDetails)}
          className="w-full h-9 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700/90 transition-all text-xs"
        >
          {showInGameDetails ? 'Hide Detail Panels' : 'Show Detail Panels'}
        </button>
      </div>
      {showInGameDetails && (
        <>
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
                            ? 'border-amber-400/60 bg-amber-400/10 text-amber-200'
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
                          ? 'border-cyan-400/50 text-cyan-300 bg-cyan-400/10'
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
        </>
      )}

      {/* Pitch Entry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2.5">
        {/* Strikes */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <div className="text-slate-300 text-sm font-medium uppercase tracking-wider">Strike</div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5 mb-2">
            {selectedPitcher?.pitchTypes.map(type => (
              <button
                key={type}
                onClick={() => selectPitchType(type, true)}
                disabled={isAwaitingAtBatResult}
                className={`bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 rounded-xl text-cyan-400 font-bold active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${oneHandMode ? 'h-[4.5rem] text-2xl' : 'h-12 text-base'} min-h-[3rem]`}
              >
                {type}
              </button>
            ))}
          </div>
          
          {/* Strike Type Selection */}
          {pendingPitch && pendingPitch.isStrike && (
            <div className="mt-2 p-2 bg-cyan-400/5 border border-cyan-400/20 rounded-xl">
              <div className="text-slate-300 text-xs font-medium uppercase tracking-wider mb-3">Strike Type</div>
              <div className="grid grid-cols-3 gap-2">
                {strikeTypes.map(strikeType => (
                  <button
                    key={strikeType}
                    onClick={() => recordPitch(pendingPitch.type, true, strikeType)}
                    disabled={isAwaitingAtBatResult}
                    className="py-1.5 bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/40 rounded-lg text-cyan-400 font-medium text-[11px] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {strikeType}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Balls */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="text-slate-300 text-sm font-medium uppercase tracking-wider">Ball</div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5 mb-2">
            {selectedPitcher?.pitchTypes.map(type => (
              <button
                key={type}
                onClick={() => {
                  selectPitchType(type, false);
                }}
                disabled={isAwaitingAtBatResult}
                className={`bg-red-400/10 hover:bg-red-400/20 border border-red-400/30 rounded-xl text-red-400 font-bold active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${oneHandMode ? 'h-[4.5rem] text-2xl' : 'h-12 text-base'} min-h-[3rem]`}
              >
                {type}
              </button>
            ))}
          </div>
          
          {/* Ball Location */}
          {pendingPitch && !pendingPitch.isStrike && (
            <div className="mt-2 p-2 bg-red-400/5 border border-red-400/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-slate-300 text-xs font-medium uppercase tracking-wider">Ball Location</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Up', 'Away', 'In', 'Down'].map((edge) => (
                  <button
                    key={edge}
                    onClick={() => {
                      recordPitch(pendingPitch.type, false, null, edge);
                    }}
                    disabled={isAwaitingAtBatResult}
                    className="py-1.5 bg-red-400/20 hover:bg-red-400/30 border border-red-400/40 rounded-lg text-red-300 font-medium text-[11px] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {edge}
                  </button>
                ))}
                {currentPitchCount.balls === 3 && (
                  <button
                    onClick={() => {
                      recordPitch(pendingPitch.type, false, null, 'HBP');
                    }}
                    disabled={isAwaitingAtBatResult}
                    className="py-1.5 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 rounded-lg text-amber-200 font-medium text-[11px] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed col-span-2 sm:col-span-4"
                  >
                    HBP
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Outcomes */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-400/25 rounded-xl p-2 mb-16">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">At-Bat Result</div>
          {isAwaitingAtBatResult ? (
            <div className="text-[11px] text-amber-300">In play logged. Pick the result to continue.</div>
          ) : null}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {outcomes.map(outcome => (
            <button
              key={outcome}
              onClick={() => {
                if (outcome === 'OUT') {
                  openDefensiveOutcomeModal('OUT');
                  return;
                }
                if (['E', 'SAC', 'DP'].includes(outcome)) {
                  openDefensiveOutcomeModal(outcome);
                  return;
                }
                if (['1B', '2B', '3B'].includes(outcome)) {
                  handleHitOutcomeClick(outcome);
                  return;
                }
                completeAtBat(outcome);
              }}
              disabled={atBatPitches.length === 0}
              className={`bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl text-amber-400 font-semibold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all ${oneHandMode ? 'h-12 text-sm px-2' : 'h-9 text-[11px] px-1.5'}`}
            >
              {outcome}
            </button>
          ))}
        </div>
      </div>

      {/* Out Location Modal */}
      {showBasesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-semibold mb-4">Bases / Runs Editor</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={basesDraft.first}
                onChange={(e) => setBasesDraft((prev) => ({ ...prev, first: e.target.value }))}
                placeholder="Runner on 1st"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                type="text"
                value={basesDraft.second}
                onChange={(e) => setBasesDraft((prev) => ({ ...prev, second: e.target.value }))}
                placeholder="Runner on 2nd"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                type="text"
                value={basesDraft.third}
                onChange={(e) => setBasesDraft((prev) => ({ ...prev, third: e.target.value }))}
                placeholder="Runner on 3rd"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                type="number"
                min="0"
                value={basesDraft.runs}
                onChange={(e) => setBasesDraft((prev) => ({ ...prev, runs: e.target.value }))}
                placeholder="Runs allowed"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowBasesModal(false)}
                className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveBasesEditor}
                className="flex-1 h-12 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all"
              >
                Save Bases
              </button>
            </div>
          </div>
        </div>
      )}

      {showOutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-semibold mb-4">{pendingDefensiveOutcome || 'Defensive'} Detail</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(defensiveResultPresets[pendingDefensiveOutcome] || []).map((preset) => (
                <button
                  key={preset}
                  onClick={() => submitDefensiveDetail(preset)}
                  className="py-3 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 rounded-lg text-amber-200 font-medium text-sm active:scale-95 transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={outLocation}
              onChange={(e) => setOutLocation(e.target.value)}
              placeholder="Custom detail"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOutModal(false);
                  setOutLocation('');
                  setPendingDefensiveOutcome(null);
                }}
                className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitOut}
                disabled={!outLocation.trim()}
                className="flex-1 h-12 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showHitLocationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-white text-xl font-semibold mb-2">{pendingHitOutcome || 'Hit'} Location</h3>
            <p className="text-slate-400 text-sm mb-4">Log where the ball was hit so it stays with this at-bat.</p>
            <input
              type="text"
              value={hitLocation}
              onChange={(e) => setHitLocation(e.target.value)}
              placeholder="e.g., 5-6 hole, LF line, RC gap"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowHitLocationModal(false);
                  setPendingHitOutcome(null);
                  setHitLocation('');
                }}
                className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitHitLocation}
                disabled={!hitLocation.trim()}
                className="flex-1 h-12 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Hit
              </button>
            </div>
          </div>
        </div>
      )}

      {showLineupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-white text-2xl font-semibold">Game Lineup</h3>
                <p className="text-slate-400 text-sm">Set your 9 hitters once. Reopen this for hitting changes.</p>
              </div>
              <button
                onClick={() => setShowLineupModal(false)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="space-y-3">
              {normalizeLineup(lineupDraft).map((spot) => (
                <div key={spot.slot} className="grid grid-cols-1 md:grid-cols-[80px_1fr_120px_180px_180px] gap-3 items-center bg-slate-900/60 border border-slate-700 rounded-xl p-3">
                  <div className="text-slate-300 font-semibold">#{spot.slot}</div>
                  <input
                    type="text"
                    value={spot.name}
                    onChange={(e) => updateLineupDraftSpot(spot.slot, 'name', e.target.value)}
                    placeholder={`Hitter ${spot.slot} name`}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <input
                    type="text"
                    value={spot.number}
                    onChange={(e) => updateLineupDraftSpot(spot.slot, 'number', e.target.value)}
                    placeholder="Number"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleLineupSpotSub(spot.slot)}
                      className={`w-full h-10 rounded-lg text-sm font-semibold ${spot.isSub ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      {spot.isSub ? 'Remove Sub' : 'Sub Hitter'}
                    </button>
                    {spot.isSub && (
                      <details className="rounded-xl border border-slate-700 bg-slate-800/70">
                        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-slate-400 hover:text-white flex items-center justify-between">
                          <span>Previous hitter</span>
                          <span className="text-slate-500">{spot.replacedPlayer?.trim() ? 'Show' : 'Add'}</span>
                        </summary>
                        <div className="px-3 pb-3">
                          <input
                            type="text"
                            value={spot.replacedPlayer}
                            onChange={(e) => updateLineupDraftSpot(spot.slot, 'replacedPlayer', e.target.value)}
                            placeholder="Who was in this spot before?"
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                      </details>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateLineupDraftSpot(spot.slot, 'handedness', 'L')}
                      className={`h-11 rounded-lg font-semibold ${spot.handedness === 'L' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'}`}
                    >
                      L
                    </button>
                    <button
                      onClick={() => updateLineupDraftSpot(spot.slot, 'handedness', 'S')}
                      className={`h-11 rounded-lg font-semibold ${spot.handedness === 'S' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'}`}
                    >
                      S
                    </button>
                    <button
                      onClick={() => updateLineupDraftSpot(spot.slot, 'handedness', 'R')}
                      className={`h-11 rounded-lg font-semibold ${spot.handedness === 'R' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'}`}
                    >
                      R
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowLineupModal(false)}
                className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveLineup}
                disabled={!normalizeLineup(lineupDraft).every((spot) => spot.name.trim())}
                className="flex-1 h-12 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Lineup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-700/60 backdrop-blur px-2 py-1">
        <div className="w-full md:max-w-7xl mx-auto mb-1 text-[9px] text-slate-400 uppercase tracking-[0.14em]">
          {getUndoSummary()}
        </div>
        <div className="w-full md:max-w-7xl mx-auto grid grid-cols-5 gap-2">
          <button
            onClick={returnToHome}
            className="h-9 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-white text-[10px] font-medium transition-all"
          >
            Home
          </button>
          <button
            onClick={undoLastPitch}
            disabled={actionHistory.length === 0}
            className="h-9 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-white text-[10px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {actionHistory.length === 0 ? 'Undo' : 'Undo Last'}
          </button>
          <button
            onClick={nextBatter}
            className="h-9 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-white text-[10px] font-medium transition-all"
          >
            Next
          </button>
          <button
            onClick={pitchingChange}
            className="h-9 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-white text-[10px] font-medium transition-all"
          >
            Change
          </button>
          <button
            onClick={saveGame}
            className="h-9 bg-cyan-400 hover:bg-cyan-300 rounded-lg text-slate-900 text-[10px] font-semibold transition-all shadow-lg shadow-cyan-400/20"
          >
            Save
          </button>
        </div>
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
                  className="h-14 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all text-lg"
                >
                  Save & Continue
                </button>
                <button
                  onClick={() => confirmSaveGame(false)}
                  className="h-14 bg-amber-500 hover:bg-amber-400 rounded-xl text-white font-semibold transition-all text-lg"
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
                  className="flex-1 h-14 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all text-lg"
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
                  scoutingMode ? 'bg-cyan-400 text-slate-900' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {scoutingMode ? 'Switch to My Team' : 'Switch to Opponent'}
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              {scoutingMode ? 'Track an opponent pitcher (saved separately)' : (bullpenMode ? 'Choose which pitcher will be throwing in this bullpen' : 'Choose which pitcher will be throwing in this game')}
            </p>
            <input
              type="text"
              value={pitcherSearch}
              onChange={(e) => setPitcherSearch(e.target.value)}
              placeholder="Search pitchers..."
              className="w-full px-4 py-3 mb-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
                    <div className="w-14 h-14 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-cyan-400">#{pitcher.number || '--'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">{pitcher.name}</div>
                      <div className="text-sm text-slate-400">{pitcher.handedness || '--'} • {pitcher.role || 'Opponent'}</div>
                    </div>
                    <ChevronRight size={24} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
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
              className="w-full h-12 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-slate-900 font-semibold transition-all mb-3"
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

return <div className={`${shellClass} p-4 sm:p-6 ${appClass}`} style={appStyle}>Loading...</div>;
};

export default BSBL101;
