const moment = require('moment-timezone');
function createdAtTimeStamp() {
    const fechaHoraActual = moment().tz('America/Lima').format('YYYY-MM-DD HH:mm:ss');
    return fechaHoraActual;
}
module.exports = { createdAtTimeStamp }
