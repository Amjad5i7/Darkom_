const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/service-files/');
  },
  filename: function (req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now());
    // const fileName = file.originalname.replace(/\s/g, "_");
    //   cb(null, "testImages-" + Date.now() + "-" + fileName);
    if (file.fieldname === "planImages") {
        const fileName = file.originalname.replace(/\s/g, "_");
      cb(null, "planImages-" + Date.now() + "-" + fileName);
    }
    if (file.fieldname === "activityImages") {
        const fileName = file.originalname.replace(/\s/g, "_");
      cb(null, "activityImages-" + Date.now() + "-" + fileName);
    }
  }
});

const upload = multer({ storage: storage });

module.exports = upload;