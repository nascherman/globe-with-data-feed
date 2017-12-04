export default class MathHelper {
  isBetween(a, b, value) {
    const min = Math.min.apply(Math, [a, b]);
    const max = Math.max.apply(Math, [a, b]);
    return value > min && value < max;
  }

  isVector3Equal(vec1, vec2, threshold) {
    return this.isBetween(vec2.x - threshold, vec2.x + threshold, vec1.x) &&
      this.isBetween(vec2.y - threshold, vec2.y + threshold, vec1.y) &&
      this.isBetween(vec2.z - threshold, vec2.z + threshold, vec1.z);
    // return vec1.x === vec2.x && vec1.y === vec2.y && vec1.z === vec2.z;
  }
}
