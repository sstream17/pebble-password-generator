const DefaultOptions = {
    length: 14,
    ambiguous: false,
    number: true,
    minNumber: 1,
    uppercase: true,
    minUppercase: 0,
    lowercase: true,
    minLowercase: 0,
    special: false,
    minSpecial: 1,
    type: "password",
    numWords: 3,
    wordSeparator: "-",
    capitalize: false,
    includeNumber: false,
};

export function generatePassword(options) {
    // overload defaults with given options
    const o = Object.assign({}, DefaultOptions, options);

    if (o.type === "passphrase") {
        return generatePassphrase(options);
    }

    // sanitize
    sanitizePasswordLength(o, true);

    const minLength = o.minUppercase + o.minLowercase + o.minNumber + o.minSpecial;
    if (o.length < minLength) {
        o.length = minLength;
    }

    const positions = [];
    if (o.lowercase && o.minLowercase > 0) {
        for (let i = 0; i < o.minLowercase; i++) {
            positions.push("l");
        }
    }
    if (o.uppercase && o.minUppercase > 0) {
        for (let i = 0; i < o.minUppercase; i++) {
            positions.push("u");
        }
    }
    if (o.number && o.minNumber > 0) {
        for (let i = 0; i < o.minNumber; i++) {
            positions.push("n");
        }
    }
    if (o.special && o.minSpecial > 0) {
        for (let i = 0; i < o.minSpecial; i++) {
            positions.push("s");
        }
    }
    while (positions.length < o.length) {
        positions.push("a");
    }

    // shuffle
    shuffleArray(positions);

    // build out the char sets
    let allCharSet = "";

    let lowercaseCharSet = "abcdefghijkmnopqrstuvwxyz";
    if (o.ambiguous) {
        lowercaseCharSet += "l";
    }
    if (o.lowercase) {
        allCharSet += lowercaseCharSet;
    }

    let uppercaseCharSet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    if (o.ambiguous) {
        uppercaseCharSet += "IO";
    }
    if (o.uppercase) {
        allCharSet += uppercaseCharSet;
    }

    let numberCharSet = "23456789";
    if (o.ambiguous) {
        numberCharSet += "01";
    }
    if (o.number) {
        allCharSet += numberCharSet;
    }

    const specialCharSet = "!@#$%^&*";
    if (o.special) {
        allCharSet += specialCharSet;
    }

    let password = "";
    for (let i = 0; i < o.length; i++) {
        let positionChars;
        switch (positions[i]) {
            case "l":
                positionChars = lowercaseCharSet;
                break;
            case "u":
                positionChars = uppercaseCharSet;
                break;
            case "n":
                positionChars = numberCharSet;
                break;
            case "s":
                positionChars = specialCharSet;
                break;
            case "a":
                positionChars = allCharSet;
                break;
            default:
                break;
        }

        const randomCharIndex = randomNumber(0, positionChars.length - 1);
        password += positionChars.charAt(randomCharIndex);
    }

    return password;
}

function generatePassphrase(options) {
    const o = Object.assign({}, DefaultOptions, options);

    if (o.numWords == null || o.numWords <= 2) {
        o.numWords = DefaultOptions.numWords;
    }
    if (o.wordSeparator == null || o.wordSeparator.length === 0 || o.wordSeparator.length > 1) {
        o.wordSeparator = " ";
    }
    if (o.capitalize == null) {
        o.capitalize = false;
    }
    if (o.includeNumber == null) {
        o.includeNumber = false;
    }

    const listLength = EFFLongWordList.length - 1;
    const wordList = new Array(o.numWords);
    for (let i = 0; i < o.numWords; i++) {
        const wordIndex = randomNumber(0, listLength);
        if (o.capitalize) {
            wordList[i] = capitalize(EFFLongWordList[wordIndex]);
        } else {
            wordList[i] = EFFLongWordList[wordIndex];
        }
    }

    if (o.includeNumber) {
        appendRandomNumberToRandomWord(wordList);
    }
    return wordList.join(o.wordSeparator);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function appendRandomNumberToRandomWord() {
    if (wordList == null || wordList.length <= 0) {
        return;
    }
    const index = this.cryptoService.randomNumber(0, wordList.length - 1);
    const num = this.cryptoService.randomNumber(0, 9);
    wordList[index] = wordList[index] + num;
}

function sanitizePasswordLength(options, forGeneration) {
    let minUppercaseCalc = 0;
    let minLowercaseCalc = 0;
    let minNumberCalc = options.minNumber;
    let minSpecialCalc = options.minSpecial;

    if (options.uppercase && options.minUppercase <= 0) {
        minUppercaseCalc = 1;
    } else if (!options.uppercase) {
        minUppercaseCalc = 0;
    }

    if (options.lowercase && options.minLowercase <= 0) {
        minLowercaseCalc = 1;
    } else if (!options.lowercase) {
        minLowercaseCalc = 0;
    }

    if (options.number && options.minNumber <= 0) {
        minNumberCalc = 1;
    } else if (!options.number) {
        minNumberCalc = 0;
    }

    if (options.special && options.minSpecial <= 0) {
        minSpecialCalc = 1;
    } else if (!options.special) {
        minSpecialCalc = 0;
    }

    // This should never happen but is a final safety net
    if (!options.length || options.length < 1) {
        options.length = 10;
    }

    const minLength = minUppercaseCalc + minLowercaseCalc + minNumberCalc + minSpecialCalc;
    // Normalize and Generation both require this modification
    if (options.length < minLength) {
        options.length = minLength;
    }

    // Apply other changes if the options object passed in is for generation
    if (forGeneration) {
        options.minUppercase = minUppercaseCalc;
        options.minLowercase = minLowercaseCalc;
        options.minNumber = minNumberCalc;
        options.minSpecial = minSpecialCalc;
    }
}

// ref: https://stackoverflow.com/a/12646864/1090359
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomNumber(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// EFForg/OpenWireless
// ref https://github.com/EFForg/OpenWireless/blob/master/app/js/diceware.js
function randomNumber(min, max) {
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
    const byteArray = new Uint8Array(randomBytes(bytesNeeded));

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
    self.crypto.getRandomValues(arr);
    return arr.buffer;
}
