//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const lodash = require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-Piyush:test123@cluster0-gxny3.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
})
const Item = mongoose.model("Item",itemsSchema)

const item1 = new Item({
  name: "Wake-up"
})
const item2 = new Item({
  name: "Eat breakfast"
})
const item3 = new Item({
  name: "Watch Ramayan"
})

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  item:[itemsSchema]
})

const List = mongoose.model("List",listSchema)


app.get("/", function(req, res) {

  Item.find({},function(err,results){
    if (results.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Success");
        }
      })
    }
    res.render("list", {listTitle: "Today", newListItems: results});
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const tempItem = new Item({
    name: itemName
  })

  if(listName ==="Today"){
    tempItem.save();
    res.redirect("/")
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.item.push(tempItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


});

app.post("/delete",function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(id,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
        res.redirect("/");
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull : {item : {_id : id}}},function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})

app.get("/:value",function(req, res){

  const newRoute = lodash.capitalize(req.params.value);


  List.findOne({name:newRoute},function(err,response){
    if(!err){
      if(!response){
        const list = new List({
          name:newRoute,
          item:defaultItems
        })
        list.save();
        res.redirect("/"+newRoute);
      }
      else{
      res.render("list", {listTitle: newRoute, newListItems:response.item});
      }
    }
  })

})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
