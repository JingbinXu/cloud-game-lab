import type { ItemAnswers } from '../../types/cabin'

type DrawFn = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, p: ItemAnswers) => void

function ctxSetup(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#2c2416'
  ctx.fillStyle = '#fafaf8'
  ctx.lineWidth = 1.6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

/* ============ LIVING ROOM ============ */

export const drawClock: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx)
  const f = p.form || 'round', sz = p.size || 'm'
  const scale: Record<string, number> = { xs: 0.55, s: 0.7, m: 1, l: 1.3, xl: 1.6 }
  ctx.save(); ctx.translate(x, y); ctx.scale(scale[sz] || 1, scale[sz] || 1)
  if (f === 'grandfather') {
    ctx.strokeRect(-10, -32, 20, 40); ctx.strokeRect(-14, -34, 28, 4)
    ctx.beginPath(); ctx.arc(0, -22, 8, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, -17); ctx.moveTo(0, -22); ctx.lineTo(4, -20); ctx.stroke()
  } else if (f === 'round') {
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -8); ctx.moveTo(0, 0); ctx.lineTo(5, -2); ctx.stroke()
  } else if (f === 'digital') {
    ctx.strokeRect(-13, -8, 26, 16); ctx.strokeRect(-10, -5, 8, 10); ctx.strokeRect(1, -5, 8, 10)
  } else {
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke()
    for (let i = 0; i < 5; i++) { const a = i * 0.8 - 0.6; ctx.strokeRect(Math.cos(a) * 10 - 3, Math.sin(a) * 10 - 3, 6, 6) }
  }
  ctx.restore()
}

export const drawSofa: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'loveseat'
  if (f === 'loveseat') {
    ctx.strokeRect(x - 16, y - 6, 32, 12); ctx.strokeRect(x - 18, y - 7, 4, 16); ctx.strokeRect(x + 14, y - 7, 4, 16)
  } else if (f === 'lshape') {
    ctx.strokeRect(x - 18, y - 6, 24, 12); ctx.strokeRect(x + 6, y - 6, 12, 20); ctx.strokeRect(x + 6, y + 14, 12, 4)
  } else if (f === 'ushape') {
    ctx.strokeRect(x - 20, y - 8, 16, 20); ctx.strokeRect(x + 4, y - 8, 16, 20); ctx.strokeRect(x - 20, y - 10, 40, 4)
  } else {
    ctx.strokeRect(x - 22, y - 8, 14, 14); ctx.strokeRect(x - 8, y - 6, 16, 12)
    ctx.strokeRect(x + 10, y - 8, 14, 14); ctx.strokeRect(x - 4, y + 6, 16, 10)
  }
}

export const drawPhone: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'smart', sz = p.size || 'm'
  const scale: Record<string, number> = { xs: 0.6, s: 0.75, m: 1, l: 1.25, xl: 1.5 }
  ctx.save(); ctx.translate(x, y); ctx.scale(scale[sz] || 1, scale[sz] || 1)
  if (f === 'smart') { ctx.strokeRect(-7, -12, 14, 24); ctx.strokeRect(-5, -9, 10, 16) }
  else if (f === 'rotary') { ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke(); ctx.strokeRect(-12, 8, 24, 14) }
  else if (f === 'deskphone') { ctx.strokeRect(-10, -5, 20, 14); ctx.strokeRect(-12, 4, 24, 8) }
  else { ctx.strokeRect(-6, -8, 12, 16) }
  ctx.restore()
}

export const drawCoffeetable: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'mic', sz = p.size || 'm'
  const scale: Record<string, number> = { xs: 0.55, s: 0.7, m: 1, l: 1.35, xl: 1.7 }
  ctx.save(); ctx.translate(x, y); ctx.scale(scale[sz] || 1, scale[sz] || 1)
  ctx.strokeRect(-15, -3, 30, 6); ctx.strokeRect(-10, 3, 3, 8); ctx.strokeRect(7, 3, 3, 8)
  if (f === 'mic') { ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(0, -8); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -10, 4, 0, Math.PI * 2); ctx.stroke() }
  ctx.restore()
}

export const drawDoormat: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 's'
  const sizes: Record<string, [number, number]> = { s: [14, 6], m: [22, 8], l: [30, 10], xl: [38, 12] }
  const [wm, hm] = sizes[f] || sizes.m
  ctx.beginPath(); ctx.ellipse(x, y, wm / 2, hm / 2, 0, 0, Math.PI * 2); ctx.stroke()
}

export const drawPictureframe: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'wide'
  if (f === 'double') {
    ctx.strokeRect(x - 14, y - 8, 12, 16); ctx.strokeRect(x + 4, y - 8, 12, 16); return
  }
  const sizes: Record<string, [number, number]> = { wide: [24, 16], tall: [14, 22], desk: [10, 12] }
  const [fw, fh] = sizes[f] || sizes.wide
  ctx.strokeRect(x - fw / 2, y - fh / 2, fw, fh)
  ctx.lineWidth = 0.6; ctx.strokeRect(x - fw / 2 + 3, y - fh / 2 + 3, fw - 6, fh - 6); ctx.lineWidth = 1.6
}

/* ============ STUDY ============ */

export const drawBookshelf: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'standard'
  const cfg: Record<string, [number, number, number]> = {
    tallnarrow: [14, 30, 4], standard: [24, 26, 4], wide: [34, 22, 3], wall: [42, 20, 2],
  }
  const [bw, bh, rows] = cfg[f] || cfg.standard
  ctx.strokeRect(x - bw / 2, y - bh / 2, bw, bh)
  for (let r = 1; r < rows; r++) { ctx.beginPath(); ctx.moveTo(x - bw / 2, y - bh / 2 + r * bh / rows); ctx.lineTo(x + bw / 2, y - bh / 2 + r * bh / rows); ctx.stroke() }
}

export const drawMonitor: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'laptop', sz = p.size || 'm'
  const scale: Record<string, number> = { xs: 0.55, s: 0.7, m: 1, l: 1.3, xl: 1.6 }
  ctx.save(); ctx.translate(x, y); ctx.scale(scale[sz] || 1, scale[sz] || 1)
  if (f === 'bigscreen') ctx.strokeRect(-14, -10, 28, 18)
  else if (f === 'dual') { ctx.strokeRect(-20, -8, 18, 14); ctx.strokeRect(2, -8, 18, 14) }
  else if (f === 'laptop') ctx.strokeRect(-10, -7, 20, 14)
  else { ctx.strokeRect(-22, -8, 14, 14); ctx.strokeRect(-6, -8, 14, 14); ctx.strokeRect(10, -8, 12, 10) }
  ctx.restore()
}

export const drawWhiteboard: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'big'
  if (f === 'big') ctx.strokeRect(x - 18, y - 12, 36, 24)
  else if (f === 'smalldata') ctx.strokeRect(x - 10, y - 8, 20, 16)
  else if (f === 'mid') ctx.strokeRect(x - 14, y - 10, 28, 20)
  else { for (let i = 0; i < 3; i++) ctx.strokeRect(x - 18 + i * 13, y - 8, 11, 16) }
}

export const drawPenholder: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx)
  ctx.beginPath(); ctx.moveTo(x - 8, y - 8); ctx.lineTo(x - 6, y + 10); ctx.lineTo(x + 8, y + 10); ctx.lineTo(x + 8, y - 6); ctx.closePath(); ctx.stroke()
  const count: Record<string, number> = { sparse: 2, half: 5, full: 9, multi: 14 }
  const n = count[p.density || 'half'] || 5
  ctx.lineWidth = 0.7
  for (let i = 0; i < Math.min(n, 15); i++) { ctx.beginPath(); ctx.moveTo(x - 4 + i * 1.2, y - 5 - i * 0.3); ctx.lineTo(x - 4 + i * 1.2, y - 12 - i * 0.3); ctx.stroke() }
  ctx.lineWidth = 1.6
}

export const drawMagnifier: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'standard', sz = p.size || 'm'
  const scale: Record<string, number> = { xs: 0.5, s: 0.7, m: 1, l: 1.3, xl: 1.6 }
  ctx.save(); ctx.translate(x, y); ctx.scale(scale[sz] || 1, scale[sz] || 1)
  if (f === 'pro') { ctx.beginPath(); ctx.arc(-2, -2, 10, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(14, 15); ctx.stroke() }
  else if (f === 'standard') { ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(12, 13); ctx.stroke() }
  else if (f === 'portable') { ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.stroke() }
  else { ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke() }
  ctx.restore()
}

export const drawCorkboard: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); ctx.strokeRect(x - 16, y - 12, 32, 24)
  const count: Record<string, number> = { sparse: 2, mid: 5, dense: 10, overflow: 18 }
  const n = count[p.density || 'mid'] || 5
  ctx.lineWidth = 0.5
  for (let i = 0; i < Math.min(n, 20); i++) ctx.strokeRect(x - 12 + (i % 5) * 5, y - 8 + Math.floor(i / 5) * 6, 4, 5)
  ctx.lineWidth = 1.6
}

/* ============ KITCHEN ============ */

export const drawStove: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); ctx.strokeRect(x - 14, y - 6, 28, 16)
  const burners: Record<string, number> = { one: 1, two: 2, four: 4, many: 6 }
  const n = burners[p.density || 'two'] || 2
  for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x - 8 + (i % 3) * 8, y - 2 + Math.floor(i / 3) * 5, 3.5, 0, Math.PI * 2); ctx.stroke() }
}

export const drawPots: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'wok'
  const sets: Record<string, [number, number, number, number][]> = {
    saucepan: [[0, 0, 10, 12]],
    wok: [[-10, 2, 12, 14], [5, -3, 10, 12]],
    stockpot: [[-14, -2, 14, 20]],
    commercial: [[-18, -4, 16, 22], [2, -6, 14, 18], [6, -12, 10, 14]],
  }
  ;(sets[f] || sets.wok).forEach(([px, py, pw, ph]) => { ctx.strokeRect(x + px - pw / 2, y + py - ph / 2, pw, ph) })
}

export const drawRecipestand: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx)
  const th: Record<string, number> = { thick: 16, mid: 10, thin: 5, empty: 1 }
  const t = th[p.form || 'mid'] || 10
  ctx.strokeRect(x - 8, y - t / 2, 16, t)
  if (p.form !== 'empty') { ctx.beginPath(); ctx.moveTo(x, y - t / 2); ctx.lineTo(x, y + t / 2); ctx.stroke() }
}

export const drawTimer: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'mechanical', sz = p.size || 'm'
  const scale: Record<string, number> = { simple: 0.5, s: 0.7, m: 1, l: 1.3 }
  ctx.save(); ctx.translate(x, y); ctx.scale(scale[sz] || 1, scale[sz] || 1)
  if (f === 'digital') ctx.strokeRect(-8, -10, 16, 20)
  else if (f === 'mechanical') { ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -8); ctx.stroke() }
  else if (f === 'hourglass') {
    ctx.beginPath(); ctx.moveTo(-6, -12); ctx.lineTo(6, -12); ctx.lineTo(0, 0); ctx.lineTo(-6, -12); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(6, 12); ctx.lineTo(0, 0); ctx.lineTo(-6, 12); ctx.stroke()
  } else { ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke() }
  ctx.restore()
}

export const drawSpicerack: DrawFn = (ctx, x, y, _s, _p) => {
  ctxSetup(ctx); ctx.strokeRect(x - 10, y - 8, 20, 16)
  ctx.beginPath(); ctx.moveTo(x - 10, y - 4); ctx.lineTo(x + 10, y - 4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.stroke()
}

export const drawKnifeblock: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'utility', sz = p.size || 'm'
  const scale: Record<string, number> = { xs: 0.5, s: 0.7, m: 1, l: 1.3 }
  ctx.save(); ctx.translate(x, y); ctx.scale(scale[sz] || 1, scale[sz] || 1)
  ctx.strokeRect(-8, -6, 16, 14)
  if (f === 'chef') { ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(1, -16); ctx.stroke() }
  else if (f === 'utility') { ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(1, -12); ctx.stroke() }
  else if (f === 'fruit') { ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -8); ctx.stroke() }
  ctx.restore()
}

/* ============ BEDROOM ============ */

export const drawBed: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const sz = p.size || 'm'
  const scale: Record<string, number> = { xs: 0.45, s: 0.6, m: 1, l: 1.4, xl: 1.8 }
  ctx.save(); ctx.translate(x, y); ctx.scale(scale[sz] || 1, scale[sz] || 1)
  ctx.strokeRect(-18, -6, 36, 16); ctx.strokeRect(-20, -8, 4, 20); ctx.strokeRect(16, -8, 4, 20)
  ctx.restore()
}

export const drawAlarmclock: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'twinbell', sz = p.size || 'm'
  const scale: Record<string, number> = { xs: 0.55, s: 0.7, m: 1, l: 1.3 }
  ctx.save(); ctx.translate(x, y); ctx.scale(scale[sz] || 1, scale[sz] || 1)
  if (f === 'swiss') ctx.strokeRect(-8, -6, 16, 14)
  else if (f === 'twinbell') {
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(-5, -6, 3, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(5, -6, 3, 0, Math.PI * 2); ctx.stroke()
  } else ctx.strokeRect(-8, -8, 16, 16)
  ctx.restore()
}

export const drawMirror: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'normal'
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke()
  if (f === 'blurry') {
    ctx.lineWidth = 0.4; ctx.setLineDash([1, 3])
    ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([]); ctx.lineWidth = 1.6
  }
}

export const drawCoatrack: DrawFn = (ctx, x, y, _s, _p) => {
  ctxSetup(ctx)
  ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x, y + 12); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - 12, y + 12); ctx.lineTo(x + 12, y + 12); ctx.stroke()
}

export const drawNotebook: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'mid'
  const th: Record<string, number> = { thick: 14, mid: 9, thin: 4, empty: 1 }
  const t = th[f] || 9
  ctx.strokeRect(x - 10, y - t / 2, 20, t)
  if (f !== 'empty') { ctx.beginPath(); ctx.moveTo(x, y - t / 2); ctx.lineTo(x, y + t / 2); ctx.stroke() }
}

export const drawDesklamp: DrawFn = (ctx, x, y, _s, _p) => {
  ctxSetup(ctx)
  ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x, y - 4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - 4, y - 2); ctx.lineTo(x + 4, y - 8); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - 3, y - 3); ctx.lineTo(x, y - 8); ctx.lineTo(x + 3, y - 7); ctx.stroke()
}

/* ============ BALCONY ============ */

export const drawPottedplant: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'small'
  ctx.beginPath(); ctx.moveTo(x - 8, y + 8); ctx.lineTo(x - 6, y - 4); ctx.lineTo(x + 6, y - 4); ctx.lineTo(x + 8, y + 8); ctx.closePath(); ctx.stroke()
  if (f === 'tree') {
    ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x, y - 12); ctx.stroke()
    ctx.beginPath(); ctx.arc(x, y - 14, 10, 0, Math.PI * 2); ctx.stroke()
  } else if (f === 'flowering') {
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x - 4 + i * 5, y - 4, 4, 0, Math.PI * 2); ctx.stroke() }
  } else if (f === 'small') { ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 1); ctx.stroke() }
}

export const drawTelescope: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'bino'
  if (f === 'astro') {
    ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(x - 4, y - 6); ctx.lineTo(x - 6, y - 18); ctx.lineTo(x + 6, y - 18); ctx.lineTo(x + 4, y - 6); ctx.closePath(); ctx.stroke()
  } else if (f === 'bino') { ctx.strokeRect(x - 6, y - 6, 5, 14); ctx.strokeRect(x + 3, y - 6, 5, 14) }
  else if (f === 'toy') ctx.strokeRect(x - 4, y - 5, 8, 12)
}

export const drawWindvane: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx)
  ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.lineTo(x, y - 12); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - 8, y + 12); ctx.lineTo(x + 8, y + 12); ctx.stroke()
  if (p.form !== 'removed') {
    ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x + 10, y - 8); ctx.lineTo(x, y - 6); ctx.closePath(); ctx.stroke()
  }
}

export const drawBalconytable: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx)
  const chairs: Record<string, number> = { empty: 0, sparse: 2, mid: 4, dense: 7 }
  const n = chairs[p.density || 'mid'] || 3
  ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke()
  for (let i = 0; i < n; i++) {
    ctx.beginPath(); ctx.arc(x + Math.cos(i * Math.PI * 2 / n - Math.PI / 2) * 16, y + Math.sin(i * Math.PI * 2 / n - Math.PI / 2) * 16, 3.5, 0, Math.PI * 2); ctx.stroke()
  }
}

export const drawClothesline: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const sz = p.size || 'm'
  const ls: Record<string, number> = { xs: 10, s: 18, m: 28, l: 38 }
  const len = ls[sz] || 18
  ctx.beginPath(); ctx.moveTo(x - len / 2, y - 10); ctx.lineTo(x + len / 2, y - 10); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - len / 2 - 2, y - 10); ctx.lineTo(x - len / 2 - 2, y); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x + len / 2 + 2, y - 10); ctx.lineTo(x + len / 2 + 2, y); ctx.stroke()
}

export const drawWindchime: DrawFn = (ctx, x, y, _s, p) => {
  ctxSetup(ctx); const f = p.form || 'mid'
  ctx.beginPath(); ctx.moveTo(x - 6, y - 16); ctx.lineTo(x + 6, y - 16); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x, y - 20); ctx.stroke()
  if (f === 'long') { for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x - 8 + i * 4, y - 16); ctx.lineTo(x - 8 + i * 4, y - 6); ctx.stroke() } }
  else if (f === 'mid') { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - 6 + i * 6, y - 16); ctx.lineTo(x - 6 + i * 6, y - 8); ctx.stroke() } }
  else if (f === 'short') { ctx.beginPath(); ctx.moveTo(x - 4, y - 16); ctx.lineTo(x - 4, y - 10); ctx.stroke() }
}

/** 所有物品绘制函数的查找表 */
export const drawFnMap: Record<string, DrawFn> = {
  clock: drawClock, sofa: drawSofa, phone: drawPhone, coffeetable: drawCoffeetable,
  doormat: drawDoormat, pictureframe: drawPictureframe,
  bookshelf: drawBookshelf, monitor: drawMonitor, whiteboard: drawWhiteboard,
  penholder: drawPenholder, magnifier: drawMagnifier, corkboard: drawCorkboard,
  stove: drawStove, pots: drawPots, recipestand: drawRecipestand, timer: drawTimer,
  spicerack: drawSpicerack, knifeblock: drawKnifeblock,
  bed: drawBed, alarmclock: drawAlarmclock, mirror: drawMirror,
  coatrack: drawCoatrack, notebook: drawNotebook, desklamp: drawDesklamp,
  pottedplant: drawPottedplant, telescope: drawTelescope, windvane: drawWindvane,
  balconytable: drawBalconytable, clothesline: drawClothesline, windchime: drawWindchime,
}
