const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const _ = require("lodash");

// REmoved line
// const date = require(__dirname + "/date.js");

let items = [];

// newItem

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy food","Cook food","Eat food"];
// const workItems = [];

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list app!"
});

const item2 = new Item({
  name: "Hit + button to add!"
});

const item3 = new Item({
  name: "<-- check to complete the Task!"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  // deleted this below line
  // const day = date.getDate();

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully added default items!");
        }
      });
    // redirect after added items successfully
    res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

    // change items to foundItems
    // res.render("list", {listTitle: "Today", newListItems: foundItems});
    // copy the above code inside else block
  });

  // changed Day to "Today"
  // res.render("list", {listTitle: "Today", newListItems: items});
  // cut and paste the above line inside Item.find()
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // below code moved inside if condition
  // item.save();
  // res.redirect("/");

  //  below code rewritten above

  // if(req.body.list === "Work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }else{
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("item successfully removed");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }



});



app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // create new db
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save()
        res.redirect("/" + customListName);
      }
      else{
        // show existing db
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })


});

// below code Depricated to above code
// app.get("/work", function(req, res){
//   res.render("list", {listTitle : "Work List",  newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});




app.listen(process.env.PORT || 3000, function() {
  console.log("server started at port 3000");
});
