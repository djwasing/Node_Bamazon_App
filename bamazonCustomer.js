var mysql = require("mysql");
var inquirer = require("inquirer");
var columnify = require("columnify");
var productId;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Riften#333",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    listAll(); // need to find a better way to show this data so it looks nicer, maybe JSON?
    //selectProduct();
});

function listAll() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      console.log("\n");
      console.log("--------- For Sale Items: --------")
      console.log(columnify(res, {columnSplitter: " | "}));
      console.log("\n");
      //connection.end();
      selectProduct();
    });
}

function selectProduct() {
    inquirer
    .prompt(
        [
            {
                name: "product",
                message: "Welcome to Bamazon. Enter the item ID number for the product you want to buy.",
                type: "input",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    console.log("The item ID number must be a number. Please try again.");
                    return false;
                }
                // validate: function(value) {
                //     var x;
                //     connection.query("SELECT * FROM products", function(err, res) {
                //         if (err) throw err;
                //         var highest = 0;
                //         res.forEach(item => {
                //             if (item.id > highest) {
                //                 highest = item.id;
                //             }
                //         });
                //         //console.log(highest + "line47")
                //         if (isNaN(value) === false) {
                //             if (value > highest) {
                //                 //console.log(highest + "line52");
                //                 console.log("You must enter a product ID number from the list. Please try again.");
                //                 return false;
                //             }else{
                //                 console.log(highest + "line55");
                //                 x = true;                                            // ***why is this not continuing to the .then? 
                //             }
                //         }else{
                //             console.log("The item number must be a number. Please try again.");
                //             return false;
                //         }
                //     })
                //     if (x === true) {
                //         return true;
                //     }
                // } 
            }
        ]
    ).then(itemNum => {
        console.log(`You chose item ID number ${itemNum.product}.`);
        var productId = itemNum.product;
        console.log("Great Choice!");
        howMany(productId);
    })
}

function howMany(productId) {
    inquirer
    .prompt(
        [
            {
                name: "quant",
                message: "How many of that item do you want to buy?",
                type: "input",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    console.log("The item quantity must be a number. Please try again.");
                    return false;
                }
            }
        ]
    ).then(x => {
        console.log(`You are ordering ${x.quant} of those items.`);
        connection.query(`select stock_quantity, price from products where id = ${productId}`, function(err, res) {
            if (err) throw err;
            //console.log(res);
            if (x.quant > res[0].stock_quantity) {
                console.log("There is not enough stock for that order. Please try again.");
            }else{
                console.log(`Total order price:$ ${res[0].price * x.quant}. Your order is on the way.`);
            }
        })
        connection.end();
        
        // if (x.quant > productId.stock_quantity) { //I think I need to be getting the responses as json objects before I can do this part of selecting the quantity using dot notation
        //     console.log("Invalid entry. There are not enough in stock. Please check how many are in stock and try again.");
        // }else{
        //     console.log(`Your order of ${selectedItemVar}. Quantity: ${numberOfItemVar} has been submitted and will be shipped soon.`);
        // }
    }) 
}

