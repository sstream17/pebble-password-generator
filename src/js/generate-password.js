import { randomNumber } from "./random-number";

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

export async function generatePassword(options) {
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
    await shuffleArray(positions);

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

        const randomCharIndex = await randomNumber(0, positionChars.length - 1);
        password += positionChars.charAt(randomCharIndex);
    }

    return password;
}

async function generatePassphrase(options) {
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
        const wordIndex = await randomNumber(0, listLength);
        if (o.capitalize) {
            wordList[i] = capitalize(EFFLongWordList[wordIndex]);
        } else {
            wordList[i] = EFFLongWordList[wordIndex];
        }
    }

    if (o.includeNumber) {
        await appendRandomNumberToRandomWord(wordList);
    }
    return wordList.join(o.wordSeparator);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function appendRandomNumberToRandomWord() {
    if (wordList == null || wordList.length <= 0) {
        return;
    }
    const index = await this.cryptoService.randomNumber(0, wordList.length - 1);
    const num = await this.cryptoService.randomNumber(0, 9);
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
async function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = await randomNumber(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
}
