var express                 =   require("express"),
    mongoose                =   require("mongoose"),
    app                     =   express(),
    passport                =   require("passport"),
    LocalStrategy           =   require("passport-local"),
    bodyParser              =   require("body-parser"),
    passportLocalMongoose   =   require("passport-local-mongoose"),
    User                    =   require("./models/user");

mongoose.connect("mongodb://localhost/minitask_algoscale",{ useNewUrlParser: true,useUnifiedTopology: true });
app.set('view engine','ejs');
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
    secret:"MySecretKey",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser  = req.user;
    next();
});

//=========================
//ROUTES
//=========================

//SIGNUP ROUTES

app.get("/register",function(req,res){
    req.logout();
    res.render("register");
});


//handling user sign up
app.post("/register",function(req,res){
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("register");
        } else {
            user.alias=req.body.Alias;
            user.save();
            passport.authenticate("local")(req,res,function(){
                res.redirect("show");
            });
        }
    });
});

//LOGIN ROUTES

//Login form at root
app.get("/",function(req,res){
    req.logout();
    res.redirect("login");
});


//handle user login
app.get("/login",function(req,res){
    req.logout();
    res.render("login");
});

//login logic
app.post("/login",passport.authenticate("local",{
    successRedirect: "/show",
    failureRedirect: "/register"
}),function(req,res){
});

//show User IDs
app.get("/show",isLoggedIn,function(req,res){
    User.find({},function(err,allUsers){
        if(err){
            console.log(err);
        }
        else{
            res.render("show",{Users:allUsers,foundUsers:allUsers,User:User});
        }
    });
});
// User.findOne
//show one userID
app.post("/search",isLoggedIn,function(req,res){
    User.find({username:req.body.searchvalue},function(err,foundUser){
        User.find({},function(err,allUsers){
            res.render("show",{foundUsers:foundUser,Users:allUsers});
        });
    });
});

//delete profile route
app.get("/delete/:user_id",function(req,res){
    User.findByIdAndRemove(req.params.user_id,function(err){
        if(err){
            res.send(err);
        } else {
            res.redirect("/show");
        }
    });
});

//logout route
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/login");
});

//middleware
function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

app.listen(3000,function(req,res){
    console.log("server started");
});