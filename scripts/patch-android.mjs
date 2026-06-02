/**
 * Patches Capacitor Android project: boot receiver, cleartext LAN, launcher prefs bridge
 * Run after: npx cap add android && npx cap sync android
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const androidRoot = join(root, "android");
const manifestPath = join(
  androidRoot,
  "app/src/main/AndroidManifest.xml"
);
const javaDest = join(
  androidRoot,
  "app/src/main/java/com/prism/finance/BootReceiver.java"
);

if (!existsSync(manifestPath)) {
  console.log("Android project not found — skip patch (run cap add android first)");
  process.exit(0);
}

mkdirSync(dirname(javaDest), { recursive: true });
copyFileSync(join(root, "android-boot/BootReceiver.java"), javaDest);

let manifest = readFileSync(manifestPath, "utf8");

if (!manifest.includes("RECEIVE_BOOT_COMPLETED")) {
  manifest = manifest.replace(
    "<application",
    `<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />\n    <application`
  );
}

if (!manifest.includes("BootReceiver")) {
  manifest = manifest.replace(
    "</application>",
    `        <receiver
            android:name=".BootReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>
    </application>`
  );
}

if (!manifest.includes("usesCleartextTraffic")) {
  manifest = manifest.replace(
    "<application",
    '<application android:usesCleartextTraffic="true"'
  );
}

writeFileSync(manifestPath, manifest);
console.log("Android patched: boot receiver + LAN cleartext");
