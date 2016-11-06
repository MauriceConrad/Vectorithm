# Vectorithm


**Note, that you need the node module [phantom](https://github.com/amir20/phantomjs-node)!**

Vectorithm is a Node.js module to automate a logical structure of a vector graphic, algorithmic repeating and draw the vector graphic in a PDF file, so often as indicated.

## What?! Give me an example!

Look at this vector graphic "source":

![Source](https://img5.picload.org/image/rdicralc/source.png)

We want to create 100 pieces of this graphic but the number (Nr. X) needs to be different. In addition, we want that the stroke color of the line on the bottom is different, in a way that every third time the stroke color is red, blue & green. And this logic repeating.

That means:
1. "#f00"
2. "#00f"
3. "#0f0"
4. "#f00"
5. "#00f"
6. "#0f0"
7. "#f00"
8. [...]

## Syntax

That's exactly what the module does. Therefore, you pass variables into the SVG context. A variable is declared by the syntax "{{xxx}}". A variable is an array, with the items to repeat.

There is one special variable. That is the variable "count". In difference to a normal one, in every repeat of "count" 1 is added to this variable. Of course "count" is also be an array, 1 is added to every item if it's the current repeating.

### Variables

#### Variable Items

For example, if "color" is:

```javascript
["#f00", "#00f", "#0f0"]
```


For example, if "count" is:
```javascript
[0, 0]
```

1. [1, 0]
2. [1, 1]
3. [2, 1]
4. [2, 2]
4. [3, 2]
4. [3, 3]
5. [...]

#### Variables syntax

The variables are stored in a simple object. For our example:

```javascript
{
  "color": [
    "#f00", // Red
    "#00f", // Blue
    "#0f0" // Green
  ],
  "count": [0]
}
```

## Module

### Required

**Note, that you need the node module [phantom](https://github.com/amir20/phantomjs-node)!**

```javascript
var vectorithm = require("vectorithm")

console.log(vectorithm)
```

### Paramters & Options

Pass the options (settings) into the "options" object of the vectorithm instance (vectorithm.options)

```javascript
vectorithm.options = {
  output: __dirname + "/result.pdf", // PDF file to export
  max: 100, // Count of repeats
  border: true, // If there is a border between the items
  width: "9cm", // Width of an item
  //height: "3cm", // Height of an item (Use only, if you don't set a width)
  source: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><!--SVG Content--></svg>', // Source File
  variables: {
    "variable1": ["value1", "value2"],
    "variable2": ["valueA", "valueB"],
    "count": [0]
  } // Object containing the variables (arrays)
}
```
#### Width & Height
As you saw, you can pass the width and height of your items in the options. The values are in centimeters. If you just pass the width or height, the other value will used from the "viewBox" attribute. For example, if you set the width to "9cm" and your "viewBox" is "0 0 100 50", the height will be 4.5cm.


### Create!

The method "create" will create the PDF using the options.

To see a complete, working example with file reading of the SVG Source, look at the "example.js" file!

```javascript
vectorithm.create(function(result) {
  console.log(result);
})

```

### SVG Syntax

To declare a variable in the SVG context, use {{variableName}}.

For our example:

If you set the all the options like this, your SVG context looks like this and you run the create() method, your result would be:

![Result](https://picload.org/image/rdicdrod/result.png)

**The animation is because, your browser wants to show you every site!**

## Working example

If you are confused about everything, look at the "example.js" file ;-)
