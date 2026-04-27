export function buildOpenStreetMapEmbed(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) {
    return null;
  }

  const offset = 0.005;
  const bbox = [
    longitude - offset,
    latitude - offset,
    longitude + offset,
    latitude + offset
  ].join("%2C");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}
