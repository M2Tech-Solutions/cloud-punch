# Objectif

Créer le frontend complet d'une application de gestion de temps (Punch-In/Punch-Out) nommée "Punch-Master". L'application est destinée à être hébergée sur Cloudflare Pages.

# Stack Technique imposée

- **Frontend :** React (Vite) avec TypeScript.
- **Styling :** Tailwind CSS.
- **Composants UI :** shadcn/ui (préféré) ou Radix UI.
- **Icônes :** Lucide-React.
- **Gestion des dates :** date-fns.
- **ORM (Référence de types) :** Drizzle ORM.
- **Gestion d'état :** React Context ou Zustand.

# Schéma de Données (Référence Drizzle)

Utilise ce schéma pour typer tes interfaces et tes mocks :

```typescript
// schema.ts
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  name: text("name").notNull(),
});

export const timeLogs = pgTable("time_logs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  taskId: integer("task_id").references(() => tasks.id),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  durationMinutes: integer("duration_minutes"),
});
```

Fonctionnalités Frontend à développer
Interface de Punch-In/Out :

Un sélecteur de Projet (Project).

Un sélecteur de Tâche (Task), filtré dynamiquement selon le projet choisi.

Un gros bouton d'action : "Punch In" (quand inactif) et "Punch Out" (quand actif).

Un chronomètre visuel qui s'incrémente en temps réel dès que l'employé est "Punché".

Dashboard Utilisateur :

Sommaire du temps travaillé aujourd'hui.

Sommaire de la semaine en cours (Progress bar ou graphique simple).

Historique des logs :

Une table ou une liste montrant les entrées passées.

Affichage : [Projet] > [Tâche] | [Début] - [Fin] | [Durée totale].

Gestion (Mock Admin) :

Modale ou page simple pour créer un nouveau projet et ajouter des tâches liées.

Contraintes de développement
Mock Data : Le backend n'est pas encore prêt. Crée un fichier src/mocks/data.ts avec des données réalistes pour peupler l'interface au démarrage.

Persistence : Utilise le localStorage pour sauvegarder l'état du chronomètre en cours afin qu'il ne disparaisse pas au rafraîchissement de la page.

Design : Très moderne, épuré, mode sombre (dark mode) par défaut ou supporté. Mobile-first.

Modularité : Sépare bien les composants (Button, Select, Card) de la logique métier (hooks personnalisés comme useTimer).

Instructions de sortie
Génère la structure des dossiers, les composants principaux et le fichier de mock.

---

## 🛠️ Quelques conseils pour ton projet Open-Source

Pour que ton projet soit "pro", je te suggère d'ajouter ces quelques bibliothèques npm lors de l'initialisation :

1.  **`sonner`** : Pour des notifications "toast" élégantes quand on punch-in/out.
2.  **`recharts`** : Si tu veux afficher un petit graphique de tes heures sur la semaine.
3.  **`clsx` & `tailwind-merge`** : Indispensable pour gérer les classes Tailwind proprement (déjà inclus si tu installes shadcn/ui).

### Prochaine étape suggérée

Souhaites-tu que je te génère le fichier **`schema.ts` complet pour Drizzle** avec les relations (One-to-Many) pour que tu puisses l'utiliser directement côté backend quand tu attaqueras la partie D1 ?
