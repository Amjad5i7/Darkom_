const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/user_profile_pic/');
  },
  filename: function (req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now());
    // const fileName = file.originalname.replace(/\s/g, "_");
    //   cb(null, "testImages-" + Date.now() + "-" + fileName);
    if (file.fieldname === "profilePic") {
        const fileName = file.originalname.replace(/\s/g, "_");
      cb(null, "profilePic-" + Date.now() + "-" + fileName);
    }
  }
});

const uploadPic = multer({ storage: storage });

module.exports = uploadPic;