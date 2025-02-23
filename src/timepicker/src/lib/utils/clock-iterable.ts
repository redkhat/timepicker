
/**
 * A class that implements the `Iterable` interface to generate coordinates for clock labels.
 * 
 * @template T - The type of the labels.
 */
export class ClockIterable<T> implements Iterable<[T, number, number]> {
  /**
   * The labels to be positioned around the clock.
   */
  private labels: T[];

  /**
   * The radius of the clock.
   */
  private radio: number;

  /**
   * The size of each label.
   */
  private labelSize: number;

  /**
   * The inset distance from the edge of the clock.
   */
  private inset: number;

  /**
   * The degrees between each label.
   */
  private readonly degreesByNumber = 30;

  /**
   * Creates an instance of ClockIterable.
   * 
   * @param labels - An array of labels to be positioned around the clock [12, 1, 2, 3...].
   * @param labelSize - The size of each label.
   * @param diameter - The diameter of the clock.
   * @param inset - The inset distance from the edge of the clock (default is 0).
   */
  constructor(labels: T[], labelSize: number, diameter: number, inset: number = 0) {
    this.labels = labels;
    this.labelSize = labelSize / 2;
    this.radio = (diameter / 2) - inset;
    this.inset = inset;
  }

  /**
   * Returns an iterator that yields the label and its x, y coordinates.
   * 
   * @returns An iterator that yields a tuple containing the label and its x, y coordinates.
   */
  *[Symbol.iterator](): Iterator<[T, number, number]> {
    for (let i = 0; i < this.labels.length; i++) {
      const x = this.radio + (this.radio - this.labelSize) * Math.sin(i * this.degreesByNumber * Math.PI / 180);
      const y = this.radio - (this.radio - this.labelSize) * Math.cos(i * this.degreesByNumber * Math.PI / 180);
      yield [this.labels[i], this.inset + x - this.labelSize, this.inset + y - this.labelSize];
    }
  }
}
