/**
 * The record info of Server-Sent Events item.
 */
export class ServerSentEventItem {
  private source: Record<string, string>;
  private dataParsedInJson: Record<string, unknown> | undefined;

  /**
   * Initializes a new instance of the ServerSentEventItem class.
   * @param source 
   */
  constructor(source: string) {
    this.source = {};

    // Parse each field.
    (source || "").split("\n").forEach(line => {
      const pos = line.indexOf(":");
      if (pos < 0) return;
      const key = line.substring(0, pos);
      const value = line.substring(pos + 1);
      if (!this.source[key] || (key !== "data" && key !== "")) this.source[key] = value;
      else this.source[key] += value;
    });
  }

  /**
   * Gets the event name.
   */
  get event() {
    return this.source.event || "message";
  }

  /**
   * Gets the data in string.
   */
  get data() {
    return this.source.data;
  }

  /**
   * Gets the event identifier.
   */
  get id() {
    return this.source.id;
  }

  /**
   * Gets the comment.
   */
  get comment() {
    return this.source[""];
  }

  /**
   * Gets the retry in millisecond.
   */
  get retry() {
    return this.source.retry ? parseInt(this.source.retry, 10) : undefined;
  }

  /**
   * Gets the data in JSON.
   * @returns The data object parsed by JSON.
   */
  dataJson<T = Record<string, unknown>>() {
    const data = this.source.data;
    if (!data) return undefined;
    if (!this.dataParsedInJson) this.dataParsedInJson = JSON.parse(data);
    return this.dataParsedInJson as T;
  }

  /**
   * Gets a specific field.
   * @param key The field key.
   * @returns The raw value of the field.
   */
  get(key: string) {
    return this.source[key];
  }
}

/**
 * Handles the response of Server-Sent Events.
 * @param response The response of `fetch`.
 * @param decoder The decoder. Default is to use UTF-8 text decoder.
 * @param callback The callback for each item.
 * @returns The `ServerSentEventItem` array parsed.
 */
export async function handleServerSentEvents(response: Response, decoder: TextDecoder | null, callback: ((item: ServerSentEventItem) => void)) {
  // Response body is required.
  if (!response.body) return Promise.reject("no response body");

  // Get reader to read content partially into buffer.
  // Then parse buffer to `ServerSentEventItem` instances.
  const reader = response.body.getReader();
  let buffer = "";
  const arr: ServerSentEventItem[] = [];
  if (!decoder) decoder = new TextDecoder('utf-8');

  // Read in loop.
  while (true) {
    const { done, value } = await reader.read();
    if (done) { // Ending handler.
      convertSse(buffer, arr, callback);
      return arr;
    }

    // Decode the array buffer and append to buffer.
    buffer += decoder.decode(value, { stream: true });

    // Check the double new line (`\n\n`) seperator.
    const messages = buffer.split("\n\n");
    if (messages.length < 2) continue;

    // Remove the last one becuase it may not complete.
    buffer = messages.pop() || "";

    // Parse each content into `ServerSentEventItem` instances.
    messages.forEach(msg => {
      convertSse(msg, arr, callback);
    });
  }
}

/**
 * Parses and raise callback for each.
 * @param msg The item content in string.
 * @param arr The `ServerSentEventItem` to push.
 * @param callback The callback handler.
 * @returns The instance parsed.
 */
function convertSse(msg: string, arr: ServerSentEventItem[], callback: ((item: ServerSentEventItem) => void)) {
  if (!msg) return;

  // Parse and raise callback for each.
  const sse = new ServerSentEventItem(msg);
  arr.push(sse);
  callback(sse);
  return sse;
}
