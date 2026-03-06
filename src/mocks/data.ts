// src/mocks/data.ts
export const mockEmployees = [
  { id: 1, fullName: "Alice Dupont", email: "alice@example.com" },
  { id: 2, fullName: "Bob Martin", email: "bob@example.com" },
];

export const mockProjects = [
  {
    id: 1,
    name: "Refonte Site Web",
    description: "Refonte graphique du site de la compagnie",
  },
  {
    id: 2,
    name: "Application Mobile",
    description: "Création d'une app React Native",
  },
];

export const mockTasks = [
  { id: 1, projectId: 1, name: "Design des maquettes" },
  { id: 2, projectId: 1, name: "Intégration HTML/CSS" },
  { id: 3, projectId: 2, name: "Mise en place de l'API" },
  { id: 4, projectId: 2, name: "Développement des écrans" },
];

export const mockTimeLogs = [
  {
    id: 1,
    employeeId: 1,
    taskId: 1,
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date().toISOString(),
    durationMinutes: 60,
  },
];
