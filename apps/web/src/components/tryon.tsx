import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Download, ImagePlus, RefreshCcw, ScanFace, Upload, X } from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────
type Mode     = "live" | "photo";
type JType    = "earring" | "necklace" | "ring" | "bracelet";
type BlendMode = "normal" | "multiply";
interface Adj { x: number; y: number; scale: number; opacity: number }
interface Pt  { x: number; y: number; z: number }

// ─── constants ────────────────────────────────────────────────────────────────
const MP_WASM   = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const FACE_TASK = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const HAND_TASK = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const DEFAULT_ADJ: Adj = { x: 0, y: 0, scale: 1, opacity: 0.97 };

const JTYPES: { key: JType; label: string; emoji: string }[] = [
	{ key: "earring",  label: "Earring",  emoji: "💎" },
	{ key: "necklace", label: "Necklace", emoji: "📿" },
	{ key: "ring",     label: "Ring",     emoji: "💍" },
	{ key: "bracelet", label: "Bracelet", emoji: "✨" },
];

// ─── background removal helpers ───────────────────────────────────────────────

/**
 * Sample the 4 corner pixels to detect the background colour, then make
 * pixels that are close to that colour transparent (smooth falloff).
 * Works for white, light-grey, cream and any other solid-ish product background.
 */
async function removeCanvasBg(img: HTMLImageElement): Promise<string> {
	const canvas = document.createElement("canvas");
	canvas.width  = img.naturalWidth;
	canvas.height = img.naturalHeight;
	const ctx = canvas.getContext("2d")!;
	ctx.drawImage(img, 0, 0);

	const W = canvas.width;
	const H = canvas.height;
	const id = ctx.getImageData(0, 0, W, H);
	const px = id.data;

	// Average colour of the 4 corners
	const cornerIdx = [0, (W - 1), (H - 1) * W, (H - 1) * W + (W - 1)];
	let bgR = 0, bgG = 0, bgB = 0;
	for (const i of cornerIdx) {
		bgR += px[i * 4];
		bgG += px[i * 4 + 1];
		bgB += px[i * 4 + 2];
	}
	bgR /= 4; bgG /= 4; bgB /= 4;

	// Threshold: pixels within 40 colour units of the background get erased
	const THRESH = 40;
	for (let i = 0; i < px.length; i += 4) {
		const diff = Math.max(
			Math.abs(px[i] - bgR),
			Math.abs(px[i + 1] - bgG),
			Math.abs(px[i + 2] - bgB),
		);
		if (diff < THRESH) {
			px[i + 3] = Math.round((diff / THRESH) * 255); // smooth falloff
		}
	}

	ctx.putImageData(id, 0, 0);
	return canvas.toDataURL("image/png");
}

async function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((res, rej) => {
		const img = new Image();
		img.onload  = () => res(img);
		img.onerror = rej;
		img.src     = src;
	});
}

// ─── canvas drawing ───────────────────────────────────────────────────────────
function toPx(pt: Pt, cw: number, ch: number, mirror: boolean): [number, number] {
	return [mirror ? (1 - pt.x) * cw : pt.x * cw, pt.y * ch];
}

function drawJewel(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	cx: number, cy: number,
	size: number,
	adj: Adj,
	blend: BlendMode,
	angle = 0,
) {
	const w = size * adj.scale;
	const h = w * ((img.naturalHeight || 1) / (img.naturalWidth || 1));
	ctx.save();
	ctx.globalAlpha          = Math.max(0, Math.min(1, adj.opacity));
	ctx.globalCompositeOperation = blend === "multiply" ? "multiply" : "source-over";
	// drop-shadow filter works on transparent PNGs (unlike ctx.shadow*)
	const sh = Math.round(size * 0.04);
	ctx.filter = `drop-shadow(1px ${Math.max(2, sh)}px ${Math.max(4, sh * 2)}px rgba(0,0,0,0.45))`;
	ctx.translate(cx + adj.x, cy + adj.y);
	if (angle !== 0) ctx.rotate(angle);
	ctx.drawImage(img, -w / 2, -h / 2, w, h);
	ctx.restore();
}

function overlayJewel(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
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
			const sz   = faceW * 0.18;
			const drop = faceH * 0.07;
			drawJewel(ctx, img, elx, ely + drop, sz, adj, blend);
			drawJewel(ctx, img, erx, ery + drop, sz, adj, blend);
			return true;
		}
		drawJewel(ctx, img, cx, chiny + faceH * 0.28, faceW * 1.1, adj, blend);
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
			drawJewel(ctx, img, (r13x + r14x) / 2, (r13y + r14y) / 2, fingerLen * 0.75, adj, blend, angle);
			return true;
		}

		// bracelet
		const [wx,   wy]  = toPx(hand[0],  cw, ch, mirror);
		const [i5x,  i5y] = toPx(hand[5],  cw, ch, mirror);
		const [p17x, p17y] = toPx(hand[17], cw, ch, mirror);
		const wristW = Math.hypot(p17x - i5x, p17y - i5y) * 1.15;
		const angle  = Math.atan2(p17y - i5y, p17x - i5x);
		drawJewel(ctx, img, wx, wy, wristW, adj, blend, angle);
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

	const canvasRef   = useRef<HTMLCanvasElement>(null);
	const videoRef    = useRef<HTMLVideoElement>(null);
	const jewImgRef   = useRef<HTMLImageElement | null>(null);
	const bodyImgRef  = useRef<HTMLImageElement | null>(null);
	const faceLMRef   = useRef<any>(null);
	const handLMRef   = useRef<any>(null);
	const animRef     = useRef(0);
	const streamRef   = useRef<MediaStream | null>(null);
	const isDrag      = useRef(false);
	const dragOrigin  = useRef({ mx: 0, my: 0, ax: 0, ay: 0 });
	const faceLmsRef  = useRef<Pt[] | null>(null);
	const handLmsRef  = useRef<Pt[][] | null>(null);
	const isDetecting = useRef(false);
	const touchOrig   = useRef<{ x: number; y: number; ax: number; ay: number; dist?: number } | null>(null);

	// Keep refs in sync for rAF loop
	const modeRef  = useRef(mode);
	const jtypeRef = useRef(jtype);
	const adjRef   = useRef(adj);
	const blendRef = useRef(blend);
	useEffect(() => { modeRef.current  = mode;  }, [mode]);
	useEffect(() => { jtypeRef.current = jtype; }, [jtype]);
	useEffect(() => { adjRef.current   = adj;   }, [adj]);
	useEffect(() => { blendRef.current = blend; }, [blend]);

	// ── Load MediaPipe ──────────────────────────────────────────────────────
	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const { FaceLandmarker, HandLandmarker, FilesetResolver } =
					await import("@mediapipe/tasks-vision");
				const vision = await FilesetResolver.forVisionTasks(MP_WASM);

				const tryCreate = async (Ctor: any, modelAssetPath: string, extra: object) => {
					const opts = (delegate: "GPU" | "CPU") => ({
						baseOptions: { modelAssetPath, delegate }, ...extra,
					});
					return Ctor.createFromOptions(vision, opts("GPU")).catch(
						() => Ctor.createFromOptions(vision, opts("CPU")),
					);
				};

				const [face, hand] = await Promise.all([
					tryCreate(FaceLandmarker, FACE_TASK, { runningMode: "VIDEO", numFaces: 1 }),
					tryCreate(HandLandmarker, HAND_TASK, { runningMode: "VIDEO", numHands: 2 }),
				]);
				if (alive) { faceLMRef.current = face; handLMRef.current = hand; setMpReady(true); }
			} catch (e: any) {
				if (alive) setMpErr(e?.message ?? "AI vision failed to load");
			}
		})();
		return () => { alive = false; };
	}, []);

	// ── Webcam rAF loop ─────────────────────────────────────────────────────
	const tick = useCallback(() => {
		const video  = videoRef.current;
		const canvas = canvasRef.current;
		if (!video || !canvas || modeRef.current !== "live") return;
		const ctx = canvas.getContext("2d");
		if (!ctx || video.readyState < 2) { animRef.current = requestAnimationFrame(tick); return; }

		const vw = video.videoWidth || 640;
		const vh = video.videoHeight || 480;
		if (canvas.width !== vw || canvas.height !== vh) { canvas.width = vw; canvas.height = vh; }

		// Mirrored frame
		ctx.save(); ctx.scale(-1, 1); ctx.drawImage(video, -vw, 0, vw, vh); ctx.restore();

		const now = performance.now();
		const jt  = jtypeRef.current;

		if (faceLMRef.current && (jt === "earring" || jt === "necklace")) {
			try { const r = faceLMRef.current.detectForVideo(video, now); faceLmsRef.current = r.faceLandmarks?.[0] ?? null; setDetected(!!faceLmsRef.current); } catch { /* skip */ }
		} else { faceLmsRef.current = null; }

		if (handLMRef.current && (jt === "ring" || jt === "bracelet")) {
			try { const r = handLMRef.current.detectForVideo(video, now); handLmsRef.current = r.landmarks?.length ? r.landmarks : null; setDetected(!!handLmsRef.current); } catch { /* skip */ }
		} else { handLmsRef.current = null; }

		if (jewImgRef.current) {
			overlayJewel(ctx, jewImgRef.current, jt,
				faceLmsRef.current, handLmsRef.current,
				vw, vh, adjRef.current, blendRef.current, true);
		}
		animRef.current = requestAnimationFrame(tick);
	}, []);

	// ── Camera start/stop ───────────────────────────────────────────────────
	const startCamera = useCallback(async () => {
		setCamErr(null); setDetected(false);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
			});
			streamRef.current = stream;
			const video = videoRef.current!;
			video.srcObject = stream;
			await video.play();
			setStreaming(true);
			cancelAnimationFrame(animRef.current);
			animRef.current = requestAnimationFrame(tick);
		} catch (e: any) { setCamErr(e?.message ?? "Camera access denied"); }
	}, [tick]);

	const stopCamera = useCallback(() => {
		cancelAnimationFrame(animRef.current);
		streamRef.current?.getTracks().forEach(t => t.stop());
		streamRef.current = null;
		setStreaming(false); setDetected(false);
	}, []);

	// ── Photo detect + render ────────────────────────────────────────────────
	const renderPhoto = useCallback(() => {
		const canvas = canvasRef.current;
		const bodyImg = bodyImgRef.current;
		if (!canvas || !bodyImg) return;
		const MAX = 1920;
		const scale = Math.min(1, MAX / bodyImg.naturalWidth);
		canvas.width  = Math.round(bodyImg.naturalWidth  * scale);
		canvas.height = Math.round(bodyImg.naturalHeight * scale);
		const ctx = canvas.getContext("2d")!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(bodyImg, 0, 0, canvas.width, canvas.height);
		if (jewImgRef.current) {
			overlayJewel(ctx, jewImgRef.current, jtypeRef.current,
				faceLmsRef.current, handLmsRef.current,
				canvas.width, canvas.height, adjRef.current, blendRef.current, false);
		}
	}, []);

	const detectPhoto = useCallback(async () => {
		if (isDetecting.current || !bodyImgRef.current) return;
		if (!faceLMRef.current || !handLMRef.current) { renderPhoto(); return; }
		isDetecting.current = true; setDetecting(true);
		const jt = jtypeRef.current;
		faceLmsRef.current = null; handLmsRef.current = null;
		try {
			if (jt === "earring" || jt === "necklace") {
				await faceLMRef.current.setOptions({ runningMode: "IMAGE" });
				const r = faceLMRef.current.detect(bodyImgRef.current);
				faceLmsRef.current = r.faceLandmarks?.[0] ?? null;
				await faceLMRef.current.setOptions({ runningMode: "VIDEO" });
			}
			if (jt === "ring" || jt === "bracelet") {
				await handLMRef.current.setOptions({ runningMode: "IMAGE" });
				const r = handLMRef.current.detect(bodyImgRef.current);
				handLmsRef.current = r.landmarks?.length ? r.landmarks : null;
				await handLMRef.current.setOptions({ runningMode: "VIDEO" });
			}
		} catch { /* ignore */ }
		setDetected(!!(faceLmsRef.current || handLmsRef.current));
		isDetecting.current = false; setDetecting(false);
		renderPhoto();
	}, [renderPhoto]);

	// Re-render when adj or blend changes (photo mode)
	useEffect(() => { if (mode === "photo" && bodyImgRef.current) renderPhoto(); }, [adj, blend, mode, renderPhoto]);

	// Mode switching
	useEffect(() => {
		if (mode === "live") {
			setPhotoUrl(null); bodyImgRef.current = null;
			faceLmsRef.current = null; handLmsRef.current = null;
			startCamera();
		} else {
			stopCamera();
			const c = canvasRef.current;
			if (c) { const ctx = c.getContext("2d"); ctx?.clearRect(0, 0, c.width, c.height); }
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode]);

	useEffect(() => () => { stopCamera(); cancelAnimationFrame(animRef.current); }, [stopCamera]);

	// Jewellery type change
	useEffect(() => {
		setAdj(DEFAULT_ADJ); setDetected(false);
		if (mode === "photo" && bodyImgRef.current && mpReady) detectPhoto();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jtype]);

	// ── Jewellery upload with background removal ─────────────────────────────
	const handleJewelleryFile = useCallback(async (file: File) => {
		if (!file.type.startsWith("image/")) return;
		setRemoving(true); setCaptured(null);

		let finalImg: HTMLImageElement;

		// 1. Try ML background removal (@imgly)
		try {
			const { removeBackground } = await import("@imgly/background-removal");
			const blob = await removeBackground(file);
			finalImg = await loadImage(URL.createObjectURL(blob));
		} catch {
			// 2. Fallback: canvas-based corner-colour background removal
			try {
				const origUrl  = URL.createObjectURL(file);
				const origImg  = await loadImage(origUrl);
				const cleanUrl = await removeCanvasBg(origImg);
				finalImg = await loadImage(cleanUrl);
			} catch {
				// 3. Last resort: raw original
				finalImg = await loadImage(URL.createObjectURL(file));
			}
		}

		jewImgRef.current = finalImg;
		setJewUrl(finalImg.src);
		setRemoving(false);
		if (mode === "photo" && bodyImgRef.current) detectPhoto();
	}, [mode, detectPhoto]);

	// ── Body photo upload ────────────────────────────────────────────────────
	const handleBodyFile = useCallback(async (file: File) => {
		if (!file.type.startsWith("image/")) return;
		const img = await loadImage(URL.createObjectURL(file));
		bodyImgRef.current = img;
		setPhotoUrl(img.src);
		faceLmsRef.current = null; handLmsRef.current = null;
		if (mpReady) detectPhoto(); else renderPhoto();
	}, [mpReady, detectPhoto, renderPhoto]);

	// Clipboard paste → jewellery upload
	useEffect(() => {
		const fn = (e: ClipboardEvent) => {
			const item = Array.from(e.clipboardData?.items ?? []).find(i => i.type.startsWith("image/"));
			const f = item?.getAsFile();
			if (f) handleJewelleryFile(f);
		};
		window.addEventListener("paste", fn);
		return () => window.removeEventListener("paste", fn);
	}, [handleJewelleryFile]);

	// ── Drag / pinch ─────────────────────────────────────────────────────────
	const onMouseDown = (e: React.MouseEvent) => {
		isDrag.current = true;
		dragOrigin.current = { mx: e.clientX, my: e.clientY, ax: adjRef.current.x, ay: adjRef.current.y };
	};
	const onMouseMove = (e: React.MouseEvent) => {
		if (!isDrag.current) return;
		setAdj(a => ({ ...a, x: dragOrigin.current.ax + (e.clientX - dragOrigin.current.mx), y: dragOrigin.current.ay + (e.clientY - dragOrigin.current.my) }));
	};
	const onMouseUp = () => { isDrag.current = false; };
	const onWheel = (e: React.WheelEvent) => {
		e.preventDefault();
		setAdj(a => ({ ...a, scale: Math.max(0.1, Math.min(5, a.scale * (e.deltaY > 0 ? 0.9 : 1.1))) }));
	};
	const onTouchStart = (e: React.TouchEvent) => {
		if (e.touches.length === 1) {
			const t = e.touches[0];
			touchOrig.current = { x: t.clientX, y: t.clientY, ax: adjRef.current.x, ay: adjRef.current.y };
		} else if (e.touches.length === 2) {
			const dx = e.touches[0].clientX - e.touches[1].clientX;
			const dy = e.touches[0].clientY - e.touches[1].clientY;
			touchOrig.current = { x: 0, y: 0, ax: adjRef.current.x, ay: adjRef.current.y, dist: Math.hypot(dx, dy) };
		}
	};
	const onTouchMove = (e: React.TouchEvent) => {
		if (!touchOrig.current) return;
		e.preventDefault();
		if (e.touches.length === 1) {
			setAdj(a => ({ ...a, x: touchOrig.current!.ax + (e.touches[0].clientX - touchOrig.current!.x), y: touchOrig.current!.ay + (e.touches[0].clientY - touchOrig.current!.y) }));
		} else if (e.touches.length === 2 && touchOrig.current.dist) {
			const dx = e.touches[0].clientX - e.touches[1].clientX;
			const dy = e.touches[0].clientY - e.touches[1].clientY;
			const d  = Math.hypot(dx, dy);
			setAdj(a => ({ ...a, scale: Math.max(0.1, Math.min(5, a.scale * (d / touchOrig.current!.dist!))) }));
			touchOrig.current = { ...touchOrig.current, dist: d };
		}
	};
	const onTouchEnd = () => { touchOrig.current = null; };

	// ── Capture / download ────────────────────────────────────────────────────
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

			{/* ── Left Controls ────────────────────────────────────────────── */}
			<div className="flex w-full flex-col gap-5 lg:w-64 lg:shrink-0">

				{/* Type */}
				<div>
					<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#888882]">Type</p>
					<div className="grid grid-cols-2 gap-1.5">
						{JTYPES.map(({ key, label, emoji }) => (
							<button
								key={key}
								onClick={() => setJtype(key)}
								className={`rounded-lg border px-2 py-2 text-[11px] font-medium transition-all ${
									jtype === key
										? "border-[#C4A84F] bg-[#C4A84F]/10 text-[#C4A84F]"
										: "border-[#E5E5E0] text-[#888882] hover:border-[#C4A84F]/40 dark:border-[#2A2A28]"
								}`}
							>
								<span className="mr-1">{emoji}</span>{label}
							</button>
						))}
					</div>
				</div>

				{/* Jewellery upload */}
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
							</>
						) : jewUrl ? (
							<>
								<img src={jewUrl} alt="" className="h-16 w-16 object-contain" style={{ background: "repeating-conic-gradient(#e5e5e5 0% 25%,#f5f5f5 0% 50%) 0 0 / 12px 12px" }} />
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

				{/* Mode */}
				<div>
					<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#888882]">Mode</p>
					<div className="flex overflow-hidden rounded-lg border border-[#E5E5E0] dark:border-[#2A2A28]">
						{(["live", "photo"] as Mode[]).map(m => (
							<button key={m} onClick={() => setMode(m)}
								className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors ${
									mode === m
										? "bg-[#0D0D0B] text-[#F0F0EB] dark:bg-[#F0F0EB] dark:text-[#0D0D0B]"
										: "text-[#888882] hover:text-[#0D0D0B] dark:hover:text-[#F0F0EB]"
								}`}
							>
								{m === "live" ? <><Camera className="h-3.5 w-3.5" />Live</> : <><Upload className="h-3.5 w-3.5" />Photo</>}
							</button>
						))}
					</div>
				</div>

				{/* Body photo (photo mode) */}
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
								<><div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C4A84F] border-t-transparent" /><span className="text-[11px] text-[#888882]">Detecting landmarks…</span></>
							) : photoUrl ? (
								<><img src={photoUrl} alt="" className="h-12 w-12 rounded-lg object-cover" /><span className="text-[10px] text-[#ADADAA]">Click to change</span></>
							) : (
								<><Upload className="h-5 w-5 text-[#ADADAA]" /><span className="text-[11px] text-[#888882]">Upload your photo</span><span className="text-[10px] text-[#ADADAA]">Face, hand, or body</span></>
							)}
						</label>
					</div>
				)}

				{/* Adjustments */}
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

						{/* Blend mode toggle — helps when jewellery still has slight bg remnants */}
						<div className="flex items-center justify-between rounded-lg border border-[#E5E5E0] px-3 py-2 dark:border-[#2A2A28]">
							<div>
								<p className="text-[11px] font-medium text-[#888882]">Blend mode</p>
								<p className="text-[10px] text-[#ADADAA]">{blend === "multiply" ? "Merges with skin tone" : "Natural overlay"}</p>
							</div>
							<button
								onClick={() => setBlend(b => b === "normal" ? "multiply" : "normal")}
								className={`relative h-5 w-9 rounded-full transition-colors ${blend === "multiply" ? "bg-[#C4A84F]" : "bg-[#E5E5E0] dark:bg-[#2A2A28]"}`}
							>
								<span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${blend === "multiply" ? "translate-x-4" : "translate-x-0.5"}`} />
							</button>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					<button onClick={() => setAdj(DEFAULT_ADJ)}
						className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E5E0] py-2 text-[11px] text-[#888882] transition-colors hover:text-[#0D0D0B] dark:border-[#2A2A28] dark:hover:text-[#F0F0EB]"
					>
						<RefreshCcw className="h-3.5 w-3.5" /> Reset
					</button>
					<button onClick={capture} disabled={!canvasLive || !jewUrl}
						className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#C4A84F] py-2 text-[11px] font-medium text-white transition-opacity disabled:opacity-40"
					>
						<Camera className="h-3.5 w-3.5" /> Capture
					</button>
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
									{mode === "live" ? "Allow camera access when prompted" : "Supports face, hand, and body shots"}
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
