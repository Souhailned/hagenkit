// Video-related types for Horecagrond

export type VideoRoomType =
  | "living-room"
  | "kitchen"
  | "bedroom"
  | "bathroom"
  | "toilet"
  | "hallway"
  | "office"
  | "laundry-room"
  | "storage-room"
  | "walk-in-closet"
  | "sauna"
  | "gym"
  | "childrens-room"
  | "pool-area"
  | "dining-room"
  | "tv-room"
  | "library"
  | "hobby-room"
  | "utility-room"
  | "pantry"
  | "conservatory"
  | "garage"
  | "terrace"
  | "garden"
  | "landscape"
  | "exterior"
  | "other";

export type VideoProjectStatus =
  | "pending"
  | "processing"
  | "generating"
  | "compiling"
  | "completed"
  | "failed";

export type VideoClipStatus =
  | "pending"
  | "generating"
  | "completed"
  | "failed";
