#include <math.h>
#include <stdlib.h>

unsigned long *prv_random_bytes(size_t num_bytes) {
    unsigned long *stream = malloc(num_bytes);

    for (size_t i = 0; i < num_bytes; i++)
    {
        stream[i] = rand();
    }

    return stream;
}

// EFForg/OpenWireless
// ref https://github.com/EFForg/OpenWireless/blob/master/app/js/diceware.js
unsigned long prv_random_number(unsigned long min, unsigned long max) {
    unsigned long rval = 0;
    double range = max - min + 1;
    double log_range = log2((double) range);
    double bits_needed = ceil(log_range);
    if (bits_needed > 53) {
        return -1;
    }

    unsigned long bytes_needed = ceil(bits_needed / 8);
    unsigned long mask = pow(2, (double) bits_needed) - 1;
    // 7776 -> (2^13 = 8192) -1 == 8191 or 0x00001111 11111111

    // Fill a byte array with N random numbers
    unsigned long *byte_array = prv_random_bytes(bytes_needed);

    unsigned long p = (bytes_needed - 1) * 8;
    for (unsigned long i = 0; i < bytes_needed; i++) {
        rval += byte_array[i] * pow(2, (double) p);
        p -= 8;
    }

    // Use & to apply the mask and reduce the number of recursive lookups
    rval = rval & mask;

    if (rval >= range) {
        // Integer out of acceptable range
        return prv_random_number(min, max);
    }

    // Return an integer that falls within the range
    return min + rval;
}