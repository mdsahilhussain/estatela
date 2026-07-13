import NetInfo, {
  NetInfoStateType,
  type NetInfoState,
} from "@react-native-community/netinfo";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type NetworkContextValue = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  isOnline: boolean;
  type: NetInfoState["type"];
  lastChangedAt: number | null;
};

const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined
);

function resolveIsOnline(state: Pick<NetInfoState, "isConnected" | "isInternetReachable">) {
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return state.isConnected === true;
}

export function NetworkProvider({ children }: PropsWithChildren) {
  const [networkState, setNetworkState] = useState<NetworkContextValue>({
    isConnected: null,
    isInternetReachable: null,
    isOnline: true,
    type: NetInfoStateType.unknown,
    lastChangedAt: null,
  });

  useEffect(() => {
    let mounted = true;

    const updateState = (state: NetInfoState) => {
      if (!mounted) return;

      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        isOnline: resolveIsOnline(state),
        type: state.type,
        lastChangedAt: Date.now(),
      });
    };

    NetInfo.fetch().then(updateState);
    const unsubscribe = NetInfo.addEventListener(updateState);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => networkState, [networkState]);

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetworkStatus() {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error("useNetworkStatus must be used within NetworkProvider");
  }

  return context;
}
