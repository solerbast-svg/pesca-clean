'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { LayoutDashboard, Fish, Users, Download, MapPin, Settings, LogOut, Anchor, X } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/catches', label: 'Mes prises', icon: Fish },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/exports', label: 'Exports', icon: Download },
  { href: '/gps', label: 'Points GPS', icon: MapPin },
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
  return (
    <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0f2942] text-white z-30 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="bg-[#00b4d8] rounded-lg p-1.5"><Anchor size={20} className="text-white" /></div>
          <span className="text-xl font-bold">PESCA</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-white/60"><X size={20} /></button>
      </div>
      <nav className="px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.startsWith(href) ? 'bg-[#00b4d8] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <Icon size={19} />{label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all">
          <LogOut size={19} />Déconnexion
        </button>
      </div>
    </aside>
  )
}
