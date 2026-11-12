import definePlugin from "@utils/types";
import { findByProps } from "@webpack";
import { Logger } from "@utils/Logger";

// Wir suchen die Module jetzt über ihre einzigartigen Eigenschaften (findByProps)
const MediaEngineActions = findByProps("setEchoCancellation", "setNoiseSuppression") as any;
const MediaEngineStore = findByProps("getSettings", "isDeaf", "isMute") as any;
const ToastStore = findByProps("showToast", "createToast") as any;

let keydownHandler: (e: KeyboardEvent) => void;

export default definePlugin({
    name: "EchoNoiseToggle",
    description: "Schaltet Noise Suppression, Krisp und Echo Cancellation per Hotkey (STRG + SHIFT + A) um.",
    authors: [{ name: "antonelly68", id: "0" }],

    start() {
        keydownHandler = (e: KeyboardEvent) => {
            // Hotkey: STRG + SHIFT + A
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
                
                if (!MediaEngineActions || !MediaEngineStore) {
                    Logger.error("EchoNoiseToggle", "Discord Audio-Module konnten nicht gefunden werden.");
                    return;
                }

                // Aktuellen Status abrufen und umkehren
                const currentSettings = MediaEngineStore.getSettings();
                const currentState = currentSettings.noiseSuppression || currentSettings.noiseCancellation || currentSettings.echoCancellation;
                const newState = !currentState;

                // Alle relevanten Filter umschalten
                if (MediaEngineActions.setNoiseSuppression) MediaEngineActions.setNoiseSuppression(newState);
                if (MediaEngineActions.setNoiseCancellation) MediaEngineActions.setNoiseCancellation(newState);
                if (MediaEngineActions.setEchoCancellation) MediaEngineActions.setEchoCancellation(newState);

                // Toast-Benachrichtigung in Discord anzeigen
                if (ToastStore) {
                    ToastStore.showToast(
                        ToastStore.createToast(
                            `Audio-Filter ${newState ? "aktiviert" : "deaktiviert"}`,
                            newState ? ToastStore.ToastType.SUCCESS : ToastStore.ToastType.FAILURE
                        )
                    );
                }
            }
        };

        // Event-Listener aktivieren
        document.addEventListener("keydown", keydownHandler);
    },

    stop() {
        // Event-Listener beim Deaktivieren des Plugins entfernen
        if (keydownHandler) {
            document.removeEventListener("keydown", keydownHandler);
        }
    }
});
