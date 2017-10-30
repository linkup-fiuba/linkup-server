'use strict';

function FirebaseDBGateway(db) {
  this.db = db;
  this.getMessagesBetween = getMessagesBetween;
}

function createFirebaseDBGateway(db) {
  return new FirebaseDBGateway(db)
}


function getChatId(userId1, userId2) {
  if (userId1 < userId2) {
    return userId1 + '_' + userId2;
  }
  return userId2 + '_' + userId1;
};

function getMessagesBetween(userId1, userId2) {
  const chatId = getChatId(userId1, userId2);
  var ref = this.db.ref("/chats/" + chatId + "/messages");

  ref.once("value", function(snap) {
    console.log("initial data loaded!", snap.numChildren());

    console.log(snap.val());
  });
}



module.exports = {
  createFirebaseDBGateway: createFirebaseDBGateway
};