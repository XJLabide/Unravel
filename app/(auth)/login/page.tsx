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
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
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
