import {
  ArrowLeft,
  CircleHelp,
  ImagePlus,
  List,
  Map,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Smartphone,
  Upload,
  X,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MutableRefObject,
} from 'react';
import trackImage from '../assets/factory-racecourse.png';
import racecarImage from '../assets/racecar-avatar-shell-v2.png';

type WorkerProgress = {
  id: string;
  name: string;
  station: string;
  initials: string;
  color: string;
  qualified: number;
  standardMinutes: number;
  operationFactor: number;
  plannedWorkload: number;
};

type ViewMode = 'track' | 'list';
type Position = { x: number; y: number; angle: number };

const INITIAL_WORKERS: WorkerProgress[] = [
  {
    id: 'lin',
    name: '林嘉',
    station: 'A01',
    initials: '林',
    color: '#2f8f5b',
    qualified: 68,
    standardMinutes: 4.2,
    operationFactor: 1,
    plannedWorkload: 380,
  },
  {
    id: 'zhou',
    name: '周悦',
    station: 'A02',
    initials: '周',
    color: '#f0a45b',
    qualified: 60,
    standardMinutes: 5.6,
    operationFactor: 1.1,
    plannedWorkload: 430,
  },
  {
    id: 'chen',
    name: '陈航',
    station: 'A03',
    initials: '陈',
    color: '#4f82c2',
    qualified: 85,
    standardMinutes: 3.4,
    operationFactor: 0.95,
    plannedWorkload: 430,
  },
  {
    id: 'fang',
    name: '方宁',
    station: 'B01',
    initials: '方',
    color: '#d96d70',
    qualified: 35,
    standardMinutes: 6.2,
    operationFactor: 1.2,
    plannedWorkload: 480,
  },
  {
    id: 'xu',
    name: '许薇',
    station: 'B02',
    initials: '许',
    color: '#8b6fc5',
    qualified: 45,
    standardMinutes: 4,
    operationFactor: 1,
    plannedWorkload: 430,
  },
  {
    id: 'tang',
    name: '唐朔',
    station: 'C01',
    initials: '唐',
    color: '#d4a82e',
    qualified: 19,
    standardMinutes: 7,
    operationFactor: 1.15,
    plannedWorkload: 520,
  },
  {
    id: 'he',
    name: '何青',
    station: 'C02',
    initials: '何',
    color: '#2f9da0',
    qualified: 23,
    standardMinutes: 3,
    operationFactor: 1,
    plannedWorkload: 390,
  },
];

const TRACK_POINTS = [
  [0.025, 0.84],
  [0.12, 0.75],
  [0.23, 0.68],
  [0.3, 0.66],
  [0.34, 0.58],
  [0.33, 0.48],
  [0.34, 0.39],
  [0.4, 0.34],
  [0.46, 0.37],
  [0.47, 0.44],
  [0.53, 0.49],
  [0.62, 0.5],
  [0.69, 0.47],
  [0.72, 0.39],
  [0.7, 0.3],
  [0.68, 0.22],
  [0.72, 0.15],
  [0.82, 0.12],
  [0.94, 0.13],
  [0.985, 0.085],
] as const;

const TRACK_ASPECT = { width: 16, height: 9 } as const;

const TRACK_SEGMENTS = TRACK_POINTS.slice(0, -1).map((start, index) => {
  const end = TRACK_POINTS[index + 1];
  const dx = (end[0] - start[0]) * TRACK_ASPECT.width;
  const dy = (end[1] - start[1]) * TRACK_ASPECT.height;

  return {
    start,
    end,
    length: Math.hypot(dx, dy),
  };
});

const TRACK_LENGTH = TRACK_SEGMENTS.reduce(
  (total, segment) => total + segment.length,
  0,
);

const SEED = 0x52f731a9;

function completionRate(worker: WorkerProgress) {
  const completedWorkload =
    worker.qualified * worker.standardMinutes * worker.operationFactor;
  return Math.min(1, Math.max(0, completedWorkload / worker.plannedWorkload));
}

function displayPercent(worker: WorkerProgress) {
  return Math.round(completionRate(worker) * 100);
}

function pointAtTrackDistance(distance: number) {
  const safeDistance = Math.min(TRACK_LENGTH, Math.max(0, distance));
  let traversed = 0;

  for (const segment of TRACK_SEGMENTS) {
    const segmentEnd = traversed + segment.length;
    if (safeDistance <= segmentEnd) {
      const amount =
        segment.length === 0 ? 0 : (safeDistance - traversed) / segment.length;
      return {
        x: segment.start[0] + (segment.end[0] - segment.start[0]) * amount,
        y: segment.start[1] + (segment.end[1] - segment.start[1]) * amount,
      };
    }
    traversed = segmentEnd;
  }

  const last = TRACK_POINTS[TRACK_POINTS.length - 1];
  return { x: last[0], y: last[1] };
}

function pointOnTrack(progress: number): Position {
  const safeProgress = 0.03 + Math.min(1, Math.max(0, progress)) * 0.92;
  const distance = safeProgress * TRACK_LENGTH;
  const point = pointAtTrackDistance(distance);

  // A short, symmetric sample smooths direction changes around polyline corners.
  const tangentSample = TRACK_LENGTH * 0.012;
  const before = pointAtTrackDistance(distance - tangentSample);
  const after = pointAtTrackDistance(distance + tangentSample);
  const angle =
    (Math.atan2(
      (after.y - before.y) * TRACK_ASPECT.height,
      (after.x - before.x) * TRACK_ASPECT.width,
    ) *
      180) /
    Math.PI;

  return { ...point, angle };
}

function nextRandom(seedRef: MutableRefObject<number>) {
  let value = seedRef.current || SEED;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  seedRef.current = value >>> 0;
  return seedRef.current / 4294967296;
}

function useMobileViewport() {
  const [mobile, setMobile] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(max-width: 720px)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 720px)');
    const handleChange = () => setMobile(media.matches);
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return mobile;
}

function Avatar({
  worker,
  imageUrl,
  className = '',
}: {
  worker: WorkerProgress;
  imageUrl?: string;
  className?: string;
}) {
  return (
    <span
      className={`avatar ${className}`}
      style={{ '--avatar-color': worker.color } as CSSProperties}
      aria-hidden="true"
    >
      {imageUrl ? <img src={imageUrl} alt="" /> : worker.initials}
    </span>
  );
}

export function ProgressTrackApp() {
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [running, setRunning] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('track');
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});
  const avatarUrlsRef = useRef(avatarUrls);
  const avatarDialogRef = useRef<HTMLDialogElement>(null);
  const formulaDialogRef = useRef<HTMLDialogElement>(null);
  const randomSeedRef = useRef(SEED);
  const isMobile = useMobileViewport();

  useEffect(() => {
    avatarUrlsRef.current = avatarUrls;
  }, [avatarUrls]);

  useEffect(() => {
    setViewMode(isMobile ? 'list' : 'track');
  }, [isMobile]);

  useEffect(() => {
    return () => {
      Object.values(avatarUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!running) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const advance = () => {
      const advanceCount = nextRandom(randomSeedRef) > 0.68 ? 2 : 1;
      const selected = new Set<number>();
      while (selected.size < advanceCount) {
        selected.add(Math.floor(nextRandom(randomSeedRef) * INITIAL_WORKERS.length));
      }

      setWorkers((current) =>
        current.map((worker, index) => {
          if (!selected.has(index) || completionRate(worker) >= 1) return worker;
          const increment = 1 + Math.floor(nextRandom(randomSeedRef) * 3);
          return { ...worker, qualified: worker.qualified + increment };
        }),
      );

      const delay = 1200 + Math.floor(nextRandom(randomSeedRef) * 600);
      timeoutId = setTimeout(advance, delay);
    };

    timeoutId = setTimeout(advance, 900);
    return () => clearTimeout(timeoutId);
  }, [running]);

  const neutralList = useMemo(
    () => [...workers].sort((a, b) => a.station.localeCompare(b.station)),
    [workers],
  );

  function resetSimulation() {
    setRunning(false);
    setWorkers(INITIAL_WORKERS.map((worker) => ({ ...worker })));
    randomSeedRef.current = SEED;
  }

  function updateAvatar(workerId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;

    const nextUrl = URL.createObjectURL(file);
    setAvatarUrls((current) => {
      if (current[workerId]) URL.revokeObjectURL(current[workerId]);
      return { ...current, [workerId]: nextUrl };
    });
  }

  function restoreAvatar(workerId: string) {
    setAvatarUrls((current) => {
      if (!current[workerId]) return current;
      URL.revokeObjectURL(current[workerId]);
      const next = { ...current };
      delete next[workerId];
      return next;
    });
  }

  return (
    <main className="progress-page">
      <header className="progress-toolbar">
        <div className="toolbar-identity">
          <a className="icon-button back-button" href="../" aria-label="返回项目说明">
            <ArrowLeft size={21} aria-hidden="true" />
          </a>
          <div>
            <p>车间公共大屏 · 早班</p>
            <h1>车间进度赛道</h1>
          </div>
        </div>

        <div className="toolbar-status" aria-live="polite">
          <span className={running ? 'live-dot live-dot--running' : 'live-dot'} />
          {running ? '正在模拟生产' : '模拟已暂停'}
        </div>

        <div className="toolbar-actions">
          <div className="view-switch" aria-label="选择查看方式">
            <button
              className={viewMode === 'track' ? 'is-active' : ''}
              type="button"
              onClick={() => setViewMode('track')}
              aria-pressed={viewMode === 'track'}
            >
              <Map size={17} aria-hidden="true" />
              赛道
            </button>
            <button
              className={viewMode === 'list' ? 'is-active' : ''}
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
            >
              <List size={17} aria-hidden="true" />
              普通
            </button>
          </div>
          <button
            className="toolbar-button"
            type="button"
            onClick={() => avatarDialogRef.current?.showModal()}
          >
            <ImagePlus size={18} aria-hidden="true" />
            头像
          </button>
          <button
            className="toolbar-button toolbar-button--secondary"
            type="button"
            onClick={() => formulaDialogRef.current?.showModal()}
          >
            <CircleHelp size={18} aria-hidden="true" />
            口径
          </button>
          <button
            className="toolbar-button toolbar-button--primary"
            type="button"
            onClick={() => setRunning((current) => !current)}
          >
            {running ? (
              <Pause size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" />
            )}
            {running ? '暂停' : '开始'}
          </button>
          <button
            className="icon-button reset-button"
            type="button"
            onClick={resetSimulation}
            aria-label="重置模拟"
          >
            <RotateCcw size={19} aria-hidden="true" />
          </button>
        </div>
      </header>

      {viewMode === 'track' ? (
        <section className="track-stage" aria-label="七名员工的赛车场进度视图">
          <img
            className="track-background"
            src={trackImage}
            alt="原创卡通工厂赛车场"
            fetchPriority="high"
          />
          <div className="track-vignette" aria-hidden="true" />

          <div className="stage-caption">
            <span>{workers.length} 个工位</span>
            <span>位置代表个人当班计划完成率</span>
          </div>

          {workers.map((worker) => {
            const position = pointOnTrack(completionRate(worker));
            const style = {
              '--car-x': `${position.x * 100}%`,
              '--car-y': `${position.y * 100}%`,
              '--car-angle': `${position.angle}deg`,
              '--car-color': worker.color,
              '--avatar-x': '50%',
              '--avatar-y': '50%',
            } as CSSProperties;

            return (
              <div
                className="car-token"
                style={style}
                key={worker.id}
                aria-label={`${worker.name}，${displayPercent(worker)}%`}
              >
                <img className="car-shell" src={racecarImage} alt="" />
                <Avatar
                  worker={worker}
                  imageUrl={avatarUrls[worker.id]}
                  className="car-avatar"
                />
              </div>
            );
          })}

          <div className="stage-note">
            <Settings2 size={16} aria-hidden="true" />
            固定赛道 · 固定随机种子 · 本地模拟
          </div>
        </section>
      ) : (
        <section className="neutral-panel" aria-labelledby="neutral-title">
          <div className="neutral-heading">
            <div>
              <p className="mobile-view-label">
                <Smartphone size={17} aria-hidden="true" />
                老板手机默认视图
              </p>
              <h2 id="neutral-title">早班进度</h2>
            </div>
            <p>按工位排列，不按完成率排序</p>
          </div>

          <div className="worker-list">
            {neutralList.map((worker) => {
              const percent = displayPercent(worker);
              const status = percent >= 90 ? '接近完成' : percent >= 60 ? '按计划' : '进行中';
              return (
                <article className="worker-row" key={worker.id}>
                  <Avatar worker={worker} imageUrl={avatarUrls[worker.id]} />
                  <div className="worker-name">
                    <strong>{worker.name}</strong>
                    <span>工位 {worker.station}</span>
                  </div>
                  <div className="worker-output">
                    <strong className="number-font">{worker.qualified}</strong>
                    <span>合格件</span>
                  </div>
                  <div className="worker-progress">
                    <div className="progress-label">
                      <span>{status}</span>
                      <strong className="number-font">{percent}%</strong>
                    </div>
                    <div className="progress-rail" aria-hidden="true">
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <dialog className="settings-dialog" ref={avatarDialogRef}>
        <div className="dialog-heading">
          <div>
            <p>本地头像</p>
            <h2>替换赛车头像</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => avatarDialogRef.current?.close()}
            aria-label="关闭头像设置"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="dialog-description">
          图片只保留在当前浏览器中，不会上传；刷新页面即恢复内置头像。
        </p>
        <div className="avatar-settings-list">
          {workers.map((worker) => (
            <div className="avatar-settings-row" key={worker.id}>
              <Avatar worker={worker} imageUrl={avatarUrls[worker.id]} />
              <span>
                <strong>{worker.name}</strong>
                <small>工位 {worker.station}</small>
              </span>
              <label className="upload-button" htmlFor={`avatar-${worker.id}`}>
                <Upload size={16} aria-hidden="true" />
                替换
              </label>
              <input
                className="sr-only"
                id={`avatar-${worker.id}`}
                type="file"
                accept="image/*"
                onChange={(event) => updateAvatar(worker.id, event)}
              />
              <button
                className="restore-button"
                type="button"
                onClick={() => restoreAvatar(worker.id)}
                disabled={!avatarUrls[worker.id]}
              >
                恢复
              </button>
            </div>
          ))}
        </div>
      </dialog>

      <dialog className="formula-dialog" ref={formulaDialogRef}>
        <div className="dialog-heading">
          <div>
            <p>进度口径</p>
            <h2>不同工序，先换成可解释的工作量</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => formulaDialogRef.current?.close()}
            aria-label="关闭口径说明"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="formula-card number-font">
          赛车进度 = 合格件数 × 标准工时 × 工序系数 ÷ 当班计划工作量
        </div>
        <div className="formula-grid">
          <article>
            <span className="formula-step">AI 建议</span>
            <h3>根据历史节拍给出初始口径</h3>
            <p>参考相同产品、设备和工序的近期数据，建议标准工时与工序系数。</p>
          </article>
          <article>
            <span className="formula-step">管理员确认</span>
            <h3>看得见依据，也能人工覆盖</h3>
            <p>异常订单或工艺变化时可以调整，并留下覆盖原因。</p>
          </article>
        </div>
        <p className="formula-footnote">
          这是候选人的产品方案，用来减少不同工序直接比较原始件数造成的偏差，并非黑湖现有功能说明。
        </p>
      </dialog>
    </main>
  );
}
