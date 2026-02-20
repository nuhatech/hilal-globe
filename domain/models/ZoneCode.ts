export enum ZoneCode {
  /** Easily visible to the naked eye */
  A = 'A',
  /** Visible under perfect conditions */
  B = 'B',
  /** Optical aid needed to locate, then naked eye */
  C = 'C',
  /** Optical aid only */
  D = 'D',
  /** Crescent exists (conjunction before sunset) but not visible */
  E = 'E',
  /** Not visible — crescent does not exist (conjunction after sunset or no sunset) */
  NOT_VISIBLE = 'NOT_VISIBLE',
}
