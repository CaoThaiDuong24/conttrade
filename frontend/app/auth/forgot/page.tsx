"use client"

import type React from "react"
import { useState } from "react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Phone, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { apiClient, AuthForgotRequest, AuthResetRequest } from "@/lib/api"
import Link from "next/link"

type ResetMethod = "email" | "phone"
type Step = "request" | "verify" | "reset" | "success"

export default function ForgotPasswordPage() {
  const t = useTranslations()
  const [step, setStep] = useState<Step>("request")
  const [resetMethod, setResetMethod] = useState<ResetMethod>("email")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const forgotData: AuthForgotRequest = {
        emailOrPhone: resetMethod === "email" ? formData.email : formData.phone,
      }

      const response = await apiClient.forgotPassword(forgotData)
      
      if (response.status === 200) {
        setStep("verify")
      } else {
        // Handle error
        console.error('Forgot password failed:', response.message)
      }
    } catch (error) {
      console.error('Forgot password error:', error)
    }

    setIsLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setStep("reset")
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const resetData: AuthResetRequest = {
        tokenOrOtp: formData.otp,
        newPassword: formData.newPassword,
      }

      const response = await apiClient.resetPassword(resetData)
      
      if (response.status === 200) {
        setStep("success")
      } else {
        // Handle error
        console.error('Reset password failed:', response.message)
      }
    } catch (error) {
      console.error('Reset password error:', error)
    }

    setIsLoading(false)
  }

  const getContactInfo = () => {
    return resetMethod === "email" ? formData.email : formData.phone
  }

  if (step === "success") {
    return (
      <AuthLayout title="Đặt lại mật khẩu thành công" subtitle="Mật khẩu của bạn đã được cập nhật">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Mật khẩu mới đã được thiết lập thành công. Bạn có thể đăng nhập với mật khẩu mới.
            </AlertDescription>
          </Alert>

          <Button asChild className="w-full">
            <Link href="/vi/auth/login">{t("auth.login")}</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  if (step === "reset") {
    return (
      <AuthLayout title={t("auth.resetPassword")} subtitle="Tạo mật khẩu mới cho tài khoản của bạn">
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")} *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {formData.newPassword !== formData.confirmPassword && formData.confirmPassword && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Mật khẩu xác nhận không khớp</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep("verify")} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || formData.newPassword !== formData.confirmPassword}
              className="flex-1"
            >
              {isLoading ? t("common.loading") : "Cập nhật mật khẩu"}
            </Button>
          </div>
        </form>
      </AuthLayout>
    )
  }

  if (step === "verify") {
    return (
      <AuthLayout title={t("auth.verifyOtp")} subtitle={`Mã xác thực đã được gửi đến ${getContactInfo()}`}>
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp">{t("auth.otp")}</Label>
            <Input
              id="otp"
              type="text"
              value={formData.otp}
              onChange={(e) => handleInputChange("otp", e.target.value)}
              placeholder="Nhập mã OTP 6 số"
              maxLength={6}
              className="text-center text-lg tracking-widest"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep("request")} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
            <Button type="submit" disabled={isLoading || formData.otp.length !== 6} className="flex-1">
              {isLoading ? t("common.loading") : t("auth.verifyOtp")}
            </Button>
          </div>

          <div className="text-center">
            <Button variant="link" className="text-sm">
              Gửi lại mã OTP
            </Button>
          </div>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t("auth.forgotPassword")} subtitle="Nhập thông tin để đặt lại mật khẩu">
      <div className="space-y-6">
        <Tabs value={resetMethod} onValueChange={(value) => setResetMethod(value as ResetMethod)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Điện thoại
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleRequestReset} className="space-y-4 mt-4">
            <TabsContent value="email" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Chúng tôi sẽ gửi liên kết đặt lại mật khẩu đến email của bạn.
              </p>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="0123456789"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">Chúng tôi sẽ gửi mã OTP đến số điện thoại của bạn.</p>
            </TabsContent>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("auth.sendOtp")}
            </Button>
          </form>
        </Tabs>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Nhớ mật khẩu? </span>
          <Link href="/vi/auth/login" className="text-primary hover:underline font-medium">
            {t("auth.login")}
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
