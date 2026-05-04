import { AppStorage } from "@/services/storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform, LogBox } from "react-native";

// Ignore Expo Go specific remote push notification error since we only use local notifications
LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
  "`expo-notifications` functionality is not fully supported in Expo Go",
]);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn("Notifications only work on physical devices.");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6366F1",
    });

    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Course Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#F59E0B",
    });
  }

  return true;
}

export async function scheduleBookmarkMilestoneNotification(
  bookmarkCount: number
): Promise<void> {
  if (bookmarkCount < 5) return;

  const key = `notification_milestone_${Math.floor(bookmarkCount / 5) * 5}`;
  const alreadySent = await AppStorage.get(key);
  if (alreadySent) return;

  await AppStorage.set(key, "sent");

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎉 Learning Enthusiast!",
      body: `You've bookmarked ${bookmarkCount} courses! Time to start learning? Open a course and begin your journey.`,
      data: { type: "bookmark" },
      sound: true,
    },
    trigger: null,
  });
}

export async function checkAndScheduleInactivityReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📚 Missing your courses?",
      body: "You haven't checked in today! Your bookmarked courses are waiting for you.",
      data: { type: "reminder" },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 24 * 60 * 60,
    },
  });
}

export async function scheduleDailyReminder(): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎓 Daily Learning Goal",
      body: "Don't forget to learn something new today! Your courses are waiting.",
      data: { type: "daily_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });
  return id;
}

export async function sendEnrollmentNotification(
  courseTitle: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "✅ Enrollment Confirmed!",
      body: `You're enrolled in "${courseTitle}". Let's start learning!`,
      data: { type: "enrollment" },
      sound: true,
    },
    trigger: null,
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getNotificationStatus(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  return { granted: status === "granted", canAskAgain };
}
