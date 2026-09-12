import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

type StepChoice = 1 | 5 | 10 | 'custom';
type Feedback = {
  action: 'recorded' | 'undone';
  amount: number;
};

const INITIAL_PROGRESS = 126;
const TARGET_PROGRESS = 200;
const WORK_ORDER = 'WO-018';
const PRODUCT = '铝合金阀体 A17';
const OPERATION = '精车 · OP20';
const DEFAULT_CUSTOM_STEP = '20';

const formatAmount = (amount: number) => `+${amount}`;

const parseCustomStep = (value: string): number | null => {
  if (!/^\d{1,3}$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return parsed >= 1 && parsed <= 999 ? parsed : null;
};

const describeChoice = (choice: StepChoice, customStep: string): string => {
  if (choice === 'custom') {
    const parsedCustomStep = parseCustomStep(customStep);
    return parsedCustomStep === null ? '自定义' : formatAmount(parsedCustomStep);
  }

  return formatAmount(choice);
};

export default function QuickReportApp() {
  const [progress, setProgress] = useState(INITIAL_PROGRESS);
  const [stepChoice, setStepChoice] = useState<StepChoice>(5);
  const [customStep, setCustomStep] = useState(DEFAULT_CUSTOM_STEP);
  const [undoStack, setUndoStack] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pulseId, setPulseId] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftChoice, setDraftChoice] = useState<StepChoice>(5);
  const [draftCustomStep, setDraftCustomStep] =
    useState(DEFAULT_CUSTOM_STEP);
  const [customStepError, setCustomStepError] = useState<string | null>(null);

  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const settingsCloseRef = useRef<HTMLButtonElement>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  const activeStep =
    stepChoice === 'custom'
      ? (parseCustomStep(customStep) ?? 1)
      : stepChoice;
  const isComplete = progress >= TARGET_PROGRESS;
  const lastRecordedAmount = undoStack.at(-1);

  useEffect(() => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    if (feedback === null) {
      feedbackTimerRef.current = null;
      return;
    }

    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback(null);
      feedbackTimerRef.current = null;
    }, 4500);

    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, [feedback]);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    settingsCloseRef.current?.focus();

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSettings();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [settingsOpen]);

  const closeSettings = () => {
    setSettingsOpen(false);
    window.setTimeout(() => settingsTriggerRef.current?.focus(), 0);
  };

  const openSettings = () => {
    setDraftChoice(stepChoice);
    setDraftCustomStep(customStep);
    setCustomStepError(null);
    setSettingsOpen(true);
  };

  const handleReport = () => {
    if (isComplete) {
      return;
    }

    const amount = Math.min(activeStep, TARGET_PROGRESS - progress);
    if (amount <= 0) {
      return;
    }

    setProgress((currentProgress) => currentProgress + amount);
    setUndoStack((currentStack) => [...currentStack, amount]);
    setFeedback({ action: 'recorded', amount });
    setPulseId((currentPulseId) => currentPulseId + 1);

    if ('vibrate' in navigator) {
      navigator.vibrate?.(10);
    }
  };

  const handleUndo = () => {
    const lastAmount = undoStack.at(-1);
    if (lastAmount === undefined) {
      return;
    }

    setProgress((currentProgress) => currentProgress - lastAmount);
    setUndoStack((currentStack) => currentStack.slice(0, -1));
    setFeedback({ action: 'undone', amount: lastAmount });
  };

  const handleDraftChoiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === 'custom') {
      setDraftChoice('custom');
    } else if (value === '1' || value === '5' || value === '10') {
      setDraftChoice(Number(value) as 1 | 5 | 10);
    }

    setCustomStepError(null);
  };

  const handleCustomStepChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftCustomStep(event.target.value);
    setCustomStepError(null);
  };

  const handleSettingsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (draftChoice === 'custom') {
      const parsedCustomStep = parseCustomStep(draftCustomStep);
      if (parsedCustomStep === null) {
        setCustomStepError('请输入 1–999 的整数。');
        return;
      }
    }

    setStepChoice(draftChoice);
    setCustomStep(draftCustomStep);
    closeSettings();
  };

  const handleSettingsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled])',
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (!firstFocusable || !lastFocusable) {
      return;
    }

    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  };

  const handleOverlayMouseDown = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget) {
      closeSettings();
    }
  };

  const renderFeedback = () => {
    if (feedback?.action === 'recorded') {
      return (
        <>
          <span>
            已记录 {formatAmount(feedback.amount)} ·{' '}
          </span>
          <button
            className="inline-undo"
            type="button"
            onClick={handleUndo}
            aria-label={`撤销本次记录 ${formatAmount(feedback.amount)}`}
            disabled={lastRecordedAmount === undefined}
          >
            撤销
          </button>
        </>
      );
    }

    if (feedback?.action === 'undone') {
      return (
        <>
          <span>
            已撤销 {formatAmount(feedback.amount)} ·{' '}
          </span>
          <button
            className="inline-undo"
            type="button"
            onClick={handleUndo}
            aria-label={
              lastRecordedAmount === undefined
                ? '暂无可撤销的记录'
                : `撤销上一笔记录 ${formatAmount(lastRecordedAmount)}`
            }
            disabled={lastRecordedAmount === undefined}
          >
            撤销上一笔
          </button>
        </>
      );
    }

    if (lastRecordedAmount !== undefined) {
      return (
        <>
          <span>
            最近已记录 {formatAmount(lastRecordedAmount)} ·{' '}
          </span>
          <button
            className="inline-undo"
            type="button"
            onClick={handleUndo}
            aria-label={`撤销最近记录 ${formatAmount(lastRecordedAmount)}`}
            disabled={lastRecordedAmount === undefined}
          >
            撤销
          </button>
        </>
      );
    }

    return (
      <>
        <span className="feedback-placeholder">每次点击后都可以撤销最近一笔</span>
        <button
          className="inline-undo"
          type="button"
          onClick={handleUndo}
          disabled
          aria-label="暂无可撤销的记录"
        >
          撤销
        </button>
      </>
    );
  };

  const feedbackContent = renderFeedback();
  const hasFeedback = feedback !== null || lastRecordedAmount !== undefined;

  return (
    <div className="quick-report-page">
      <header className="app-header">
        <a className="back-link" href="../">
          <span aria-hidden="true">←</span> 项目说明
        </a>
        <div className="ai-status" aria-label="AI 已准备，工单 WO-018，建议加五">
          <span className="status-dot" aria-hidden="true" />
          <span>AI 已准备 · {WORK_ORDER} · 建议 +5</span>
        </div>
      </header>

      <main className="quick-report-main">
        <section className="task-context" aria-labelledby="page-title">
          <p className="eyebrow">当前工单</p>
          <h1 id="page-title">智能快捷报工</h1>
          <div className="task-heading">
            <span className="work-order">{WORK_ORDER}</span>
            <span className="task-divider" aria-hidden="true" />
            <span>{PRODUCT}</span>
          </div>
          <p className="operation-label">
            工序 <strong>{OPERATION}</strong>
          </p>

          <div className="progress-card" aria-label={`当前进度 ${progress} / ${TARGET_PROGRESS}`}>
            <div className="progress-card__label">
              <span>本工序进度</span>
              <span className="progress-card__target">计划 {TARGET_PROGRESS}</span>
            </div>
            <div className="progress-value-row">
              <span className="progress-value" key={pulseId} aria-live="polite">
                {progress}
              </span>
              <span className="progress-target"> / {TARGET_PROGRESS}</span>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span
                className="progress-track__fill"
                style={{ width: `${(progress / TARGET_PROGRESS) * 100}%` }}
              />
            </div>
          </div>
        </section>

        <section className="report-action" aria-labelledby="report-action-title">
          <div className="action-heading">
            <div>
              <p className="eyebrow">现场记录</p>
              <h2 id="report-action-title">完成一批就点一下</h2>
            </div>
            <button
              className="settings-trigger"
              type="button"
              onClick={openSettings}
              ref={settingsTriggerRef}
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
            >
              <span className="settings-trigger__label">步长</span>
              <strong>{describeChoice(stepChoice, customStep)}</strong>
              <span className="settings-trigger__chevron" aria-hidden="true">⌄</span>
            </button>
          </div>

          <div className="report-stage">
            <button
              className={`report-button${isComplete ? ' is-complete' : ''}`}
              type="button"
              onClick={handleReport}
              disabled={isComplete}
              aria-describedby="report-hint"
            >
              {pulseId > 0 && (
                <span className="report-button__ripple" key={pulseId} aria-hidden="true" />
              )}
              <span className="report-button__halo" aria-hidden="true" />
              <span className="report-button__content" key={pulseId}>
                <span className="report-button__plus">{isComplete ? '已完成' : formatAmount(activeStep)}</span>
                <span className="report-button__caption">
                  {isComplete ? '本工单已完成' : '立即记一批'}
                </span>
              </span>
            </button>
          </div>

          <p id="report-hint" className="report-hint">
            {isComplete
              ? '本工单已完成 · 200 / 200'
              : `点击即入账当前步长 ${formatAmount(activeStep)}`}
          </p>

          <div className={`feedback-row${hasFeedback ? ' has-feedback' : ''}`} role="status" aria-live="polite">
            {feedbackContent}
          </div>

          <details className="why-step">
            <summary>为何是 +5？</summary>
            <p>
              依据当前工序的包装批量与本班近期节拍预设；管理员可改回固定规则。
            </p>
          </details>
        </section>
      </main>

      <footer className="page-footer">
        <span>只在本页记录，刷新后恢复演示初始值</span>
      </footer>

      {settingsOpen && (
        <div className="settings-overlay" onMouseDown={handleOverlayMouseDown}>
          <div
            className="settings-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onKeyDown={handleSettingsKeyDown}
          >
            <div className="settings-panel__header">
              <div>
                <p className="eyebrow">管理员预设</p>
                <h2 id="settings-title">调整报工步长</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={closeSettings}
                ref={settingsCloseRef}
                aria-label="关闭步长设置"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit}>
              <fieldset className="step-options">
                <legend>每次点击记录</legend>
                {[1, 5, 10].map((step) => (
                  <label className="step-option" key={step}>
                    <input
                      type="radio"
                      name="report-step"
                      value={step}
                      checked={draftChoice === step}
                      onChange={handleDraftChoiceChange}
                    />
                    <span>{formatAmount(step)}</span>
                  </label>
                ))}
                <label className="step-option step-option--custom">
                  <input
                    type="radio"
                    name="report-step"
                    value="custom"
                    checked={draftChoice === 'custom'}
                    onChange={handleDraftChoiceChange}
                  />
                  <span>自定义</span>
                  <input
                    className="custom-step-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    minLength={1}
                    maxLength={3}
                    value={draftCustomStep}
                    onChange={handleCustomStepChange}
                    onFocus={() => setDraftChoice('custom')}
                    aria-label="自定义步长，1 至 999 的整数"
                    aria-invalid={customStepError !== null}
                    aria-describedby={customStepError ? 'custom-step-error' : undefined}
                  />
                </label>
              </fieldset>
              <p className="settings-note">请输入 1–999 的整数；切换步长不会影响已记录的撤销顺序。</p>
              {customStepError && (
                <p className="field-error" id="custom-step-error" role="alert">
                  {customStepError}
                </p>
              )}
              <div className="settings-actions">
                <button className="secondary-button" type="button" onClick={closeSettings}>
                  取消
                </button>
                <button className="primary-button" type="submit">
                  保存步长
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
