"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Mail, Lock, Loader2, User, CheckCircle2, Sparkles } from "lucide-react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else if (data.user && !data.session) {
            setSuccess(true);
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    const handleGoogleSignup = async () => {
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

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-500/10 mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-3">Check your email</h1>
                    <p className="text-muted-foreground mb-8 text-lg">
                        We&apos;ve sent a confirmation link to <br />
                        <strong className="text-foreground">{email}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                        Click the link in your email to activate your account and start using Unravel.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" size="lg" className="w-full">
                            Back to login
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />

                {/* Floating shapes */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-32 right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

                <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                            <Layers className="w-7 h-7 text-primary" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight">Unravel</span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Start your journey with
                        <span className="block text-primary">AI-powered research</span>
                    </h2>

                    <div className="space-y-4 text-muted-foreground">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <span>Upload any document format</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <span>Get AI answers with source citations</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <span>Organize with project folders</span>
                        </div>
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
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Create your account</h1>
                        <p className="text-muted-foreground">
                            Get started for free, no credit card required
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
                        <form onSubmit={handleSignup} className="space-y-5">
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
                                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    <>
                                        <User className="w-4 h-4 mr-2" />
                                        Create account
                                    </>
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
                            onClick={handleGoogleSignup}
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

                    {/* Login link */}
                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
