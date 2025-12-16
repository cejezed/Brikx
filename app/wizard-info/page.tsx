import Link from "next/link";

export default function WizardInfoPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 text-slate-900 dark:bg-gradient-to-br dark:from-[#040914] dark:via-[#0a1326] dark:to-[#0F172A] dark:text-slate-100 transition-colors duration-500">
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Wizard aankondiging</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Onze PvE-wizard is binnenkort terug</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            We werken aan de laatste stabilisaties. Laat uw e-mailadres achter en we geven u een seintje zodra de
            wizard weer open is. Wilt u nu al met ons sparren? Mail ons gerust.
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <form
            className="space-y-3"
            action="https://formsubmit.co/info@brikxai.nl"
            method="POST"
          >
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block">
              E-mailadres
              <input
                type="email"
                name="email"
                required
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 px-3 py-2 focus:border-slate-400 focus:outline-none"
                placeholder="u@voorbeeld.nl"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 text-white py-2.5 font-semibold hover:bg-slate-800 transition"
            >
              Houd me op de hoogte
            </button>
            <input type="hidden" name="_subject" value="Wizard waitlist" />
            <input type="hidden" name="_captcha" value="false" />
          </form>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <p>We gebruiken uw e-mailadres alleen om u te informeren wanneer de wizard weer beschikbaar is.</p>
            <p>
              Liever direct contact? Mail ons op{" "}
              <Link className="underline font-semibold" href="mailto:info@brikxai.nl">
                info@brikxai.nl
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <Link className="underline hover:text-slate-700 dark:hover:text-slate-200" href="/">
            Terug naar homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
