const firebase = require("../firebase");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const storage = getStorage();
global.XMLHttpRequest = require("xhr2");
const addImage = async (avatar) => {
  try {
    console.log("avatar", avatar);
    // Grab the file
    const file = avatar;
    // Format the filename
    const timestamp = Date.now();
    // console.log(avatar.split('.'))
    const name = file.originalname.split(".")[0];
    const type = file.originalname.split(".")[1];
    const fileName = `${name}_${timestamp}.${type}`;
    console.log(fileName);


   const storageRef = ref(storage, `files/${fileName}`);
    const metadata = {
      contentType: file.mimetype,
    };
    const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("downloadURL", downloadURL);
    return downloadURL;
   
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ error });
  }
};
module.exports = addImage;
