import Link from 'next/link'
import { createServerClient } from '@/services/supabase-server'
import { ComputerCard } from '@/components/features/computer-card'
import { Button } from '@/components/ui/button'
import type { Computer } from '@power-station/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createServerClient()
  const { data: computers } = await supabase
    .from('computers')
    .select('*')
    .order('created_at', { ascending: true })

  const list = (computers ?? []) as Computer[]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Power Station</h1>
            <p className="text-sm text-gray-500 mt-1">
              Wake or shut down your computers via Alexa
            </p>
          </div>
          <Link href="/computers">
            <Button>+ Add computer</Button>
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium mb-2">No computers yet</p>
            <p className="text-sm mb-6">
              Add your first computer to get started.
            </p>
            <Link href="/computers">
              <Button>Add computer</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((c) => (
              <ComputerCard key={c.id} computer={c} />
            ))}
          </div>
        )}

        <div className="mt-10 rounded-xl bg-blue-50 border border-blue-100 p-5 text-sm text-blue-800">
          <p className="font-semibold mb-1">How to use</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Add your computer above (name + MAC address)</li>
            <li>Install and run the desktop agent on your PC</li>
            <li>
              Say:{' '}
              <span className="font-mono">
                &quot;Alexa, ask Power Station to turn on my PC&quot;
              </span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  )
}
