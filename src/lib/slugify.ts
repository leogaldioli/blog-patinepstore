export function slugify(text: string): string {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Não foi possível criar o slug: título ausente ou inválido");
  }

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}
