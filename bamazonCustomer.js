var mysql = require("mysql");
var inquirer = require("inquirer");
var columnify = require("columnify");
var numberOfItems;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Riften#333",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    listAll(); 
});

function listAll() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log("\n");
        console.log("--------- For Sale Items: --------")
        console.log(columnify(res, { columnSplitter: " | " }));
        numberOfItems = res.length;
        console.log("\n");
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
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        console.log("The item ID number must be a number. Please try again.");
                        return false;
                    },
                    validate: function (value) {
                        let pass = value.match("^\\d{1,2}$");
                        if (pass) {
                            if (value <= numberOfItems) {
                                return true;
                            } else {
                                return "This ID is not matched to a product."
                            };
                        }
                        else return "Please enter a valid ID";
                    }
                }
            ]
        ).then(itemNum => {
            console.log(`You chose item ID number ${itemNum.product}`);
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
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        console.log("The item quantity must be a number. Please try again.");
                        return false;
                    }
                }
            ]
        ).then(x => {
            connection.query(`select stock_quantity, price, product_name from products where id = ${productId}`, function (err, res) {
                if (err) throw err;
                if (x.quant > res[0].stock_quantity) {
                    console.log("There is not enough stock for that order. Please try again.");
                    howMany();
                } else {
                    console.log(`You are ordering ${x.quant} of those items.`);
                    console.log(`The total order price for your ${res[0].product_name}(s) is $${(res[0].price * x.quant).toFixed(2)}. Your order is on the way.`);
                    var newQuant = res[0].stock_quantity - x.quant;
                    connection.query(`UPDATE products SET stock_quantity = ${newQuant} WHERE id = ${productId}`, function(err, res) {
                        if (err) throw err;
                        continueShopping();
                    });
                }
            })
        })
}

function continueShopping() {
    inquirer
        .prompt(
            [
                {
                    name: "continue",
                    message: "Do you want to contniue shopping?",
                    type: "confirm",
                }
            ]
        ).then(answer => {
            if (answer.continue === true) {
                listAll();
            }else{
                console.log("Thank you for shopping. Come back soon!")
                connection.end();
            }
        })
}

