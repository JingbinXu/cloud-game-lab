import type { ItemAnswers } from '../../types/cabin'

type DrawFn = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, p: ItemAnswers) => void

/** 从 tone 属性获取主色调 */
function toneColor(tone: string): string {
  const map: Record<string, string> = {
    warm: '#B8860B', cool: '#5B7FA5', neutral: '#8B8680',
    dark: '#4A3728', light: '#D4C8B8', bright: '#C05746',
    muted: '#9B8E7E', gold: '#C0882A', silver: '#8B9DAF',
    wooden: '#8B6914', vintage: '#8B7355', modern: '#5A6670',
    fresh: '#6B9E6B', warm_wood: '#A0724A', deep: '#3A3028',
    soft: '#B8A898', earthy: '#7A6A50',
  }
  return map[tone] || '#8B8680'
}

/** 从 condition 属性获取透明度/状态 */
function conditionAlpha(cond: string): number {
  const map: Record<string, number> = {
    new: 1, used: 0.85, worn: 0.65, broken: 0.45,
    fresh: 1, dusty: 0.7, clean: 0.95, stained: 0.6,
    tidy: 0.95, messy: 0.75, stopped: 0.5, empty: 0.4,
    active: 1, full: 1,
  }
  return map[cond] || 0.9
}

/** 绘制阴影 */
function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save()
  ctx.fillStyle = 'rgba(44, 36, 22, 0.08)'
  ctx.beginPath()
  ctx.ellipse(x, y + h / 2 + 3, w / 2 + 2, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/** 通用绘制设置 */
function baseSetup(ctx: CanvasRenderingContext2D, fill: string, stroke: string = '#2c2416') {
  ctx.fillStyle = fill
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

const scaleMap: Record<string, number> = { xs: 0.5, s: 0.7, m: 1, l: 1.3, xl: 1.6 }

/* ============ LIVING ROOM ============ */

export const drawClock: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'round', sz = p.size || 'm', tone = p.tone || 'warm', cond = p.condition || 'used'
  const sc = scaleMap[sz] || 1, fill = toneColor(tone), alpha = conditionAlpha(cond)
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha = alpha
  if (f === 'grandfather') {
    // 落地钟
    drawShadow(ctx, 0, 20, 24, 4)
    baseSetup(ctx, '#3A2A16', '#2c2416')
    ctx.fillRect(-12, -34, 24, 52)
    ctx.strokeRect(-12, -34, 24, 52)
    ctx.fillRect(-14, -36, 28, 4)
    ctx.strokeRect(-14, -36, 28, 4)
    ctx.fillRect(-10, 16, 20, 4)
    // 表盘
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.arc(0, -20, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 指针
    ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, -14); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(5, -18); ctx.stroke()
    // 钟摆
    ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 8); ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 10, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  } else if (f === 'round') {
    drawShadow(ctx, 0, 14, 28, 4)
    // 外圈
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 内圈
    baseSetup(ctx, '#fafaf8', '#8b7a65')
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 刻度
    ctx.fillStyle = '#5a4a35'
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2
      const r = i % 3 === 0 ? 8 : 9
      ctx.beginPath()
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, i % 3 === 0 ? 1.2 : 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
    // 指针
    ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -7); ctx.stroke()
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, -2); ctx.stroke()
    // 中心点
    ctx.fillStyle = '#2c2416'
    ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, Math.PI * 2); ctx.fill()
  } else if (f === 'digital') {
    drawShadow(ctx, 0, 10, 28, 4)
    baseSetup(ctx, '#2c2416', '#1a1410')
    ctx.beginPath()
    ctx.roundRect(-14, -9, 28, 18, 3)
    ctx.fill(); ctx.stroke()
    // 屏幕
    ctx.fillStyle = '#3a5a3a'
    ctx.beginPath()
    ctx.roundRect(-11, -6, 22, 12, 2)
    ctx.fill()
    // 数字
    ctx.fillStyle = '#7ccc7c'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('12:30', 0, 3)
    ctx.textAlign = 'start'
  } else {
    // busy — 多功能钟
    drawShadow(ctx, 0, 16, 30, 4)
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    baseSetup(ctx, '#fafaf8', '#8b7a65')
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 多个子表盘
    for (let i = 0; i < 3; i++) {
      const ox = (i - 1) * 7
      ctx.beginPath(); ctx.arc(ox, 0, 4, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -7); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(4, -2); ctx.stroke()
  }
  ctx.restore()
}

export const drawSofa: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'loveseat', tone = p.tone || 'warm', cond = p.condition || 'used'
  const fill = toneColor(tone), alpha = conditionAlpha(cond)
  ctx.save(); ctx.globalAlpha = alpha
  if (f === 'loveseat') {
    drawShadow(ctx, x, y + 8, 36, 4)
    // 靠背
    baseSetup(ctx, '#D4C8B8', '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 18, y - 10, 36, 8, 3); ctx.fill(); ctx.stroke()
    // 座垫
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 17, y - 3, 34, 10, 2); ctx.fill(); ctx.stroke()
    // 扶手
    baseSetup(ctx, '#6B5B4A', '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 20, y - 8, 5, 16, 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(x + 15, y - 8, 5, 16, 2); ctx.fill(); ctx.stroke()
    // 腿
    ctx.fillStyle = '#4A3728'
    ctx.fillRect(x - 15, y + 7, 3, 4)
    ctx.fillRect(x + 12, y + 7, 3, 4)
  } else if (f === 'lshape') {
    drawShadow(ctx, x, y + 10, 40, 4)
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 20, y - 6, 26, 12, 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(x + 6, y - 6, 14, 22, 2); ctx.fill(); ctx.stroke()
    // 靠背
    baseSetup(ctx, '#D4C8B8', '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 20, y - 10, 26, 5, 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(x + 6, y - 10, 14, 5, 2); ctx.fill(); ctx.stroke()
    // 腿
    ctx.fillStyle = '#4A3728'
    ctx.fillRect(x - 18, y + 6, 3, 4)
    ctx.fillRect(x + 16, y + 14, 3, 4)
  } else if (f === 'ushape') {
    drawShadow(ctx, x, y + 12, 44, 4)
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 22, y - 8, 18, 22, 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(x + 4, y - 8, 18, 22, 2); ctx.fill(); ctx.stroke()
    baseSetup(ctx, '#D4C8B8', '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 22, y - 12, 44, 5, 2); ctx.fill(); ctx.stroke()
  } else {
    // sectional
    drawShadow(ctx, x, y + 12, 48, 4)
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 24, y - 8, 16, 14, 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(x - 8, y - 6, 18, 12, 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(x + 10, y - 8, 16, 14, 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(x - 6, y + 6, 18, 12, 2); ctx.fill(); ctx.stroke()
    // 靠背
    baseSetup(ctx, '#D4C8B8', '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 24, y - 12, 50, 5, 2); ctx.fill(); ctx.stroke()
  }
  ctx.restore()
}

export const drawPhone: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'smart', sz = p.size || 'm', tone = p.tone || 'modern'
  const sc = scaleMap[sz] || 1, fill = toneColor(tone)
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc)
  if (f === 'smart') {
    drawShadow(ctx, 0, 14, 16, 3)
    baseSetup(ctx, '#1a1a2e', '#0a0a1a')
    ctx.beginPath(); ctx.roundRect(-8, -13, 16, 26, 3); ctx.fill(); ctx.stroke()
    // 屏幕
    ctx.fillStyle = fill
    ctx.beginPath(); ctx.roundRect(-6, -10, 12, 18, 2); ctx.fill()
    // 刘海
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(-3, -11, 6, 2)
  } else if (f === 'rotary') {
    drawShadow(ctx, 0, 22, 26, 3)
    baseSetup(ctx, fill, '#2c2416')
    // 底座
    ctx.beginPath(); ctx.roundRect(-14, 6, 28, 16, 3); ctx.fill(); ctx.stroke()
    // 转盘
    baseSetup(ctx, '#fafaf8', '#8b7a65')
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 拨号孔
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 1.5 - Math.PI * 0.75
      ctx.beginPath(); ctx.arc(Math.cos(a) * 7, Math.sin(a) * 7, 1.5, 0, Math.PI * 2); ctx.stroke()
    }
    // 听筒
    baseSetup(ctx, '#3A2A16', '#2c2416')
    ctx.beginPath(); ctx.roundRect(-12, -16, 24, 6, 3); ctx.fill(); ctx.stroke()
  } else if (f === 'deskphone') {
    drawShadow(ctx, 0, 12, 26, 3)
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.roundRect(-12, -4, 24, 14, 3); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(-14, 6, 28, 10, 3); ctx.fill(); ctx.stroke()
    // 按键
    ctx.fillStyle = '#fafaf8'
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      ctx.beginPath(); ctx.arc(-6 + j * 6, 9 + i * 0, 1.5, 0, Math.PI * 2); ctx.fill()
    }
    // 听筒
    baseSetup(ctx, '#4A3728', '#2c2416')
    ctx.beginPath(); ctx.roundRect(-10, -8, 20, 5, 2); ctx.fill(); ctx.stroke()
  } else {
    drawShadow(ctx, 0, 10, 14, 3)
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.roundRect(-6, -8, 12, 16, 2); ctx.fill(); ctx.stroke()
    // 按键
    ctx.fillStyle = '#fafaf8'
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      ctx.beginPath(); ctx.arc(-3 + j * 3, -4 + i * 3, 1, 0, Math.PI * 2); ctx.fill()
    }
  }
  ctx.restore()
}

export const drawCoffeetable: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'round', tone = p.tone || 'warm', cond = p.condition || 'used'
  const fill = toneColor(tone), alpha = conditionAlpha(cond)
  ctx.save(); ctx.globalAlpha = alpha
  drawShadow(ctx, x, y + 8, 34, 4)
  // 桌面
  baseSetup(ctx, fill, '#2c2416')
  if (f === 'round') {
    ctx.beginPath(); ctx.ellipse(x, y, 16, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  } else {
    ctx.beginPath(); ctx.roundRect(x - 16, y - 4, 32, 8, 2); ctx.fill(); ctx.stroke()
  }
  // 桌腿
  ctx.fillStyle = '#6B5B4A'
  ctx.fillRect(x - 12, y + 4, 3, 6)
  ctx.fillRect(x + 9, y + 4, 3, 6)
  ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1
  ctx.strokeRect(x - 12, y + 4, 3, 6)
  ctx.strokeRect(x + 9, y + 4, 3, 6)
  ctx.restore()
}

export const drawDoormat: DrawFn = (ctx, x, y, _s, p) => {
  const tone = p.tone || 'earthy', cond = p.condition || 'worn'
  const fill = toneColor(tone), alpha = conditionAlpha(cond)
  ctx.save(); ctx.globalAlpha = alpha
  baseSetup(ctx, fill, '#6B5B4A')
  ctx.beginPath(); ctx.roundRect(x - 16, y - 5, 32, 10, 2); ctx.fill(); ctx.stroke()
  // 纹理
  ctx.strokeStyle = '#5A4A35'; ctx.lineWidth = 0.4
  for (let i = -12; i < 14; i += 3) {
    ctx.beginPath(); ctx.moveTo(x + i, y - 4); ctx.lineTo(x + i, y + 4); ctx.stroke()
  }
  // 边框花纹
  ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 0.8
  ctx.strokeRect(x - 14, y - 3, 28, 6)
  ctx.restore()
}

export const drawPictureframe: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'wide', tone = p.tone || 'warm'
  const fill = toneColor(tone)
  if (f === 'double') {
    drawShadow(ctx, x, y + 10, 30, 3)
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 15, y - 8, 13, 16, 1); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(x + 3, y - 8, 13, 16, 1); ctx.fill(); ctx.stroke()
    // 画芯
    ctx.fillStyle = '#e8dfd0'
    ctx.fillRect(x - 13, y - 6, 9, 12)
    ctx.fillRect(x + 5, y - 6, 9, 12)
    return
  }
  const sizes: Record<string, [number, number]> = { wide: [26, 18], tall: [16, 24], desk: [12, 14] }
  const [fw, fh] = sizes[f] || sizes.wide
  drawShadow(ctx, x, y + fh / 2 + 2, fw, 3)
  // 框架
  baseSetup(ctx, fill, '#2c2416')
  ctx.beginPath(); ctx.roundRect(x - fw / 2, y - fh / 2, fw, fh, 2); ctx.fill(); ctx.stroke()
  // 画芯
  ctx.fillStyle = '#e8dfd0'
  ctx.beginPath(); ctx.roundRect(x - fw / 2 + 3, y - fh / 2 + 3, fw - 6, fh - 6, 1); ctx.fill()
  ctx.strokeStyle = '#c8b898'; ctx.lineWidth = 0.5
  ctx.strokeRect(x - fw / 2 + 3, y - fh / 2 + 3, fw - 6, fh - 6)
}

/* ============ STUDY ============ */

export const drawBookshelf: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'standard', density = p.density || 'half'
  const cfg: Record<string, [number, number, number]> = {
    tallnarrow: [16, 32, 4], standard: [26, 28, 4], wide: [36, 24, 3], wall: [44, 20, 2],
  }
  const [bw, bh, rows] = cfg[f] || cfg.standard
  drawShadow(ctx, x, y + bh / 2 + 3, bw, 4)
  // 书架主体
  baseSetup(ctx, '#8B6914', '#2c2416')
  ctx.beginPath(); ctx.roundRect(x - bw / 2, y - bh / 2, bw, bh, 2); ctx.fill(); ctx.stroke()
  // 隔板
  ctx.fillStyle = '#A07A3A'
  for (let r = 0; r <= rows; r++) {
    const fy = y - bh / 2 + r * (bh / rows)
    ctx.fillRect(x - bw / 2 + 1, fy - 1, bw - 2, 2)
  }
  ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 0.8
  for (let r = 0; r <= rows; r++) {
    const fy = y - bh / 2 + r * (bh / rows)
    ctx.strokeRect(x - bw / 2 + 1, fy - 1, bw - 2, 2)
  }
  // 书籍
  const bookColors = ['#C05746', '#4A6FA5', '#3A7D44', '#8B4E3A', '#6B5FA0', '#C0882A']
  const bookCount: Record<string, number> = { sparse: 2, half: 4, full: 6, dense: 8 }
  const n = bookCount[density] || 4
  for (let r = 0; r < rows; r++) {
    const baseY = y - bh / 2 + r * (bh / rows) + 1
    const shelfH = bh / rows - 2
    let bx = x - bw / 2 + 3
    for (let b = 0; b < Math.min(n, Math.floor((bw - 6) / 4)); b++) {
      const bookW = 2 + Math.random() * 2
      const bookH = shelfH * (0.5 + Math.random() * 0.4)
      ctx.fillStyle = bookColors[(r * 3 + b) % bookColors.length]
      ctx.fillRect(bx, baseY + shelfH - bookH, bookW, bookH)
      bx += bookW + 0.5
      if (bx > x + bw / 2 - 4) break
    }
  }
}

export const drawMonitor: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'laptop', sz = p.size || 'm'
  const sc = scaleMap[sz] || 1
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc)
  if (f === 'bigscreen') {
    drawShadow(ctx, 0, 10, 32, 4)
    // 屏幕边框
    baseSetup(ctx, '#2c2416', '#1a1410')
    ctx.beginPath(); ctx.roundRect(-16, -12, 32, 20, 2); ctx.fill(); ctx.stroke()
    // 屏幕
    ctx.fillStyle = '#3a5a7a'
    ctx.beginPath(); ctx.roundRect(-14, -10, 28, 16, 1); ctx.fill()
    // 底座
    baseSetup(ctx, '#4A4A4A', '#2c2416')
    ctx.beginPath(); ctx.roundRect(-4, 8, 8, 3, 1); ctx.fill(); ctx.stroke()
    ctx.fillRect(-8, 11, 16, 2)
  } else if (f === 'dual') {
    drawShadow(ctx, 0, 8, 44, 4)
    for (const ox of [-11, 11]) {
      baseSetup(ctx, '#2c2416', '#1a1410')
      ctx.beginPath(); ctx.roundRect(ox - 10, -10, 20, 16, 2); ctx.fill(); ctx.stroke()
      ctx.fillStyle = '#3a5a7a'
      ctx.beginPath(); ctx.roundRect(ox - 8, -8, 16, 12, 1); ctx.fill()
    }
    ctx.fillStyle = '#4A4A4A'
    ctx.fillRect(-6, 6, 12, 3)
  } else if (f === 'laptop') {
    drawShadow(ctx, 0, 8, 24, 3)
    // 屏幕
    baseSetup(ctx, '#3a3a3a', '#2c2416')
    ctx.beginPath(); ctx.roundRect(-12, -10, 24, 15, 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#4a6a8a'
    ctx.beginPath(); ctx.roundRect(-10, -8, 20, 11, 1); ctx.fill()
    // 键盘
    baseSetup(ctx, '#4A4A4A', '#2c2416')
    ctx.beginPath(); ctx.roundRect(-12, 5, 24, 5, 1); ctx.fill(); ctx.stroke()
    // 触控板
    ctx.fillStyle = '#5a5a5a'
    ctx.fillRect(-3, 6, 6, 3)
  } else {
    // triple
    drawShadow(ctx, 0, 8, 50, 4)
    for (const [ox, w] of [[-24, 14], [-8, 14], [8, 12]]) {
      baseSetup(ctx, '#2c2416', '#1a1410')
      ctx.beginPath(); ctx.roundRect(ox as number, -10, w as number, 16, 2); ctx.fill(); ctx.stroke()
      ctx.fillStyle = '#3a5a7a'
      ctx.fillRect((ox as number) + 1, -8, (w as number) - 2, 12)
    }
    ctx.fillStyle = '#4A4A4A'
    ctx.fillRect(-10, 6, 20, 3)
  }
  ctx.restore()
}

export const drawWhiteboard: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'big'
  drawShadow(ctx, x, y + 14, 40, 3)
  // 板面
  baseSetup(ctx, '#f8f6f0', '#8b7a65')
  if (f === 'big') {
    ctx.beginPath(); ctx.roundRect(x - 20, y - 14, 40, 26, 2); ctx.fill(); ctx.stroke()
    // 边框
    ctx.strokeStyle = '#c8b898'; ctx.lineWidth = 0.5
    ctx.strokeRect(x - 18, y - 12, 36, 22)
  } else if (f === 'smalldata') {
    ctx.beginPath(); ctx.roundRect(x - 12, y - 9, 24, 18, 2); ctx.fill(); ctx.stroke()
  } else if (f === 'mid') {
    ctx.beginPath(); ctx.roundRect(x - 16, y - 11, 32, 22, 2); ctx.fill(); ctx.stroke()
  } else {
    // 三联
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.roundRect(x - 20 + i * 14, y - 9, 12, 18, 1); ctx.fill(); ctx.stroke()
    }
  }
  // 内容线条
  ctx.strokeStyle = '#d0c8b8'; ctx.lineWidth = 0.3
  const lines = f === 'smalldata' ? 3 : 5
  for (let i = 0; i < lines; i++) {
    ctx.beginPath()
    ctx.moveTo(x - 16, y - 10 + i * 4)
    ctx.lineTo(x + 16 - Math.random() * 8, y - 10 + i * 4)
    ctx.stroke()
  }
}

export const drawPenholder: DrawFn = (ctx, x, y, _s, p) => {
  const density = p.density || 'half', tone = p.tone || 'wooden'
  const fill = toneColor(tone)
  drawShadow(ctx, x, y + 12, 18, 3)
  // 笔筒
  baseSetup(ctx, fill, '#2c2416')
  ctx.beginPath()
  ctx.moveTo(x - 8, y - 8); ctx.lineTo(x - 6, y + 10); ctx.lineTo(x + 8, y + 10); ctx.lineTo(x + 8, y - 6)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // 笔
  const count: Record<string, number> = { sparse: 2, half: 5, full: 9, dense: 14 }
  const n = count[density] || 5
  const penColors = ['#2c2416', '#C05746', '#4A6FA5', '#3A7D44', '#C0882A']
  for (let i = 0; i < Math.min(n, 12); i++) {
    ctx.strokeStyle = penColors[i % penColors.length]
    ctx.lineWidth = 1.2
    const px = x - 4 + i * 1.5
    const h = 8 + Math.random() * 6
    ctx.beginPath(); ctx.moveTo(px, y - 5); ctx.lineTo(px + (Math.random() - 0.5), y - 5 - h); ctx.stroke()
    // 笔尖
    ctx.fillStyle = penColors[i % penColors.length]
    ctx.beginPath(); ctx.arc(px, y - 5 - h, 0.8, 0, Math.PI * 2); ctx.fill()
  }
  ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1.4
}

export const drawMagnifier: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'standard', sz = p.size || 'm'
  const sc = scaleMap[sz] || 1
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc)
  // 镜片
  if (f === 'pro') {
    baseSetup(ctx, 'rgba(180, 210, 230, 0.4)', '#5A4A35')
    ctx.beginPath(); ctx.arc(-2, -2, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.beginPath(); ctx.arc(-5, -5, 4, 0, Math.PI * 2); ctx.fill()
    // 手柄
    baseSetup(ctx, '#8B6914', '#2c2416'); ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(16, 16); ctx.stroke()
  } else if (f === 'standard') {
    baseSetup(ctx, 'rgba(180, 210, 230, 0.35)', '#5A4A35')
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.beginPath(); ctx.arc(-3, -3, 3, 0, Math.PI * 2); ctx.fill()
    baseSetup(ctx, '#6B5B4A', '#2c2416'); ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(7, 7); ctx.lineTo(13, 13); ctx.stroke()
  } else if (f === 'portable') {
    baseSetup(ctx, 'rgba(180, 210, 230, 0.3)', '#5A4A35')
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  } else {
    baseSetup(ctx, 'rgba(180, 210, 230, 0.35)', '#5A4A35')
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  }
  ctx.lineWidth = 1.4
  ctx.restore()
}

export const drawCorkboard: DrawFn = (ctx, x, y, _s, p) => {
  const density = p.density || 'mid'
  drawShadow(ctx, x, y + 14, 36, 3)
  // 板面
  baseSetup(ctx, '#B8860B', '#8B6914')
  ctx.beginPath(); ctx.roundRect(x - 18, y - 14, 36, 26, 2); ctx.fill(); ctx.stroke()
  // 软木纹理
  ctx.fillStyle = '#C89A2A'
  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    ctx.arc(x - 14 + (i % 5) * 7, y - 10 + Math.floor(i / 5) * 7, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }
  // 便签
  const count: Record<string, number> = { sparse: 2, mid: 5, dense: 8, overflow: 12 }
  const n = count[density] || 5
  const noteColors = ['#FFFDE0', '#FFE0E0', '#E0F0FF', '#E0FFE0', '#FFE8D0']
  for (let i = 0; i < Math.min(n, 12); i++) {
    ctx.fillStyle = noteColors[i % noteColors.length]
    const nx = x - 12 + (i % 4) * 7
    const ny = y - 10 + Math.floor(i / 4) * 7
    ctx.save()
    ctx.translate(nx + 3, ny + 3)
    ctx.rotate((Math.random() - 0.5) * 0.2)
    ctx.fillRect(-3, -2, 6, 5)
    ctx.strokeStyle = '#c8b898'; ctx.lineWidth = 0.3
    ctx.strokeRect(-3, -2, 6, 5)
    ctx.restore()
  }
}

/* ============ KITCHEN ============ */

export const drawStove: DrawFn = (ctx, x, y, _s, p) => {
  const density = p.density || 'two'
  drawShadow(ctx, x, y + 12, 32, 4)
  // 灶台
  baseSetup(ctx, '#e8e0d5', '#2c2416')
  ctx.beginPath(); ctx.roundRect(x - 16, y - 8, 32, 18, 2); ctx.fill(); ctx.stroke()
  // 控制面板
  baseSetup(ctx, '#3a3a3a', '#2c2416')
  ctx.fillRect(x - 16, y + 6, 32, 4)
  ctx.strokeRect(x - 16, y + 6, 32, 4)
  // 炉头
  const burners: Record<string, number> = { one: 1, two: 2, four: 4, many: 6 }
  const n = burners[density] || 2
  for (let i = 0; i < n; i++) {
    const bx = x - 8 + (i % 3) * 8
    const by = y - 3 + Math.floor(i / 3) * 5
    // 外圈
    baseSetup(ctx, '#5a5a5a', '#2c2416')
    ctx.beginPath(); ctx.arc(bx, by, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 内圈
    ctx.strokeStyle = '#888'; ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.stroke()
  }
  // 旋钮
  for (let i = 0; i < Math.min(n, 4); i++) {
    ctx.fillStyle = '#2c2416'
    ctx.beginPath(); ctx.arc(x - 10 + i * 7, y + 8, 1.5, 0, Math.PI * 2); ctx.fill()
  }
}

export const drawPots: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'wok', tone = p.tone || 'dark'
  const fill = toneColor(tone)
  drawShadow(ctx, x, y + 12, 30, 4)
  const sets: Record<string, [number, number, number, number][]> = {
    saucepan: [[0, 0, 12, 14]],
    wok: [[-10, 2, 14, 14], [6, -2, 12, 12]],
    stockpot: [[-14, -2, 16, 22]],
    commercial: [[-18, -4, 16, 22], [2, -6, 14, 18], [10, -10, 10, 14]],
  }
  const items = sets[f] || sets.wok
  items.forEach(([px, py, pw, ph]) => {
    // 锅身
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath()
    ctx.roundRect(x + px - pw / 2, y + py - ph / 2, pw, ph, 2)
    ctx.fill(); ctx.stroke()
    // 锅口高光
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.ellipse(x + px, y + py - ph / 2, pw / 2 - 1, 2, 0, 0, Math.PI * 2)
    ctx.fill()
    // 把手
    ctx.strokeStyle = '#6B5B4A'; ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + px + pw / 2, y + py - ph / 4)
    ctx.lineTo(x + px + pw / 2 + 6, y + py - ph / 4 - 2)
    ctx.stroke()
  })
}

export const drawRecipestand: DrawFn = (ctx, x, y, _s, p) => {
  const form = p.form || 'mid'
  const th: Record<string, number> = { thick: 18, mid: 12, thin: 6, empty: 1 }
  const t = th[form] || 12
  drawShadow(ctx, x, y + 10, 20, 3)
  // 架子
  baseSetup(ctx, '#8B6914', '#2c2416')
  ctx.beginPath(); ctx.roundRect(x - 10, y + 2, 20, 8, 1); ctx.fill(); ctx.stroke()
  // 支架
  ctx.fillStyle = '#6B5B4A'
  ctx.fillRect(x - 1, y - t / 2, 2, t / 2 + 2)
  // 书/食谱
  if (form !== 'empty') {
    baseSetup(ctx, '#C05746', '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 9, y - t / 2, 18, t, 1); ctx.fill(); ctx.stroke()
    // 书脊线
    ctx.strokeStyle = '#8B3A2A'; ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(x, y - t / 2); ctx.lineTo(x, y + t / 2); ctx.stroke()
    // 书名文字线条
    ctx.strokeStyle = '#fafaf8'; ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(x - 6, y - t / 4); ctx.lineTo(x + 6, y - t / 4); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.stroke()
  }
}

export const drawTimer: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'mechanical', sz = p.size || 'm'
  const sc = scaleMap[sz] || 1
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc)
  if (f === 'digital') {
    drawShadow(ctx, 0, 12, 18, 3)
    baseSetup(ctx, '#2c2416', '#1a1410')
    ctx.beginPath(); ctx.roundRect(-9, -11, 18, 22, 3); ctx.fill(); ctx.stroke()
    // 屏幕
    ctx.fillStyle = '#4a6a3a'
    ctx.beginPath(); ctx.roundRect(-7, -8, 14, 12, 1); ctx.fill()
    ctx.fillStyle = '#8cda8c'
    ctx.font = 'bold 8px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('05:30', 0, 0)
    ctx.textAlign = 'start'
    // 按钮
    ctx.fillStyle = '#555'
    ctx.beginPath(); ctx.arc(-4, 6, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(4, 6, 1.5, 0, Math.PI * 2); ctx.fill()
  } else if (f === 'mechanical') {
    drawShadow(ctx, 0, 12, 22, 3)
    // 外壳
    baseSetup(ctx, '#C0882A', '#8B6914')
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 表盘
    baseSetup(ctx, '#fafaf8', '#8b7a65')
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 刻度
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2
      ctx.fillStyle = '#5a4a35'
      ctx.beginPath(); ctx.arc(Math.cos(a) * 7, Math.sin(a) * 7, 0.5, 0, Math.PI * 2); ctx.fill()
    }
    // 指针
    ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -6); ctx.stroke()
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(4, 1); ctx.stroke()
    // 铃铛
    baseSetup(ctx, '#C0882A', '#8B6914')
    ctx.beginPath(); ctx.arc(-5, -12, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.arc(5, -12, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 顶部按钮
    ctx.fillStyle = '#C0882A'
    ctx.beginPath(); ctx.arc(0, -13, 2, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#8B6914'; ctx.stroke()
  } else if (f === 'hourglass') {
    // 沙漏框架
    baseSetup(ctx, '#8B6914', '#2c2416')
    ctx.fillRect(-8, -14, 16, 2)
    ctx.fillRect(-8, 12, 16, 2)
    ctx.strokeRect(-8, -14, 16, 2)
    ctx.strokeRect(-8, 12, 16, 2)
    // 玻璃
    ctx.fillStyle = 'rgba(200, 210, 230, 0.3)'
    ctx.strokeStyle = '#8b7a65'; ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-6, -12); ctx.lineTo(6, -12); ctx.lineTo(1, 0); ctx.lineTo(6, 12); ctx.lineTo(-6, 12); ctx.lineTo(-1, 0)
    ctx.closePath(); ctx.fill(); ctx.stroke()
    // 沙子
    ctx.fillStyle = '#C0882A'
    ctx.beginPath()
    ctx.moveTo(-4, -10); ctx.lineTo(4, -10); ctx.lineTo(1, -2); ctx.lineTo(-1, -2)
    ctx.closePath(); ctx.fill()
  } else {
    // simple
    drawShadow(ctx, 0, 12, 22, 3)
    baseSetup(ctx, '#e8e0d5', '#2c2416')
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -7); ctx.stroke()
  }
  ctx.restore()
}

export const drawSpicerack: DrawFn = (ctx, x, y, _s, p) => {
  const tone = p.tone || 'wooden'
  const fill = toneColor(tone)
  drawShadow(ctx, x, y + 10, 24, 3)
  // 架子
  baseSetup(ctx, fill, '#2c2416')
  ctx.beginPath(); ctx.roundRect(x - 12, y - 10, 24, 20, 2); ctx.fill(); ctx.stroke()
  // 隔板
  ctx.fillStyle = '#6B5B4A'
  ctx.fillRect(x - 12, y - 3, 24, 2)
  ctx.fillRect(x - 12, y + 3, 24, 2)
  // 罐子
  const jarColors = ['#C05746', '#3A7D44', '#C0882A', '#4A6FA5', '#8B4E3A']
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const jx = x - 7 + col * 7
      const jy = y - 8 + row * 6
      ctx.fillStyle = jarColors[(row * 3 + col) % jarColors.length]
      ctx.beginPath(); ctx.roundRect(jx - 2, jy, 4, 4, 1); ctx.fill()
      ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 0.5
      ctx.strokeRect(jx - 2, jy, 4, 4)
      // 盖子
      ctx.fillStyle = '#4A3728'
      ctx.fillRect(jx - 1.5, jy - 1.5, 3, 1.5)
    }
  }
}

export const drawKnifeblock: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'utility', sz = p.size || 'm'
  const sc = scaleMap[sz] || 1
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc)
  drawShadow(ctx, 0, 10, 20, 3)
  // 刀座
  baseSetup(ctx, '#5A3A1A', '#2c2416')
  ctx.beginPath(); ctx.roundRect(-9, -4, 18, 16, 2); ctx.fill(); ctx.stroke()
  // 刀
  ctx.fillStyle = '#c0c0c0'
  ctx.strokeStyle = '#888'
  ctx.lineWidth = 0.8
  if (f === 'chef') {
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(1, -18); ctx.lineTo(4, -18); ctx.lineTo(3, -4); ctx.fill(); ctx.stroke()
    // 刀柄
    ctx.fillStyle = '#3A2A16'
    ctx.fillRect(-1, -4, 3, 3)
  } else if (f === 'utility') {
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(1, -14); ctx.lineTo(3, -14); ctx.lineTo(2, -4); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#3A2A16'
    ctx.fillRect(-1, -4, 3, 3)
  } else {
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(1, -9); ctx.lineTo(3, -9); ctx.lineTo(2, -4); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#3A2A16'
    ctx.fillRect(-1, -4, 3, 3)
  }
  ctx.restore()
}

/* ============ BEDROOM ============ */

export const drawBed: DrawFn = (ctx, x, y, _s, p) => {
  const sz = p.size || 'm', tone = p.tone || 'soft'
  const sc = scaleMap[sz] || 1, fill = toneColor(tone)
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc)
  drawShadow(ctx, 0, 12, 42, 4)
  // 床架
  baseSetup(ctx, '#6B5B4A', '#2c2416')
  ctx.beginPath(); ctx.roundRect(-20, -4, 40, 14, 2); ctx.fill(); ctx.stroke()
  // 床垫
  baseSetup(ctx, '#e8e0d5', '#c8b898')
  ctx.beginPath(); ctx.roundRect(-18, -6, 36, 10, 2); ctx.fill(); ctx.stroke()
  // 被子
  baseSetup(ctx, fill, '#c8b898')
  ctx.beginPath(); ctx.roundRect(-16, -5, 24, 8, 2); ctx.fill(); ctx.stroke()
  // 枕头
  baseSetup(ctx, '#fafaf8', '#d4c8b8')
  ctx.beginPath(); ctx.roundRect(10, -5, 8, 8, 3); ctx.fill(); ctx.stroke()
  // 床头板
  baseSetup(ctx, '#4A3728', '#2c2416')
  ctx.beginPath(); ctx.roundRect(-22, -10, 4, 18, 2); ctx.fill(); ctx.stroke()
  ctx.restore()
}

export const drawAlarmclock: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'twinbell', sz = p.size || 'm'
  const sc = scaleMap[sz] || 1
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc)
  if (f === 'swiss') {
    drawShadow(ctx, 0, 10, 18, 3)
    baseSetup(ctx, '#e8e0d5', '#2c2416')
    ctx.beginPath(); ctx.roundRect(-9, -6, 18, 14, 2); ctx.fill(); ctx.stroke()
    // 表盘
    ctx.fillStyle = '#fafaf8'
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 指针
    ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -4); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, -1); ctx.stroke()
    // 顶灯
    ctx.fillStyle = '#C05746'
    ctx.beginPath(); ctx.arc(0, -8, 2, 0, Math.PI * 2); ctx.fill()
  } else if (f === 'twinbell') {
    drawShadow(ctx, 0, 10, 22, 3)
    // 铃铛
    baseSetup(ctx, '#C0882A', '#8B6914')
    ctx.beginPath(); ctx.arc(-6, -7, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.arc(6, -7, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 锤子
    ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -12); ctx.stroke()
    // 表体
    baseSetup(ctx, '#2c2416', '#1a1410')
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 表盘
    baseSetup(ctx, '#fafaf8', '#8b7a65')
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 刻度
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2
      ctx.fillStyle = '#5a4a35'
      ctx.beginPath(); ctx.arc(Math.cos(a) * 5.5, Math.sin(a) * 5.5, 0.4, 0, Math.PI * 2); ctx.fill()
    }
    // 指针
    ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -4); ctx.stroke()
    ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, -1); ctx.stroke()
  } else {
    drawShadow(ctx, 0, 10, 18, 3)
    baseSetup(ctx, '#e8e0d5', '#2c2416')
    ctx.beginPath(); ctx.roundRect(-9, -9, 18, 18, 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#fafaf8'
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -4); ctx.stroke()
  }
  ctx.restore()
}

export const drawMirror: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'normal', tone = p.tone || 'silver'
  const fill = toneColor(tone)
  drawShadow(ctx, x, y + 14, 28, 3)
  // 镜框
  baseSetup(ctx, fill, '#2c2416')
  ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  // 镜面
  const grad = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 11)
  grad.addColorStop(0, 'rgba(220, 230, 240, 0.9)')
  grad.addColorStop(1, 'rgba(180, 195, 210, 0.7)')
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill()
  // 高光
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.beginPath(); ctx.ellipse(x - 3, y - 4, 4, 2, -0.3, 0, Math.PI * 2); ctx.fill()
  if (f === 'blurry') {
    ctx.strokeStyle = 'rgba(100, 120, 140, 0.3)'; ctx.lineWidth = 0.4; ctx.setLineDash([1, 3])
    ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([])
  }
  // 支架
  ctx.strokeStyle = '#6B5B4A'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.lineTo(x, y + 20); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - 6, y + 20); ctx.lineTo(x + 6, y + 20); ctx.stroke()
}

export const drawCoatrack: DrawFn = (ctx, x, y, _s, p) => {
  const tone = p.tone || 'wooden'
  const fill = toneColor(tone)
  drawShadow(ctx, x, y + 14, 30, 3)
  // 主杆
  baseSetup(ctx, fill, '#2c2416')
  ctx.fillRect(x - 1.5, y - 18, 3, 32)
  ctx.strokeRect(x - 1.5, y - 18, 3, 32)
  // 底座
  ctx.beginPath(); ctx.moveTo(x - 14, y + 14); ctx.lineTo(x + 14, y + 14); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - 10, y + 12); ctx.lineTo(x + 10, y + 12); ctx.stroke()
  // 挂钩
  ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1.5
  const hooks = [-14, -8, -2, 4, 10]
  hooks.forEach(hy => {
    ctx.beginPath(); ctx.moveTo(x, y + hy); ctx.lineTo(x + 8, y + hy + 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(x + 9, y + hy + 3, 1.5, 0, Math.PI * 2); ctx.stroke()
  })
  // 衣物
  const clothes = ['#C05746', '#4A6FA5', '#3A7D44']
  clothes.forEach((c, i) => {
    if (i < 3) {
      ctx.fillStyle = c
      ctx.beginPath(); ctx.roundRect(x + 4, y + hooks[i * 2] + 4, 10, 8, 2); ctx.fill()
      ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 0.5
      ctx.stroke()
    }
  })
}

export const drawNotebook: DrawFn = (ctx, x, y, _s, p) => {
  const form = p.form || 'mid', tone = p.tone || 'warm'
  const fill = toneColor(tone)
  const th: Record<string, number> = { thick: 16, mid: 10, thin: 5, empty: 2 }
  const t = th[form] || 10
  drawShadow(ctx, x, y + t / 2 + 3, 24, 3)
  // 本子
  baseSetup(ctx, fill, '#2c2416')
  ctx.beginPath(); ctx.roundRect(x - 12, y - t / 2, 24, t, 2); ctx.fill(); ctx.stroke()
  // 书脊
  ctx.strokeStyle = '#6B5B4A'; ctx.lineWidth = 0.5
  ctx.beginPath(); ctx.moveTo(x, y - t / 2); ctx.lineTo(x, y + t / 2); ctx.stroke()
  if (form !== 'empty') {
    // 文字线条
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 0.3
    for (let i = 0; i < Math.min(t / 2, 5); i++) {
      ctx.beginPath()
      ctx.moveTo(x - 8, y - t / 2 + 3 + i * 3)
      ctx.lineTo(x + 8 - Math.random() * 4, y - t / 2 + 3 + i * 3)
      ctx.stroke()
    }
  }
  // 标签
  if (form === 'thick') {
    ctx.fillStyle = '#C0882A'
    ctx.fillRect(x + 8, y - t / 2 + 2, 5, 3)
  }
}

export const drawDesklamp: DrawFn = (ctx, x, y, _s, p) => {
  const tone = p.tone || 'modern'
  const fill = toneColor(tone)
  drawShadow(ctx, x, y + 10, 16, 3)
  // 底座
  baseSetup(ctx, '#4A4A4A', '#2c2416')
  ctx.beginPath(); ctx.ellipse(x, y + 8, 8, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  // 灯杆
  ctx.strokeStyle = '#4A4A4A'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, y - 6); ctx.stroke()
  // 灯臂
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(x - 2, y - 4); ctx.lineTo(x + 6, y - 12); ctx.stroke()
  // 灯罩
  baseSetup(ctx, fill, '#2c2416')
  ctx.beginPath()
  ctx.moveTo(x + 2, y - 10); ctx.lineTo(x + 10, y - 14); ctx.lineTo(x + 12, y - 10); ctx.lineTo(x + 4, y - 8)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // 灯光效果
  ctx.fillStyle = 'rgba(255, 240, 200, 0.15)'
  ctx.beginPath()
  ctx.moveTo(x + 4, y - 8); ctx.lineTo(x + 12, y - 10); ctx.lineTo(x + 16, y + 2); ctx.lineTo(x, y + 2)
  ctx.closePath(); ctx.fill()
}

/* ============ BALCONY ============ */

export const drawPottedplant: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'small', cond = p.condition || 'fresh'
  const alpha = conditionAlpha(cond)
  ctx.save(); ctx.globalAlpha = alpha
  drawShadow(ctx, x, y + 12, 20, 3)
  // 花盆
  baseSetup(ctx, '#A0522D', '#6B3A1A')
  ctx.beginPath()
  ctx.moveTo(x - 9, y + 4); ctx.lineTo(x - 7, y + 12); ctx.lineTo(x + 7, y + 12); ctx.lineTo(x + 9, y + 4)
  ctx.closePath(); ctx.fill(); ctx.stroke()
  // 土壤
  ctx.fillStyle = '#5A3A1A'
  ctx.beginPath(); ctx.ellipse(x, y + 4, 8, 2, 0, 0, Math.PI * 2); ctx.fill()
  if (f === 'tree') {
    // 树干
    ctx.strokeStyle = '#6B5B4A'; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x, y - 14); ctx.stroke()
    // 树冠
    baseSetup(ctx, '#3A7D44', '#2D6335')
    ctx.beginPath(); ctx.arc(x, y - 18, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#4A9E54'
    ctx.beginPath(); ctx.arc(x - 5, y - 15, 6, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + 6, y - 16, 5, 0, Math.PI * 2); ctx.fill()
  } else if (f === 'flowering') {
    // 茎
    ctx.strokeStyle = '#3A7D44'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x, y - 8); ctx.stroke()
    // 叶子
    ctx.fillStyle = '#4A9E54'
    ctx.beginPath(); ctx.ellipse(x - 4, y - 2, 4, 2, -0.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(x + 4, y - 3, 4, 2, 0.5, 0, Math.PI * 2); ctx.fill()
    // 花朵
    const flowerColors = ['#E87090', '#F0A0B0', '#E06070']
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = flowerColors[i]
      ctx.beginPath(); ctx.arc(x - 3 + i * 3, y - 8 - i, 3, 0, Math.PI * 2); ctx.fill()
    }
  } else if (f === 'small') {
    // 小盆栽
    ctx.strokeStyle = '#3A7D44'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x, y - 2); ctx.stroke()
    ctx.fillStyle = '#4A9E54'
    ctx.beginPath(); ctx.ellipse(x, y - 4, 5, 3, 0, 0, Math.PI * 2); ctx.fill()
  } else {
    // succulent
    ctx.fillStyle = '#5ABE6A'
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 4, y - 2 + Math.sin(a) * 3, 3, 4, a, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = '#7ADE8A'
    ctx.beginPath(); ctx.arc(x, y - 2, 3, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

export const drawTelescope: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'bino', tone = p.tone || 'dark'
  const fill = toneColor(tone)
  drawShadow(ctx, x, y + 12, 18, 3)
  if (f === 'astro') {
    // 天文望远镜
    baseSetup(ctx, '#e8e0d5', '#2c2416')
    // 三脚架
    ctx.strokeStyle = '#6B5B4A'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x - 8, y + 16); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x + 8, y + 16); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x, y + 16); ctx.stroke()
    // 镜筒
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath()
    ctx.roundRect(x - 3, y - 20, 6, 22, 1)
    ctx.fill(); ctx.stroke()
    // 物镜
    ctx.fillStyle = '#4A6FA5'
    ctx.beginPath(); ctx.arc(x, y - 20, 4, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#2c2416'; ctx.stroke()
    // 目镜
    ctx.fillStyle = '#4A4A4A'
    ctx.beginPath(); ctx.roundRect(x - 2, y, 4, 4, 1); ctx.fill(); ctx.stroke()
  } else if (f === 'bino') {
    // 双筒望远镜
    baseSetup(ctx, fill, '#2c2416')
    ctx.beginPath(); ctx.roundRect(x - 8, y - 6, 7, 16, 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(x + 1, y - 6, 7, 16, 2); ctx.fill(); ctx.stroke()
    // 镜片
    ctx.fillStyle = '#4A6FA5'
    ctx.beginPath(); ctx.arc(x - 4.5, y - 6, 3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + 4.5, y - 6, 3, 0, Math.PI * 2); ctx.fill()
    // 连接桥
    ctx.strokeStyle = '#2c2416'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(x - 2, y - 2); ctx.lineTo(x + 2, y - 2); ctx.stroke()
  } else {
    // toy telescope
    baseSetup(ctx, '#C05746', '#8B3A2A')
    ctx.beginPath(); ctx.roundRect(x - 4, y - 6, 8, 14, 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#4A6FA5'
    ctx.beginPath(); ctx.arc(x, y - 6, 3, 0, Math.PI * 2); ctx.fill()
  }
}

export const drawWindvane: DrawFn = (ctx, x, y, _s, p) => {
  drawShadow(ctx, x, y + 14, 20, 3)
  // 支柱
  baseSetup(ctx, '#8B8680', '#5a5a5a')
  ctx.fillRect(x - 1, y - 14, 2, 28)
  ctx.strokeRect(x - 1, y - 14, 2, 28)
  // 底座
  ctx.fillStyle = '#6B5B4A'
  ctx.fillRect(x - 8, y + 12, 16, 3)
  ctx.strokeRect(x - 8, y + 12, 16, 3)
  if (p.form !== 'removed') {
    // 箭头
    baseSetup(ctx, '#4A6FA5', '#2c2416')
    ctx.beginPath()
    ctx.moveTo(x, y - 12); ctx.lineTo(x + 12, y - 8); ctx.lineTo(x, y - 4); ctx.closePath()
    ctx.fill(); ctx.stroke()
    // 尾翼
    baseSetup(ctx, '#C05746', '#8B3A2A')
    ctx.beginPath()
    ctx.moveTo(x, y - 12); ctx.lineTo(x - 6, y - 10); ctx.lineTo(x, y - 6); ctx.closePath()
    ctx.fill(); ctx.stroke()
    // N/S 标记
    ctx.fillStyle = '#2c2416'; ctx.font = 'bold 6px sans-serif'
    ctx.fillText('N', x - 1, y - 15)
  }
}

export const drawBalconytable: DrawFn = (ctx, x, y, _s, p) => {
  const density = p.density || 'mid'
  drawShadow(ctx, x, y + 12, 38, 4)
  // 桌面
  baseSetup(ctx, '#A07A3A', '#6B5B4A')
  ctx.beginPath(); ctx.ellipse(x, y, 12, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  // 桌腿
  ctx.strokeStyle = '#6B5B4A'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(x - 8, y + 4); ctx.lineTo(x - 10, y + 12); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x + 8, y + 4); ctx.lineTo(x + 10, y + 12); ctx.stroke()
  // 椅子
  const chairs: Record<string, number> = { empty: 0, sparse: 2, mid: 4, dense: 6 }
  const n = chairs[density] || 3
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    const cx = x + Math.cos(angle) * 18
    const cy = y + Math.sin(angle) * 10
    // 椅面
    baseSetup(ctx, '#C0882A', '#8B6914')
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // 椅背
    const bx = cx + Math.cos(angle) * 3
    const by = cy + Math.sin(angle) * 3
    ctx.strokeStyle = '#8B6914'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(bx - 2, by - 2); ctx.lineTo(bx + 2, by - 5); ctx.stroke()
  }
}

export const drawClothesline: DrawFn = (ctx, x, y, _s, p) => {
  const sz = p.size || 'm'
  const ls: Record<string, number> = { xs: 12, s: 20, m: 30, l: 40 }
  const len = ls[sz] || 20
  drawShadow(ctx, x, y + 12, len + 8, 3)
  // 竿子
  ctx.strokeStyle = '#6B5B4A'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x - len / 2 - 2, y - 12); ctx.lineTo(x - len / 2 - 2, y + 10); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x + len / 2 + 2, y - 12); ctx.lineTo(x + len / 2 + 2, y + 10); ctx.stroke()
  // 绳子
  ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(x - len / 2 - 2, y - 10); ctx.lineTo(x + len / 2 + 2, y - 10); ctx.stroke()
  // 衣物
  const clothes = [
    { color: '#fafaf8', w: 8, type: 'shirt' },
    { color: '#4A6FA5', w: 6, type: 'pants' },
    { color: '#C05746', w: 7, type: 'shirt' },
  ]
  const count = sz === 'l' ? 4 : sz === 'm' ? 3 : 2
  for (let i = 0; i < Math.min(count, clothes.length); i++) {
    const cx = x - len / 3 + i * (len / 3)
    const c = clothes[i]
    // 夹子
    ctx.fillStyle = '#C0882A'
    ctx.fillRect(cx - 1, y - 11, 2, 2)
    // 衣物
    ctx.fillStyle = c.color
    ctx.strokeStyle = '#c8b898'; ctx.lineWidth = 0.5
    if (c.type === 'shirt') {
      ctx.beginPath(); ctx.roundRect(cx - c.w / 2, y - 9, c.w, 10, 1); ctx.fill(); ctx.stroke()
      // 袖子
      ctx.beginPath(); ctx.roundRect(cx - c.w / 2 - 3, y - 8, 3, 6, 1); ctx.fill(); ctx.stroke()
      ctx.beginPath(); ctx.roundRect(cx + c.w / 2, y - 8, 3, 6, 1); ctx.fill(); ctx.stroke()
    } else {
      ctx.beginPath(); ctx.roundRect(cx - c.w / 2, y - 9, c.w, 12, 1); ctx.fill(); ctx.stroke()
    }
  }
}

export const drawWindchime: DrawFn = (ctx, x, y, _s, p) => {
  const f = p.form || 'mid', tone = p.tone || 'silver'
  const fill = toneColor(tone)
  drawShadow(ctx, x, y + 6, 20, 3)
  // 横杆
  baseSetup(ctx, '#8B8680', '#5a5a5a')
  ctx.fillRect(x - 8, y - 18, 16, 2)
  ctx.strokeRect(x - 8, y - 18, 16, 2)
  // 挂绳
  ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 24); ctx.stroke()
  // 风铃管
  const tubeColors = [fill, '#8B8680', '#A0A0A0']
  if (f === 'long') {
    for (let i = 0; i < 5; i++) {
      const tx = x - 6 + i * 3
      const h = 8 + i % 3
      ctx.fillStyle = tubeColors[i % tubeColors.length]
      ctx.beginPath(); ctx.roundRect(tx - 1, y - 16, 2, h, 1); ctx.fill()
      ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = 0.5; ctx.stroke()
      // 连线
      ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 0.3
      ctx.beginPath(); ctx.moveTo(tx, y - 18); ctx.lineTo(tx, y - 16); ctx.stroke()
    }
  } else if (f === 'mid') {
    for (let i = 0; i < 3; i++) {
      const tx = x - 4 + i * 4
      const h = 6 + i % 2 * 2
      ctx.fillStyle = tubeColors[i % tubeColors.length]
      ctx.beginPath(); ctx.roundRect(tx - 1, y - 16, 2, h, 1); ctx.fill()
      ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = 0.5; ctx.stroke()
      ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 0.3
      ctx.beginPath(); ctx.moveTo(tx, y - 18); ctx.lineTo(tx, y - 16); ctx.stroke()
    }
  } else {
    ctx.fillStyle = fill
    ctx.beginPath(); ctx.roundRect(x - 1.5, y - 16, 3, 6, 1); ctx.fill()
    ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = 0.5; ctx.stroke()
  }
  // 风帆
  ctx.fillStyle = '#fafaf8'; ctx.strokeStyle = '#c8b898'; ctx.lineWidth = 0.5
  ctx.beginPath(); ctx.roundRect(x - 3, y - 6, 6, 4, 1); ctx.fill(); ctx.stroke()
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
