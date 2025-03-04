export interface BoardModel {
  id?: string;
  name: string;
  ownerId?: string;
  backgroundId?: string;
  background:
    | {
        color?: string | null;
        fileName?: string | null;
        fileLocation?: string | null;
      }
    | File
    | null;
  createdAt?: Date | null;
}
