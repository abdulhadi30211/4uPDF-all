import { getAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import SeoClient from './SeoClient'

export const metadata = {
  title: 'SEO Settings - 4uPDF Admin',
  robots: 'noindex, nofollow'
}

export default async function SeoPage() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <AdminLayout>
      <SeoClient />
    </AdminLayout>
  )
}
