

let users = [];


class Post{
    constructor(name, text){
        this.name = name;
        this.text = text;
    }
    UpdatePost(newName, newText){
        this.name = newName;
        this.text = newText;
    }
}
class User{
    
    constructor(username, password , posts){
        this.username = username;
        this.password = password;
        this.posts = posts || [];
    }
    addPost(name, text){
        let newPost = new Post(name, text);
        this.posts.push(newPost);
    }
    deletePost(){
        const deletePosition = this.posts.indexOf(post => post.name === name);

        if (deletePosition !== -1) {
            this.posts.splice(deletePosition, 1);
        } else {
            console.log("Invalid index {0}", deletePosition);
        }
    }
    
}


export{Post};
export{User};
export{users};
