'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { getDashboardStats, getLastSessions } from '../../lib/crud'
import { Fish, Users, TrendingUp, Package, Plus } from 'lucide-react'

const STATUS: any = {
  available: { label: '🟢 Dispo', color: 'text-green-600' },
  partial: { label: '🟡 Partiel', color: 'text-yellow-600' },
  sold: { label: '⚫ Vendu', color: 'text-gray-500' },
  expired: { label: '🔴 Expiré', color: 'text-red-500' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const [s, p, sess] = await Promise.all([
        getDashboardStats(user.id),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        getLastSessions(user.id),
      ])
      setStats(s)
      setProfile(p.data)
      setSessions(sess)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Layout title="Tableau de bord"><div className="flex items-center justify-center h-64"><div className="text-[#00b4d8] text-lg">Chargement...</div></div></Layout>

  return (
    <Layout title="Tableau de bord">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0f2942]">Bonjour {profile?.full_name?.split(' ')[0] || 'Pêcheur'} 👋</h2>
        <p className="text-gray-500 mt-0.5">Ce mois-ci</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0f2942] rounded-2xl p-5 text-white">
          <Fish size={24} className="text-[#00b4d8] mb-3" />
          <p className="text-3xl font-bold">{stats.totalWeightMonth.toFixed(0)} <span className="text-lg">kg</span></p>
          <p className="text-white/60 text-sm mt-1">Pris ce mois</p>
        </div>
        <div className="bg-[#00b4d8] rounded-2xl p-5 text-white">
          <TrendingUp size={24} className="text-white/80 mb-3" />
          <p className="text-3xl font-bold">{stats.totalRevenueMonth.toFixed(0)} <span className="text-lg">€</span></p>
          <p className="text-white/70 text-sm mt-1">Revenus ce mois</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <Package size={24} className="text-[#0f2942] mb-3" />
          <p className="text-3xl font-bold text-[#0f2942]">{stats.availableCatches}</p>
          <p className="text-gray-400 text-sm mt-1">Lots disponibles</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <Users size={24} className="text-[#0f2942] mb-3" />
          <p className="text-3xl font-bold text-[#0f2942]">{stats.totalClients}</p>
          <p className="text-gray-400 text-sm mt-1">Clients actifs</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link href="/catches/new" className="bg-[#0f2942] text-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#1a3d5c] transition">
          <Plus size={28} className="text-[#00b4d8]" />
          <span className="font-bold text-sm">Nouvelle prise</span>
        </Link>
        <Link href="/clients/new" className="bg-white border-2 border-[#0f2942] text-[#0f2942] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition">
          <Users size={28} />
          <span className="font-bold text-sm">Nouveau client</span>
        </Link>
      </div>
      <div className="mb-6">
        <a href="recfishing://" onClick={(e) => { e.preventDefault(); window.location.href = 'recfishing://'; setTimeout(() => { window.open('https://recfishing.eu', '_blank') }, 500) }}
          className="w-full bg-[#006d77] text-white rounded-2xl p-4 flex items-center justify-center gap-3 hover:bg-[#005f69] transition">
          <span className="text-2xl">🎣</span>
          <div className="text-left">
            <p className="font-bold">Déclarer mes prises</p>
            <p className="text-white/70 text-sm">Ouvrir RecFishing</p>
          </div>
        </a>
      </div>
      <div className="mt-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🌊 Météo & Vent</p>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <iframe src="https://embed.windy.com/embed2.html?lat=-21.115&lon=55.536&detailLat=-21.115&detailLon=55.536&width=650&height=450&zoom=9&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1" width="100%" height="400" frameBorder="0" title="Windy La Réunion" />
        </div>
      </div>
      {sessions.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🐟 7 dernières sorties</p>
          <div className="space-y-2">
            {sessions.map((c: any) => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0f2942]">{c.species}</p>
                  <p className="text-sm text-gray-400">{new Date(c.catch_date).toLocaleDateString('fr-FR')} · {c.weight_kg} kg</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold ${STATUS[c.status]?.color || 'text-gray-400'}`}>{STATUS[c.status]?.label || c.status}</p>
                  {c.price_per_kg && <p className="text-sm font-bold text-[#00b4d8]">{c.price_per_kg}€/kg</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}