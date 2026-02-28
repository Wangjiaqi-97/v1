import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: '缺少文档 ID' }, { status: 400 })
    }

    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      console.log('[v0] GITHUB_TOKEN not set')
      return NextResponse.json(
        { error: '未配置 GitHub Token，请设置 GITHUB_TOKEN 环境变量' },
        { status: 500 }
      )
    }

    const supabase = createAdminClient()

    // Get document from database
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) {
      console.log('[v0] Document not found:', documentId, fetchError)
      return NextResponse.json({ error: '文档未找到' }, { status: 404 })
    }

    if (!doc.extracted_text) {
      return NextResponse.json(
        { error: '该文档没有可提取的文本内容' },
        { status: 400 }
      )
    }

    // Update status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', documentId)

    // Truncate text if too long (GitHub Models has token limits)
    const maxChars = 15000
    const textToSummarize =
      doc.extracted_text.length > maxChars
        ? doc.extracted_text.substring(0, maxChars) + '\n\n[文本已截断...]'
        : doc.extracted_text

    console.log('[v0] Calling GitHub Models API, text length:', textToSummarize.length)

    // Call GitHub Models API (GPT-4.1-mini)
    const response = await fetch(
      'https://models.github.ai/inference/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content:
                '你是一个专业的文档摘要助手。请用中文对提供的文档内容生成简明扼要的摘要。摘要应包括：1) 文档的主要主题；2) 关键要点（3-5个）；3) 总结性结论。保持摘要清晰、有条理。',
            },
            {
              role: 'user',
              content: `请为以下文档内容生成摘要：\n\n${textToSummarize}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      }
    )

    console.log('[v0] GitHub Models API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('[v0] GitHub Models API error:', response.status, errorText)

      let userMessage = `AI 服务返回错误 (${response.status})`
      if (response.status === 403) {
        userMessage = 'GitHub Token 权限不足或无效。请确保你的 PAT 拥有 Models: Read 权限。'
      } else if (response.status === 401) {
        userMessage = 'GitHub Token 认证失败，请检查 Token 是否正确。'
      } else if (response.status === 429) {
        userMessage = 'API 调用频率超限，请稍后重试。'
      }

      await supabase
        .from('documents')
        .update({
          status: 'error',
          error_message: userMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      return NextResponse.json(
        { error: userMessage, detail: errorText },
        { status: 502 }
      )
    }

    const result = await response.json()
    const summary = result.choices?.[0]?.message?.content

    console.log('[v0] AI summary received, length:', summary?.length)

    if (!summary) {
      await supabase
        .from('documents')
        .update({
          status: 'error',
          error_message: 'AI 未返回有效摘要',
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      return NextResponse.json(
        { error: 'AI 未返回有效摘要' },
        { status: 502 }
      )
    }

    // Update document with summary
    const { data: updated, error: updateError } = await supabase
      .from('documents')
      .update({
        summary,
        status: 'completed',
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      console.log('[v0] Database update error:', JSON.stringify(updateError))
      return NextResponse.json(
        { error: '保存摘要失败' },
        { status: 500 }
      )
    }

    console.log('[v0] Summary saved for document:', documentId)
    return NextResponse.json({ document: updated })
  } catch (error) {
    console.log('[v0] Summarize error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
