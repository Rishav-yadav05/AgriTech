// Rule-based soil health analysis. Thresholds are typical agronomy guidelines; adjust per crop/region.
module.exports = (s = {}) => {
  const advice = []; let score = 100;
  const check = (v, lo, hi, label, low, high) => {
    if (v == null) return;
    if (v < lo) { score -= 15; advice.push(`${label} is low: ${low}`); }
    else if (v > hi) { score -= 10; advice.push(`${label} is high: ${high}`); }
  };
  check(s.ph, 6, 7.5, 'pH', 'apply agricultural lime or organic compost', 'apply gypsum or sulphur and add organic matter');
  check(s.n, 280, 560, 'Nitrogen (kg/ha)', 'apply urea or green manure', 'skip nitrogen top-dressing this cycle');
  check(s.p, 10, 25, 'Phosphorus (kg/ha)', 'apply DAP or single super phosphate', 'avoid phosphate fertiliser');
  check(s.k, 110, 280, 'Potassium (kg/ha)', 'apply muriate of potash', 'avoid potash fertiliser');
  check(s.organicMatter, 0.5, 5, 'Organic carbon (%)', 'add farmyard manure or compost', 'reduce organic inputs');
  check(s.moisture, 20, 60, 'Soil moisture (%)', 'irrigate soon', 'improve drainage and pause irrigation');
  score = Math.max(0, score);
  return { score, rating: score >= 80 ? 'Good' : score >= 55 ? 'Fair' : 'Poor', advice: advice.length ? advice : ['Soil values look balanced. Keep monitoring each season.'] };
};
