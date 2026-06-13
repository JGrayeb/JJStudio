// app/beverages/page.js
"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function BeveragesPage() {
  const router = useRouter()
  const supabase = createClient()

  // Example product list: change names and image file names as you like.
  const PRODUCTS = [
    { id: "matcha1", name: "Ceremonial Matcha", image: "/images/matcha-ceremonial.png" },
    { id: "protein-bar", name: "JJ Protein Bar", image: "/images/protein-bar.png" },
    { id: "matcha-latte", name: "Matcha Latte", image: "/images/matcha-latte.png" },
    { id: "recovery-shake", name: "Recovery Shake", image: "/images/recovery-shake.png" },
  ]

  const handleBuy = (product) => {
    // simple placeholder: later implement cart/checkout
    alert(`${product.name} added — costs 1 beverage point`)
  }

  return (
    <main className="min-h-screen bg-black text-white py-20" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="w-14 h-0.5 bg-red-900 mx-auto mb-6" />
          <h1 className="font-black uppercase text-4xl lg:text-6xl">Beverages <span className="text-red-800">Store</span></h1>
          <p className="mt-4 text-sm text-white/40">Grab a Matcha or a JJ bar — each costs 1 beverage point.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map(p => (
            <div key={p.id} className="bg-white/3 border border-white/8 p-6 rounded-lg flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform">
              <div className="w-full h-40 relative mb-4 bg-white/5 flex items-center justify-center overflow-hidden">
                {/* If you don't have the image yet, add a matching PNG to public/images */}
                <Image src={p.image} alt={p.name} fill className="object-cover" />
              </div>
              <h3 className="font-bold uppercase mb-2">{p.name}</h3>
              <p className="text-xs text-white/50 mb-4">1 beverage point</p>
              <div className="w-full flex gap-2">
                <button onClick={() => handleBuy(p)} className="flex-1 bg-red-900 hover:bg-red-800 text-white text-xs font-bold uppercase px-4 py-2">
                  Get
                </button>
                <button onClick={() => router.push('/login')} className="flex-1 border border-white/10 text-white text-xs font-bold uppercase px-4 py-2">
                  More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}