import { useState } from 'react'
import { supabase } from './supabaseClient'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Mail, Loader2 } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      setShowSuccess(false)
      
      const { error } = await supabase.auth.signInWithOtp({ 
        email: values.email 
      })

      if (error) throw error

      setShowSuccess(true)
      form.reset()
      
      toast({
        title: "Magic link sent!",
        description: "Check your email for the login link.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account using your email
          </CardDescription>
        </CardHeader>

        <CardContent>
          {showSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <Mail className="h-4 w-4" />
              <AlertTitle>Check your email</AlertTitle>
              <AlertDescription>
                We've sent you a magic link to sign in to your account.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                        <Input 
                          placeholder="name@example.com" 
                          type="email" 
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      We'll send you a magic link for password-free sign in
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending magic link
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send magic link
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="justify-center text-sm text-gray-500">
          Protected by Supabase Auth
        </CardFooter>
      </Card>
    </div>
  )
}