import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router';
import { useTheme } from '../../../context/ThemeContext';
import {
  MousePointer2, Circle, Minus, Anchor, ArrowDown, ArrowRightLeft,
  Play, Trash2, Grid3x3, PanelLeftClose, PanelRightClose,
  Box, Layers, Undo2, Redo2, Save, FolderOpen,
  Move, TrendingUp, ArrowUpDown, RotateCcw, Sun, Moon,
  ArrowUpFromLine,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useModelStore } from '../../stores/modelStore';
import { useResultStore } from '../../stores/resultStore';
import { useHistoryStore } from '../../utils/history';
import { runAnalysis } from '../../solver/Solver';
import { saveProject, loadProject } from '../../utils/fileIO';
import type { ActiveTool, ResultView, ElementType } from '../../types/model';

function ToolButton({
  icon: Icon, label, active, onClick, danger, disabled, compact,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex flex-col items-center justify-center rounded-lg text-xs gap-1
        transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
        ${compact ? 'px-5 py-3 mx-1' : 'px-6 py-3.5 mx-1.5'}
        ${active
          ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30'
          : danger
            ? 'hover:bg-[var(--color-danger)]/10 text-[var(--color-danger)]/70 hover:text-[var(--color-danger)]'
            : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
        }`}
    >
      <Icon size={16} />
      <span className="leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}

function ToolGroup({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2">
        {children}
      </div>
      {label && (
        <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)]/60 leading-none">
          {label}
        </span>
      )}
    </div>
  );
}

function Divider() {
  return <div className="w-px self-stretch bg-[var(--color-border)]/50 mx-4" />;
}

interface ToolbarProps {
  onOpenMaterials: () => void;
  onOpenSections: () => void;
}

export function Toolbar({ onOpenMaterials, onOpenSections }: ToolbarProps) {
  const { theme, toggleTheme } = useTheme();
  const activeTool = useUIStore(s => s.activeTool);
  const setActiveTool = useUIStore(s => s.setActiveTool);
  const resultView = useUIStore(s => s.resultView);
  const setResultView = useUIStore(s => s.setResultView);
  const defaultElementType = useUIStore(s => s.defaultElementType);
  const setDefaultElementType = useUIStore(s => s.setDefaultElementType);
  const toggleLeftPanel = useUIStore(s => s.toggleLeftPanel);
  const toggleRightPanel = useUIStore(s => s.toggleRightPanel);
  const gridVisible = useUIStore(s => s.gridVisible);
  const setGridVisible = useUIStore(s => s.setGridVisible);
  const results = useResultStore(s => s.results);
  const isSolving = useResultStore(s => s.isSolving);
  const clearModel = useModelStore(s => s.clearModel);
  const clearResults = useResultStore(s => s.clearResults);
  const undo = useHistoryStore(s => s.undo);
  const redo = useHistoryStore(s => s.redo);
  const saveSnapshot = useHistoryStore(s => s.saveSnapshot);

  const setTool = (t: ActiveTool) => {
    saveSnapshot();
    setActiveTool(t);
    if (t !== 'select') setResultView('none');
  };

  const handleSolve = () => {
    saveSnapshot();
    clearResults();
    runAnalysis();
  };

  const handleResultView = (v: ResultView) => {
    setResultView(resultView === v ? 'none' : v);
  };

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] select-none">
      <div className="flex flex-col gap-1 mr-2 pr-3 border-r border-[var(--color-border)]">
        <div className="font-bold text-[var(--color-accent)] text-base tracking-tight leading-none">SAS</div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Structural analysis
        </span>
        <Link
          to="/"
          className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
        >
          ← Back to Dino Calcs
        </Link>
      </div>

      <Divider />

      <ToolGroup label="file">
        <ToolButton icon={Save} label="Save" onClick={saveProject} compact />
        <ToolButton icon={FolderOpen} label="Open" onClick={loadProject} compact />
        <ToolButton icon={Undo2} label="Undo" onClick={undo} compact />
        <ToolButton icon={Redo2} label="Redo" onClick={redo} compact />
      </ToolGroup>

      <Divider />

      <ToolGroup label="draw">
        <ToolButton icon={MousePointer2} label="Select" active={activeTool === 'select'} onClick={() => setTool('select')} />
        <ToolButton icon={Circle} label="Node" active={activeTool === 'node'} onClick={() => setTool('node')} />
        <ToolButton icon={Minus} label="Member" active={activeTool === 'member'} onClick={() => setTool('member')} />
      </ToolGroup>

      <Divider />

      <ToolGroup label="type">
        <select
          value={defaultElementType}
          onChange={(e) => setDefaultElementType(e.target.value as ElementType)}
          className="bg-[var(--color-bg-panel)] text-[var(--color-text-primary)] text-xs px-4 py-2.5 rounded-lg border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)] transition-colors"
          title="Element type for new members"
        >
          <option value="spring">Spring</option>
          <option value="truss2d">Truss 2D</option>
          <option value="beam">Beam</option>
          <option value="frame2d">Frame 2D</option>
          <option value="frame3d">Frame 3D</option>
        </select>
      </ToolGroup>

      <Divider />

      <ToolGroup label="assign">
        <ToolButton icon={Anchor} label="Support" active={activeTool === 'support'} onClick={() => setTool('support')} />
        <ToolButton icon={ArrowDown} label="Pt Load" active={activeTool === 'pointLoad'} onClick={() => setTool('pointLoad')} />
        <ToolButton icon={ArrowRightLeft} label="Dist Load" active={activeTool === 'distributedLoad'} onClick={() => setTool('distributedLoad')} />
      </ToolGroup>

      <Divider />

      <ToolGroup label="define">
        <ToolButton icon={Box} label="Materials" onClick={onOpenMaterials} />
        <ToolButton icon={Layers} label="Sections" onClick={onOpenSections} />
      </ToolGroup>

      <Divider />

      <ToolGroup label="solve">
        <button
          onClick={handleSolve}
          disabled={isSolving}
          title="Run Analysis"
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium cursor-pointer
            bg-[var(--color-accent)]/15 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/25
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Play size={15} />
          {isSolving ? 'Solving…' : 'Solve'}
        </button>
      </ToolGroup>

      <Divider />

      <ToolGroup label="results">
        <ToolButton icon={Move} label="Deform" active={resultView === 'deformed'} onClick={() => handleResultView('deformed')} disabled={!results} compact />
        <ToolButton icon={TrendingUp} label="Axial" active={resultView === 'axial'} onClick={() => handleResultView('axial')} disabled={!results} compact />
        <ToolButton icon={ArrowUpDown} label="Shear" active={resultView === 'shear'} onClick={() => handleResultView('shear')} disabled={!results} compact />
        <ToolButton icon={RotateCcw} label="Moment" active={resultView === 'moment'} onClick={() => handleResultView('moment')} disabled={!results} compact />
        <ToolButton icon={RotateCcw} label="Torsion" active={resultView === 'torsion'} onClick={() => handleResultView('torsion')} disabled={!results} compact />
        <ToolButton icon={ArrowUpFromLine} label="Reactions" active={resultView === 'reactions'} onClick={() => handleResultView('reactions')} disabled={!results} compact />
      </ToolGroup>

      <div className="flex-1" />

      <ToolGroup>
        <ToolButton
          icon={theme === 'dark' ? Sun : Moon}
          label={theme === 'dark' ? 'Light' : 'Dark'}
          onClick={toggleTheme}
          compact
        />
        <ToolButton icon={Grid3x3} label="Grid" active={gridVisible} onClick={() => setGridVisible(!gridVisible)} compact />
        <ToolButton icon={PanelLeftClose} label="Left" onClick={toggleLeftPanel} compact />
        <ToolButton icon={PanelRightClose} label="Right" onClick={toggleRightPanel} compact />
      </ToolGroup>

      <div className="w-2" />

      <ToolButton icon={Trash2} label="Clear" onClick={() => { saveSnapshot(); clearModel(); clearResults(); }} danger compact />
    </div>
  );
}
