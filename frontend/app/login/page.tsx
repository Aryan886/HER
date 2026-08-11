"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HeartPulse, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { DEMO_CONFIG } from "@/lib/mock/config";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, demoLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: DEMO_CONFIG.credentials,
  });

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-card border border-border bg-white shadow-elevated lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-rose-light p-8 sm:p-10">
          <div className="mb-10 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-card bg-rose text-white">
              <HeartPulse className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-3xl leading-none">HER</p>
              <p className="text-caption text-muted">Heard, Evidenced, Recorded</p>
            </div>
          </div>
          <h1 className="font-display text-display">A symptom record in your own words.</h1>
          <p className="mt-4 max-w-md text-body text-muted">
            HER turns lived experience into organized medical evidence while keeping the demo private and local.
          </p>
        </div>

        <form
          className="p-8 sm:p-10"
          onSubmit={handleSubmit(async (values) => {
            setError(null);
            const success = await login(values.email, values.password);
            if (success) router.push("/dashboard");
            else setError("Use the demo credentials to enter the prototype.");
          })}
        >
          <h2 className="font-display text-title">Demo login</h2>
          <p className="mt-1 text-sm text-muted">
            {DEMO_CONFIG.credentials.email} / {DEMO_CONFIG.credentials.password}
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-label text-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field mt-2"
                {...register("email", { required: true })}
              />
              {errors.email ? <p className="mt-1 text-caption text-rose">Email is required.</p> : null}
            </div>
            <div>
              <label htmlFor="password" className="text-label text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="field mt-2"
                {...register("password", { required: true })}
              />
              {errors.password ? <p className="mt-1 text-caption text-rose">Password is required.</p> : null}
            </div>
          </div>

          {error ? <p className="mt-4 rounded-input bg-rose-light p-3 text-sm text-rose">{error}</p> : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary flex-1" disabled={isSubmitting}>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in
            </button>
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={async () => {
                await demoLogin();
                router.push("/dashboard");
              }}
            >
              Use demo account
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
