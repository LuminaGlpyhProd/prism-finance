package com.prism.finance;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

/** Launches Prism after boot if user enabled start-at-boot in app settings */
public class BootReceiver extends BroadcastReceiver {
  private static final String PREFS = "CapacitorStorage";
  private static final String KEY_START = "start_at_boot";

  @Override
  public void onReceive(Context context, Intent intent) {
    if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
      return;
    }
    SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    String start = prefs.getString(KEY_START, "true");
    if ("false".equals(start)) {
      return;
    }
    Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
    if (launch != null) {
      launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(launch);
    }
  }
}
