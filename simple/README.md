
## `class UIElement`

    constructor(div, label) : UIElement
    createChild() : UIElement
    createChildren() : []UIElement
    verticalSplit([]rowsInfo) : []UIElement
    horizontalSplit([]colsInfo) : []UIElement
    expandToWindow() : void
    getLabel(), setLabel()
    getText(), setText()
    getDiv(), setDiv()
    addDiv()

Parents keep a list of their children.
We create corresponding DOM elements for each of our elements.

Note that we can access all the DOM functionality through the DOM element, exposed via `getDiv()`. 
But we don't currently have a reverse mapping to get back our `UIElement`.

An element can have any number of children, but must choose a single method of doing so.
Current choice is between 'vertical split' and 'horizontal split'. 
In either case, the size and number of splits is arbitrary.


