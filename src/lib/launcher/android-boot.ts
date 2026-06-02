/** Persists start-at-boot preference for native BootReceiver */
export async function setAndroidStartAtBoot(enabled: boolean): Promise<void> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.getPlatform() !== "android") return;

    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({
      key: "start_at_boot",
      value: enabled ? "true" : "false",
    });
  } catch {
    // Preferences plugin optional — BootReceiver defaults to true
  }
}
