Add-Type -AssemblyName System.Drawing
$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class ImageProcessor {
    public static void MakeTransparent(string input, string output) {
        using (Bitmap bmp = new Bitmap(input)) {
            Bitmap res = new Bitmap(bmp.Width, bmp.Height, PixelFormat.Format32bppArgb);
            for (int y = 0; y < bmp.Height; y++) {
                for (int x = 0; x < bmp.Width; x++) {
                    Color c = bmp.GetPixel(x, y);
                    // Calculate luminance approximation
                    int max = Math.Max(c.R, Math.Max(c.G, c.B));
                    int min = Math.Min(c.R, Math.Min(c.G, c.B));
                    int luma = c.R + c.G + c.B;
                    
                    if (luma < 45 && max < 25) {
                        res.SetPixel(x, y, Color.Transparent);
                    } else if (luma < 200 && max < 100 && min < 30) {
                        // Smoothly transition the alpha channel for antialiased edges
                        float factor = (max - 20) / 80.0f;
                        if (factor < 0) factor = 0;
                        if (factor > 1) factor = 1;
                        int alpha = (int)(255 * factor);
                        res.SetPixel(x, y, Color.FromArgb(alpha, c.R, c.G, c.B));
                    } else {
                        res.SetPixel(x, y, c);
                    }
                }
            }
            res.Save(output, ImageFormat.Png);
        }
    }
}
"@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[ImageProcessor]::MakeTransparent("star_wedding_logo_v2.png", "logo_transparent.png")
