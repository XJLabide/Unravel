"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Mail, Lock, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />

                {/* Floating shapes */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-32 right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />

                <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                            <Layers className="w-7 h-7 text-primary" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight">Unravel</span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Transform your documents into
                        <span className="block text-primary">interactive knowledge</span>
                    </h2>

                    <p className="text-lg text-muted-foreground max-w-md mb-8">
                        Upload PDFs, DOCX, spreadsheets and more. Ask questions and get AI-powered answers grounded in your content.
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>RAG-powered</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        <span>Source citations</span>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        <span>Project folders</span>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                            <Layers className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Unravel</h1>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
                        <p className="text-muted-foreground">
                            Sign in to continue to your workspace
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
                        <form onSubmit={handleEmailLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-11 h-12 bg-background border-border focus:border-primary transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </label>
                                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-11 h-12 bg-background border-border focus:border-primary transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Sign in"
                                )}
                            </Button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-4 text-muted-foreground font-medium">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-12 bg-background hover:bg-muted border-border font-medium"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google
                        </Button>
                    </div>

                    {/* Sign up link */}
                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-primary font-medium hover:underline">
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
