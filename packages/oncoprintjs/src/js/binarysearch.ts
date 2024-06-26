export default function binarysearch<T>(
    array: T[],
    target_key: number,
    keyFn: (t: T) => number,
    return_closest_lower_if_not_found?: boolean
) {
    if (!array.length) {
        return -1; // return -1 for an empty array
    }
    var upper_excl = array.length;
    var lower_incl = 0;
    var middle;
    while (lower_incl < upper_excl) {
        middle = Math.floor((upper_excl + lower_incl) / 2);
        var middle_key = keyFn(array[middle]);
        if (middle_key === target_key) {
            return middle;
        } else if (target_key > middle_key) {
            lower_incl = middle + 1;
        } else if (target_key < middle_key) {
            upper_excl = middle;
        } else {
            // make sure we don't infinite loop in case anything's wrong
            //	so that those three cases don't cover everything
            return -1;
        }
    }
    if (return_closest_lower_if_not_found) {
        return Math.max(0, lower_incl - 1);
    } else {
        return -1;
    }
}
