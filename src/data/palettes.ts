export const CURATED_PALETTES: string[][] = [
  // MagicPattern Essentials
  ["#090238", "#6903F9", "#FF15E5", "#DCC5FF"],
  ["#276678", "#1687A7", "#D3E0EA", "#F6F5F5"],
  ["#021B1A", "#0C6972", "#1DD3B0", "#AFFC41"],
  ["#2B0A3D", "#7B2D8E", "#FF5E78", "#FFC15E"],
  ["#05010D", "#0B1E4A", "#3A2EAD", "#6C5CE7"],
  ["#F875AA", "#FBACCC", "#F1D1D0", "#F4F9F9"],
  ["#012A4A", "#2C7DA0", "#61A5C2", "#A9D6E5"],
  ["#0B0000", "#3D0C02", "#C1121F", "#FB8B24"],
  ["#474744", "#2994B2", "#FFFBE0", "#FFB400"],
  ["#790C5A", "#CC0E74", "#E6739F", "#F1D4D4"],
  ["#EDEEF7", "#7868E6", "#B8B5FF", "#E4FBFF"],
  ["#494949", "#FFFDF6", "#ECE8D9", "#FAF6E9"],
  ["#FF7E67", "#FAFAFA", "#A2D5F2", "#07689F"],
  ["#53354A", "#903749", "#E84545", "#2B2E4A"],
  ["#EEEEEE", "#00ADB5", "#393E46", "#222831"],

  // Vibrant Neon & Cyber
  ["#FF007F", "#7928CA", "#4338CA", "#00F2FE"],
  ["#FF0055", "#7209B7", "#3F37C9", "#4CC9F0"],
  ["#08F7FE", "#09FBD3", "#FE53BB", "#F5D300"],
  ["#FF0844", "#FFB199", "#E0C3FC", "#8EC5FC"],
  ["#00F5D4", "#7B2CBF", "#5A189A", "#240046"],
  ["#F72585", "#7209B7", "#3A0CA3", "#4361EE", "#4CC9F0"],
  ["#10002B", "#240046", "#3C096C", "#5A189A", "#7B2CBF", "#E0AAFF"],

  // Warm Sunset & Desert
  ["#FF4E50", "#F9D423", "#EDE574", "#E1F5C4"],
  ["#2E1A47", "#5B2A86", "#8F3985", "#C85A80", "#F28E79", "#FFC38B"],
  ["#F83600", "#F9D423", "#FFA07A", "#20B2AA"],
  ["#642B73", "#C6426E", "#F37335", "#FDC830"],
  ["#451952", "#662549", "#AE445A", "#F39F5A", "#E8BCB9"],

  // Deep Ocean & Aurora
  ["#03071E", "#370617", "#6A040F", "#9D0208", "#D00000", "#DC2F02"],
  ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#6FFFE9"],
  ["#0077B6", "#0096C7", "#00B4D8", "#48CAE4", "#90E0EF", "#ADE8F4"],
  ["#1A1423", "#372549", "#774C60", "#B75D69", "#EACDC2"],
  ["#001219", "#005F73", "#0A9396", "#94D2BD", "#E9D8A6", "#EE9B00"],

  // Pastel & Editorial
  ["#E0BBE4", "#957DAD", "#D291BC", "#FEC8D8", "#FFDFD3"],
  ["#D8E2DC", "#FFE5D9", "#FFCAD4", "#F4ACB7", "#9D8189"],
  ["#F3C68F", "#EE964B", "#F95738", "#F4D06F", "#392F5A"],
  ["#EAE4E9", "#FFF1E6", "#FDE2E4", "#FAD2E1", "#E2ECE9", "#BEE1E6"],
  ["#CDF0EA", "#F7DBF0", "#BEAEE2", "#F9F9F9"],

  // Silk, Satin & Monochromatic Luxury
  ["#0F2027", "#203A43", "#2C5364"],
  ["#141E30", "#243B55", "#4B6CB7", "#182848"],
  ["#111111", "#333333", "#777777", "#CCCCCC", "#FFFFFF"],
  ["#1E130C", "#9A8478", "#C8B6A6", "#F1DEC9"],
  ["#2B2E4A", "#E84545", "#903749", "#53354A"]
];

export function getRandomPalette(): string[] {
  const index = Math.floor(Math.random() * CURATED_PALETTES.length);
  return [...CURATED_PALETTES[index]];
}
