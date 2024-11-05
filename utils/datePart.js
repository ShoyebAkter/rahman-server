module.exports = dateString => {
    var datePart = dateString.split("T")[0];
    return datePart;
}