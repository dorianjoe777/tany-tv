param([string]$Dir = 'assets\chars', [int]$Tolerance = 58, [int]$MaxSize = 700)

# Recorta el fondo de las laminas generadas dejando solo el personaje.
# Flood fill desde los bordes hacia dentro: el fondo contiguo desaparece y el
# interior del personaje (negro solido) se conserva.

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $root $Dir
if (-not (Test-Path $dir)) { Write-Output "no existe $dir"; exit 1 }

Add-Type -AssemblyName System.Drawing
if (-not ('Cutout' -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class Cutout {
  public static string Remove(string src, string dst, int tol, int maxSize) {
    Bitmap work = null;
    try {
      using (Bitmap orig = new Bitmap(src)) {
        if (orig.Width > maxSize) {
          int nh = orig.Height * maxSize / orig.Width;
          work = new Bitmap(maxSize, nh);
          using (Graphics g = Graphics.FromImage(work)) {
            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
            g.DrawImage(orig, 0, 0, maxSize, nh);
          }
        } else {
          work = new Bitmap(orig);
        }
      }

      int w = work.Width, h = work.Height;
      Rectangle rect = new Rectangle(0, 0, w, h);
      BitmapData data = work.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int stride = data.Stride;
      byte[] px = new byte[stride * h];
      System.Runtime.InteropServices.Marshal.Copy(data.Scan0, px, 0, px.Length);

      // Color semilla: la media de las cuatro esquinas.
      int sr = 0, sg = 0, sb = 0, n = 0;
      int[] corners = { 0, w - 1, (h - 1) * w, (h - 1) * w + w - 1 };
      for (int i = 0; i < 4; i++) {
        int o = (corners[i] / w) * stride + (corners[i] % w) * 4;
        sr += px[o]; sg += px[o + 1]; sb += px[o + 2]; n++;
      }
      sr /= n; sg /= n; sb /= n;

      bool[] vis = new bool[w * h];
      Stack<int> stack = new Stack<int>();
      for (int x = 0; x < w; x++) { stack.Push(x); stack.Push(x + (h - 1) * w); }
      for (int y = 0; y < h; y++) { stack.Push(y * w); stack.Push(y * w + w - 1); }

      int removed = 0;
      while (stack.Count > 0) {
        int idx = stack.Pop();
        if (idx < 0 || idx >= w * h) continue;
        if (vis[idx]) continue;
        vis[idx] = true;
        int y = idx / w, x = idx - y * w;
        int o = y * stride + x * 4;
        int dr = Math.Abs(px[o] - sr), dg = Math.Abs(px[o + 1] - sg), db = Math.Abs(px[o + 2] - sb);
        if (dr > tol || dg > tol || db > tol) continue; // ya no es fondo: es el sujeto
        px[o + 3] = 0;
        removed++;
        if (x > 0) stack.Push(idx - 1);
        if (x < w - 1) stack.Push(idx + 1);
        if (y > 0) stack.Push(idx - w);
        if (y < h - 1) stack.Push(idx + w);
      }

      System.Runtime.InteropServices.Marshal.Copy(px, 0, data.Scan0, px.Length);
      work.UnlockBits(data);
      work.Save(dst, ImageFormat.Png);
      double pct = 100.0 * removed / (w * h);
      return w + "x" + h + " fondo:" + pct.ToString("0") + "%";
    } finally {
      if (work != null) work.Dispose();
    }
  }
}
'@ -ReferencedAssemblies System.Drawing
}

$total = 0
Get-ChildItem -Path $dir -File | Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg' -and $_.Name -notlike '*.cut.*' } | ForEach-Object {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
  $src = $_.FullName
  $dst = Join-Path $dir ($base + '.cut.png')
  try {
    $info = [Cutout]::Remove($src, $dst, $Tolerance, $MaxSize)
    $kb = [math]::Round((Get-Item $dst).Length / 1KB, 1)
    Write-Output ("  {0}.cut.png  {1} KB  {2}" -f $base, $kb, $info)
    $total += $kb
  } catch {
    Write-Output ("  FALLO {0}: {1}" -f $base, $_.Exception.Message)
  }
}
Write-Output ("recortados: {0} KB" -f [math]::Round($total, 1))
