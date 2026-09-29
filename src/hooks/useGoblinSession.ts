import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useSignMessage, useChainId, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { ROBINHOOD_CHAIN_ID } from '../config/chains';

export interface ActivityItem {
  id: string;
  type: string;
  detail: string;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  timestamp: string;
  promptPreview: string;
  fullPrompt: string;
  response: string;
  creditsUsed: number;
  status: 'COMPLETE' | 'FAILED';
  sessionId: string;
}


export function useGoblinSession() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({ address });
  const { signMessageAsync, isPending: isSigning } = useSignMessage();

  // References to prevent duplicate logs on re-renders
  const loggedWalletRef = useRef<string | null>(null);
  const loggedChainRef = useRef<number | null>(null);
  const loggedBalanceRef = useRef<string | null>(null);

  const getStorageKeys = useCallback((addr?: string) => {
    const suffix = addr ? addr.toLowerCase() : 'guest';
    return {
      storageKey: `goblin_compute_session_${suffix}`,
      tasksKey: `goblin_compute_tasks_${suffix}`,
    };
  }, []);

  const [sessionId, setSessionId] = useState<string>(`GC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [computeCredits, setComputeCredits] = useState<number>(0);
  const [taskHistory, setTaskHistory] = useState<TaskItem[]>([]);

  // Reload session when connected wallet changes
  useEffect(() => {
    const { storageKey, tasksKey } = getStorageKeys(address);
    
    // Load session
    const savedSession = localStorage.getItem(storageKey);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.sessionId) setSessionId(parsed.sessionId);
        setIsActivated(!!parsed.isActivated);
        if (typeof parsed.computeCredits === 'number') {
          setComputeCredits(parsed.computeCredits);
        }
      } catch {}
    } else {
      setSessionId(`GC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
      setIsActivated(false);
      setComputeCredits(0);
    }

    // Load task history
    const savedTasks = localStorage.getItem(tasksKey);
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) setTaskHistory(parsed);
      } catch {
        setTaskHistory([]);
      }
    } else {
      setTaskHistory([]);
    }
  }, [address, getStorageKeys]);

  const [activityLogs, setActivityLogs] = useState<ActivityItem[]>([
    { id: '1', type: '> SYSTEM READY', detail: 'EARLY ACCESS', timestamp: '12:00' },
    { id: '2', type: '> WAITING FOR WALLET', detail: 'LISTENING...', timestamp: '12:00' },
  ]);

  // Persist session state for active address
  useEffect(() => {
    const { storageKey } = getStorageKeys(address);
    localStorage.setItem(storageKey, JSON.stringify({
      sessionId,
      isActivated,
      computeCredits,
    }));
  }, [address, sessionId, isActivated, computeCredits, getStorageKeys]);

  // Persist task history for active address
  useEffect(() => {
    const { tasksKey } = getStorageKeys(address);
    localStorage.setItem(tasksKey, JSON.stringify(taskHistory));
  }, [address, taskHistory, getStorageKeys]);

  const addActivity = useCallback((type: string, detail: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const newItem: ActivityItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      type,
      detail,
      timestamp: time,
    };
    setActivityLogs((prev) => [newItem, ...prev.slice(0, 15)]);
  }, []);

  // Real Wallet Connection Logger
  useEffect(() => {
    if (isConnected && address) {
      if (loggedWalletRef.current !== address) {
        loggedWalletRef.current = address;
        const shortAddr = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        addActivity('> WALLET CONNECTED', shortAddr);
      }
    } else if (!isConnected) {
      if (loggedWalletRef.current !== null) {
        loggedWalletRef.current = null;
        loggedChainRef.current = null;
        loggedBalanceRef.current = null;
        addActivity('> WALLET DISCONNECTED', 'SESSION RESET');
      }
    }
  }, [isConnected, address, addActivity]);

  // Real Network Detection Logger
  useEffect(() => {
    if (isConnected && chainId) {
      if (loggedChainRef.current !== chainId) {
        loggedChainRef.current = chainId;
        if (chainId === ROBINHOOD_CHAIN_ID) {
          addActivity('> NETWORK VERIFIED', 'ROBINHOOD 4663');
        } else {
          addActivity('> WRONG NETWORK', `CHAIN ${chainId}`);
        }
      }
    }
  }, [chainId, isConnected, addActivity]);

  // Real Balance Logger
  useEffect(() => {
    if (isConnected && balanceData) {
      const formatted = `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} ${balanceData.symbol}`;
      if (loggedBalanceRef.current !== formatted) {
        loggedBalanceRef.current = formatted;
        addActivity('> BALANCE READ', formatted);
      }
    }
  }, [balanceData, isConnected, addActivity]);

  // Real Wallet Signature Interaction
  const activateGoblin = async (isHolder: boolean, allowance: number): Promise<boolean> => {
    if (!isConnected) {
      addActivity('> ERROR', 'WALLET NOT CONNECTED');
      throw new Error('Wallet not connected');
    }

    if (!isHolder) {
      addActivity('> ERROR', 'HOLDER VERIFICATION REQUIRED');
      throw new Error('Holder verification required to activate session');
    }

    try {
      addActivity('> SIGNATURE REQUESTED', 'Goblin Activation');
      const signature = await signMessageAsync({
        message: 'Goblin Compute Activation',
      });

      if (signature) {
        setIsActivated(true);
        setComputeCredits((prev) => (prev === 0 ? allowance : prev));
        addActivity('> SIGNATURE VERIFIED', 'EIP-191 OK');
        addActivity('> GOBLIN SESSION ACTIVE', sessionId);
        addActivity(`> +${allowance} COMPUTE CREDITS`, 'AWARDED');
        return true;
      }
    } catch (err: unknown) {
      const isReject = err instanceof Error && (err.message.includes('user rejected') || err.message.includes('User denied'));
      const errorMsg = isReject ? 'SIGNATURE CANCELLED' : 'SIGNATURE FAILED';
      addActivity(`> ${errorMsg}`, 'USER REJECTED');
      throw err;
    }
    return false;
  };

  const deductCredits = useCallback((amount: number) => {
    setComputeCredits((prev) => Math.max(0, prev - amount));
  }, []);

  const addTaskToHistory = useCallback((task: TaskItem) => {
    setTaskHistory((prev) => [task, ...prev.slice(0, 19)]);
  }, []);

  const isCorrectNetwork = chainId === ROBINHOOD_CHAIN_ID;
  const formattedBalance = balanceData
    ? `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} ${balanceData.symbol}`
    : '0.0000 ETH';

  return {
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
  };
}
