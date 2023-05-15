module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
    //   req.flash('error_msg', 'Please log in to view that resource');
    console.log("req.session",req.session)
    res.render('pages/home', { url: 'pageone', title: 'Darkom | Home Page', baseUrl: req.baseUrl,loggedIn:false,session: req.session })
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.render('pages/home', { url: 'pageone', title: 'Darkom | Home Page', baseUrl: req.baseUrl,loggedIn:false })   
    }
  };
  