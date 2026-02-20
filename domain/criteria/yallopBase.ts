/**
 * Yallop base polynomial for the q-value criterion.
 * This polynomial appears in the original Yallop (1997) method and is
 * reused by Odeh (2006) and Shaukat criteria.
 *
 * qBase = 11.8371 - 6.3226*W + 0.7319*W^2 - 0.1018*W^3
 *
 * @param W Crescent width in arcminutes
 */
export function computeYallopQBase(W: number): number {
  return 11.8371 - 6.3226 * W + 0.7319 * W * W - 0.1018 * W * W * W
}
