import { Head, useForm, Link } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, LogIn } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Selamat Datang Kembali" description="Silakan masuk untuk mengelola toko Anda hari ini.">
            <Head title="Masuk ke Akun" />

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="font-semibold text-sm">
                            Alamat Email
                        </Label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-[var(--primary)] transition-colors">
                                <Mail className="size-4" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="pl-10 h-11 transition-all border-muted focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                                placeholder="email@tokoanda.com"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="font-semibold text-sm">
                                Kata Sandi
                            </Label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-semibold text-[var(--primary)] hover:underline"
                                    tabIndex={5}
                                >
                                    Lupa Kata Sandi?
                                </Link>
                            )}
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-[var(--primary)] transition-colors">
                                <Lock className="size-4" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="pl-10 h-11 transition-all border-muted focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                                placeholder="••••••••"
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" name="remember" tabIndex={3} className="size-4 rounded-md border-muted text-[var(--primary)] focus:ring-[var(--primary)]" />
                            <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                Ingat Saya
                            </Label>
                        </div>
                    </div>

                    <Button type="submit" className="h-11 w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold transition-all shadow-lg shadow-[var(--primary)]/20 active:scale-[0.98]" tabIndex={4} disabled={processing}>
                        {processing ? (
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                <LogIn className="size-4" /> Masuk Sekarang
                            </span>
                        )}
                    </Button>
                </div>

                {/* Register link removed */}
            </form>

            {status && <div className="mt-6 text-center text-sm font-medium text-green-600 bg-green-50 py-2 rounded-lg border border-green-100">{status}</div>}
        </AuthLayout>
    );
}
