export class CreateChecklistItemDto {
  title: string;
  position?: number;
  isCompleted: boolean;
  cardId: string;
}
