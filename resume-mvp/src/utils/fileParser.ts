import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// pdf.js worker — Vite 用 ?url 导入
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export class FileParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileParseError'
  }
}

function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileParseError(`文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），请上传 10MB 以内的文件`)
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'pdf' && ext !== 'docx') {
    throw new FileParseError('仅支持 PDF 和 Word (.docx) 格式')
  }
}

export async function parsePDF(file: File): Promise<string> {
  validateFile(file)
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    throw new FileParseError('文件不是 PDF 格式')
  }

  const arrayBuffer = await file.arrayBuffer()
  let pdf: pdfjsLib.PDFDocumentProxy
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  } catch {
    throw new FileParseError('PDF 文件损坏或已加密，无法解析')
  }

  const textParts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map(item => ('str' in item ? item.str : ''))
      .join('')
    if (pageText.trim()) textParts.push(pageText)
  }

  const result = textParts.join('\n').trim()
  if (!result) {
    throw new FileParseError('PDF 中未提取到文字内容，可能是扫描件或纯图片 PDF')
  }
  return result
}

export async function parseWord(file: File): Promise<string> {
  validateFile(file)
  if (!file.name.toLowerCase().endsWith('.docx')) {
    throw new FileParseError('文件不是 Word (.docx) 格式')
  }

  const arrayBuffer = await file.arrayBuffer()
  let result: { value: string }
  try {
    result = await mammoth.extractRawText({ arrayBuffer })
  } catch {
    throw new FileParseError('Word 文件损坏或格式不受支持，无法解析')
  }

  const text = result.value.trim()
  if (!text) {
    throw new FileParseError('Word 文档中未提取到文字内容')
  }
  return text
}

export async function parseResumeFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return parsePDF(file)
  if (ext === 'docx') return parseWord(file)
  throw new FileParseError('仅支持 PDF 和 Word (.docx) 格式')
}
