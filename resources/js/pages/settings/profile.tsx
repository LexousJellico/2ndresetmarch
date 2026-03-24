import { FormEvent } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type SharedAuthProps = {
  auth: {
    user: {
      name: string;
      email: string;
      email_verified_at?: string | null;
    };
  };
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Profile settings', href: '/settings/profile' },
];

export default function Profile({
  mustVerifyEmail,
  status,
}: {
  mustVerifyEmail: boolean;
  status?: string;
}) {
  const { auth } = usePage<SharedAuthProps>().props;

  const { data, setData, patch, post, processing, errors, recentlySuccessful } = useForm({
    name: auth.user.name ?? '',
    email: auth.user.email ?? '',
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();

    patch('/settings/profile', {
      preserveScroll: true,
    });
  };

  const resendVerification = () => {
    post('/email/verification-notification', {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile settings" />

      <div className="space-y-6">
        <SettingsLayout>
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#121318]">
              <HeadingSmall
                title="Profile information"
                description="Update your account name and email address."
              />

              {status === 'profile-updated' && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                  Profile updated successfully.
                </div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    autoComplete="name"
                  />
                  <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    autoComplete="email"
                  />
                  <InputError message={errors.email} className="mt-2" />
                </div>

                {mustVerifyEmail && auth.user.email_verified_at === null && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
                    <p>Your email address is unverified.</p>

                    <button
                      type="button"
                      onClick={resendVerification}
                      className="mt-2 underline underline-offset-4"
                    >
                      Click here to resend the verification email.
                    </button>

                    {status === 'verification-link-sent' && (
                      <p className="mt-2">
                        A new verification link has been sent to your email address.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={processing}>
                    Save
                  </Button>

                  {recentlySuccessful && (
                    <span className="text-sm text-slate-500 dark:text-slate-300">
                      Saved
                    </span>
                  )}
                </div>
              </form>
            </div>

            <DeleteUser />
          </div>
        </SettingsLayout>
      </div>
    </AppLayout>
  );
}
