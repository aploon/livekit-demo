import { AlertTriangle, BadgeInfo, ShieldAlert } from 'lucide-react';

export default function PatientInfoPanel() {
  // Données factices pour la démo
  const patient = {
    name: 'Marcus Patient LEBERT',
    age: '20 ans',
    birthDate: '15/05/1990',
    weight: '89 kg',
    height: '1m83',
    address: '22 rue de Moulins, 39200 Actung HB',
    nss: '1 90 05 39 999 999',
  };

  return (
    <aside className="w-full md:w-96 xl:w-[420px] bg-slate-50 border-r border-slate-200 flex flex-col">
      <header className="px-6 pt-6 pb-4 border-b border-slate-200">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Informations administratives
        </h2>
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {patient.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Né(e) le {patient.birthDate} · {patient.age}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Taille : {patient.height} · Poids : {patient.weight}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Adresse : {patient.address}
              </p>
            </div>
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Pas encore communiqué
            </span>
          </div>
          <button className="mt-3 text-xs font-medium text-sky-700 hover:text-sky-800">
            Changer de bénéficiaire
          </button>
        </div>
      </header>

      <div className="px-6 pb-6 space-y-3 overflow-y-auto">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-800">
              Identité Nationale de Santé
            </p>
            <span className="text-[11px] font-medium text-amber-600">
              identité provisoire
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            NSS : {patient.nss}
          </p>
        </section>

        <section className="bg-rose-50 rounded-2xl border border-rose-200 p-4 flex items-start gap-3">
          <div className="mt-0.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-700">
              Information consultative sur ce patient
            </p>
            <p className="mt-1 text-xs text-rose-700">
              Pour information : en suivi d&apos;infection respiratoire aiguë
              dans les 7 derniers jours.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-slate-500 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-slate-800">
              Identité du patient clef pas vérifiée
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Un contrôle d&apos;identité doit être réalisé avant de conclure
              la consultation.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-start gap-3">
          <BadgeInfo className="w-4 h-4 text-slate-500 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-slate-800">
              Contact d&apos;urgence
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Parent : Jeanne LE BERT · 06 12 34 56 78
            </p>
          </div>
        </section>
      </div>
    </aside>
  );
}


