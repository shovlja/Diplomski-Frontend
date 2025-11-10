// Zajednički tipovi za board/karte/listove

export type LabelItem = {
    id: number;
    name: string;
    color: string;
    checked?: boolean;
  };
  
  export type ChecklistItem = {
    id: string;
    text: string;
    done: boolean;
  };
  
  export type Checklist = {
    id: string;
    title: string;
    items: ChecklistItem[];
  };
  
  export type Member = {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  
  export type Card = {
    id: number;
    title: string;
    position: number;
    description?: string;
    labels?: LabelItem[];
    dueDate?: string | null;
    dueComplete?: boolean;
    attachmentsCount?: number;
    members?: Member[];
    checklist?: Checklist;
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
  