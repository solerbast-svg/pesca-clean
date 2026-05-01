'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { getProfile, updateProfile } from '../../lib/crud'
import { User, Save } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState({ full_name: '', boat_name: '', phone: '' })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      try {
        const profile = await getProfile(user.id)
        setForm({ full_name: profile.full_name || '', boat_name: profile.boat_name || '', phone: profile.phone || '' })
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    try {
      await updateProfile(userId, form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally { setSaving(false) }
  }

  if (loading) return <Layout title="Paramètres"><div className="text-center text-gray-400 py-12">Chargement...</div></Layout>

  return (
    <Layout title="Paramètres">
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm mb-5 text-center font-medium">✅ Profil enregistré !</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4">
          <p className="font-bold text-[#0f2942] flex items-center gap-2"><User size={18} className="text-[#00b4d8]" />Mon profil</p>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Nom complet</label>
            <input type="text" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} placeholder="Jean-Paul Martin" className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-[#00b4d8]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Nom du bateau</label>
            <input type="text" value={form.boat_name} onChange={e => setForm(f => ({...f, boat_name: e.target.value}))} placeholder="La Belle Réunion" className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-[#00b4d8]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1.5">Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="0692 000 000" className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-[#00b4d8]" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="w-full bg-[#0f2942] text-white py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 hover:bg-[#1a3d5c] transition disabled:opacity-50">
          <Save size={20} />{saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} className="w-full border-2 border-red-200 text-red-500 py-4 rounded-2xl text-base font-bold hover:bg-red-50 transition">Se déconnecter</button>
      </div>
    </Layout>
  )
}
