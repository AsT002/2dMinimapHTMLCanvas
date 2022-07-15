// Variables
const canvas = document.getElementById("mapCanvas") // Get the canvas
const cxt = canvas.getContext('2d') // Get 2d Context
const colors = ["#F75C03", "#D90368", "#04A777", "#CADF9E", "#EFF9F0", "#759EB8", "#7392B7", "#A03E99", "#302F4D"] // Colors from coolors.co's random generator.
var saved_obj = [] // To save some objects
var [miniMapRadius, search_radius] = [200, 1000]
var miniMap;

// Functions
function setSize() { // For the purpose of updating Canvas size when resized/first loaded.
    // const [pWidth, pHeight] = [canvas.width, canvas.height] // Get Previous width/height
    const [wLimit, hLimit] = [400, 400] // Lower bounds to what Canvas can resize.
    const [x, y] = [innerWidth - 5, innerHeight - 5] // Current window's size minus 5px
    const [width, height] = [x > wLimit ? x : wLimit, y > hLimit ? y : hLimit]

    canvas.width = width; 
    canvas.height = height;

    saved_obj = []; // Clear saved Objects
    miniMapRadius = width * .10 // Make it 10% of the screen's width

    if (miniMap) {
        miniMap.radius = miniMapRadius
        miniMap.update()
    }

    // return [width, height, pWidth, pHeight] // return some values.

    // Make sure width and height are not below 400px.
    // Set Height and Width 
}
function random(max) { // Get a random number from 0 - max
    return Math.floor(Math.random() * max)
}

// Classes
class minimap {
    constructor(radius, color, search_radius=1000) {
        this.radius = radius;
        this.color = color;
        this.search_radius = search_radius; // Pixel radius of Search from Center (First Object on Map)
    }

    search() {
        if (saved_obj.length > 0) {
            const proportion = this.radius / search_radius
            var center = saved_obj[0]

            center.update();
            var center_obj = new object(this.radius, this.radius, center.radius * proportion, 0, Math.PI * 2, false) // Put this thing in the center
            center_obj.update()
            

            for (let i = 1; i < saved_obj.length; i ++) {
                var obj = saved_obj[i]
                obj.update()

                const X = (center.x - obj.x)
                const Y = (center.y - obj.y)
                const theta = Math.atan2(X, Y)
                const r = Math.sqrt((X)**2 + (Y)**2)
                const [x, y] = [this.radius - (r * Math.cos(theta) * proportion), this.radius - (r * Math.sin(theta) * proportion)]

                if (r <= this.search_radius && this.radius > (r * proportion)) {
                    var mm_obj = new object(y, x, obj.radius * proportion, 0, Math.PI * 2, false)
                    mm_obj.update()
                }
            }
        }
    }

    update() {
        cxt.beginPath()
        cxt.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2, false)
        cxt.fillStyle = this.color
        cxt.fill() 
        cxt.closePath()
        this.search()
    }
}
class object { // Create objects in Map
    // x, y -> Position.
    // radius, color

    constructor(x, y, radius, color) { // When a new Instance is created
        // this refers to the THIS instance
        this.x = x
        this.y = y 
        this.radius = radius
        this.color = color
    }

    update() { // Update the object
        cxt.beginPath()
        cxt.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false) // arc(x, y, radius, startAngle, endAngle (2pi -> Full Angle), counterclockwise)
        cxt.fillStyle = this.color
        cxt.fill()
        cxt.closePath() 
    }
}

// Main
setSize() // Set size.

window.onload = () => { // Page has fully loaded
    do {
        search_radius = parseInt(window.prompt("Search Radius in Pixels (>99): "))
    } while (isNaN(search_radius) || search_radius < 100)    

    miniMap = new minimap(miniMapRadius, "#000000", search_radius)
    miniMap.update()

    // Events
    addEventListener('resize', setSize)
    canvas.addEventListener("click", (MouseEvent) => { // When user clicks somewhere on the Canvas.
        const [x, y] = [MouseEvent.clientX, MouseEvent.clientY] // Where user clicked; Read-only values.
        const [color, radius] = [colors[random(colors.length)], 10] // Random color, radius
        cxt.clearRect(0, 0, canvas.width, canvas.height)

        // Check if minimap and click overlap
        var dist = Math.sqrt((miniMapRadius - (x - (radius / 2))) ** 2 + (miniMapRadius - (y - (radius / 2))) ** 2) // Right Most Side
        var dist2 = Math.sqrt((miniMapRadius - (x + (radius / 2))) ** 2 + (miniMapRadius - (y + (radius / 2))) ** 2) // Left Most Side
        
        if (dist > miniMapRadius && dist2 > miniMapRadius) {
            var obj = new object(x, y, radius, color) // Instantiate the object.
            saved_obj.push(obj) // Push it in the saved_obj array. 
        }

        miniMap.update()
    })
}