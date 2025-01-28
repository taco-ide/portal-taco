"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Select } from "./ui/select";

export function SingUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Create account")
    router.push("/login")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleCreate}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome</h1>
                <p className="text-balance text-muted-foreground">
                  Create your TACO account
                </p>
              </div>
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your Name"
                  required
                />
              </div>
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" required />
              </div>
              {/* Account Type */}
              <div className="grid gap-2">
                <Label htmlFor="accountType">Account Type</Label>
              </div>
              {/* Create Account */}
              <Button type="submit" className="w-full">
                Create Account
              </Button>
              
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/taco-logo.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
