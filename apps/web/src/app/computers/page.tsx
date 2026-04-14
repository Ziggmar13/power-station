import { createServerClient } from '@/services/supabase-server'
import { ComputerForm } from '@/components/features/computer-form'
import type { Computer } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function ComputersPage({ searchParams }: PageProps) {
  const { id } = await searchParams
  let computer: Computer | undefined

  if (id) {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('computers')
      .select('*')
      .eq('id', id)
      .single()
    computer = data ?? undefined
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {computer ? `Edit "${computer.name}"` : 'Add computer'}
        </h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <ComputerForm computer={computer} />
        </div>
      </div>
    </main>
  )
}
