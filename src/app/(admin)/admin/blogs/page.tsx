import { getAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminBlogsClient from './AdminBlogsClient'

export const metadata = {
  title: 'Manage Blogs - 4uPDF Admin',
  robots: 'noindex, nofollow'
}

export default async function AdminBlogsPage() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <AdminBlogsClient />
    </AdminLayout>
  )
}
