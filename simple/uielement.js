class UIElement {
  constructor(div) {
    this.children = [];

    if (div) {
      if (typeof div == 'string') {
        this.setDiv(document.getElementById(div));
      } else {
        this.setDiv(div);
      }
    } else {
      this.setDiv(document.createElement('div'));
    }

    this.getDiv().classList.add('entity');

    // Let's have a div to wrap our own content
    this.setHeaderDiv(document.createElement('div'));
    this.getHeaderDiv().classList.add('header')
    this.getDiv().append(this.getHeaderDiv());

    // Let's show a label, if present
    this.labelP = document.createElement('p');
    this.labelP.classList.add('label');
    this.getHeaderDiv().append(this.labelP);

    // Have a text value in addition to other possible children
    this.setBodyDiv(document.createElement('div'));
    this.getBodyDiv().classList.add('body')
    this.p = document.createElement('p');
    this.getBodyDiv().append(this.p);
    this.getDiv().append(this.getBodyDiv());

    // Let's also have a div to wrap our children
    this.setChildrenDiv(document.createElement('div'));
    this.getChildrenDiv().classList.add('children');
    this.getDiv().append(this.getChildrenDiv());

    // To actually evaluate placements we may need some context.
    // I guess we can introspect our own bounding box.
    // We can also track changes of our children's properties, and
    // recompute layouts and/or notify children of the need to recompute.

    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////

    // For now, establish conventions by defining some of our parameters here.
    this.conventions = {
      // gravityDirection: 'left',
    };
    // So far we have for each UIElement:
    // label, text, children
    // We will likely be adding more properties.
    // Think about how we want to support this: what kinds of properties do we need; what is the desired workflow for
    // adding them; how can we import/export elements (save/load, serialize/deserialize, marshall/unmarshall);
    // rendering; evaluating; referencing; indexing; etc.
    this.properties = {
      children: [],
      label: null,
      text: null,
      layoutProperties: null, // member of split group; position; etc.
    };
  }

  getHeaderDiv() { return this.headerDiv; }
  setHeaderDiv(div) { this.headerDiv = div; }

  getBodyDiv() { return this.bodyDiv; }
  setBodyDiv(div) { this.bodyDiv = div; }

  getChildrenDiv() { return this.childrenDiv; }
  setChildrenDiv(div) { this.childrenDiv = div; }

  getChildren() { return this.children; }
  addChild(child) {
    this.children.push(child);
    // Need to tie the DOM together as well
    this.getChildrenDiv().append(child.getDiv());
    return child;
  }

  getDiv() { return this.div; }
  setDiv(div) { this.div = div; }

  debug(tag) {
    return (...args) => {
      args[0] = `${this.getLabel()} ${args[0]}`;
      debug(tag)(...args);
    };
  }

  // Apply the update to the docElement
  setText(text) { this.p.innerText = text; }
  getText() { return this.p.innerText; }

  // Rely on innerText of <p> to store label
  getLabel() { return this.labelP.innerText; }
  setLabel(label) { this.labelP.innerText = label; }


  getRectangle() {
    const result = getDivRectangle(this.getDiv());
    return result;
  }

  getBoundingRectangle() {
    // Rectangle that bounds this element and all its children
    const mainRectangle = getDivRectangle(this.getDiv());
    const childrenRectangle = getDivRectangle(this.getChildrenDiv());
    const childRectangles = this.getChildren().map(child => {
      const childRectangle = child.getRectangle();
      // This is relative to our childrenDiv, so let's account for that
      childRectangle.top += mainRectangle.top + this.getChildrenDiv().offsetTop;
      childRectangle.left += mainRectangle.left + this.getChildrenDiv().offsetLeft;
      return childRectangle;
    });
    const allRectangles = [mainRectangle].concat(childRectangles);
    const result = getBoundingRectangle(allRectangles);
    return result;
  }

  moveTo(left, top) {
    if (left !== null) {
      // this.getDiv().style.left = (left + this.getComputedStylePropertyNumeric('padding-left')) + 'px';
      this.getDiv().style.left = (left ) + 'px';
    }
    if (top !== null) {
      this.getDiv().style.top = (top) + 'px';
    }
  }

  expandToWindow() {
    const margin = 50;
    this.getDiv().style.width = (window.innerWidth - 2 * margin) + 'px';
    this.getDiv().style.height = (window.innerHeight - 2 * margin) + 'px';
    this.getDiv().style.left = margin + 'px';
    this.getDiv().style.top = margin + 'px';
  }

  createChild() {
    // We want to return a handle like our own, but
    // initialized with the child as the root.
    // For now, the child will have no access to the parent;
    // it will be a one-way relationship.
    const child = new UIElement();
    return this.addChild(child);
  }

  createChildren(infoArray, configureChild) {
    // For now, let's just enforce here that each UIElement can only have one set of children.
    if (this.children.length > 0) {
      throw new Error('Each UIElement may only have one set of children');
    }
    return infoArray.map((info, index) => {
      return this.createChild();
    }).map((child, index, children) => {
      configureChild(child, index, children);
      return child;
    });
  }

  verticalSplit(infoArray) {
    let offset = 0;
    return this.createChildren(infoArray, (child, index, children) => {
      // We want this child to start where its predecessor ends
      child.getDiv().style.top = offset + 'px';
      child.getDiv().style.height = infoArray[index];
      // child.getDiv().style.width = '100%';
      child.setLabel(`verticalSplit ${index}`);
      offset += child.getRectangle().height;
    });
  }

  horizontalSplit(infoArray) {
    let offset = 0;
    return this.createChildren(infoArray, (child, index, children) => {
      child.getDiv().style.left = offset + 'px';
      child.getDiv().style.width = infoArray[index];
      child.setLabel(`horizontalSplit ${index}`);
      offset += child.getDiv().offsetWidth;
    });
  }
}
