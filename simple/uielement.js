class UIElement {
  constructor(div, label) {
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

    this.getDiv().classList.add('entityRectangle');

    // Let's have a div to wrap our own content
    this.headerDiv = document.createElement('div');
    this.headerDiv.style.position = 'relative';
    this.addDiv(this.headerDiv);

    // Let's show a label, if present
    this.labelP = document.createElement('p');
    this.labelP.classList.add('label');
    this.headerDiv.append(this.labelP);
    if (label) {
      this.setLabel(label);
    }

    // Have a text value in addition to other possible children
    this.p = document.createElement('p');
    this.headerDiv.append(this.p);

    // Let's also have a div to wrap our children
    this.setChildrenDiv(document.createElement('div'));
    this.getChildrenDiv().style.position = 'relative';
    this.addDiv(this.getChildrenDiv());

    // To actually evaluate placements we may need some context.
    // I guess we can introspect our own bounding box.
    // We can also track changes of our children's properties, and
    // recompute layouts and/or notify children of the need to recompute.

    this.computedStyle = window.getComputedStyle(this.getDiv());

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

  getChildrenDiv() { return this.childrenDiv; }
  setChildrenDiv(div) { this.childrenDiv = div; }

  getDiv() { return this.div; }
  setDiv(div) { this.div = div; }

  addDiv(div) { this.getDiv().append(div); }

  // Apply the update to the docElement
  setText(text) { this.p.innerText = text; }
  getText() { return this.p.innerText; }

  // Rely on innerText of <p> to store label
  getLabel() { return this.labelP.innerText; }
  setLabel(label) { this.labelP.innerText = label; }

  getComputedStyle() { return this.computedStyle; }
  getComputedStylePropertyNumeric(property) {
    const value = this.getComputedStyle().getPropertyValue(property);
    return parseInt(value);
  }

  getRectangle() {
    // Let's also include padding here
    return {
      left: this.getComputedStylePropertyNumeric('left')
        - this.getComputedStylePropertyNumeric('padding-left'),
      top: this.getComputedStylePropertyNumeric('top')
        - this.getComputedStylePropertyNumeric('padding-top'),
      width: this.getComputedStylePropertyNumeric('width')
        + this.getComputedStylePropertyNumeric('padding-left')
        + this.getComputedStylePropertyNumeric('padding-right'),
      height: this.getComputedStylePropertyNumeric('height')
        + this.getComputedStylePropertyNumeric('padding-top')
        + this.getComputedStylePropertyNumeric('padding-bottom'),
    };
  }

  moveTo(left, top) {
    if (left !== null) {
      this.getDiv().style.left = (left + this.getComputedStylePropertyNumeric('padding-left')) + 'px';
    }
    if (top !== null) {
      this.getDiv().style.top = (top + this.getComputedStylePropertyNumeric('padding-top')) + 'px';
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
    this.children.push(child);
    // Need to tie the DOM together as well
    this.getChildrenDiv().append(child.getDiv());
    return child;
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
      child.getDiv().style.width = '100%';
      child.setLabel(`verticalSplit ${index}`);
      offset += child.getDiv().offsetHeight;
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
