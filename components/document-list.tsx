'use client'

import { DocumentCard } from '@/components/document-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Document } from '@/lib/types'
import { FileText } from 'lucide-react'

interface DocumentListProps {
  documents: Document[] | undefined
  isLoading: boolean
  onSummarize: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function DocumentList({
  documents,
  isLoading,
  onSummarize,
  onDelete,
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">暂无文档</p>
          <p className="text-xs text-muted-foreground">
            上传 PDF 或 TXT 文件开始使用
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onSummarize={onSummarize}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
