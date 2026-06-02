import { getAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import BlogFormClient from '../../BlogFormClient'

export const metadata = {
  title: 'Edit Blog Post - 4uPDF Admin',
  robots: 'noindex, nofollow'
}

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }

  const { id } = await params

  const { data: blog } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!blog) {
    redirect('/admin/blogs')
  }

  return (
    <AdminLayout>
      <BlogFormClient mode="edit" blog={blog} />
    </AdminLayout>
  )
}
