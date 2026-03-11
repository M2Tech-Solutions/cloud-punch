import { useState, useEffect } from "react";
import { GET as getWorkTime } from "@api/worktime";
import { GET as getUsers } from "@api/admin/users";
import { GET as getSalaries } from "@api/admin/salary";
import { Banknote } from "lucide-react";
import PaymentTable, { type PaymentRecord } from "../../components/PaymentTable";
import WorktimeTable from "../../components/WorktimeTable";
import EmployeeCard from "../../components/EmployeeCard";
import ProjectTasksCard from "../../components/ProjectTasksCard";
import type { WorktimeType } from "@db/schema";
import { useProjects } from "@hooks/project";
import type { UserResponseSchemaType } from "openauthster-shared/endpoints";

export default function AdminPage() {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [hourlyRates, setHourlyRates] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [userList, setUserList] = useState<
    Exclude<UserResponseSchemaType["data"], null>["users"]
  >([]);

  const { projects, loading: loadingProjects } = useProjects();

  useEffect(() => {
    getWorkTime().then((res) => {
      if (!res.success) {
        setError(
          "Une erreur est survenue lors de la récupération des employés.",
        );
        return;
      }
      setPaymentRecords(
        res.workingHours?.map<PaymentRecord>((wh) => ({
          id: wh.id,
          userId: wh.userId,
          employeeName: wh.userName || wh.userId,
          fromDate: new Date(wh.punchIn!),
          toDate: new Date(wh.punchOut!),
          status: wh.status,
        })) ?? [],
      );
    });
    getUsers().then((res) => {
      if (!res.error) {
        setUserList(
          (res.users?.users as Exclude<
            UserResponseSchemaType["data"],
            null
          >["users"]) || [],
        );
      }
    });
    getSalaries().then((res) => {
      if (res.success && res.data) {
        const map: Record<string, number> = {};
        for (const { userId, salary } of res.data as Array<{ userId: string; salary: number }>) {
          if (salary) map[userId] = salary;
        }
        setHourlyRates(map);
      }
    });
  }, []);

  const handleTogglePaymentStatus = (
    ids: number[],
    nextStatus: WorktimeType["status"],
  ) => {
    setPaymentRecords((prev) =>
      prev.map((rec) =>
        ids.includes(rec.id) ? { ...rec, status: nextStatus } : rec,
      ),
    );
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-5xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Administration
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gérez les projets, les tâches et les paiements.
        </p>
      </header>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <EmployeeCard users={userList} />
      <ProjectTasksCard projects={projects} loadingProjects={loadingProjects} />
      <WorktimeTable users={userList} projects={projects} />

      {/* Payment table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Banknote size={16} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Salaires & Paiements
          </h3>
        </div>
        <div className="overflow-x-auto">
          {paymentRecords.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
              Chargement des données ou aucun paiement trouvé...
            </div>
          ) : (
            <PaymentTable
              data={paymentRecords}
              hourlyRates={hourlyRates}
              onToggleStatus={handleTogglePaymentStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}
