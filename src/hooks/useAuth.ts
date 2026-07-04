'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

const OWNER_EMAILS = (process.env.NEXT_PUBLIC_SITE_OWNER_EMAIL || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

function emailIsOwner(email: string | null | undefined): boolean {
  if (!email) return false
  if (OWNER_EMAILS.length === 0) return false
  return OWNER_EMAILS.includes(email.toLowerCase())
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const refresh = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (!mounted) return
        const u = error || !data?.user ? null : data.user
        setUser(u)
        setIsAdmin(emailIsOwner(u?.email))
      } catch {
        if (mounted) {
          setUser(null)
          setIsAdmin(false)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    refresh()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      const u = session?.user ?? null
      setUser(u)
      setIsAdmin(emailIsOwner(u?.email))
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    setIsAdmin(false)
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error }
  }

  return {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updatePassword,
  }
}
