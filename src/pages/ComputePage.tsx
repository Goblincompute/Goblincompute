import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { TerminalWindow } from '../components/TerminalWindow';
import { TerminalButton } from '../components/TerminalButton';
import { runGoblinInference } from '../services/ai';
import { useHolderStatus } from '../hooks/useHolderStatus';
import type { TaskItem } from '../hooks/useGoblinSession';

interface ComputePageProps {
  sessionId: string;
  isActivated: boolean;
  computeCredits: number;
  taskHistory: TaskItem[];
  deductCredits: (amount: number) => void;
  addTaskToHistory: (task: TaskItem) => void;
  addActivity: (type: string, detail: string) => void;
  onNavigate: (route: string) => void;
  onOpenWalletModal: () => void;
}

export const ComputePage: React.FC<ComputePageProps> = ({
  sessionId,
  isActivated,
  computeCredits,
  taskHistory,
  deductCredits,
  addTaskToHistory,
  addActivity,
  onNavigate,
  onOpenWalletModal,
}) => {
  const { isConnected } = useAccount();
  const holderStatus = useHolderStatus();
  const [prompt, setPrompt] = useState('');
  const [isInferring, setIsInferring] = useState(false);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalCreditsUsed = taskHistory.reduce((sum, t) => sum + t.creditsUsed, 0);
  const lastTaskPreview = taskHistory[0] ? taskHistory[0].promptPreview : 'NONE';

  const handleRunInference = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Prevent double requests
    if (isInferring) return;

    setErrorMessage(null);
    setCurrentResponse(null);

    if (!prompt.trim()) {
      setErrorMessage('TASK PROMPT CANNOT BE EMPTY');
      return;
    }

    if (!isConnected) {
      setErrorMessage('WALLET NOT CONNECTED');
      return;
    }

    if (!holderStatus.isHolder) {
      setErrorMessage('ACCESS DENIED: HOLDER VERIFICATION REQUIRED');
      return;
    }

    if (!isActivated) {
      setErrorMessage('GOBLIN NOT ACTIVE');
      return;
    }

    if (computeCredits < 2) {
      setErrorMessage('INSUFFICIENT COMPUTE CREDITS (2 CR REQUIRED)');
      return;
    }

    setIsInferring(true);
    setStatusLog(['> TASK RECEIVED', '> RUNNING INFERENCE...']);
    addActivity('> AI TASK RECEIVED', prompt.substring(0, 15) + '...');
    addActivity('> INFERENCE STARTED', 'NODE GOBLIN_001');

    try {
      const response = await runGoblinInference(prompt);

      if (response.success && response.result) {
        setStatusLog(['> TASK RECEIVED', '> RUNNING INFERENCE...', '> INFERENCE COMPLETE']);
        setCurrentResponse(response.result);

        // Deduct credits and update history only on success
        deductCredits(2);
        const remaining = computeCredits - 2;

        const newTask: TaskItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          promptPreview: prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt,
          fullPrompt: prompt,
          response: response.result,
          creditsUsed: 2,
          status: 'COMPLETE',
          sessionId,
        };

        addTaskToHistory(newTask);
        addActivity('> INFERENCE COMPLETE', '2 CR SPENT');
        addActivity('> -2 COMPUTE CREDITS', `${remaining} CR REMAINING`);
      } else {
        // Failure branch
        setStatusLog(['> TASK RECEIVED', '> RUNNING INFERENCE...', '> INFERENCE FAILED']);
        const err = response.error || 'AI SERVICE BUSY';
        setErrorMessage(err);
        addActivity('> INFERENCE FAILED', err.substring(0, 20));
      }
    } catch (err: unknown) {
      // Exception fallback branch
      setStatusLog(['> TASK RECEIVED', '> RUNNING INFERENCE...', '> INFERENCE FAILED']);
      const msg = err instanceof Error ? err.message : 'AI SERVICE UNAVAILABLE';
      setErrorMessage(msg);
      addActivity('> REQUEST FAILED', msg.substring(0, 20));
    } finally {
      // GUARANTEED: Always reset loading state so UI is never stuck
      setIsInferring(false);
    }
  };

  // Requirement #9: Empty States for non-connected or inactive sessions
  if (!isConnected) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] p-6 md:p-12 font-mono select-none flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto text-center my-auto">
        <div className="p-6 border border-[#60FF70] bg-[#050805] box-glow w-full space-y-4">
          <div className="text-lg font-pixel text-[#60FF70]">&gt; NO WALLET CONNECTED</div>
          <p className="text-xs text-[#688D6C]">
            Please connect your Web3 wallet to access the Compute Terminal and run AI tasks.
          </p>
          <div className="pt-2">
            <TerminalButton variant="primary" onClick={onOpenWalletModal}>
              [ CONNECT WALLET ]
            </TerminalButton>
          </div>
        </div>
      </div>
    );
  }

  // Holder Verification Access Protection
  if (!holderStatus.isHolder) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] p-6 md:p-12 font-mono select-none flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto text-center my-auto">
        <div className="p-6 border border-red-500 bg-[#050805] box-glow w-full space-y-4">
          <div className="text-lg font-pixel text-red-500">&gt; ACCESS DENIED</div>
          <div className="text-xs font-bold text-red-400 tracking-wider">&gt; GBLC HOLDER VERIFICATION REQUIRED</div>
          <p className="text-xs text-[#688D6C]">
            Goblin Compute access is restricted to verified GBLC token holders on Robinhood Chain Mainnet (4663).
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <TerminalButton variant="primary" onClick={() => onNavigate('/cave')}>
              [ RETURN TO CAVE ]
            </TerminalButton>
          </div>
        </div>
      </div>
    );
  }

  if (!isActivated) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] p-6 md:p-12 font-mono select-none flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto text-center my-auto">
        <div className="p-6 border border-[#60FF70] bg-[#050805] box-glow w-full space-y-4">
          <div className="text-lg font-pixel text-[#60FF70]">&gt; NO ACTIVE SESSION</div>
          <p className="text-xs text-[#688D6C]">
            Goblin_001 is currently sleeping. Please activate your session in the Cave to receive Compute Credits.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <TerminalButton variant="primary" onClick={() => onNavigate('/cave')}>
              [ RETURN TO CAVE ]
            </TerminalButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-65px)] p-4 md:p-8 font-mono select-none space-y-6 max-w-6xl mx-auto">
      {/* Title & Overview Bar */}
      <div className="border border-[#60FF70]/50 p-3 bg-[#050805] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#60FF70] uppercase">
          <span>&gt; COMPUTE TERMINAL</span>
          <span className="text-[#688D6C]">// NODE GOBLIN_001</span>
        </div>
        <div className="text-xs flex flex-wrap gap-4 text-[#60FF70]">
          <span>SESSION: <strong className="text-white">{sessionId}</strong></span>
          <span>CREDITS: <strong className="text-[#60FF70]">{computeCredits} CR</strong></span>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="border border-[#60FF70]/40 p-3 bg-[#123B17]/20">
          <div className="text-[#688D6C] text-[10px]">GOBLIN STATUS</div>
          <div className="text-[#60FF70] font-bold text-sm mt-0.5">[ ACTIVE ]</div>
        </div>

        <div className="border border-[#60FF70]/40 p-3 bg-[#123B17]/20">
          <div className="text-[#688D6C] text-[10px]">AVAILABLE CREDITS</div>
          <div className="text-[#60FF70] font-bold text-sm mt-0.5">{computeCredits} CR</div>
        </div>

        <div className="border border-[#60FF70]/40 p-3 bg-[#123B17]/20">
          <div className="text-[#688D6C] text-[10px]">TOTAL SPENT</div>
          <div className="text-[#688D6C] font-bold text-sm mt-0.5">{totalCreditsUsed} CR</div>
        </div>

        <div className="border border-[#60FF70]/40 p-3 bg-[#123B17]/20">
          <div className="text-[#688D6C] text-[10px]">LAST TASK</div>
          <div className="text-[#60FF70] truncate text-xs mt-0.5">{lastTaskPreview}</div>
        </div>
      </div>

      {/* MAIN ASK GOBLIN INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Inference Input Form (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <TerminalWindow title="ASK GOBLIN (RUN AI INFERENCE)">
            <form onSubmit={handleRunInference} className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-[#688D6C]">
                  <span>&gt; ENTER TASK PROMPT:</span>
                  <span className="text-[#60FF70] font-bold">COST: 2 CR</span>
                </div>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='> "Explain what gas fees are in simple terms."'
                  disabled={isInferring}
                  className="w-full bg-[#050805] border border-[#60FF70] p-3 text-[#60FF70] placeholder-[#688D6C]/60 text-xs font-mono focus:outline-none focus:shadow-[0_0_10px_rgba(96,255,112,0.3)] resize-none"
                />
              </div>

              {/* Terminal Status Stream Log */}
              {statusLog.length > 0 && (
                <div className="p-2.5 bg-[#123B17]/30 border border-[#60FF70]/40 text-[11px] space-y-1 font-mono">
                  {statusLog.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.includes('COMPLETE') ? "text-[#60FF70] font-bold" :
                        log.includes('FAILED') ? "text-red-400 font-bold" :
                        "text-[#60FF70]"
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 border border-red-500 bg-red-950/40 text-red-400 text-xs font-mono">
                  &gt; {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-[#688D6C]">
                  AVAILABLE: <strong className="text-[#60FF70]">{computeCredits} CR</strong>
                </span>

                <TerminalButton
                  variant="primary"
                  type="submit"
                  disabled={isInferring || computeCredits < 2}
                >
                  {isInferring ? '[ INFERRING... ]' : '[ RUN INFERENCE ]'}
                </TerminalButton>
              </div>
            </form>
          </TerminalWindow>

          {/* AI Response Display Window */}
          {currentResponse && (
            <TerminalWindow title="INFERENCE RESULT">
              <div className="p-3.5 bg-[#123B17]/30 border border-[#60FF70] text-xs text-[#A3FFB2] leading-relaxed space-y-2">
                <div className="text-[10px] text-[#688D6C] border-b border-[#60FF70]/30 pb-1 flex justify-between">
                  <span>RESPONSE FROM GOBLIN_001</span>
                  <span className="text-[#60FF70] font-bold">-2 CR DEDUCTED</span>
                </div>
                <div className="whitespace-pre-wrap font-mono pt-1">
                  {currentResponse}
                </div>
              </div>
            </TerminalWindow>
          )}
        </div>

        {/* Task History List (5 cols on lg) */}
        <div className="lg:col-span-5">
          <TerminalWindow title="RECENT TASKS">
            {taskHistory.length === 0 ? (
              <div className="py-8 text-center space-y-3 text-xs">
                <div className="text-[#688D6C]">&gt; NO TASKS YET</div>
                <p className="text-[11px] text-[#688D6C]">Run your first AI task above to spend Compute Credits.</p>
              </div>
            ) : (
              <div className="space-y-2 pt-1 max-h-[360px] overflow-y-auto pr-1">
                {taskHistory.slice(0, 5).map((t, idx) => (
                  <div key={t.id} className="p-2.5 border border-[#60FF70]/30 bg-[#123B17]/15 text-xs space-y-1 font-mono">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#688D6C] font-bold">0{idx + 1}. {t.timestamp}</span>
                      <span className="text-red-400 font-bold">-{t.creditsUsed} CR</span>
                    </div>
                    <div className="text-[#60FF70] font-bold truncate">
                      "{t.promptPreview}"
                    </div>
                    <div className="flex justify-between text-[10px] text-[#688D6C] pt-0.5">
                      <span>STATUS: {t.status}</span>
                      <span>SESS: {t.sessionId.substring(0, 8)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TerminalWindow>
        </div>

      </div>
    </div>
  );
};
