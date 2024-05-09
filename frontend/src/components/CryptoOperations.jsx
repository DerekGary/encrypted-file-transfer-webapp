// Authors: Derek Gary, Takaiya Jones

// Import necessary functions from the libsodium-wrappers library
import {
    ready as sodiumReady,
    from_string,
    from_hex,
    to_hex,
    to_string,
    crypto_aead_xchacha20poly1305_ietf_decrypt,
} from '../../node_modules/libsodium-wrappers';


// Calculate the factorial of a given number
// This function is used in the permutation calculation for generating IVs
export const factorial = (n) => {
    let result = BigInt(1);
    for (let i = 1n; i <= n; i++) {
        result *= i;
    }
    return result;
};

// Handle the decryption of a DB Object
export const handleDecryption = async (subId, encryptedFileName, encryptedFileData, key) => {
  // Wait for the libsodium library to be ready
  await sodiumReady;
  try {
    // Generate unique IVs for the file name and file data based on the subId
    const fileNameIV = generateIV(subId, 0);
    const fileDataIV = generateIV(subId, 1);

    // Convert the encrypted file name from hex to binary
    const encryptedFileNameBinary = from_hex(encryptedFileName);
    // Convert the encryption key from hex to binary
    key = from_hex(key);

    // Decrypt the file name using XChaCha20-Poly1305 encryption
    const decryptedFileName = crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      encryptedFileNameBinary,
      null,
      fileNameIV,
      key
    );

    // If decryption fails, return null
    if (!decryptedFileName) {
      console.error("Failed to decrypt file name");
      return null;
    }

    // Convert the decrypted file name from binary to string
    const fileName = new TextDecoder().decode(new Uint8Array(decryptedFileName));

    // If there is no encrypted file data, return the decrypted file name and null file data
    if (!encryptedFileData) {
      return {
        fileName: fileName,
        fileData: null,
      };
    }

    // Convert the encrypted file data to binary
    const encryptedFileDataBinary = new Uint8Array(await encryptedFileData.arrayBuffer());
    // Decrypt the file data using XChaCha20-Poly1305 encryption
    const decryptedFileData = crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      encryptedFileDataBinary,
      null,
      fileDataIV,
      key
    );

    // If decryption fails, return null
    if (!decryptedFileData) {
      console.error("Failed to decrypt file data");
      return null;
    }

    // Return the decrypted file name and file data
    return {
      fileName: fileName,
      fileData: new Uint8Array(decryptedFileData),
    };
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

  // Generate a permutation based on the subID, index, and total number of IVs.
  // The totalIVs parameter defaults to 2500, which is used to ensure distinctness between adjacent indexes.
  // To prevent overflowing the 64-bit integers, the permutation is limited to a 20-character string.
  // This means that for each increment in the index, the permutation will jump by a factor of 2500, providing
  // a significant difference between consecutive indexes.
  const getPermutation = (subID, index, totalIVs = 2500) => {
    const size = 20;
    const numberOfDigits = 4;
    // Create a unique key based on the subID and size
    const uniqueKey = createUniqueKey(subID, size);
    // Calculate factorials for the permutation calculation
    const factorials = Array.from({ length: size + 1 }, (_, i) => factorial(BigInt(i)));

    // Calculate the permutation index based on the index and total number of IVs
    let permutationIndex = BigInt(index) * (factorials[size] / BigInt(totalIVs));
    let temp = uniqueKey.split('');
    let result = '';

    // Generate the permutation by iteratively selecting characters from the unique key
    for (let i = size; i > 0; i--) {
      const selected = Number(permutationIndex / factorials[i - 1]);
      result += temp[selected];
      permutationIndex %= factorials[i - 1];
      temp.splice(selected, 1);
    }

    // Append the index as a padded string to the permutation
    const indexString = index.toString().padStart(numberOfDigits, '0');
    return result + indexString;
  };
  
// Create a unique key based on the subID and size
export const createUniqueKey = (subID, size) => {
    let uniqueKey = '';
    let seen = new Set();

    // Iterate over each character in the subID and add unique characters to the key
    for (let char of subID) {
        if (!seen.has(char) && uniqueKey.length < size) {
            seen.add(char);
            uniqueKey += char;
        }
    }

    return uniqueKey;
};

// Generate an IV based on the subID and index
export const generateIV = (subID, index) => {
    // Get the permuted string based on the subID and index
    const permutedString = getPermutation(subID, index);
    // Convert the permuted string to binary and return it as the IV
    return from_string(permutedString);
};