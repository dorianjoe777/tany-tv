package com.snoopy.tv;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * SNOOPY TV - el sistema operativo del mundo de Snoopy.
 * App nativa de Android TV: WebView a pantalla completa con toda la web
 * empaquetada dentro del APK. No necesita internet ni servidor.
 *
 * Puente con la web: la estanteria lista las apps instaladas en la TV y
 * puede abrirlas (window.TanyNative).
 */
public class MainActivity extends Activity {

    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String HOST = "appassets.androidplatform.net";

    private WebView web;
    private PackageManager pm;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        pm = getPackageManager();

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(0xFF0F0D09);
        getWindow().setNavigationBarColor(0xFF0F0D09);
        goFullscreen();

        web = new WebView(this);
        web.setBackgroundColor(0xFF0F0D09);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setHorizontalScrollBarEnabled(false);
        web.setVerticalScrollBarEnabled(false);
        web.setLongClickable(false);
        web.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                return true; // nada de seleccion de texto en la TV
            }
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);

        web.addJavascriptInterface(new NativeBridge(), "TanyNative");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri != null && HOST.equals(uri.getHost())) {
                    return serve(uri.getPath());
                }
                return null;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri != null && HOST.equals(uri.getHost())) {
                    return false; // contenido local, deja que lo sirva el interceptor
                }
                return true; // cualquier otra cosa se bloquea: esta TV no navega
            }
        });

        setContentView(web);
        goFullscreen();
        web.loadUrl(ORIGIN + "/index.html");
    }

    /** Sirve un archivo desde assets/site dentro de la app. */
    private WebResourceResponse serve(String path) {
        if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
        try {
            InputStream in = getAssets().open("site" + path);
            String mime = mimeOf(path);
            WebResourceResponse res = new WebResourceResponse(mime, "UTF-8", in);
            Map<String, String> headers = new HashMap<String, String>();
            headers.put("Cache-Control", "no-cache");
            res.setResponseHeaders(headers);
            return res;
        } catch (IOException e) {
            return null;
        }
    }

    private String mimeOf(String path) {
        String p = path.toLowerCase();
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".jpg")) return "image/jpeg";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".json")) return "application/json";
        return "application/octet-stream";
    }

    private void goFullscreen() {
        View decor = getWindow().getDecorView();
        if (decor == null) return;
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController c = decor.getWindowInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.systemBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            decor.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean has) {
        super.onWindowFocusChanged(has);
        if (has) goFullscreen();
    }

    /** El boton atras lo gestiona la web (cierra overlays); si no, sale de la app. */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript(
                "(window.__snoopyRemoteBack && window.__snoopyRemoteBack()) ? '1' : '0'",
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        if (!"\"1\"".equals(value)) {
                            finish();
                        }
                    }
                });
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) {
            web.onPause();
            web.pauseTimers();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) {
            web.resumeTimers();
            web.onResume();
        }
        goFullscreen();
    }

    /* ============================================================
       PUENTE CON LA WEB: las apps de la TV
       ============================================================ */
    private class NativeBridge {

        /** Devuelve JSON: [{pkg, label, icon(base64 png)}] */
        @JavascriptInterface
        public String listApps() {
            StringBuilder sb = new StringBuilder("[");
            try {
                Intent main = new Intent(Intent.ACTION_MAIN, null);
                main.addCategory(Intent.CATEGORY_LAUNCHER);
                List<ResolveInfo> list = pm.queryIntentActivities(main, 0);
                int n = 0;
                for (ResolveInfo ri : list) {
                    ActivityInfo ai = ri.activityInfo;
                    if (ai == null) continue;
                    if (n >= 18) break;
                    String label = String.valueOf(ri.loadLabel(pm));
                    if (n > 0) sb.append(',');
                    sb.append("{\"pkg\":\"").append(ai.packageName)
                      .append("\",\"label\":\"").append(label.replace("\\", "").replace("\"", "'"))
                      .append("\",\"icon\":\"").append(iconBase64(ai)).append("\"}");
                    n++;
                }
            } catch (Exception e) {
                // si algo falla, se devuelve una lista vacia
            }
            sb.append("]");
            return sb.toString();
        }

        /** Abre una app instalada en la TV. */
        @JavascriptInterface
        public void launchApp(final String pkg) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Intent i = pm.getLaunchIntentForPackage(pkg);
                        if (i != null) {
                            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(i);
                        }
                    } catch (Exception e) {
                        // la app no existe o no se puede abrir
                    }
                }
            });
        }
    }

    private String iconBase64(ActivityInfo ai) {
        try {
            Drawable d = ai.loadIcon(pm);
            Bitmap bmp = Bitmap.createBitmap(64, 64, Bitmap.Config.ARGB_8888);
            Canvas c = new Canvas(bmp);
            d.setBounds(0, 0, 64, 64);
            d.draw(c);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            bmp.compress(Bitmap.CompressFormat.PNG, 90, out);
            bmp.recycle();
            return Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP);
        } catch (Exception e) {
            return "";
        }
    }
}
