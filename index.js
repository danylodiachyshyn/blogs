import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import { User } from "./classes.js";
import { Post } from "./classes.js";
import { users } from "./classes.js";

const app = express();
const port = 3000;


app.use(session({
    secret: 'mysecretkey1234',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post("/sign-up", (req, res) => {
    res.render("sign-up.ejs");
});

app.post("/login", (req, res)=>{
    res.render("login.ejs");
})

app.post("/login-page", (req, res) => {
    
    let inputusername = req.body.inputUsername;
    let inputpassword1 = req.body.inputPassword1;
    let inputpassword2 = req.body.inputPassword2;

    if (inputpassword1 === " " || inputpassword2 === " " || inputusername === " ") {
        res.status(401).send("bad data");
    }
    if (!(inputpassword1 === inputpassword2)) {
        res.status(401).send("passwords do not match");
    }
    users.forEach(user => {
        if (user.username === inputusername) {
            console.log(user.username);
            res.status(401).send("Name already in use");
        }
    });
    
    let newUser = new User(inputusername, inputpassword1);
    users.push(newUser);
    req.session.users = users;
    res.redirect("/login");
});

app.get("/login-page", (req, res) => {
    res.render("login.ejs");
});

app.post("/user-page", (req, res) => {
    if (users) {
        let inputusername = req.body.inputUsername;
        let inputpassword = req.body.inputPassword;
        
        const user = users.find(user => user.username === inputusername && user.password === inputpassword);
        
        if (user) {
            req.session.user = user;
            return res.render("userpage.ejs", {user});
        } else {
            return res.status(401).send("Error...Incorrect login or password");
        }
    } else {
        return res.status(500).send("Session is not properly initialized");
    }
});

app.get("/user-page", (req, res) => {
    // Check if user is logged in
    if (req.session.user) {
        let user = req.session.user;
        res.render("userpage.ejs", { user });
    } else {
        // Redirect to the login page if user is not logged in
        res.redirect("/login");
    }
});

app.post("/view", (req, res) =>{
    if (req.session.users && req.session.user) {
        let users = req.session.users;
        let user = req.session.user;
        res.render("view.ejs", {users, user});
    } else {
        return res.status(500).send("Session is not properly initialized");
    }
})

app.post("/create-post", (req, res) =>{
    if (req.session.users && req.session.user) {
        res.render("create-post.ejs");
    } else {
        return res.status(500).send("Session is not properly initialized");
    }
})

app.post("/post-new-post", (req, res) =>{
    if (req.session.users && req.session.user) {

        let inputPostName = req.body.postName;
        let inputPostText = req.body.postContent;
        let newPost = new Post(inputPostName, inputPostText);
        req.session.user.posts.push(newPost);
        res.redirect("/user-page");
    } else {
        return res.status(500).send("Session is not properly initialized");
    }
})

app.post("/delete", (req, res) =>{
    if (req.session.users && req.session.user) {
        let user = req.session.user;
        res.render("delete-post.ejs", {user});
    } else {
        return res.status(500).send("Session is not properly initialized");
    }
})

app.post("/delete-post", (req, res) =>{
    if (req.session.users && req.session.user) {
        if (req.session.user.posts.length !== 0) {
            let inputPostName = req.body.postName;
            let idx = req.session.user.posts.indexOf(req.session.user.posts.find(post => post.name === inputPostName));
            req.session.user.posts.splice(idx, 1);
            res.redirect("/user-page");
        }
    } else {
        return res.status(500).send("Session is not properly initialized");
    }
})

app.post("/update", (req, res) =>{
    if (req.session.users && req.session.user) {
        let user = req.session.user;
        res.render("post-to-update.ejs", {user});
    } else {
        return res.status(500).send("Session is not properly initialized");
    }
})

app.post("/post-to-update", (req, res) => {
    if (req.session.users && req.session.user) {
        if (req.session.user.posts.length !== 0) {
            let inputPostName = req.body.postName;
            let idx = req.session.user.posts.findIndex(post => post.name === inputPostName);

            if (idx !== -1) {
                req.session.idx = idx;
                const Name = req.session.user.posts[idx].name;
                const Text = req.session.user.posts[idx].text;
                const Idx = idx;
                console.log(Name, Text, Idx);
                res.render("update-post.ejs", { Name, Text, Idx });
            } else {
                return res.status(404).send("Post not found");
            }
        }
    } else {
        return res.status(500).send("Session is not properly initialized");
    }
});

app.post("/finally-update", (req, res) =>{
    console.log(req.session.idx);
    let Idx = req.session.idx;
    console.log(Idx);
    if (Idx !== undefined) {
        if (req.session.users && req.session.user ) {
            if (req.session.user.posts.length !== 0) {
                let inputPostText = req.body.postText;
                let inputPostName = req.body.postName;
                let updatedPost = new Post(inputPostName, inputPostText);
                req.session.user.posts[Idx] = updatedPost;
                res.redirect("/user-page");
            }
        } else {
            return res.status(500).send("Session is not properly initialized");
        }
    }
    else{
        return res.status(500).send("ERRRRRRRROOOOOOOOR IDX");
    }
    
})

app.post("/exit", (req, res) =>{
    if (req.session.user) {
        for (let i = 0; i < req.session.user.posts.length; i++) {
            console.log(req.session.user.posts[i].name+ '\t'+ req.session.user.posts[i].text + '\n');
        }
        let indexToUpdate = users.findIndex(user => user.username === req.session.user.username);
        if (indexToUpdate !== -1) {
            users[indexToUpdate] = req.session.user;
            for (let i = 0; i < req.session.user.posts.length; i++) {
                console.log(users[indexToUpdate].posts[i].name+ '\t'+ users[indexToUpdate].posts[i].text + '\n');
            }
            res.redirect("/");
        } else {
            console.error('User not found');
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
    

})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
