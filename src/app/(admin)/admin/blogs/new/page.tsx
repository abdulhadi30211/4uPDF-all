import { getAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import BlogFormClient from '../BlogFormClient'

export const metadata = {
  title: 'New Blog Post - 4uPDF Admin',
  robots: 'noindex, nofollow'
}

export default async function NewBlogPage() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <BlogFormClient mode="create" />
    </AdminLayout>
  )
}
