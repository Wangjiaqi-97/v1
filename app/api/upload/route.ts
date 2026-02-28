import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 })
    }

    const allowedTypes = ['application/pdf', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
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

    const supabase = await createClient()

    // Generate a unique storage path
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${timestamp}_${safeName}`

    // Upload file to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: '文件上传失败：' + uploadError.message },
        { status: 500 }
      )
    }

    // Extract text based on file type
    let extractedText = ''

    if (file.type === 'text/plain') {
      extractedText = await file.text()
    } else if (file.type === 'application/pdf') {
      try {
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError)
        // Still save the document but mark extraction as failed
        extractedText = ''
      }
    }

    // Determine file_type label
    const fileType = file.type === 'application/pdf' ? 'pdf' : 'txt'

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
      console.error('Database insert error:', dbError)
      // Clean up uploaded file
      await supabase.storage.from('documents').remove([storagePath])
      return NextResponse.json(
        { error: '数据保存失败：' + dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ document: doc }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
