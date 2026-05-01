'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { getGpsPoints, createGpsPoint, deleteGpsPoint } from '../../lib/crud'
import { Plus, Trash2, MapPin, Navigation } from 'lucide-react'

const CAT: any = { spot: '🎣', port: '⚓', danger: '⚠️', autre: '📍' }

export default function GpsPage() {
  const router = useRouter()
  const [points, setPoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', lat: '', lng: '', category: 'spot', notes: '' })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const data = await getGpsPoints(user.id)
      setPoints(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert('GPS non disponible'); return }
    navigator.geolocation.getCurrentPosition(pos => setForm(f => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    try {
      const point = await createGpsPoint(userId, { name: form.name, lat: parseFloat(form.lat), lng: parseFloat(form.lng), category: form.category, notes: form.notes || null })
      setPoints([point, ...points])
      setShowForm(false)
      setForm({ name: '', lat: '', lng: '', category: 'spot', notes: '' })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ?')) return
    await deleteGpsPoint(id)
    setPoints(points.filter((p: any) => p.id !== id))
  }

  return (
    <Layout title="Points GPS">
      <button onClick={() => setShowForm(!showForm)} className="flex items-center justify-center gap-2 w-full bg-[#0f2942] text-white rounded-2xl py-4 px-6 text-base font-bold mb-5 hover:bg-[#1a3d5c] transition">
        <Plus size={22} />{showForm ? 'Annuler' : 'Ajouter un point'}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Nom *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="Spot du large..." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b4d8]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="any" value={form.lat} onChange={e => setForm(f => ({...f, lat: e.target.value}))} required placeholder="Latitude" className="border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#00b4d8]" />
            <input type="number" step="any" value={form.lng} onChange={e => setForm(f => ({...f, lng: e.target.value}))} required placeholder="Longitude" className="border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#00b4d8]" />
          </div>
          <button type="button" onClick={handleGetLocation} className="w-full border-2 border-[#00b4d8] text-[#00b4d8] rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2"><Navigation size={18} />Utiliser ma position GPS</button>
          <button type="submit" disabled={saving} className="w-full bg-[#00b4d8] text-white rounded-xl py-3 text-sm font-bold disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </form>
      )}
      {loading ? <div className="text-center text-gray-400 py-12">Chargement...</div> : points.length === 0 ? (
        <div className="text-center py-16"><MapPin size={48} className="text-gray-200 mx-auto mb-3" /><p className="text-gray-400">Aucun point GPS</p></div>
      ) : (
        <div className="space-y-3">
          {points.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{CAT[p.category] || '📍'}</span>
                  <div><p className="font-bold text-[#0f2942]">{p.name}</p><p className="text-xs text-gray-400 font-mono">{Number(p.lat).toFixed(4)}, {Number(p.lng).toFixed(4)}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.open(`https://maps.google.com/?q=${p.lat},${p.lng}`, '_blank')} className="bg-[#e0f7fa] text-[#00b4d8] rounded-xl p-2.5"><MapPin size={18} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-400 transition p-2"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
