'use strict';


function compareByDistanceASC(a,b) {
  if (a.distance < b.distance)
    return -1;
  if (a.distance > b.distance)
    return 1;
  return 0;
}

function compareByDistanceDESC(a,b) {
  if (a.distance > b.distance)
    return -1;
  if (a.distance < b.distance)
    return 1;
  return 0;
}

function compareByDateASC(a,b) {
  if (a.date < b.date)
    return -1;
  if (a.date > b.date)
    return 1;
  return 0;
}

function compareBy(a,b, field) {
  if (a.field < b.field)
    return -1;
  if (a.field > b.field)
    return 1;
  return 0;
}

function compareByDateDESC(a,b) {
  if (a.date > b.date)
    return -1;
  if (a.date < b.date)
    return 1;
  return 0;
}

function formatDate(date) {
    var d = new Date(parseInt(date)),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function compareASC(a,b) {
	  if (a < b)
	    return -1;
	  if (a > b)
	    return 1;
	  return 0;
}



module.exports = {
	compareByDistanceASC: compareByDistanceASC,
	compareByDistanceDESC: compareByDistanceDESC,
	compareByDateASC: compareByDateASC,
	compareByDateDESC: compareByDateDESC,
	compareBy: compareBy,
	formatDate: formatDate,
	compareASC: compareASC

}