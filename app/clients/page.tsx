'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { getClients, deleteClient } from '../../lib/crud'
import { Plus, Phone, Mail, Trash2, Users } from 'lucide-react'

const TYPE_ICON: any = { restaurant: '🍽️', hotel: '🏨', particulier: '👤', autre: '📋' }

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const data = await getClients(user.id)
      setClients(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return
    await deleteClient(id)
    setClients(clients.filter((c: any) => c.id !== id))
  }

  const filtered = clients.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <Layout title="Clients">
      <Link href="/clients/new" className="flex items-center justify-center gap-2 bg-[#0f2942] text-white rounded-2xl py-4 px-6 text-base font-bold mb-4 hover:bg-[#1a3d5c] transition">
        <Plus size={22} />Nouveau client
      </Link>
      <input type="text" placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full border-2 border-gray-200 rounded-2xl px-5 py-3.5 text-sm mb-5 focus:outline-none focus:border-[#00b4d8]" />
      {loading ? <div className="text-center text-gray-400 py-12">Chargement...</div> : filtered.length === 0 ? (
        <div className="text-center py-16"><Users size={48} className="text-gray-200 mx-auto mb-3" /><p className="text-gray-400">{search ? 'Aucun résultat' : 'Aucun client'}</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{TYPE_ICON[c.type] || '📋'}</span>
                    <p className="text-base font-bold text-[#0f2942]">{c.name}</p>
                  </div>
                  {c.contact_name && <p className="text-sm text-gray-500 mb-2">{c.contact_name}</p>}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-sm text-[#00b4d8] font-medium"><Phone size={14} />{c.phone}</a>}
                    {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-sm text-[#00b4d8] font-medium"><Mail size={14} />{c.email}</a>}
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-gray-300 hover:text-red-400 transition p-2 ml-2"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
