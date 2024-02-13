const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage");

async function firebasePostFile(payload, isProfile = false) {
  const dateTime = new Date().toUTCString();

  let fileString = isProfile ? payload?.originalname : payload?.fileName;
  let refString = isProfile ? "profiles/" : "";

  const storage = getStorage();
  const storageRef = ref(storage, `${refString}${fileString}-${dateTime}`);

  const metaData = {
    contentType: isProfile ? payload?.mimeType : payload?.fileType,
  };

  const snapshot = await uploadBytesResumable(storageRef, payload?.file || payload?.buffer, metaData);
  const fileUrl = await getDownloadURL(snapshot.ref);
  console.log(fileUrl);
  return fileUrl;
}

function isEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false; // If object has any own property, it's not empty
    }
  }
  return true; // If loop completes without returning false, object is empty
}

module.exports = { firebasePostFile, isEmpty };
