import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, queryClient } from './lib/web3';
import { useGoblinSession } from './hooks/useGoblinSession';
import { Navbar } from './components/Navbar';
import { WalletModal } from './components/WalletModal';
import { FeedbackModal } from './components/FeedbackModal';
import { Home } from './pages/Home';
import { Cave } from './pages/Cave';
import { ComputePage } from './pages/ComputePage';
import { Docs } from './pages/Docs';

function MainAppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);

  const {
    sessionId,
    isActivated,
    computeCredits,
    taskHistory,
    activityLogs,
    isSigning,
    isCorrectNetwork,
    formattedBalance,
    activateGoblin,
    deductCredits,
    addTaskToHistory,
    addActivity,
  } = useGoblinSession();

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050805] text-[#60FF70] flex flex-col items-center justify-start p-2 sm:p-4 crt-overlay font-mono">
      {/* Outer Retro CRT Terminal Container Frame matching visual reference image */}
      <div className="w-full max-w-7xl border border-[#60FF70] bg-[#050805] rounded-xs shadow-[0_0_25px_rgba(96,255,112,0.15)] flex flex-col min-h-[calc(100vh-2rem)] overflow-hidden justify-between">
        <div className="flex flex-col flex-1">
          {/* Navigation Bar */}
          <Navbar
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
          />

          {/* Page Content Rendering */}
          <main className="flex-1 flex flex-col">
            {currentRoute === '/' && (
              <Home
                onNavigate={handleNavigate}
                computeCredits={computeCredits}
                formattedBalance={formattedBalance}
                isCorrectNetwork={isCorrectNetwork}
                activityLogs={activityLogs}
              />
            )}

            {currentRoute === '/cave' && (
              <Cave
                sessionId={sessionId}
                isActivated={isActivated}
                computeCredits={computeCredits}
                activityLogs={activityLogs}
                isSigning={isSigning}
                isCorrectNetwork={isCorrectNetwork}
                formattedBalance={formattedBalance}
                activateGoblin={activateGoblin}
                onOpenWalletModal={() => setIsWalletModalOpen(true)}
                onNavigate={handleNavigate}
              />
            )}

            {currentRoute === '/compute' && (
              <ComputePage
                sessionId={sessionId}
                isActivated={isActivated}
                computeCredits={computeCredits}
                taskHistory={taskHistory}
                deductCredits={deductCredits}
                addTaskToHistory={addTaskToHistory}
                addActivity={addActivity}
                onNavigate={handleNavigate}
                onOpenWalletModal={() => setIsWalletModalOpen(true)}
              />
            )}

            {currentRoute === '/docs' && (
              <Docs onNavigate={handleNavigate} />
            )}

            {currentRoute === '/npcs' && (
              <div className="p-8 text-center space-y-4 my-auto">
                <div className="text-xl font-bold font-pixel text-[#60FF70]">
                  &gt; MODULE INITIALIZING...
                </div>
                <p className="text-xs text-[#688D6C]">
                  NPC worker swarms are being routed to Cave Treasury.
                </p>
                <button
                  onClick={() => handleNavigate('/cave')}
                  className="text-xs border border-[#60FF70] px-4 py-2 text-[#60FF70] hover:bg-[#60FF70]/10 cursor-pointer"
                >
                  [ RETURN TO CAVE ]
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Tester Feedback Footer Bar */}
        <footer className="border-t border-[#60FF70]/30 p-2.5 bg-[#050805] flex justify-between items-center text-[10px] text-[#688D6C]">
          <div>// EARLY ACCESS // BUILD 0.2.0</div>
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="text-[#60FF70] hover:underline hover:text-white font-bold cursor-pointer"
          >
            [ SEND FEEDBACK ]
          </button>
        </footer>
      </div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* Tester Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MainAppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
