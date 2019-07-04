var express         = require("express"),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser"),
    methoodOverride  = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    app              = express();


mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/restful_blog_app', {
    useNewUrlParser: true,
    useCreateIndex: true,
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methoodOverride("_method"));

// Schema

var blogSchema = new mongoose.Schema({
    title : String,
    image : String,
    body : String,
    created : {type: Date , default: Date.now}
});

var Blog = mongoose.model("Blog" , blogSchema);

// Blog.create({
//     title: "Test Blog" , 
//     image : "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//     body : "This is my first blog!"
// });

app.get('/', (req, res) => {
    res.redirect("/blogs");
});

app.get('/blogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
       if(err){
           console.log(`Error: ` + err)
       } else{
           res.render("index" , {blogs : blogs});
       }
    });
});

app.get('/blogs/new', (req, res) => {
    res.render("new");
});

app.post('/blogs', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog , (err , newBlog) => {
        if(err){
            console.log("Error" + err);
        }else{
            res.redirect('/blogs');
        }
    });
});

app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
       if(err){
           console.log('Error: ' + err);
           res.redirect("/blogs");
       } else{
            res.render("show" , {blog : foundBlog});
       }
    });
});


app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            console.log('Error: ' + err);
            res.redirect("/blogs");
        } else{
             res.render("edit" , {blog : foundBlog});
        }
     });
});

app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findOneAndUpdate(req.params.id,req.body.blog, (err, updatedBlog) => {
        if (err) {
            console.log(`Error: ` + err)
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndDelete(req.params.id, (err) => {
       if(err){
           console.log(`Error: ` + err)
       } else{
           res.redirect('/blogs');
       }
    });
});

app.listen(3000, () => {
    console.log('Blog App has started!');
});