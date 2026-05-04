import { trackAppOpen } from "@/services/storage";
import { useAuthStore } from "@/store/authStore";
import { useCourseStore } from "@/store/courseStore";
import { checkAndScheduleInactivityReminder, requestNotificationPermissions } from "@/utils/notifications";
import { useEffect, useState } from "react";

export function useAppInit(): { isReady: boolean } {
  const [isReady, setIsReady] = useState(false);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const loadPersistedData = useCourseStore((s) => s.loadPersistedData);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          restoreSession(),
          loadPersistedData(),
          requestNotificationPermissions(),
          checkAndScheduleInactivityReminder(),
        ]);
        await trackAppOpen();
      } catch {
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, [restoreSession, loadPersistedData]);

  return { isReady };
}
