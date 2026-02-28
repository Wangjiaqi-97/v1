export interface Document {
  id: string
  filename: string
  file_type: string
  file_size: number
  storage_path: string
  extracted_text: string | null
  summary: string | null
  status: 'uploaded' | 'processing' | 'completed' | 'error'
  error_message: string | null
  created_at: string
  updated_at: string
}
