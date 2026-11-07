const {
  scrypt,
  scryptSync,
  randomFill,
  createCipheriv,
  createDecipheriv,
} = require("crypto");
const { Buffer } = require("buffer");
const { ENCRYPT_KEY } = process.env;
const ALG = "aes-192-cbc";

module.exports = {
  encryptData: (data) => {
    return new Promise((resolve, reject) => {
      // First, we'll generate the key. The key length is dependent on the algorithm.
      // In this case for aes192, it is 24 bytes (192 bits).
      scrypt(ENCRYPT_KEY, "salt", 24, (err, key) => {
        if (err) {
          reject(err);
          return;
        }
        // Then, we'll generate a random initialization vector
        randomFill(new Uint8Array(16), (err, iv) => {
          if (err) {
            reject(err);
            return;
          }

          const cipher = createCipheriv(ALG, key, iv);

          let encrypted = cipher.update(data, "utf8", "base64");
          encrypted += cipher.final("base64");

          resolve(encrypted);
        });
      });
    });
  },
  decryptData: (encryptedData) => {
    const key = scryptSync(ENCRYPT_KEY, "salt", 24);
    // The IV is usually passed along with the ciphertext.
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const decipher = createDecipheriv(ALG, key, iv);

    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");
    console.log(decrypted);
    return decrypted;
  },
};
