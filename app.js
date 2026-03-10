require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const multer = require("multer");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

const Project = require("./model/project");
const Contact = require("./model/form");


const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinary");

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "projects", // folder in Cloudinary
        allowed_formats: ["jpg", "jpeg", "png"]
    }
});




// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });



// ================= DATABASE =================

// mongoose.connect("mongodb://127.0.0.1:27017/pashaEngineering")
// .then(() => console.log("MongoDB Connected"))
// .catch(err => console.log(err));




mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB Connected"))
.catch(err=>console.log(err))


// ================= MIDDLEWARE =================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
    secret: "pashaengineeringsecret",
    resave: false,
    saveUninitialized: true
}));


// ================= MULTER =================

// const storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null, "public/uploads");
//     },
//     filename: function(req, file, cb){
//         cb(null, Date.now() + "-" + file.originalname);
//     }
// });

const upload = multer({ storage });


// ================= ROUTES =================


// Home
app.get("/", (req, res) => {
    res.render("home");
});


// About
app.get("/about", (req, res) => {
    res.render("about");
});


// Services
app.get("/services", (req, res) => {
    res.render("service");
});


app.post("/send-message", async (req, res)=>{

    try{

    const {name, email, phone, message} = req.body;

    const newMessage = new Contact({    
    name,
    email,
    phone,
    message
    });

    await newMessage.save();

    res.redirect("contact");

    }catch(err){

    console.log(err);
    res.send("Something went wrong");

    }

});


app.get("/admin/message", async(req, res)=>{
    if(!req.session.admin){
        return res.redirect("/admin");
    }

    const message = await Contact.find().sort({createdAt:-1});
    res.render("admin/message", {message});

});






// Projects Page
app.get("/projects", async (req, res) => {
  try {

    const projects = await Project.find();

    console.log("PROJECT DATA:", projects);
    console.log("TYPE:", typeof projects);

    res.render("projects", { projects: projects });

  } catch (err) {
    console.log(err);
    res.render("projects", { projects: [] });
  }
});


//delete project by admin only


app.post("/admin/delete-project/:id", async (req,res)=>{

    if(!req.session.admin){
        return res.redirect("/admin/login")
    }

    try{

        await Project.findByIdAndDelete(req.params.id)

        res.redirect("/admin/dashboard")

    }catch(err){

    console.log(err)
    res.send("Error deleting project")

    }

})

// Contact
app.get("/contact", (req, res) => {
    res.render("contact");
});


// Quote Page
app.get("/request-quote", (req, res) => {
    res.render("requestQuote");
});


// Quote Form
app.post("/request-quote", (req, res) => {

    const { name, email, phone, service, message } = req.body;

    console.log(name, email, phone, service, message);

    res.send("Quote request submitted successfully");

});


// ================= ADMIN =================


// Login Page
app.get("/admin", (req, res) => {
    res.render("admin/login");
});


// Login Auth
app.post("/admin-login", (req, res) => {

    const { username, password } = req.body;

    if(username === "pasha123" && password === "pasha@9958"){
        req.session.admin = true;
        res.redirect("/admin/dashboard");
    } 
    else {
        res.redirect("/admin");
        
    }

});


// Dashboard
app.get("/admin/dashboard", async (req, res) => {

    if(!req.session.admin){
        return res.redirect("/admin");
    }

    const projects = await Project.find().sort({ createdAt: -1 });

    res.render("admin/dashboard", { projects });

});



app.post("/admin/add-project", upload.single("image"), async (req, res) => {

    console.log("ROUTE HIT");

    try {

        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        if (!req.file) {
            return res.send("Image not received");
        }

        const { title, description } = req.body;

        const newProject = new Project({
            title,
            description,
            image: req.file.path
        });

        await newProject.save();

        console.log("PROJECT SAVED");

        res.redirect("/admin/dashboard");

    } catch (err) {

        console.log("UPLOAD ERROR:", err);
        res.send(err);

    }

});




app.post("/admin/add-project", upload.single("image"), async (req, res) => {
  console.log("ROUTE HIT");
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.send("Image not received");
    }

    const newProject = new Project({
      title,
      description,
      image: "/uploads/" + req.file.filename
    });

    await newProject.save();

    console.log("PROJECT SAVED");

    res.redirect("/admin/dashboard");

  } catch (err) {
    console.log(err);
    res.send(err);
  }
});



// Logout
app.get("/admin/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/");
    });

});


// ================= SERVER =================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});