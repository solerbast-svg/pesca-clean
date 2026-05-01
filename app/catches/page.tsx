'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { getCatches, deleteCatch } from '../../lib/crud'
import { Plus, Trash2, Fish } from 'lucide-react'

const STATUS: any = {
  available: { label: 'Disponible', bg: 'bg-green-100', text: 'text-green-700' },
  partial: { label: 'Partiel', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  sold: { label: 'Vendu', bg: 'bg-gray-100', text: 'text-gray-500' },
  expired: { label: 'Expiré', bg: 'bg-red-100', text: 'text-red-600' },
}

export default function CatchesPage() {
  const router = useRouter()
  const [catches, setCatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const data = await getCatches(user.id)
      setCatches(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette prise ?')) return
    await deleteCatch(id)
    setCatches(catches.filter(c => c.id !== id))
  }

  const filtered = filter === 'all' ? catches : catches.filter(c => c.status === filter)

  return (
    <Layout title="Mes prises">
      <Link href="/catches/new" className="flex items-center justify-center gap-2 bg-[#0f2942] text-white rounded-2xl py-4 px-6 text-base font-bold mb-6 hover:bg-[#1a3d5c] transition">
        <Plus size={22} />Ajouter une prise
      </Link>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {[{key:'all',label:'Tout'},{key:'available',label:'🟢 Dispo'},{key:'partial',label:'🟡 Partiel'},{key:'sold',label:'⚫ Vendu'}].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${filter === f.key ? 'bg-[#0f2942] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{f.label}</button>
        ))}
      </div>
      {loading ? <div className="text-center text-gray-400 py-12">Chargement...</div> : filtered.length === 0 ? (
        <div className="text-center py-16"><Fish size={48} className="text-gray-200 mx-auto mb-3" /><p className="text-gray-400">Aucune prise</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c: any) => {
            const st = STATUS[c.status] || STATUS.available
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-lg font-bold text-[#0f2942]">{c.species}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${st.bg} ${st.text}`}>{st.label}</span>
                    </div>
                    <p className="text-gray-500 text-sm">{c.weight_kg} kg</p>
                    <div className="flex items-center gap-3 mt-2">
                      {c.price_per_kg && <span className="text-[#00b4d8] font-bold">{c.price_per_kg} €/kg</span>}
                      <span className="text-gray-300 text-sm">{new Date(c.catch_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(c.id)} className="text-gray-300 hover:text-red-400 transition p-2 ml-2"><Trash2 size={18} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
