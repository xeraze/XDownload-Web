package main

import (
	"bytes"
	"context"
	"crypto/hmac"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

const (
	enhanceMaxBytes = 15 << 20
	enhanceMaxDim   = 6000
	enhanceMaxX2In  = 3000
)

var (
	errEnhanceToolMissing = errors.New("realesrgan missing")
	sem                   = make(chan struct{}, 2)
)

func main() {
	addr := os.Getenv("ENHANCE_ADDR")
	if addr == "" {
		addr = "127.0.0.1:8081"
	}
	key := os.Getenv("ENHANCE_API_KEY")

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", handleHealth)
	mux.HandleFunc("POST /api/enhance", handleEnhance)

	var handler http.Handler = mux
	if key != "" {
		handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !hmac.Equal([]byte(r.Header.Get("X-Api-Key")), []byte(key)) {
				writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
				return
			}
			mux.ServeHTTP(w, r)
		})
	}

	srv := &http.Server{
		Addr:              addr,
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}
	log.Printf("enhance server listening on http://%s (key=%v)", addr, key != "")
	if err := srv.ListenAndServe(); err != nil {
		log.Println("server:", err)
		os.Exit(1)
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func handleEnhance(w http.ResponseWriter, r *http.Request) {
	select {
	case sem <- struct{}{}:
		defer func() { <-sem }()
	default:
		writeJSON(w, http.StatusTooManyRequests, map[string]string{"error": "busy"})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, enhanceMaxBytes+(1<<20))
	if err := r.ParseMultipartForm(enhanceMaxBytes); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "multipart expected"})
		return
	}
	fh, _, err := r.FormFile("file")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "file required"})
		return
	}
	defer fh.Close()

	mode := r.FormValue("mode")
	engine := r.FormValue("engine")
	if mode == "" {
		mode = "clean"
	}
	if engine == "" {
		engine = "local"
	}
	if mode != "clean" && mode != "x2" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid mode"})
		return
	}
	if engine != "local" && engine != "ai" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid engine"})
		return
	}
	if engine == "ai" {
		mode = "x2"
	}

	raw, err := io.ReadAll(io.LimitReader(fh, enhanceMaxBytes+1))
	if err != nil || len(raw) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "read failed"})
		return
	}
	if len(raw) > enhanceMaxBytes {
		writeJSON(w, http.StatusRequestEntityTooLarge, map[string]string{"error": "image too big"})
		return
	}

	img, format, err := image.Decode(bytes.NewReader(raw))
	if err != nil || (format != "jpeg" && format != "png") {
		writeJSON(w, http.StatusUnsupportedMediaType, map[string]string{"error": "jpeg or png required"})
		return
	}
	b := img.Bounds()
	inW, inH := b.Dx(), b.Dy()
	if inW > enhanceMaxDim || inH > enhanceMaxDim || inW < 16 || inH < 16 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "unsupported dimensions"})
		return
	}
	if mode == "x2" && (inW > enhanceMaxX2In || inH > enhanceMaxX2In) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "x2 input too large"})
		return
	}
	targetW, targetH := inW, inH
	if mode == "x2" {
		targetW, targetH = inW*2, inH*2
	}

	var out image.Image
	switch engine {
	case "ai":
		data, err := realESRGANEnhance(raw)
		if err != nil {
			if errors.Is(err, errEnhanceToolMissing) {
				writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "ai unavailable"})
				return
			}
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "ai failed"})
			return
		}
		res, _, err := image.Decode(bytes.NewReader(data))
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "ai decode failed"})
			return
		}
		out = resizeTo(res, targetW, targetH)
	default:
		out = localEnhance(img, mode, targetW, targetH)
	}

	buf := &bytes.Buffer{}
	ct := "image/jpeg"
	if format == "png" {
		ct = "image/png"
		if err := png.Encode(buf, out); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "encode failed"})
			return
		}
	} else {
		if err := jpeg.Encode(buf, out, &jpeg.Options{Quality: 90}); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "encode failed"})
			return
		}
	}
	w.Header().Set("Content-Type", ct)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", buf.Len()))
	w.Header().Set("X-Enhance-Engine", engine)
	_, _ = w.Write(buf.Bytes())
}

func realESRGANEnhance(src []byte) ([]byte, error) {
	dir := os.Getenv("REALSR_DIR")
	if dir == "" {
		dir = `D:\Codding\XDownload Web\tools\realesrgan`
	}
	exe := filepath.Join(dir, "realesrgan-ncnn-vulkan.exe")
	if _, err := os.Stat(exe); err != nil {
		return nil, errEnhanceToolMissing
	}
	tmp, err := os.MkdirTemp("", "xdl-esr-")
	if err != nil {
		return nil, err
	}
	defer os.RemoveAll(tmp)
	inPath := filepath.Join(tmp, "in.png")
	outPath := filepath.Join(tmp, "out.png")
	if err := os.WriteFile(inPath, src, 0o644); err != nil {
		return nil, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 4*time.Minute)
	defer cancel()
	cmd := exec.CommandContext(ctx, exe, "-i", inPath, "-o", outPath, "-n", "realesrgan-x4plus", "-s", "2", "-f", "png")
	cmd.Dir = dir
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("realesrgan: %w: %s", err, string(output))
	}
	return os.ReadFile(outPath)
}

func localEnhance(src image.Image, mode string, targetW, targetH int) image.Image {
	rgba := toRGBA(src)
	if mode == "clean" {
		median3(rgba)
		unsharp(rgba, 0.55, 1)
		if rgba.Bounds().Dx() != targetW || rgba.Bounds().Dy() != targetH {
			return resizeTo(rgba, targetW, targetH)
		}
		return rgba
	}
	up := lanczos2x(rgba)
	unsharp(up, 0.4, 1)
	if up.Bounds().Dx() != targetW || up.Bounds().Dy() != targetH {
		return resizeTo(up, targetW, targetH)
	}
	return up
}

func toRGBA(src image.Image) *image.RGBA {
	if r, ok := src.(*image.RGBA); ok {
		return r
	}
	b := src.Bounds()
	dst := image.NewRGBA(image.Rect(0, 0, b.Dx(), b.Dy()))
	for y := 0; y < b.Dy(); y++ {
		for x := 0; x < b.Dx(); x++ {
			dst.Set(x, y, src.At(b.Min.X+x, b.Min.Y+y))
		}
	}
	return dst
}

func median3(img *image.RGBA) {
	b := img.Bounds()
	w, h := b.Dx(), b.Dy()
	src := make([]byte, len(img.Pix))
	copy(src, img.Pix)
	for y := 1; y < h-1; y++ {
		for x := 1; x < w-1; x++ {
			var r, g, bb, a [9]byte
			i := 0
			for dy := -1; dy <= 1; dy++ {
				for dx := -1; dx <= 1; dx++ {
					o := (y + dy)*img.Stride + (x + dx)*4
					r[i], g[i], bb[i], a[i] = src[o], src[o+1], src[o+2], src[o+3]
					i++
				}
			}
			o := y*img.Stride + x*4
			img.Pix[o] = med9(r)
			img.Pix[o+1] = med9(g)
			img.Pix[o+2] = med9(bb)
			img.Pix[o+3] = med9(a)
		}
	}
}

func med9(v [9]byte) byte {
	for i := 1; i < 9; i++ {
		key := v[i]
		j := i - 1
		for j >= 0 && v[j] > key {
			v[j+1] = v[j]
			j--
		}
		v[j+1] = key
	}
	return v[4]
}

func boxBlur(img *image.RGBA, radius int) *image.RGBA {
	b := img.Bounds()
	w, h := b.Dx(), b.Dy()
	tmp := image.NewRGBA(image.Rect(0, 0, w, h))
	out := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			var sr, sg, sb, sa, n int
			for k := -radius; k <= radius; k++ {
				xx := x + k
				if xx < 0 {
					xx = 0
				} else if xx >= w {
					xx = w - 1
				}
				o := y*img.Stride + xx*4
				sr += int(img.Pix[o])
				sg += int(img.Pix[o+1])
				sb += int(img.Pix[o+2])
				sa += int(img.Pix[o+3])
				n++
			}
			o := y*tmp.Stride + x*4
			tmp.Pix[o] = byte(sr / n)
			tmp.Pix[o+1] = byte(sg / n)
			tmp.Pix[o+2] = byte(sb / n)
			tmp.Pix[o+3] = byte(sa / n)
		}
	}
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			var sr, sg, sb, sa, n int
			for k := -radius; k <= radius; k++ {
				yy := y + k
				if yy < 0 {
					yy = 0
				} else if yy >= h {
					yy = h - 1
				}
				o := yy*tmp.Stride + x*4
				sr += int(tmp.Pix[o])
				sg += int(tmp.Pix[o+1])
				sb += int(tmp.Pix[o+2])
				sa += int(tmp.Pix[o+3])
				n++
			}
			o := y*out.Stride + x*4
			out.Pix[o] = byte(sr / n)
			out.Pix[o+1] = byte(sg / n)
			out.Pix[o+2] = byte(sb / n)
			out.Pix[o+3] = byte(sa / n)
		}
	}
	return out
}

func unsharp(img *image.RGBA, amount float64, radius int) {
	blur := boxBlur(img, radius)
	n := len(img.Pix)
	for i := 0; i < n; i += 4 {
		for c := 0; c < 3; c++ {
			orig := float64(img.Pix[i+c])
			d := orig + amount*(orig-float64(blur.Pix[i+c]))
			if d < 0 {
				d = 0
			} else if d > 255 {
				d = 255
			}
			img.Pix[i+c] = byte(d)
		}
	}
}

func lanczosKernel(t float64) float64 {
	if t == 0 {
		return 1
	}
	if t <= -3 || t >= 3 {
		return 0
	}
	pt := math.Pi * t
	return (3 * math.Sin(pt) * math.Sin(pt/3)) / (pt * pt)
}

func lanczos2x(src *image.RGBA) *image.RGBA {
	b := src.Bounds()
	w, h := b.Dx(), b.Dy()
	dw, dh := w*2, h*2
	horiz := lanczosResample(src, dw, h, false)
	return lanczosResample(horiz, dw, dh, true)
}

func lanczosResample(src *image.RGBA, dw, dh int, vertical bool) *image.RGBA {
	b := src.Bounds()
	sw, sh := b.Dx(), b.Dy()
	dst := image.NewRGBA(image.Rect(0, 0, dw, dh))
	if !vertical {
		scale := float64(sw) / float64(dw)
		for y := 0; y < sh; y++ {
			for x := 0; x < dw; x++ {
				center := (float64(x)+0.5)*scale - 0.5
				lo := int(math.Ceil(center - 3))
				hi := int(math.Floor(center + 3))
				var wr, wg, wb, wa, sum float64
				for sx := lo; sx <= hi; sx++ {
					c := sx
					if c < 0 {
						c = 0
					} else if c >= sw {
						c = sw - 1
					}
					ww := lanczosKernel((float64(sx) - center) / scale)
					if ww == 0 {
						continue
					}
					o := y*src.Stride + c*4
					a := float64(src.Pix[o+3]) / 255
					wr += ww * float64(src.Pix[o]) * a
					wg += ww * float64(src.Pix[o+1]) * a
					wb += ww * float64(src.Pix[o+2]) * a
					wa += ww * a
					sum += ww
				}
				_ = sum
				o := y*dst.Stride + x*4
				dst.Pix[o+3] = clamp255(wa * 255)
				if wa > 0 {
					dst.Pix[o] = clamp255(wr / wa)
					dst.Pix[o+1] = clamp255(wg / wa)
					dst.Pix[o+2] = clamp255(wb / wa)
				}
			}
		}
		return dst
	}
	scale := float64(sh) / float64(dh)
	for y := 0; y < dh; y++ {
		center := (float64(y)+0.5)*scale - 0.5
		lo := int(math.Ceil(center - 3))
		hi := int(math.Floor(center + 3))
		for x := 0; x < dw; x++ {
			var wr, wg, wb, wa float64
			for sy := lo; sy <= hi; sy++ {
				c := sy
				if c < 0 {
					c = 0
				} else if c >= sh {
					c = sh - 1
				}
				ww := lanczosKernel((float64(sy) - center) / scale)
				if ww == 0 {
					continue
				}
				o := c*src.Stride + x*4
				a := float64(src.Pix[o+3]) / 255
				wr += ww * float64(src.Pix[o]) * a
				wg += ww * float64(src.Pix[o+1]) * a
				wb += ww * float64(src.Pix[o+2]) * a
				wa += ww * a
			}
			o := y*dst.Stride + x*4
			dst.Pix[o+3] = clamp255(wa * 255)
			if wa > 0 {
				dst.Pix[o] = clamp255(wr / wa)
				dst.Pix[o+1] = clamp255(wg / wa)
				dst.Pix[o+2] = clamp255(wb / wa)
			}
		}
	}
	return dst
}

func clamp255(v float64) byte {
	if v < 0 {
		return 0
	}
	if v > 255 {
		return 255
	}
	return byte(v + 0.5)
}

func resizeTo(img image.Image, tw, th int) image.Image {
	b := img.Bounds()
	if b.Dx() == tw && b.Dy() == th {
		return img
	}
	src := toRGBA(img)
	sw, sh := b.Dx(), b.Dy()
	dst := image.NewRGBA(image.Rect(0, 0, tw, th))
	xs := float64(sw) / float64(tw)
	ys := float64(sh) / float64(th)
	for y := 0; y < th; y++ {
		sy := int((float64(y)+0.5)*ys - 0.5)
		if sy < 0 {
			sy = 0
		} else if sy >= sh {
			sy = sh - 1
		}
		for x := 0; x < tw; x++ {
			sx := int((float64(x)+0.5)*xs - 0.5)
			if sx < 0 {
				sx = 0
			} else if sx >= sw {
				sx = sw - 1
			}
			o := sy*src.Stride + sx*4
			d := y*dst.Stride + x*4
			dst.Pix[d] = src.Pix[o]
			dst.Pix[d+1] = src.Pix[o+1]
			dst.Pix[d+2] = src.Pix[o+2]
			dst.Pix[d+3] = src.Pix[o+3]
		}
	}
	return dst
}
