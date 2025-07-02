const { toZonedTime, format } = require('date-fns-tz');

const selectFormat = data => {
    switch (data) {
        case 'L':
            return 'MM/dd/yyyy';
        case 'MM/DD/YYYY':
            return 'MM/dd/yyyy';
        case 'DD-MM-YYYY':
            return 'dd-MM-yyyy';
        case 'DD/MM/YYYY':
            return 'dd/MM/yyyy';
        case 'LL':
            return 'MMMM dd, yyyy';
        case 'DD MMM, YYYY':
            return 'dd MMM, yyyy';
        case 'YYYY-MM-DD':
            return 'yyyy-MM-dd';
        case 'MM-DD-YYYY':
            return 'MM-dd-yyyy';
        case 'MM.DD.YYYY':
            return 'MM.dd.yyyy';
        case 'MMM DD, YYYY':
            return 'MMM dd, yyyy';
        case 'MMMM DD, YYYY':
            return 'MMMM dd, yyyy';
        case 'DD MMMM, YYYY':
            return 'dd MMMM, yyyy';
        default:
            return 'MM/dd/yyyy';
    }
};

const formatTimeInTimezone = (date, timezone) => {
    const nyDate = timezone && toZonedTime(date, timezone);
    const generatedDate = timezone
      ? format(nyDate, 'EEE, dd MMM yyyy HH:mm:ss zzz', { timeZone: timezone })
      : new Date(date).toUTCString();
    return generatedDate;
  };


function formatDateTime(date, dateFormat, timeZone, is12Hour) {
    const zonedDate = toZonedTime(date, timeZone); // Convert date to the given timezone
    const timeFormat = is12Hour ? 'hh:mm:ss a' : 'HH:mm:ss';
    return dateFormat
        ? format(zonedDate, `${selectFormat(dateFormat)}, ${timeFormat} 'GMT' XXX`, { timeZone })
        : formatTimeInTimezone(date, timeZone);
}

module.exports = {
    formatDateTime
}