export interface CardModel {
  id: string | null;
  title: string;
  description: string;
  dueDate: Date;
  labels: any[] | null;
  members: any[] | null;
  checklistItems: any[] | null;
  comments: any[] | null;
  attachments: any[] | null;
}
