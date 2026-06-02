import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ehieczmqbhqrtnrtthob.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoaWVjem1xYmhxcnRucnR0aG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDY1ODAsImV4cCI6MjA4MDU4MjU4MH0.lf8Q-KouKJ2pxPBTVrIO1V_lezJHL6ZdizQYO6Gdcmc'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoaWVjem1xYmhxcnRucnR0aG9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAwNjU4MCwiZXhwIjoyMDgwNTgyNTgwfQ.oIxZHe6C_9wV1kfXG9_vZAIot8EMRfbUaUtzW6-_MGg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type BlogPost = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string | null
  category: string
  tags: string[]
  is_published: boolean
  author_id: string | null
  meta_title: string
  meta_description: string
  views_count: number
  created_at: string
  updated_at: string
}
