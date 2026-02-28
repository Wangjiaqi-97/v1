'use client'

import useSWR from 'swr'
import { UploadZone } from '@/components/upload-zone'
import { DocumentList } from '@/components/document-list'
import { Separator } from '@/components/ui/separator'
import type { Document } from '@/lib/types'
import { FileText } from 'lucide-react'

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json())

export default function Home() {
  const {
    data,
    isLoading,
    mutate,
  } = useSWR<{ documents: Document[] }>('/api/documents', fetcher, {
    refreshInterval: 5000,
  })

  const handleUploadComplete = () => {
    mutate()
  }

  const handleSummarize = async (id: string) => {
    // Optimistically update status
    mutate(
      (current) => {
        if (!current) return current
        return {
          documents: current.documents.map((doc) =>
            doc.id === id ? { ...doc, status: 'processing' as const } : doc
          ),
        }
      },
      false
    )

    console.log('[v0] Calling summarize API for document:', id)
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: id }),
    })

    const responseData = await response.json()
    console.log('[v0] Summarize response:', response.status, responseData)

    if (!response.ok) {
      console.log('[v0] Summarize error:', responseData.error)
    }

    mutate()
  }

  const handleDelete = async (id: string) => {
    // Optimistically remove from list
    mutate(
      (current) => {
        if (!current) return current
        return {
          documents: current.documents.filter((doc) => doc.id !== id),
        }
      },
      false
    )

    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      // Revert on error
      mutate()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              DocSummarizer
            </h1>
            <p className="text-xs text-muted-foreground">
              AI 智能文档摘要生成器
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-8">
        {/* Upload section */}
        <section>
          <div className="mb-4 flex flex-col gap-1">
            <h2 className="text-base font-medium text-foreground">
              上传文档
            </h2>
            <p className="text-sm text-muted-foreground">
              上传 PDF 或 TXT 文件，AI 将自动为您生成摘要
            </p>
          </div>
          <UploadZone onUploadComplete={handleUploadComplete} />
        </section>

        <Separator />

        {/* Documents section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-medium text-foreground">
                文档列表
              </h2>
              <p className="text-sm text-muted-foreground">
                {data?.documents?.length
                  ? `共 ${data.documents.length} 个文档`
                  : '上传文件后将在此处显示'}
              </p>
            </div>
          </div>
          <DocumentList
            documents={data?.documents}
            isLoading={isLoading}
            onSummarize={handleSummarize}
            onDelete={handleDelete}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="mx-auto max-w-3xl px-6 py-4 text-center text-xs text-muted-foreground">
          DocSummarizer - 使用 GitHub Models (GPT-4.1-mini) 驱动
        </div>
      </footer>
    </div>
  )
}
