'use client'

import { useState } from 'react'
import { FileText, File, Trash2, Sparkles, Loader2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Document } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DocumentCardProps {
  document: Document
  onSummarize: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusConfig = {
  uploaded: {
    label: '待生成摘要',
    icon: Clock,
    className: 'bg-secondary text-secondary-foreground',
  },
  processing: {
    label: '正在生成...',
    icon: Loader2,
    className: 'bg-primary/10 text-primary',
  },
  completed: {
    label: '已完成',
    icon: CheckCircle2,
    className: 'bg-accent/15 text-accent-foreground',
  },
  error: {
    label: '出错',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive',
  },
}

export function DocumentCard({
  document: doc,
  onSummarize,
  onDelete,
}: DocumentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const status = statusConfig[doc.status] || statusConfig.uploaded
  const StatusIcon = status.icon
  const FileIcon = doc.file_type === 'pdf' ? FileText : File

  const handleSummarize = async () => {
    setIsSummarizing(true)
    try {
      await onSummarize(doc.id)
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(doc.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="group transition-all duration-200 hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8">
            <FileIcon className="h-5 w-5 text-primary" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-medium text-foreground">
                {doc.filename}
              </h3>
              <Badge
                variant="secondary"
                className={cn('shrink-0 text-xs', status.className)}
              >
                <StatusIcon
                  className={cn(
                    'mr-1 h-3 w-3',
                    doc.status === 'processing' && 'animate-spin'
                  )}
                />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{doc.file_type.toUpperCase()}</span>
              <span>{formatFileSize(doc.file_size)}</span>
              <span>{formatDate(doc.created_at)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {doc.status === 'uploaded' && (
              <Button
                size="sm"
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="h-8 gap-1.5 text-xs"
              >
                {isSummarizing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                生成摘要
              </Button>
            )}
            {doc.status === 'error' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="h-8 gap-1.5 text-xs"
              >
                {isSummarizing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                重试
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              aria-label="删除文档"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Error message */}
        {doc.status === 'error' && doc.error_message && (
          <div className="rounded-md bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {doc.error_message}
          </div>
        )}

        {/* Summary section */}
        {doc.summary && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {isExpanded ? '收起摘要' : '查看摘要'}
            </button>

            {isExpanded && (
              <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {doc.summary}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
