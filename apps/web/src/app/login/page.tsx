// apps/web/src/app/login/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { useAuth } from "@/components/auth/AuthProvider"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    await login(email, password)
    router.push("/")
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />

      <input placeholder="password" type="password" onChange={(e) => setPassword(e.target.value)} />

      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
