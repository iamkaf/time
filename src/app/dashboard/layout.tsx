import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarLayout } from '@/components/layout/sidebar-layout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <SidebarLayout user={user}>
      {children}
    </SidebarLayout>
  )
}