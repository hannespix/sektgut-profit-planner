'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
}

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Grundwein einkaufen',
    description: 'Qualitativ hochwertigen Grundwein beschaffen',
    status: 'todo',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Produktionsanlage einrichten',
    description: 'Vergärungs- und Verarbeitungsanlage aufbauen',
    status: 'todo',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Onlineshop erstellen',
    description: 'Webshop-System einrichten und konfigurieren',
    status: 'in-progress',
    priority: 'high',
  },
  {
    id: '4',
    title: 'Marketing-Strategie entwickeln',
    description: 'Marketing- und Vermarktungsstrategie planen',
    status: 'todo',
    priority: 'medium',
  },
  {
    id: '5',
    title: 'Versektung vorbereiten',
    description: 'Flaschen, Etiketten, Korken beschaffen',
    status: 'todo',
    priority: 'medium',
  },
  {
    id: '6',
    title: 'Rechtliche Grundlagen prüfen',
    description: 'Gewerbeanmeldung, Steuern, Versicherungen',
    status: 'done',
    priority: 'high',
  },
];

const statusLabels = {
  todo: 'Zu erledigen',
  'in-progress': 'In Bearbeitung',
  done: 'Erledigt',
};

const priorityColors = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export default function KanbanBoard() {
  const tasksByStatus = {
    todo: defaultTasks.filter((t) => t.status === 'todo'),
    'in-progress': defaultTasks.filter((t) => t.status === 'in-progress'),
    done: defaultTasks.filter((t) => t.status === 'done'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projekt-Kanban-Board</CardTitle>
        <CardDescription>
          Übersicht über Aufgaben und Projektphasen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['todo', 'in-progress', 'done'] as const).map((status) => (
            <div key={status} className="space-y-2">
              <h3 className="font-semibold text-sm mb-2">{statusLabels[status]}</h3>
              <div className="space-y-2 min-h-[200px]">
                {tasksByStatus[status].map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge
                        className={`${priorityColors[task.priority]} text-xs`}
                      >
                        {task.priority === 'high'
                          ? 'Hoch'
                          : task.priority === 'medium'
                          ? 'Mittel'
                          : 'Niedrig'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                ))}
                {tasksByStatus[status].length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Keine Aufgaben
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
