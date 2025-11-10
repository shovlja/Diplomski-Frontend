// Centralni tipovi za board, bez "any"

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type CardChecklist = {
  id: string;
  title: string;
  items: ChecklistItem[];
};

// Ako već imaš LabelItem iz drugog mesta, ovaj je kompatibilan
export type LabelItem = {
  id: number;
  name: string;
  color: string;
  checked?: boolean;
};

export type Card = {
  id: number;
  title: string;
  position: number;
  description?: string;
  labels?: LabelItem[];
  dueDate?: string | null;
  checklist?: CardChecklist;
};

export type List = {
  id: number;
  title: string;
  position: number;
  cards: Card[];
};

export type BoardState = {
  id: number;
  title: string;
  lists: List[];
};
