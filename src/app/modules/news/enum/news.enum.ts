export enum ArticleStatus {
  Draft = 0,
  Published = 1,
  Scheduled = 2,
  Archived = 3,
}

export enum ArticleType {
  Standard = 1,
  Breaking = 2,
  Featured = 3,
  Video = 4,
  Photo = 5,
}

export enum NewsSourceType {
  Publication = 1,
  Agency = 2,
  UserSubmitted = 3,
}

export enum NewsMediaType {
  Image = 1,
  Video = 2,
  Gallery = 3,
  Embed = 4,
}

export enum NewsLocationType {
  City = 1,
  State = 2,
  Country = 3,
  Region = 4,
}

export enum NewsRelationType {
  Related = 1,
  Followup = 2,
  Series = 3,
}
