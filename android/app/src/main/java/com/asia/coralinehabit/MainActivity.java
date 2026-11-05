package com.asia.coralinehabit;

import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        enableHighRefreshRateDisplay();
        optimizeWebViewHardwareRendering();
    }

    /**
     * Sblocca il refresh rate massimo nativo del display (90Hz / 120Hz) a parità di risoluzione,
     * evitando il cap OEM a 60Hz applicato di default alle WebView su molti dispositivi Android.
     */
    private void enableHighRefreshRateDisplay() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return;
        }
        try {
            Display display = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R)
                ? getDisplay()
                : getWindowManager().getDefaultDisplay();
            if (display == null) {
                return;
            }

            Display.Mode currentMode = display.getMode();
            Display.Mode[] supportedModes = display.getSupportedModes();
            Display.Mode bestMode = currentMode;

            for (Display.Mode mode : supportedModes) {
                if (mode.getPhysicalWidth() == currentMode.getPhysicalWidth()
                    && mode.getPhysicalHeight() == currentMode.getPhysicalHeight()
                    && mode.getRefreshRate() > bestMode.getRefreshRate()) {
                    bestMode = mode;
                }
            }

            if (bestMode.getModeId() != currentMode.getModeId()) {
                WindowManager.LayoutParams params = getWindow().getAttributes();
                params.preferredDisplayModeId = bestMode.getModeId();
                getWindow().setAttributes(params);
            }
        } catch (Exception ignored) {
            // Fallback silenzioso su ROM custom
        }
    }

    /**
     * Forza il rendering GPU hardware sulla WebView ed elimina lo shader nativo di EdgeEffect
     * (stretch/glow di fine corsa Android 12-15) e l'invalidazione delle scrollbar durante i fling.
     */
    private void optimizeWebViewHardwareRendering() {
        try {
            Bridge currentBridge = getBridge();
            if (currentBridge == null) {
                return;
            }
            WebView webView = currentBridge.getWebView();
            if (webView == null) {
                return;
            }

            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            // Non bloccare lo scorrimento o i fling della WebView con OVER_SCROLL_NEVER o disattivazione canali scroll
            webView.setOverScrollMode(View.OVER_SCROLL_IF_CONTENT_SCROLLS);
        } catch (Exception ignored) {
            // Fallback sicuro
        }
    }
}
