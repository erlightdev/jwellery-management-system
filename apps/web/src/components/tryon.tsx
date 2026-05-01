import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Download, ImagePlus, RefreshCcw, ScanFace, Upload, X } from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────
type Mode      = "live" | "photo";
type JType     = "earring" | "necklace" | "ring" | "bracelet";
type BlendMode = "normal" | "multiply";
interface Adj { x: number; y: number; scale: number; opacity: number }
interface Pt  { x: number; y: number; z: number }

// ─── constants ────────────────────────────────────────────────────────────────
const MP_WASM   = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const FACE_TASK = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const HAND_TASK = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const SHADOW_PAD = 40; // px padding around jewellery for shadow bleed

const DEFAULT_ADJ: Adj = { x: 0, y: 0, scale: 1, opacity: 0.97 };

const JTYPES: { key: JType; label: string; emoji: string }[] = [
	{ key: "earring",  label: "Earring",  emoji: "💎" },
	{ key: "necklace", label: "Necklace", emoji: "📿" },
	{ key: "ring",     label: "Ring",     emoji: "💍" },
	{ key: "bracelet", label: "Bracelet", emoji: "✨" },
];

// ─── image helpers ────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((res, rej) => {
		const img = new Image();
		img.onload  = () => res(img);
		img.onerror = rej;
		img.src     = src;
	});
}

/** Resize a File/Blob so its longest edge ≤ maxPx before sending to ML. */
async function resizeForMl(file: File | Blob, maxPx = 800): Promise<Blob> {
	const url = URL.createObjectURL(file);
	const img = await loadImage(url);
	URL.revokeObjectURL(url);
	const longestEdge = Math.max(img.naturalWidth, img.naturalHeight);
	if (longestEdge <= maxPx) return file; // already small enough
	const scale  = maxPx / longestEdge;
	const canvas = document.createElement("canvas");
	canvas.width  = Math.round(img.naturalWidth  * scale);
	canvas.height = Math.round(img.naturalHeight * scale);
	canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
	return new Promise(res => canvas.toBlob(b => res(b!), "image/jpeg", 0.92));
}

/**
 * Canvas-based background removal: sample the 4 corner pixels to detect the
 * background colour, then smoothly erase pixels close to that colour.
 * Works on any solid-colour product-shot background (white, cream, grey…).
 */
async function removeCanvasBg(img: HTMLImageElement): Promise<string> {
	const canvas = document.createElement("canvas");
	canvas.width  = img.naturalWidth;
	canvas.height = img.naturalHeight;
	const ctx = canvas.getContext("2d")!;
	ctx.drawImage(img, 0, 0);
	const W  = canvas.width;
	const H  = canvas.height;
	const id = ctx.getImageData(0, 0, W, H);
	const px = id.data;
	const corners = [0, (W - 1), (H - 1) * W, (H - 1) * W + (W - 1)];
	let bgR = 0, bgG = 0, bgB = 0;
	for (const i of corners) { bgR += px[i * 4]; bgG += px[i * 4 + 1]; bgB += px[i * 4 + 2]; }
	bgR /= 4; bgG /= 4; bgB /= 4;
	const THRESH = 40;
	for (let i = 0; i < px.length; i += 4) {
		const diff = Math.max(Math.abs(px[i] - bgR), Math.abs(px[i + 1] - bgG), Math.abs(px[i + 2] - bgB));
		if (diff < THRESH) px[i + 3] = Math.round((diff / THRESH) * 255);
	}
	ctx.putImageData(id, 0, 0);
	return canvas.toDataURL("image/png");
}

/**
 * Pre-render the jewellery image with a drop-shadow onto an offscreen canvas.
 * This lets the rAF loop draw the shadow for free (one drawImage call instead
 * of setting ctx.filter every frame, which is expensive).
 */
function preRenderShadow(img: HTMLImageElement): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.width  = img.naturalWidth  + SHADOW_PAD * 2;
	canvas.height = img.naturalHeight + SHADOW_PAD * 2;
	const ctx = canvas.getContext("2d")!;
	ctx.filter = "drop-shadow(2px 8px 14px rgba(0,0,0,0.5))";
	ctx.drawImage(img, SHADOW_PAD, SHADOW_PAD);
	return canvas;
}

// ─── canvas drawing ───────────────────────────────────────────────────────────
function toPx(pt: Pt, cw: number, ch: number, mirror: boolean): [number, number] {
	return [mirror ? (1 - pt.x) * cw : pt.x * cw, pt.y * ch];
}

function drawJewel(
	ctx: CanvasRenderingContext2D,
	shadowCanvas: HTMLCanvasElement, // pre-rendered with shadow
	origW: number, origH: number,    // original jewellery natural dimensions
	cx: number, cy: number,
	size: number,
	adj: Adj,
	blend: BlendMode,
	angle = 0,
) {
	const w = size * adj.scale;
	const h = w * ((origH || 1) / (origW || 1));
	ctx.save();
	ctx.globalAlpha              = Math.max(0, Math.min(1, adj.opacity));
	ctx.globalCompositeOperation = blend === "multiply" ? "multiply" : "source-over";
	ctx.translate(cx + adj.x, cy + adj.y);
	if (angle !== 0) ctx.rotate(angle);
	// shadowCanvas is larger than the jewellery by SHADOW_PAD on each side,
	// so scale it so the inner jewellery part matches the target w×h.
	const sx = w / origW;
	const sy = h / origH;
	const sw = shadowCanvas.width  * sx;
	const sh = shadowCanvas.height * sy;
	ctx.drawImage(shadowCanvas, -sw / 2, -sh / 2, sw, sh);
	ctx.restore();
}

function overlayJewel(
	ctx: CanvasRenderingContext2D,
	shadowCanvas: HTMLCanvasElement,
	origW: number, origH: number,
	type: JType,
	faceLms: Pt[] | null,
	handLms: Pt[][] | null,
	cw: number, ch: number,
	adj: Adj,
	blend: BlendMode,
	mirror: boolean,
): boolean {
	if ((type === "earring" || type === "necklace") && faceLms && faceLms.length >= 468) {
		const [elx, ely] = toPx(faceLms[234], cw, ch, mirror);
		const [erx, ery] = toPx(faceLms[454], cw, ch, mirror);
		const [, chiny]  = toPx(faceLms[152], cw, ch, mirror);
		const [, topy]   = toPx(faceLms[10],  cw, ch, mirror);
		const faceW = Math.abs(erx - elx);
		const faceH = Math.abs(chiny - topy);
		const cx    = (elx + erx) / 2;
		if (type === "earring") {
			const sz = faceW * 0.18, drop = faceH * 0.07;
			drawJewel(ctx, shadowCanvas, origW, origH, elx, ely + drop, sz, adj, blend);
			drawJewel(ctx, shadowCanvas, origW, origH, erx, ery + drop, sz, adj, blend);
			return true;
		}
		drawJewel(ctx, shadowCanvas, origW, origH, cx, chiny + faceH * 0.28, faceW * 1.1, adj, blend);
		return true;
	}
	if ((type === "ring" || type === "bracelet") && handLms?.length) {
		const hand = handLms[0];
		if (!hand || hand.length < 21) return false;
		if (type === "ring") {
			const [r13x, r13y] = toPx(hand[13], cw, ch, mirror);
			const [r14x, r14y] = toPx(hand[14], cw, ch, mirror);
			const [r16x, r16y] = toPx(hand[16], cw, ch, mirror);
			const fingerLen = Math.hypot(r16x - r13x, r16y - r13y);
			const angle     = Math.atan2(r16y - r13y, r16x - r13x) - Math.PI / 2;
			drawJewel(ctx, shadowCanvas, origW, origH, (r13x + r14x) / 2, (r13y + r14y) / 2, fingerLen * 0.75, adj, blend, angle);
			return true;
		}
		const [wx, wy]    = toPx(hand[0],  cw, ch, mirror);
		const [i5x, i5y]  = toPx(hand[5],  cw, ch, mirror);
		const [p17x, p17y] = toPx(hand[17], cw, ch, mirror);
		const wristW = Math.hypot(p17x - i5x, p17y - i5y) * 1.15;
		const angle  = Math.atan2(p17y - i5y, p17x - i5x);
		drawJewel(ctx, shadowCanvas, origW, origH, wx, wy, wristW, adj, blend, angle);
		return true;
	}
	return false;
}

// ─── main component ───────────────────────────────────────────────────────────
export function JewelleryTryon() {
	const [mode,      setMode]     = useState<Mode>("live");
	const [jtype,     setJtype]    = useState<JType>("earring");
	const [jewUrl,    setJewUrl]   = useState<string | null>(null);
	const [removing,  setRemoving] = useState(false);
	const [photoUrl,  setPhotoUrl] = useState<string | null>(null);
	const [adj,       setAdj]      = useState<Adj>(DEFAULT_ADJ);
	const [blend,     setBlend]    = useState<BlendMode>("normal");
	const [captured,  setCaptured] = useState<string | null>(null);
	const [mpReady,   setMpReady]  = useState(false);
	const [mpErr,     setMpErr]    = useState<string | null>(null);
	const [camErr,    setCamErr]   = useState<string | null>(null);
	const [detected,  setDetected] = useState(false);
	const [streaming, setStreaming] = useState(false);
	const [detecting, setDetecting] = useState(false);

	const canvasRef    = useRef<HTMLCanvasElement>(null);
	const videoRef     = useRef<HTMLVideoElement>(null);
	const jewImgRef    = useRef<HTMLImageElement | null>(null);
	const jewShadowRef = useRef<HTMLCanvasElement | null>(null); // pre-rendered with shadow
	const bodyImgRef   = useRef<HTMLImageElement | null>(null);
	const faceLMRef    = useRef<any>(null);
	const handLMRef    = useRef<any>(null);
	const animRef      = useRef(0);
	const streamRef    = useRef<MediaStream | null>(null);
	const isDrag       = useRef(false);
	const dragOrigin   = useRef({ mx: 0, my: 0, ax: 0, ay: 0 });
	const faceLmsRef   = useRef<Pt[] | null>(null);
	const handLmsRef   = useRef<Pt[][] | null>(null);
	const isDetecting  = useRef(false);
	const frameCount   = useRef(0);           // for detection throttle
	const detectedRef  = useRef(false);       // avoids setState on every frame
	const touchOrig    = useRef<{ x: number; y: number; ax: number; ay: number; dist?: number } | null>(null);

	// Refs kept in sync for rAF loop
	const modeRef  = useRef(mode);
	const jtypeRef = useRef(jtype);
	const adjRef   = useRef(adj);
	const blendRef = useRef(blend);
	useEffect(() => { modeRef.current  = mode;  }, [mode]);
	useEffect(() => { jtypeRef.current = jtype; }, [jtype]);
	useEffect(() => { adjRef.current   = adj;   }, [adj]);
	useEffect(() => { blendRef.current = blend; }, [blend]);

	// ── Load MediaPipe (once) ───────────────────────────────────────────────
	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const { FaceLandmarker, HandLandmarker, FilesetResolver } =
					await import("@mediapipe/tasks-vision");
				const vision = await FilesetResolver.forVisionTasks(MP_WASM);
				const tryCreate = async (Ctor: any, model: string, extra: object) => {
					const mk = (d: "GPU" | "CPU") => ({ baseOptions: { modelAssetPath: model, delegate: d }, ...extra });
					return Ctor.createFromOptions(vision, mk("GPU")).catch(() => Ctor.createFromOptions(vision, mk("CPU")));
				};
				const [face, hand] = await Promise.all([
					tryCreate(FaceLandmarker, FACE_TASK, { runningMode: "VIDEO", numFaces: 1 }),
					tryCreate(HandLandmarker, HAND_TASK, { runningMode: "VIDEO", numHands: 2 }),
				]);
				if (alive) { faceLMRef.current = face; handLMRef.current = hand; setMpReady(true); }
			} catch (e: any) {
				if (alive) setMpErr(e?.message ?? "AI failed to load");
			}
		})();
		return () => { alive = false; };
	}, []);

	// ── rAF loop (optimised) ────────────────────────────────────────────────
	const tick = useCallback(() => {
		const video  = videoRef.current;
		const canvas = canvasRef.current;
		if (!video || !canvas || modeRef.current !== "live") return;
		const ctx = canvas.getContext("2d");
		if (!ctx || video.readyState < 2) { animRef.current = requestAnimationFrame(tick); return; }

		const vw = video.videoWidth || 640, vh = video.videoHeight || 480;
		if (canvas.width !== vw || canvas.height !== vh) { canvas.width = vw; canvas.height = vh; }

		// Mirrored frame
		ctx.save(); ctx.scale(-1, 1); ctx.drawImage(video, -vw, 0, vw, vh); ctx.restore();

		// Throttle detection: every 3rd frame (~20fps on 60fps camera)
		frameCount.current++;
		const shouldDetect = frameCount.current % 3 === 0;
		const jt = jtypeRef.current;
		const now = performance.now();

		if (shouldDetect) {
			if (faceLMRef.current && (jt === "earring" || jt === "necklace")) {
				try { const r = faceLMRef.current.detectForVideo(video, now); faceLmsRef.current = r.faceLandmarks?.[0] ?? null; } catch { /* skip */ }
			} else { faceLmsRef.current = null; }

			if (handLMRef.current && (jt === "ring" || jt === "bracelet")) {
				try { const r = handLMRef.current.detectForVideo(video, now); handLmsRef.current = r.landmarks?.length ? r.landmarks : null; } catch { /* skip */ }
			} else { handLmsRef.current = null; }

			// Only call setState when detected value actually changes (avoids re-render every frame)
			const nowDetected = !!(faceLmsRef.current || handLmsRef.current);
			if (nowDetected !== detectedRef.current) { detectedRef.current = nowDetected; setDetected(nowDetected); }
		}

		// Draw jewellery using pre-rendered shadow canvas (no ctx.filter in the loop)
		const shadow = jewShadowRef.current;
		const jewImg = jewImgRef.current;
		if (shadow && jewImg) {
			overlayJewel(ctx, shadow, jewImg.naturalWidth, jewImg.naturalHeight,
				jt, faceLmsRef.current, handLmsRef.current,
				vw, vh, adjRef.current, blendRef.current, true);
		}

		animRef.current = requestAnimationFrame(tick);
	}, []);

	// ── Camera ──────────────────────────────────────────────────────────────
	const startCamera = useCallback(async () => {
		setCamErr(null); detectedRef.current = false; setDetected(false);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
			});
			streamRef.current = stream;
			const v = videoRef.current!;
			v.srcObject = stream;
			await v.play();
			setStreaming(true);
			frameCount.current = 0;
			cancelAnimationFrame(animRef.current);
			animRef.current = requestAnimationFrame(tick);
		} catch (e: any) { setCamErr(e?.message ?? "Camera access denied"); }
	}, [tick]);

	const stopCamera = useCallback(() => {
		cancelAnimationFrame(animRef.current);
		streamRef.current?.getTracks().forEach(t => t.stop());
		streamRef.current = null; setStreaming(false); setDetected(false);
	}, []);

	// ── Photo render + detect ────────────────────────────────────────────────
	const renderPhoto = useCallback(() => {
		const canvas = canvasRef.current;
		const bodyImg = bodyImgRef.current;
		if (!canvas || !bodyImg) return;
		const MAX = 1920, scale = Math.min(1, MAX / bodyImg.naturalWidth);
		canvas.width  = Math.round(bodyImg.naturalWidth  * scale);
		canvas.height = Math.round(bodyImg.naturalHeight * scale);
		const ctx = canvas.getContext("2d")!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(bodyImg, 0, 0, canvas.width, canvas.height);
		const shadow = jewShadowRef.current;
		const jewImg = jewImgRef.current;
		if (shadow && jewImg) {
			overlayJewel(ctx, shadow, jewImg.naturalWidth, jewImg.naturalHeight,
				jtypeRef.current, faceLmsRef.current, handLmsRef.current,
				canvas.width, canvas.height, adjRef.current, blendRef.current, false);
		}
	}, []);

	const detectPhoto = useCallback(async () => {
		if (isDetecting.current || !bodyImgRef.current) return;
		if (!faceLMRef.current || !handLMRef.current) { renderPhoto(); return; }
		isDetecting.current = true; setDetecting(true);
		faceLmsRef.current = null; handLmsRef.current = null;
		const jt = jtypeRef.current;
		try {
			if (jt === "earring" || jt === "necklace") {
				await faceLMRef.current.setOptions({ runningMode: "IMAGE" });
				faceLmsRef.current = faceLMRef.current.detect(bodyImgRef.current).faceLandmarks?.[0] ?? null;
				await faceLMRef.current.setOptions({ runningMode: "VIDEO" });
			}
			if (jt === "ring" || jt === "bracelet") {
				await handLMRef.current.setOptions({ runningMode: "IMAGE" });
				const r = handLMRef.current.detect(bodyImgRef.current);
				handLmsRef.current = r.landmarks?.length ? r.landmarks : null;
				await handLMRef.current.setOptions({ runningMode: "VIDEO" });
			}
		} catch { /* ignore */ }
		const det = !!(faceLmsRef.current || handLmsRef.current);
		detectedRef.current = det; setDetected(det);
		isDetecting.current = false; setDetecting(false);
		renderPhoto();
	}, [renderPhoto]);

	useEffect(() => { if (mode === "photo" && bodyImgRef.current) renderPhoto(); }, [adj, blend, mode, renderPhoto]);

	// Mode switch
	useEffect(() => {
		if (mode === "live") {
			setPhotoUrl(null); bodyImgRef.current = null;
			faceLmsRef.current = null; handLmsRef.current = null;
			startCamera();
		} else {
			stopCamera();
			const c = canvasRef.current;
			if (c) c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode]);

	useEffect(() => () => { stopCamera(); cancelAnimationFrame(animRef.current); }, [stopCamera]);

	useEffect(() => {
		setAdj(DEFAULT_ADJ); detectedRef.current = false; setDetected(false);
		if (mode === "photo" && bodyImgRef.current && mpReady) detectPhoto();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jtype]);

	// ── Jewellery upload ─────────────────────────────────────────────────────
	const handleJewelleryFile = useCallback(async (file: File) => {
		if (!file.type.startsWith("image/")) return;
		setRemoving(true); setCaptured(null);

		let finalImg: HTMLImageElement;
		try {
			// Resize to max 800px first → 4–8× faster ML processing
			const small = await resizeForMl(file, 800);
			const { removeBackground } = await import("@imgly/background-removal");
			const blob = await removeBackground(small, {
				model: "isnet_quint8", // fastest model, still accurate for product shots
			});
			finalImg = await loadImage(URL.createObjectURL(blob));
		} catch {
			try {
				const orig = await loadImage(URL.createObjectURL(file));
				finalImg   = await loadImage(await removeCanvasBg(orig));
			} catch {
				finalImg = await loadImage(URL.createObjectURL(file));
			}
		}

		// Pre-render shadow once — eliminates ctx.filter in the rAF loop
		jewImgRef.current    = finalImg;
		jewShadowRef.current = preRenderShadow(finalImg);
		setJewUrl(finalImg.src);
		setRemoving(false);
		if (mode === "photo" && bodyImgRef.current) detectPhoto();
	}, [mode, detectPhoto]);

	// ── Body photo ───────────────────────────────────────────────────────────
	const handleBodyFile = useCallback(async (file: File) => {
		if (!file.type.startsWith("image/")) return;
		const img = await loadImage(URL.createObjectURL(file));
		bodyImgRef.current = img; setPhotoUrl(img.src);
		faceLmsRef.current = null; handLmsRef.current = null;
		if (mpReady) detectPhoto(); else renderPhoto();
	}, [mpReady, detectPhoto, renderPhoto]);

	// Clipboard paste
	useEffect(() => {
		const fn = (e: ClipboardEvent) => {
			const f = Array.from(e.clipboardData?.items ?? []).find(i => i.type.startsWith("image/"))?.getAsFile();
			if (f) handleJewelleryFile(f);
		};
		window.addEventListener("paste", fn);
		return () => window.removeEventListener("paste", fn);
	}, [handleJewelleryFile]);

	// ── Pointer / touch ──────────────────────────────────────────────────────
	const onMouseDown = (e: React.MouseEvent) => {
		isDrag.current = true;
		dragOrigin.current = { mx: e.clientX, my: e.clientY, ax: adjRef.current.x, ay: adjRef.current.y };
	};
	const onMouseMove = (e: React.MouseEvent) => {
		if (!isDrag.current) return;
		setAdj(a => ({ ...a, x: dragOrigin.current.ax + (e.clientX - dragOrigin.current.mx), y: dragOrigin.current.ay + (e.clientY - dragOrigin.current.my) }));
	};
	const onMouseUp   = () => { isDrag.current = false; };
	const onWheel     = (e: React.WheelEvent) => { e.preventDefault(); setAdj(a => ({ ...a, scale: Math.max(0.1, Math.min(5, a.scale * (e.deltaY > 0 ? 0.9 : 1.1))) })); };
	const onTouchStart = (e: React.TouchEvent) => {
		if (e.touches.length === 1) {
			const t = e.touches[0];
			touchOrig.current = { x: t.clientX, y: t.clientY, ax: adjRef.current.x, ay: adjRef.current.y };
		} else if (e.touches.length === 2) {
			touchOrig.current = { x: 0, y: 0, ax: adjRef.current.x, ay: adjRef.current.y,
				dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY) };
		}
	};
	const onTouchMove = (e: React.TouchEvent) => {
		if (!touchOrig.current) return; e.preventDefault();
		if (e.touches.length === 1) {
			setAdj(a => ({ ...a, x: touchOrig.current!.ax + (e.touches[0].clientX - touchOrig.current!.x), y: touchOrig.current!.ay + (e.touches[0].clientY - touchOrig.current!.y) }));
		} else if (e.touches.length === 2 && touchOrig.current.dist) {
			const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
			setAdj(a => ({ ...a, scale: Math.max(0.1, Math.min(5, a.scale * (d / touchOrig.current!.dist!))) }));
			touchOrig.current = { ...touchOrig.current, dist: d };
		}
	};
	const onTouchEnd = () => { touchOrig.current = null; };

	const capture  = () => { const c = canvasRef.current; if (c) setCaptured(c.toDataURL("image/png")); };
	const download = () => {
		if (!captured) return;
		Object.assign(document.createElement("a"), { href: captured, download: `jewel-tryon-${Date.now()}.png` }).click();
	};

	const needsFace  = jtype === "earring" || jtype === "necklace";
	const canvasLive = mode === "live" ? streaming : !!photoUrl;
	const showHint   = canvasLive && !!jewUrl && !detected;

	return (
		<div className="flex h-full flex-col gap-6 lg:flex-row">

			{/* ── Controls ─────────────────────────────────────────────────── */}
			<div className="flex w-full flex-col gap-5 lg:w-64 lg:shrink-0">

				<div>
					<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#888882]">Type</p>
					<div className="grid grid-cols-2 gap-1.5">
						{JTYPES.map(({ key, label, emoji }) => (
							<button key={key} onClick={() => setJtype(key)}
								className={`rounded-lg border px-2 py-2 text-[11px] font-medium transition-all ${
									jtype === key ? "border-[#C4A84F] bg-[#C4A84F]/10 text-[#C4A84F]"
									: "border-[#E5E5E0] text-[#888882] hover:border-[#C4A84F]/40 dark:border-[#2A2A28]"
								}`}
							><span className="mr-1">{emoji}</span>{label}</button>
						))}
					</div>
				</div>

				<div>
					<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#888882]">Jewellery Image</p>
					<label className={`relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
						removing ? "border-[#C4A84F] bg-[#C4A84F]/5"
						: jewUrl  ? "border-[#C4A84F]/50 bg-[#FAFAF8] dark:bg-[#0D0D0B]"
						: "border-[#E5E5E0] hover:border-[#C4A84F]/50 dark:border-[#2A2A28]"
					}`}>
						<input type="file" accept="image/*" className="sr-only"
							onChange={e => { const f = e.target.files?.[0]; if (f) handleJewelleryFile(f); e.target.value = ""; }}
						/>
						{removing ? (
							<>
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C4A84F] border-t-transparent" />
								<span className="text-[11px] text-[#888882]">Removing background…</span>
								<span className="text-[10px] text-[#ADADAA]">First load takes ~10s</span>
							</>
						) : jewUrl ? (
							<>
								<img src={jewUrl} alt="" className="h-16 w-16 object-contain"
									style={{ background: "repeating-conic-gradient(#e5e5e5 0% 25%,#f5f5f5 0% 50%) 0 0 / 12px 12px" }} />
								<span className="text-[10px] text-[#C4A84F]">✓ Background removed</span>
								<span className="text-[10px] text-[#ADADAA]">Click to change</span>
							</>
						) : (
							<>
								<ImagePlus className="h-6 w-6 text-[#ADADAA]" />
								<span className="text-center text-[11px] text-[#888882]">Drop or click to upload</span>
								<span className="text-[10px] text-[#ADADAA]">Ctrl+V pastes from Pinterest</span>
							</>
						)}
					</label>
				</div>

				<div>
					<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#888882]">Mode</p>
					<div className="flex overflow-hidden rounded-lg border border-[#E5E5E0] dark:border-[#2A2A28]">
						{(["live", "photo"] as Mode[]).map(m => (
							<button key={m} onClick={() => setMode(m)}
								className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors ${
									mode === m ? "bg-[#0D0D0B] text-[#F0F0EB] dark:bg-[#F0F0EB] dark:text-[#0D0D0B]"
									: "text-[#888882] hover:text-[#0D0D0B] dark:hover:text-[#F0F0EB]"
								}`}
							>
								{m === "live" ? <><Camera className="h-3.5 w-3.5" />Live</> : <><Upload className="h-3.5 w-3.5" />Photo</>}
							</button>
						))}
					</div>
				</div>

				{mode === "photo" && (
					<div>
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#888882]">Your Photo</p>
						<label className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
							photoUrl ? "border-[#6B6B67]/40 bg-[#FAFAF8] dark:bg-[#0D0D0B]"
							: "border-[#E5E5E0] hover:border-[#6B6B67]/50 dark:border-[#2A2A28]"
						}`}>
							<input type="file" accept="image/*" className="sr-only"
								onChange={e => { const f = e.target.files?.[0]; if (f) handleBodyFile(f); e.target.value = ""; }}
							/>
							{detecting ? (
								<><div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C4A84F] border-t-transparent" /><span className="text-[11px] text-[#888882]">Detecting…</span></>
							) : photoUrl ? (
								<><img src={photoUrl} alt="" className="h-12 w-12 rounded-lg object-cover" /><span className="text-[10px] text-[#ADADAA]">Click to change</span></>
							) : (
								<><Upload className="h-5 w-5 text-[#ADADAA]" /><span className="text-[11px] text-[#888882]">Upload your photo</span><span className="text-[10px] text-[#ADADAA]">Face, hand, or body</span></>
							)}
						</label>
					</div>
				)}

				<div>
					<p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#888882]">Adjust</p>
					<div className="space-y-3.5">
						<div className="flex items-center gap-3">
							<span className="w-12 shrink-0 text-[11px] text-[#888882]">Scale</span>
							<input type="range" min={0.1} max={3} step={0.01} value={adj.scale}
								onChange={e => setAdj(a => ({ ...a, scale: +e.target.value }))}
								className="h-1 flex-1 cursor-pointer accent-[#C4A84F]"
							/>
							<span className="w-9 text-right text-[11px] tabular-nums text-[#888882]">{adj.scale.toFixed(1)}×</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="w-12 shrink-0 text-[11px] text-[#888882]">Opacity</span>
							<input type="range" min={0.1} max={1} step={0.01} value={adj.opacity}
								onChange={e => setAdj(a => ({ ...a, opacity: +e.target.value }))}
								className="h-1 flex-1 cursor-pointer accent-[#C4A84F]"
							/>
							<span className="w-9 text-right text-[11px] tabular-nums text-[#888882]">{Math.round(adj.opacity * 100)}%</span>
						</div>
						<div className="flex items-center justify-between rounded-lg border border-[#E5E5E0] px-3 py-2 dark:border-[#2A2A28]">
							<div>
								<p className="text-[11px] font-medium text-[#888882]">Blend mode</p>
								<p className="text-[10px] text-[#ADADAA]">{blend === "multiply" ? "Merges with skin" : "Standard overlay"}</p>
							</div>
							<button onClick={() => setBlend(b => b === "normal" ? "multiply" : "normal")}
								className={`relative h-5 w-9 rounded-full transition-colors ${blend === "multiply" ? "bg-[#C4A84F]" : "bg-[#E5E5E0] dark:bg-[#2A2A28]"}`}
							>
								<span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${blend === "multiply" ? "translate-x-4" : "translate-x-0.5"}`} />
							</button>
						</div>
					</div>
				</div>

				<div className="flex gap-2">
					<button onClick={() => setAdj(DEFAULT_ADJ)}
						className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E5E0] py-2 text-[11px] text-[#888882] transition-colors hover:text-[#0D0D0B] dark:border-[#2A2A28] dark:hover:text-[#F0F0EB]"
					><RefreshCcw className="h-3.5 w-3.5" /> Reset</button>
					<button onClick={capture} disabled={!canvasLive || !jewUrl}
						className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#C4A84F] py-2 text-[11px] font-medium text-white transition-opacity disabled:opacity-40"
					><Camera className="h-3.5 w-3.5" /> Capture</button>
				</div>

				{canvasLive && jewUrl && <p className="text-[10px] text-[#ADADAA]">Drag to reposition · Scroll / pinch to resize</p>}
				{camErr && <p className="text-[10px] text-red-500">{camErr}</p>}
				{mpErr  && <p className="text-[10px] text-amber-500">AI limited: {mpErr}</p>}
			</div>

			{/* ── Canvas ───────────────────────────────────────────────────── */}
			<div className="flex flex-1 flex-col gap-3">
				<div
					className="relative flex-1 select-none overflow-hidden rounded-2xl border border-[#2A2A28] bg-[#0D0D0B]"
					style={{ minHeight: 420, cursor: jewUrl ? (isDrag.current ? "grabbing" : "grab") : "default" }}
					onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
					onWheel={onWheel} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
				>
					<video ref={videoRef} className="sr-only" muted playsInline />

					<canvas ref={canvasRef} className="mx-auto block"
						style={{ maxWidth: "100%", maxHeight: "100%", display: canvasLive ? "block" : "none" }}
					/>

					{!canvasLive && (
						<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
							<div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#2A2A28]">
								{mode === "live" ? <ScanFace className="h-9 w-9 text-[#888882]" /> : <Upload className="h-9 w-9 text-[#888882]" />}
							</div>
							<div>
								<p className="text-sm font-medium text-[#F0F0EB]">
									{mode === "live" ? (!mpReady && !mpErr ? "Loading AI vision…" : "Starting camera…") : "Upload your photo"}
								</p>
								<p className="mt-1 text-[11px] text-[#888882]">
									{mode === "live" ? "Allow camera access when prompted" : "Face, hand, or full body"}
								</p>
							</div>
						</div>
					)}

					<div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-2">
						{!mpReady && !mpErr && (
							<div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[10px] text-white backdrop-blur-sm">
								<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C4A84F]" /> Loading AI…
							</div>
						)}
						{mpReady && detected && jewUrl && (
							<div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[10px] text-white backdrop-blur-sm">
								<div className="h-1.5 w-1.5 rounded-full bg-green-400" />
								{needsFace ? "Face detected" : "Hand detected"}
							</div>
						)}
					</div>

					{showHint && (
						<div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-5 py-2 text-[11px] text-white backdrop-blur-sm">
							{needsFace ? "Point your face at the camera" : "Show your hand in frame"}
						</div>
					)}
				</div>

				{captured && (
					<div className="flex items-center gap-3 rounded-xl border border-[#E5E5E0] bg-white p-3 dark:border-[#2A2A28] dark:bg-[#141412]">
						<img src={captured} alt="Captured" className="h-14 w-14 rounded-lg object-cover" />
						<div className="min-w-0 flex-1">
							<p className="text-[12px] font-medium">Try-on captured</p>
							<p className="text-[11px] text-[#888882]">Save and share your look</p>
						</div>
						<button onClick={download} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#C4A84F] px-4 py-2 text-[11px] font-medium text-white">
							<Download className="h-3.5 w-3.5" /> Save
						</button>
						<button onClick={() => setCaptured(null)} className="shrink-0 text-[#ADADAA] hover:text-[#888882]">
							<X className="h-4 w-4" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
