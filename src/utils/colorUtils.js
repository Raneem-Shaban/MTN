// تحويل HEX إلى RGB
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

// تحويل RGB إلى HEX
const rgbToHex = (r, g, b) => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

// interpolation بين لونين حسب النسبة t (0 → الأول، 1 → الثاني)
const interpolateColor = (color1, color2, t) => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);

  return rgbToHex(r, g, b);
};

// دالة تحدد اللون حسب الوزن
export const getColorByWeight = (weight) => {
  const danger = '#EC1E28';     // 0
  const secondary = '#006790';  // 50
  const primary = '#FECD04';    // 100

  if (weight <= 0) return danger;
  if (weight >= 100) return primary;
  if (weight === 50) return secondary;

  if (weight < 50) {
    // بين 0 و 50 → بين danger و secondary
    const t = weight / 50;
    return interpolateColor(danger, secondary, t);
  } else {
    // بين 50 و 100 → بين secondary و primary
    const t = (weight - 50) / 50;
    return interpolateColor(secondary, primary, t);
  }
};
