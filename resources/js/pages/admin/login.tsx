import { FormEvent, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
        redirect_to: '/admin/home',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post('/login', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Admin Login" />

            <div className="min-h-screen bg-[#f5f1e8] text-[#1f1f1c] dark:bg-[#101114] dark:text-white">
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-gradient-to-b from-[#dcebdd] via-[#f5f1e8] to-transparent dark:from-[#162230] dark:via-[#101114] dark:to-transparent" />

                <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 lg:px-6">
                    <div className="grid w-full gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                        <section className="flex flex-col justify-center rounded-[2.2rem] border border-black/10 bg-white/80 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur dark:border-white/10 dark:bg-[#16171b]/90">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                BCCC EASE
                            </p>

                            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                                Admin access for content, schedules, and frontend display control.
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-8 text-[#5b5852] dark:text-[#c8c8ce]">
                                This admin login entry is dedicated to the frontend management flow. Successful login now redirects on the backend side to the admin home/config console.
                            </p>

                            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-[1.6rem] bg-[#f7f2e8] p-5 dark:bg-[#1d1e23]">
                                    <ShieldCheck className="h-6 w-6 text-[#174f40] dark:text-[#9dc0ff]" />
                                    <p className="mt-3 text-sm font-black">Admin Entry</p>
                                    <p className="mt-2 text-sm leading-7 text-[#5d5953] dark:text-[#c8c8ce]">
                                        Dedicated login page at <span className="font-semibold">/admin</span>
                                    </p>
                                </div>

                                <div className="rounded-[1.6rem] bg-[#f7f2e8] p-5 dark:bg-[#1d1e23]">
                                    <ShieldCheck className="h-6 w-6 text-[#174f40] dark:text-[#9dc0ff]" />
                                    <p className="mt-3 text-sm font-black">Admin Home</p>
                                    <p className="mt-2 text-sm leading-7 text-[#5d5953] dark:text-[#c8c8ce]">
                                        Config shell at <span className="font-semibold">/admin/home</span>
                                    </p>
                                </div>

                                <div className="rounded-[1.6rem] bg-[#f7f2e8] p-5 dark:bg-[#1d1e23]">
                                    <ShieldCheck className="h-6 w-6 text-[#174f40] dark:text-[#9dc0ff]" />
                                    <p className="mt-3 text-sm font-black">Backend Redirect</p>
                                    <p className="mt-2 text-sm leading-7 text-[#5d5953] dark:text-[#c8c8ce]">
                                        No client-side redirect workaround needed
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-[2.2rem] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[#16171b]">
                            <div className="border-b border-black/10 px-6 py-5 dark:border-white/10">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                    Admin Login
                                </p>
                                <h2 className="mt-2 text-3xl font-black tracking-tight">Sign in to manage frontend content</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
                                <input
                                    type="hidden"
                                    value={data.redirect_to}
                                    onChange={() => {}}
                                />

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">Email</label>
                                    <div className="flex items-center gap-3 rounded-[1.3rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 dark:border-white/10 dark:bg-[#1d1e23]">
                                        <Mail className="h-5 w-5 text-[#6a665f] dark:text-[#a8a8b0]" />
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="admin@email.com"
                                            className="w-full bg-transparent text-sm outline-none"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">Password</label>
                                    <div className="flex items-center gap-3 rounded-[1.3rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 dark:border-white/10 dark:bg-[#1d1e23]">
                                        <LockKeyhole className="h-5 w-5 text-[#6a665f] dark:text-[#a8a8b0]" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter password"
                                            className="w-full bg-transparent text-sm outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="text-[#6a665f] dark:text-[#a8a8b0]"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                    )}
                                </div>

                                <label className="flex items-center gap-3 rounded-2xl bg-[#f7f2e8] px-4 py-3 text-sm dark:bg-[#1d1e23]">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-black/20"
                                    />
                                    <span>Keep this admin session signed in</span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex w-full items-center justify-center rounded-full bg-[#174f40] px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60 dark:bg-[#2d47ff]"
                                >
                                    {processing ? 'Signing in...' : 'Login to Admin'}
                                </button>

                                <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 text-sm leading-7 text-[#5d5953] dark:bg-[#1d1e23] dark:text-[#c8c8ce]">
                                    This page now relies on backend redirect handling to bring the user to
                                    <span className="font-semibold"> /admin/home </span>
                                    after successful authentication.
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/"
                                        className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                                    >
                                        Back to Website
                                    </Link>

                                    <Link
                                        href="/login"
                                        className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                                    >
                                        Open Default Login
                                    </Link>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}