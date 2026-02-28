import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 })
    }

    // Validate file type - also check extension as fallback
    const allowedTypes = ['application/pdf', 'text/plain']
    const ext = file.name.split('.').pop()?.toLowerCase()
    const isAllowed =
      allowedTypes.includes(file.type) || ext === 'pdf' || ext === 'txt'

    if (!isAllowed) {
      return NextResponse.json(
        { error: '不支持的文件类型，请上传 PDF 或 TXT 文件' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超出限制（最大 10MB）' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Generate a unique storage path
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${timestamp}_${safeName}`

    // Upload file to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    console.log('[v0] Uploading file:', file.name, 'type:', file.type, 'size:', file.size)

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: file.type || (ext === 'pdf' ? 'application/pdf' : 'text/plain'),
        upsert: false,
      })

    if (uploadError) {
      console.log('[v0] Storage upload error:', JSON.stringify(uploadError))
      return NextResponse.json(
        { error: '文件上传失败：' + uploadError.message },
        { status: 500 }
      )
    }

    console.log('[v0] File uploaded to storage:', storagePath)

    // Extract text based on file type
    let extractedText = ''
    const isPdf = file.type === 'application/pdf' || ext === 'pdf'

    if (!isPdf) {
      // TXT file
      extractedText = await file.text()
    } else {
      // PDF file - use pdf-parse with workaround for serverless
      try {
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(fileBuffer)
        extractedText = pdfData.text
        console.log('[v0] PDF text extracted, length:', extractedText.length)
      } catch (pdfError) {
        console.log('[v0] PDF parsing error:', pdfError)
        // Try a basic approach - store but mark as needing manual text
        extractedText = ''
      }
    }

    // Determine file_type label
    const fileType = isPdf ? 'pdf' : 'txt'

    // Insert metadata into database
    const { data: doc, error: dbError } = await supabase
      .from('documents')
      .insert({
        filename: file.name,
        file_type: fileType,
        file_size: file.size,
        storage_path: storagePath,
        extracted_text: extractedText || null,
        status: extractedText ? 'uploaded' : 'error',
        error_message: extractedText ? null : '无法提取文本内容',
      })
      .select()
      .single()

    if (dbError) {
      console.log('[v0] Database insert error:', JSON.stringify(dbError))
      // Clean up uploaded file
      await supabase.storage.from('documents').remove([storagePath])
      return NextResponse.json(
        { error: '数据保存失败：' + dbError.message },
        { status: 500 }
      )
    }

    console.log('[v0] Document saved:', doc.id, 'status:', doc.status)
    return NextResponse.json({ document: doc }, { status: 201 })
  } catch (error) {
    console.log('[v0] Upload error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
