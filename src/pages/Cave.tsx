import React, { useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { ROBINHOOD_CHAIN_ID } from '../config/chains';
import { TerminalWindow } from '../components/TerminalWindow';
import { TerminalButton } from '../components/TerminalButton';
import { ActivityLog } from '../components/ActivityLog';
import { useHolderStatus } from '../hooks/useHolderStatus';
import type { ActivityItem } from '../hooks/useGoblinSession';

interface CaveProps {
  sessionId: string;
  isActivated: boolean;
  computeCredits: number;
  activityLogs: ActivityItem[];
  isSigning: boolean;
  isCorrectNetwork: boolean;
  formattedBalance: string;
  activateGoblin: (isHolder: boolean, allowance: number) => Promise<boolean>;
  onOpenWalletModal: () => void;
  onNavigate: (route: string) => void;
}

export const Cave: React.FC<CaveProps> = ({
  sessionId,
  isActivated,
  computeCredits,
  activityLogs,
  isSigning,
  isCorrectNetwork,
  formattedBalance,
  activateGoblin,
  onOpenWalletModal,
  onNavigate,
}) => {
  const { address, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const holderStatus = useHolderStatus();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleActivate = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isConnected) {
      onOpenWalletModal();
      return;
    }

    if (!isCorrectNetwork) {
      switchChain({ chainId: ROBINHOOD_CHAIN_ID });
      return;
    }

    if (!holderStatus.isHolder) {
      setErrorMsg('ACCESS DENIED > HOLDER VERIFICATION REQUIRED');
      return;
    }

    try {
      const success = await activateGoblin(holderStatus.isHolder, holderStatus.allowance);
      if (success) {
        setSuccessMsg(`SIGNATURE VERIFIED > GOBLIN_001 ACTIVATED (+${holderStatus.allowance} COMPUTE CREDITS)`);
      }
    } catch (err: unknown) {
      const isUserCancel = err instanceof Error && (err.message.includes('rejected') || err.message.includes('denied'));
      setErrorMsg(isUserCancel ? 'SIGNATURE CANCELLED BY USER' : 'SIGNATURE FAILED');
    }
  };

  // Determine current state text
  const getStatusText = () => {
    if (!isConnected) return 'SLEEPING';
    if (!isCorrectNetwork) return 'WRONG NETWORK';
    if (!holderStatus.isHolder) return 'NOT AUTHORIZED';
    if (isActivated) return 'ACTIVE';
    return 'READY';
  };

  return (
    <div className="w-full min-h-[calc(100vh-65px)] p-4 md:p-8 font-mono select-none space-y-6">
      {/* Title Bar */}
      <div className="border border-[#60FF70]/50 p-3 bg-[#050805] flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#60FF70] uppercase">
          <span>&gt; CAVE TERMINAL</span>
          <span className="text-[#688D6C]">// SESSION MANAGEMENT</span>
        </div>
        <div className="text-xs text-[#60FF70]">
          SESSION: <span className="font-bold">{isConnected ? sessionId : 'NOT CREATED'}</span>
        </div>
      </div>

      {/* Main 3-Column Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT PANEL: GOBLIN PROFILE */}
        <TerminalWindow title="GOBLIN PROFILE">
          <div className="space-y-4 pt-2">
            <div className="flex justify-center py-3 bg-[#123B17]/30 border border-[#60FF70]/30">
              <div className="text-center space-y-1">
                <div className="text-xl font-pixel text-[#60FF70]">
                  GOBLIN_001
                </div>
                <div className="text-[10px] text-[#688D6C]">COMPUTE MINER #01</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#60FF70]/20 pb-1.5">
                <span className="text-[#688D6C]">STATUS</span>
                <span className={
                  !isConnected ? "text-[#688D6C]" :
                  !isCorrectNetwork ? "text-amber-400 font-bold" :
                  !holderStatus.isHolder ? "text-red-400 font-bold" :
                  isActivated ? "text-[#60FF70] font-bold" : "text-[#60FF70]"
                }>
                  [ {getStatusText()} ]
                </span>
              </div>

              <div className="flex justify-between border-b border-[#60FF70]/20 pb-1.5">
                <span className="text-[#688D6C]">WALLET VERIFIED</span>
                <span className={isConnected && isCorrectNetwork ? "text-[#60FF70] font-bold" : "text-[#688D6C]"}>
                  {isConnected && isCorrectNetwork ? 'YES' : 'NO'}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#60FF70]/20 pb-1.5">
                <span className="text-[#688D6C]">COMPUTE CREDITS</span>
                <span className="text-[#60FF70] font-bold">
                  {computeCredits} CR
                </span>
              </div>

              <div className="flex justify-between pb-1">
                <span className="text-[#688D6C]">SESSION ID</span>
                <span className="text-[#60FF70] font-mono text-[11px] truncate max-w-[120px]">
                  {isConnected ? sessionId : 'PENDING'}
                </span>
              </div>
            </div>

            {/* Holder Access Panel */}
            <div className="p-3 bg-[#123B17]/20 border border-[#60FF70]/30 space-y-1.5 text-xs">
              <div className="flex justify-between border-b border-[#60FF70]/20 pb-1">
                <span className="text-[#688D6C]">HOLDER ACCESS</span>
                <span className={
                  !isConnected ? "text-[#688D6C]" :
                  holderStatus.loading ? "text-amber-400" :
                  holderStatus.isHolder ? "text-[#60FF70] font-bold" : "text-red-400 font-bold"
                }>
                  [ {!isConnected ? 'NOT CONNECTED' : holderStatus.loading ? 'CHECKING...' : holderStatus.isHolder ? 'AUTHORIZED' : 'NOT AUTHORIZED'} ]
                </span>
              </div>
              {isConnected && holderStatus.isHolder && (
                <div className="text-[11px] text-[#60FF70] space-y-0.5 pt-0.5">
                  <div>&gt; HOLDER VERIFIED</div>
                  <div>&gt; COMPUTE ACCESS ENABLED</div>
                  <div>&gt; ALLOWANCE: {holderStatus.allowance} CR</div>
                </div>
              )}
              {isConnected && !holderStatus.isHolder && !holderStatus.loading && (
                <div className="text-[11px] text-red-400 space-y-0.5 pt-0.5">
                  <div>&gt; ACCESS DENIED</div>
                  <div>&gt; HOLDER REQUIRED</div>
                </div>
              )}
            </div>
          </div>
        </TerminalWindow>

        {/* CENTER PANEL: COMPUTE ENGINE */}
        <TerminalWindow title="COMPUTE ENGINE">
          <div className="space-y-4 pt-2">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#60FF70]/20 pb-1.5">
                <span className="text-[#688D6C]">NETWORK</span>
                <span className={isConnected ? (isCorrectNetwork ? "text-[#60FF70] font-bold" : "text-amber-400 font-bold") : "text-[#688D6C]"}>
                  {isConnected ? (isCorrectNetwork ? 'ROBINHOOD (4663)' : 'UNSUPPORTED') : 'UNKNOWN'}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#60FF70]/20 pb-1.5">
                <span className="text-[#688D6C]">WALLET</span>
                <span className={isConnected ? "text-[#60FF70] font-bold" : "text-[#688D6C]"}>
                  {isConnected && address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'NOT CONNECTED'}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#60FF70]/20 pb-1.5">
                <span className="text-[#688D6C]">NATIVE BALANCE</span>
                <span className="text-[#60FF70] font-bold">{isConnected ? formattedBalance : '0.0000 ETH'}</span>
              </div>

              <div className="flex justify-between border-b border-[#60FF70]/20 pb-1.5">
                <span className="text-[#688D6C]">POOL STATUS</span>
                <span className="text-[#60FF70] font-bold">ACTIVE</span>
              </div>

              <div className="flex justify-between pb-1">
                <span className="text-[#688D6C]">TREASURY</span>
                <span className="text-[#688D6C]">COMING SOON</span>
              </div>
            </div>

            {/* Verification Status Card */}
            <div className="p-3 bg-[#123B17]/20 border border-[#60FF70]/30 space-y-1 text-[11px]">
              <div className="text-[#60FF70] font-bold">&gt; CRYPTOGRAPHIC IDENTITY:</div>
              <div className="text-[#688D6C]">
                Signing "Goblin Compute Activation" verifies wallet ownership without gas fees to allocate Compute Credits.
              </div>
            </div>
          </div>
        </TerminalWindow>

        {/* RIGHT PANEL: ACTIVITY LOG */}
        <ActivityLog logs={activityLogs} />

      </div>

      {/* Messages Feedback */}
      {errorMsg && (
        <div className="p-3 border border-red-500 bg-red-950/40 text-red-400 text-xs font-mono">
          &gt; {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 border border-[#60FF70] bg-[#123B17]/50 text-[#60FF70] text-xs font-mono font-bold flex justify-between items-center">
          <span>&gt; {successMsg}</span>
          <button
            onClick={() => onNavigate('/compute')}
            className="bg-[#60FF70] text-black px-2 py-1 text-[11px] font-bold hover:bg-[#80FF8E]"
          >
            [ GO TO COMPUTE TERMINAL ]
          </button>
        </div>
      )}

      {/* BOTTOM ACTION CTA BAR - State Dependent */}
      <div className="border border-[#60FF70] p-6 bg-[#050805] box-glow flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="text-sm font-bold text-[#60FF70] tracking-wider uppercase flex items-center justify-center md:justify-start gap-2">
            <span>▶</span>
            <span>
              {!isConnected
                ? 'CONNECT WALLET TO START SESSION'
                : !isCorrectNetwork
                ? 'SWITCH TO ROBINHOOD CHAIN'
                : !holderStatus.isHolder
                ? 'HOLDER VERIFICATION REQUIRED'
                : !isActivated
                ? 'ACTIVATE GOBLIN MINER SESSION'
                : 'GOBLIN MINER SESSION IS ACTIVE'}
            </span>
          </div>
          <div className="text-xs text-[#688D6C]">
            {!isConnected
              ? 'Connect your Web3 wallet to verify network and start session.'
              : !isCorrectNetwork
              ? 'Switch your active chain to Robinhood Chain (ID: 4663).'
              : !holderStatus.isHolder
              ? 'Wallet is not authorized as a verified token holder. Compute access denied.'
              : !isActivated
              ? 'Sign message "Goblin Compute Activation" with your wallet.'
              : 'Use your active session to run AI inference tasks in the Compute Terminal.'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isConnected ? (
            <TerminalButton
              variant="primary"
              onClick={onOpenWalletModal}
            >
              [ CONNECT WALLET ]
            </TerminalButton>
          ) : !isCorrectNetwork ? (
            <TerminalButton
              variant="primary"
              onClick={() => switchChain({ chainId: ROBINHOOD_CHAIN_ID })}
            >
              [ SWITCH TO ROBINHOOD CHAIN ]
            </TerminalButton>
          ) : !holderStatus.isHolder ? (
            <TerminalButton
              variant="outline"
              disabled={true}
            >
              [ ACCESS DENIED ]
            </TerminalButton>
          ) : !isActivated ? (
            <TerminalButton
              variant="primary"
              disabled={isSigning}
              onClick={handleActivate}
            >
              {isSigning ? '[ SIGNING IN WALLET... ]' : '[ ACTIVATE GOBLIN ]'}
            </TerminalButton>
          ) : (
            <TerminalButton
              variant="primary"
              onClick={() => onNavigate('/compute')}
            >
              [ ENTER COMPUTE ]
            </TerminalButton>
          )}
        </div>
      </div>
    </div>
  );
};
