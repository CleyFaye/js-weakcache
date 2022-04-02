/** Compute the size required to store a value.
 *
 * This is only an estimate, and expect data to be JSON-serializable
 *
 * @param {any} data
 *
 * @return {number}
 * Number of bytes required to store data
 */
export const getDataSize = data => Buffer.from(JSON.stringify(data)).length;
