// Style templates for AI image generation
export const STYLE_TEMPLATES = {
  modern: {
    id: "modern",
    name: "Modern Design",
    description: "Clean, contemporary styling with minimalist elements",
    basePrompt:
      "Transform this interior into a modern, contemporary design with clean lines, minimalist furniture, neutral color palette with accent colors, natural light emphasis, and high-end finishes.",
  },
  scandinavian: {
    id: "scandinavian",
    name: "Scandinavian",
    description: "Light, airy Nordic design with natural materials",
    basePrompt:
      "Transform this interior into a Scandinavian design with light wood tones, white walls, cozy textiles, functional furniture, hygge atmosphere, and natural lighting.",
  },
  industrial: {
    id: "industrial",
    name: "Industrial",
    description: "Raw, urban aesthetic with exposed elements",
    basePrompt:
      "Transform this interior into an industrial design with exposed brick, metal accents, raw concrete, vintage lighting, leather furniture, and urban warehouse aesthetic.",
  },
  minimalist: {
    id: "minimalist",
    name: "Minimalist",
    description: "Simple, uncluttered spaces with essential elements only",
    basePrompt:
      "Transform this interior into a minimalist design with clean surfaces, monochromatic palette, essential furniture only, hidden storage, and zen-like tranquility.",
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    description: "High-end, sophisticated design with premium materials",
    basePrompt:
      "Transform this interior into a luxury design with premium materials, marble surfaces, gold accents, designer furniture, crystal chandeliers, and sophisticated elegance.",
  },
  bohemian: {
    id: "bohemian",
    name: "Bohemian",
    description: "Eclectic, free-spirited design with global influences",
    basePrompt:
      "Transform this interior into a bohemian design with layered textiles, global patterns, plants, warm colors, vintage furniture, and artistic, collected aesthetic.",
  },
  coastal: {
    id: "coastal",
    name: "Coastal",
    description: "Beach-inspired design with light, breezy atmosphere",
    basePrompt:
      "Transform this interior into a coastal design with ocean-inspired colors, light fabrics, natural textures, weathered wood, nautical accents, and relaxed beach vibes.",
  },
  traditional: {
    id: "traditional",
    name: "Traditional",
    description: "Classic, timeless design with elegant details",
    basePrompt:
      "Transform this interior into a traditional design with classic furniture, rich wood tones, elegant fabrics, ornate details, symmetrical arrangements, and timeless sophistication.",
  },
} as const;

// Room types with specific prompts
export const ROOM_TYPES = {
  "living-room": {
    id: "living-room",
    name: "Living Room",
    contextPrompt:
      "This is a living room space. Focus on comfortable seating arrangement, entertainment area, and social gathering functionality.",
  },
  bedroom: {
    id: "bedroom",
    name: "Bedroom",
    contextPrompt:
      "This is a bedroom space. Focus on restful atmosphere, comfortable bedding, proper lighting, and calming ambiance.",
  },
  kitchen: {
    id: "kitchen",
    name: "Kitchen",
    contextPrompt:
      "This is a kitchen space. Focus on functional cooking areas, modern appliances, storage solutions, and dining integration.",
  },
  bathroom: {
    id: "bathroom",
    name: "Bathroom",
    contextPrompt:
      "This is a bathroom space. Focus on clean fixtures, proper lighting, spa-like elements, and functional storage.",
  },
  "dining-room": {
    id: "dining-room",
    name: "Dining Room",
    contextPrompt:
      "This is a dining room space. Focus on dining table arrangement, proper lighting, and elegant dining atmosphere.",
  },
  office: {
    id: "office",
    name: "Home Office",
    contextPrompt:
      "This is a home office space. Focus on productive workspace, ergonomic furniture, good lighting, and organization.",
  },
  exterior: {
    id: "exterior",
    name: "Exterior",
    contextPrompt:
      "This is an exterior space. Focus on curb appeal, landscaping, architectural details, and outdoor living areas.",
  },
  garden: {
    id: "garden",
    name: "Garden/Patio",
    contextPrompt:
      "This is a garden or patio space. Focus on outdoor furniture, plants, lighting, and relaxation areas.",
  },
} as const;

export type StyleTemplateId = keyof typeof STYLE_TEMPLATES;
export type RoomTypeId = keyof typeof ROOM_TYPES;

// Generate AI prompt for image processing
export function generatePrompt(
  styleTemplateId: StyleTemplateId,
  roomTypeId?: RoomTypeId
): string {
  const template = STYLE_TEMPLATES[styleTemplateId] || STYLE_TEMPLATES.modern;
  const roomType = roomTypeId ? ROOM_TYPES[roomTypeId] : null;

  let prompt: string = template.basePrompt;

  if (roomType) {
    prompt = `${roomType.contextPrompt} ${prompt}`;
  }

  // Add quality instructions
  prompt +=
    " Maintain photorealistic quality, proper perspective, and natural lighting. Keep the same room layout and dimensions.";

  return prompt;
}

// Get all available style templates
export function getStyleTemplates() {
  return Object.values(STYLE_TEMPLATES);
}

// Get all available room types
export function getRoomTypes() {
  return Object.values(ROOM_TYPES);
}
