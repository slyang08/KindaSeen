// apps/web/src/components/AuthProvider.tsx
"use client"

import type { User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  loading: boolean
  register: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Initialize session + listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        setUser(session?.user ?? null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // ✅ register
  const register = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  // ✅ login
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  // ✅ logout
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ✅ Get JWT
  const getToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
