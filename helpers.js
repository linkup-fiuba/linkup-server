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


module.exports = {
	compareByDistanceASC: compareByDistanceASC,
	compareByDistanceDESC: compareByDistanceDESC,
	compareByDateASC: compareByDateASC,
	compareByDateDESC: compareByDateDESC

}