"use client"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
  const t = useTranslations()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [done, setDone] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder: integrate with API-A05 when backend ready
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold">{t("auth.resetPassword")}</h1>
          <p className="text-muted-foreground">Mật khẩu của bạn đã được cập nhật.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <form onSubmit={onSubmit} className="max-w-md w-full space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">Token/OTP</Label>
          <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full">{t("auth.resetPassword")}</Button>
      </form>
    </div>
  )
}


