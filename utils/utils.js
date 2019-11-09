
function dateFixed2 (num) {
  return ('0' + num).slice(-2)
}

function format (date, formatString = 'YYYY-MM-DD hh:mm:ss') {
  const YYYY = data.getFullYear();
  const MM = dateFixed2(date.getMonth() + 1);
  const DD = dateFixed2(date.getDate());
  const hh = dateFixed2(date.getHours());
  const mm = dateFixed2(date.getMinutes());
  const ss = dateFixed2(date.getSeconds());
  
  return formatString
    .replace('YYYY', YYYY)
    .replace('MM', MM)
    .replace('DD', DD)
    .replace('hh', hh)
    .replace('mm', mm)
    .replace('ss', ss)
}

module.exports = {
  formatTime: function(date) {
    return format(date);
  },
  formatDate: function(date) {
    return format(date, 'YYYY年MM月DD日');
  },
  format,
}
