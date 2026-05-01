'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { getCatches, getSales } from '../../lib/crud'
import { exportToCSV } from '../../lib/exportCsv'
import { Download, Fish, TrendingUp, FileText } from 'lucide-react'

export default function ExportsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
    }
    load()
  }, [])

  const getDates = () => {
    const now = new Date()
    if (period === 'month') return { start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) }
    if (period === 'year') return { start: new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) }
    return { start: '2000-01-01', end: now.toISOString().slice(0, 10) }
  }

  const handleExport = async (type: string) => {
    if (!userId) return
    setLoading(type)
    try {
      const { start, end } = getDates()
      if (type === 'sales') {
        const sales = await getSales(userId)
        const filtered = sales.filter((s: any) => s.sale_date >= start && s.sale_date <= end)
        exportToCSV(`pesca_ventes_${new Date().toISOString().slice(0,10)}.csv`, filtered.map((s: any) => ({ Date: s.sale_date, Client: s.client?.name || '', Quantité: s.quantity_kg, 'Prix/kg': s.price_per_kg, Total: s.total_amount })))
      } else {
        const catches = await getCatches(userId)
        const filtered = catches.filter((c: any) => c.catch_date >= start && c.catch_date <= end)
        exportToCSV(`pesca_prises_${new Date().toISOString().slice(0,10)}.csv`, filtered.map((c: any) => ({ Date: c.catch_date, Espèce: c.species, Poids: c.weight_kg, Prix: c.price_per_kg || '', Statut: c.status })))
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <Layout title="Exports">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <p className="text-sm font-bold text-gray-500 mb-3">Période</p>
        <div className="grid grid-cols-3 gap-2">
          {[{key:'month',label:'Ce mois'},{key:'year',label:'Cette année'},{key:'all',label:'Tout'}].map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)} className={`py-3 rounded-xl text-sm font-bold transition ${period === p.key ? 'bg-[#0f2942] text-white' : 'bg-gray-100 text-gray-600'}`}>{p.label}</button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <button onClick={() => handleExport('sales')} disabled={!!loading} className="w-full bg-[#0f2942] text-white rounded-2xl p-5 flex items-center gap-4 hover:bg-[#1a3d5c] transition disabled:opacity-50">
          <div className="bg-[#00b4d8] rounded-xl p-3"><TrendingUp size={24} /></div>
          <div className="text-left flex-1"><p className="font-bold text-lg">Mes ventes</p><p className="text-white/60 text-sm">Export CSV comptabilité</p></div>
          {loading === 'sales' ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={22} className="text-white/70" />}
        </button>
        <button onClick={() => handleExport('catches')} disabled={!!loading} className="w-full bg-white border-2 border-[#0f2942] text-[#0f2942] rounded-2xl p-5 flex items-center gap-4 hover:bg-gray-50 transition disabled:opacity-50">
          <div className="bg-[#e8f4fd] rounded-xl p-3"><Fish size={24} className="text-[#0f2942]" /></div>
          <div className="text-left flex-1"><p className="font-bold text-lg">Mes prises</p><p className="text-gray-400 text-sm">Export CSV toutes espèces</p></div>
          {loading === 'catches' ? <div className="w-6 h-6 border-2 border-gray-200 border-t-[#0f2942] rounded-full animate-spin" /> : <Download size={22} className="text-gray-400" />}
        </button>
        <button onClick={() => handleExport('recfishing')} disabled={!!loading} className="w-full bg-white border-2 border-[#00b4d8] text-[#006d77] rounded-2xl p-5 flex items-center gap-4 hover:bg-[#f0fcff] transition disabled:opacity-50">
          <div className="bg-[#e0f7fa] rounded-xl p-3"><FileText size={24} className="text-[#00b4d8]" /></div>
          <div className="text-left flex-1"><p className="font-bold text-lg">RecFishing</p><p className="text-[#00b4d8]/70 text-sm">Format déclaration officielle</p></div>
          {loading === 'recfishing' ? <div className="w-6 h-6 border-2 border-[#00b4d8]/30 border-t-[#00b4d8] rounded-full animate-spin" /> : <Download size={22} className="text-[#00b4d8]/70" />}
        </button>
      </div>
    </Layout>
  )
}
