/**
 * Defines tokens for marble diagram DSL to represent Observables.
 *
 */
export enum ObservableMarbleToken {
  /**
   * The passage of time without any events
   */
  TIMEFRAME = '-',
  /**
   * Error
   */
  ERROR = '#',
  /**
   * Whitespace does nothing, for aligning between marbles
   *
   */
  NOOP = ' ',
  /**
   * Indicates start emitting simultaneouly.
   * Values between SIMULTANEOUS_START and SIMULTANEOUS_END considered to be
   * emitted simultaneously.
   *
   */
  SIMULTANEOUS_START = '(',
  /**
   * Indicates end emitting simultaneouly.
   * Values between SIMULTANEOUS_START and SIMULTANEOUS_END considered to be
   * emitted simultaneously.
   */
  SIMULTANEOUS_END = ')',
  /**
   * Indicates time passed multiple times of TIMEFRAME.
   * This token is single token, actual usage should be like
   * `...${n}...` , represents timeframe of `-` * n times.
   *
   */
  TIMEFRAME_EXPAND = '.',
  /**
   * Completion of the stream
   */
  COMPLETE = '|'
}
