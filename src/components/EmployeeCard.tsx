import { Users } from "lucide-react";
import { navigate } from "@hooks/navigate";
import type { UserResponseSchemaType } from "openauthster-shared/endpoints";

type Props = {
  users: Exclude<UserResponseSchemaType["data"], null>["users"];
};

export default function EmployeeCard({ users }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none flex flex-col mb-5">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Users size={16} />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Employés
        </h3>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const userId = new FormData(e.currentTarget).get("userId");
          if (userId) navigate(`/admin/user?id=${userId}`);
        }}
        className="p-5 flex flex-col sm:flex-row gap-3"
      >
        <select
          name="userId"
          className="flex-1 bg-slate-50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-slate-900 dark:text-white transition-all outline-none appearance-none text-sm"
          required
        >
          <option value="" className="bg-white dark:bg-zinc-800 text-slate-400">
            Sélectionnez un employé...
          </option>
          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}
              className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
            >
              {(user.data as { name?: string }).name ?? user.identifier}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-violet-500/20 shrink-0"
        >
          Voir le profil
        </button>
      </form>
    </div>
  );
}
