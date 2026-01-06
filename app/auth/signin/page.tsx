"use client"

import { signIn, getProviders } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null)

  console.log("[SignIn] Page rendering, providers:", providers)

  useEffect(() => {
    console.log("[SignIn] useEffect - Fetching providers...")
    const setAuthProviders = async () => {
      try {
        const res = await getProviders()
        console.log("[SignIn] Providers fetched successfully:", res)
        setProviders(res)
      } catch (error) {
        console.error("[SignIn] Error fetching providers:", error)
      }
    }
    setAuthProviders()
  }, [])

  if (!providers) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle>Welcome to MiniVault</CardTitle>
          <CardDescription>
            Sign in to access your unified project dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.values(providers).map((provider: any) => (
            <Button
              key={provider.name}
              onClick={() => {
                console.log("[SignIn] Sign in button clicked for provider:", provider.name)
                signIn(provider.id, { callbackUrl: "/" })
              }}
              className="w-full"
              variant="outline"
            >
              Sign in with {provider.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}