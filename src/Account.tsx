import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import type { User } from '@supabase/supabase-js'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { UserCircle, Globe, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

interface Session {
  user: User
}

interface AccountProps {
  session: Session
}

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  avatar_url: z.string().url().optional().or(z.literal(""))
})

export default function Account({ session }: AccountProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      website: "",
      avatar_url: ""
    },
  })

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error } = await supabase
          .from('profiles')
          .select(`username, website, avatar_url`)
          .eq('id', session.user.id)
          .single()

        if (error) {
          throw error
        }

        if (data) {
          form.reset({
            username: data.username || "",
            website: data.website || "",
            avatar_url: data.avatar_url || ""
          })
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [session, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      setError(null)

      const updates = {
        id: session.user.id,
        ...values,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={form.getValues().avatar_url || ""} />
            <AvatarFallback>
              {form.getValues().username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your account settings and profile information
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserCircle className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                        <Input className="pl-9" placeholder="Your name" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                        <Input 
                          className="pl-9" 
                          placeholder="https://example.com" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your personal or professional website
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="text"
                    value={session.user.email}
                    disabled
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Update Profile"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}