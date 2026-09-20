// ==========================================================
// Event module enums — matches the backend C# enums exactly.
// ==========================================================

export enum EventType {
  InPerson = 1,
  Online = 2,
  Hybrid = 3,
}

export enum EventStatus {
  Draft = 1,
  Published = 2,
  Cancelled = 3,
  Completed = 4,
}

export enum EventMediaType {
  Image = 1,
  Video = 2,
}
