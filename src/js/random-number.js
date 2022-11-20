// EFForg/OpenWireless
// ref https://github.com/EFForg/OpenWireless/blob/master/app/js/diceware.js
export async function randomNumber(min, max) {
  let rval = 0;
  const range = max - min + 1;
  const bitsNeeded = Math.ceil(Math.log2(range));
  if (bitsNeeded > 53) {
    throw new Error("We cannot generate numbers larger than 53 bits.");
  }

  const bytesNeeded = Math.ceil(bitsNeeded / 8);
  const mask = Math.pow(2, bitsNeeded) - 1;
  // 7776 -> (2^13 = 8192) -1 == 8191 or 0x00001111 11111111

  // Fill a byte array with N random numbers
  const byteArray = new Uint8Array(await randomBytes(bytesNeeded));

  let p = (bytesNeeded - 1) * 8;
  for (let i = 0; i < bytesNeeded; i++) {
    rval += byteArray[i] * Math.pow(2, p);
    p -= 8;
  }

  // Use & to apply the mask and reduce the number of recursive lookups
  rval = rval & mask;

  if (rval >= range) {
    // Integer out of acceptable range
    return randomNumber(min, max);
  }

  // Return an integer that falls within the range
  return min + rval;
}

function randomBytes(length) {
    const arr = new Uint8Array(length);
    new Crypto().getRandomValues(arr);
    return Promise.resolve(arr.buffer);
  }