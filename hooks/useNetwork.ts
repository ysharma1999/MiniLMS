import * as Network from "expo-network";
import { useCallback, useEffect, useState } from "react";

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export function useNetwork(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: "unknown",
  });

  const checkNetwork = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type ?? "unknown",
      });
    } catch {
      setNetworkState({
        isConnected: false,
        isInternetReachable: false,
        type: "unknown",
      });
    }
  }, []);

  useEffect(() => {
    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);
    return () => clearInterval(interval);
  }, [checkNetwork]);

  return networkState;
}
