const calculateExpDays = dateString => {

    var dateObject = new Date(dateString);

    // Get the timestamp (milliseconds since January 1, 1970, UTC)
    var timestamp = dateObject.getTime();

    // Get the current timestamp in milliseconds
    const now = new Date().getTime();

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = timestamp - now;

    // Convert milliseconds to days
    const daysUntilExpiry = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

    return daysUntilExpiry;
}

module.exports = calculateExpDays