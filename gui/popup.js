/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Popup for menus and other small UI notifications
 */
function popup() {
	this.container = document.createElement("div");
	this.container.setAttribute('class', 'popup');
	
    this.content = document.createElement("div");

    this.container.appendChild(this.content);
	
	document.body.appendChild(this.container);
	
	this.container.addEventListener("click", function(event) { 
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		event.stopPropagation ? event.stopPropagation() : window.event.cancelBubble = true;
	}, false);
	
	this.hidden = true;
}

popup.prototype.hide = function() {
	this.container.style.display = 'none';
	this.container.style.opacity = '0';
	this.hidden = true;
}

popup.prototype.show = function(target) {
	var toX, toY;
	var toX2;
	
	this.container.style.top = '0px';
	this.container.style.left = '0px';
	this.container.style.display = 'block';
	this.container.style.opacity = '0';
	
	var size = this.container.getBoundingClientRect();
	var width = (size.right);
	var height = (size.bottom);
	
	if(target) {
		if(target.x != null && target.y != null) {
			toX = target.x;
			toY = target.y;
		} else if(typeof target.getBoundingClientRect === 'function') {
			var rect = target.getBoundingClientRect();
			toX = Math.round(rect.left);
			toX2 = Math.round(rect.right);
			toY = Math.round(rect.bottom + 2);
		}
	} else {
		toX = window.innerWidth/2 - width/2;
		toY = window.innerHeight/2 - height/2;
	}
	
	if((toX + width) > window.innerWidth) {
		if(toX2 != null) {
			toX = toX2 - width;
		} else {
			toX = toX - width - 2;
		}
	}
	if((toY + height) > window.innerHeight) { toY = toY - height - 2; }
	
	toX = Math.round(toX);
	toY = Math.round(toY);
	
	this.container.style.top = toY + 'px';
	this.container.style.left = toX + 'px';
	this.container.style.opacity = '1';
	this.hidden = false;
}

popup.prototype.isHidden = function() {
	return this.hidden;
}

popup.prototype.reset = function() {
	this.hide();
	this.content.removeChildren();
}

popup.prototype.add = function(element) {
	this.content.appendChild(element);
	return element;
}

popup.prototype.addButton = function(button) {
	this.content.appendChild(element);
}
popup.prototype.addButtonOk = function(action) {
	if(!action) { action = ""; }
	var button = document.createElement("button");
	button.setAttribute("class", "black");
	button.setAttribute("onclick", "popup.hide();"+action);
	button.appendChild(document.createTextNode("Ok"));
	this.content.appendChild(button);
}
popup.prototype.addButtonCancel = function(action) {
	if(!action) { action = ""; }
	var button = document.createElement("button");
	button.setAttribute("onclick", "popup.hide();"+action);
	button.appendChild(document.createTextNode("Cancel"));
	this.content.appendChild(button);
}

popup.prototype.confirmation = function(target, text, actionYes, actionNo) {
	if(!target) { return; }
	this.reset();
	
	if(text) { this.add(build.p(text)); }
	
	this.addButtonOk(actionYes);
	this.addButtonCancel(actionNo);
	
	this.show(target);
}

popup.prototype.input = function(target, type, value, actionYes, actionNo) {
	if(!target) { return; }
	this.reset();
	
	this.add(build.input(type, value));
	if(actionYes) {
		this.addButtonOk('var value = this.previousSibling.value;' + actionYes);
	} else {
		this.addButtonOk();
	}
	
	if(actionNo) {
		this.addButtonCancel('var value = this.previousSibling.previousSibling.value;' + actionNo);
	} else {
		this.addButtonCancel();
	}
	
	this.show(target);
}

popup.prototype.macroClock = function(target) {
	if(!target) { return; }
	this.reset();
	
	var value = infoEditor.clock.container.innerHTML;
	if(svg.svgElement.getCurrentTime() < 3600) {
		value = '00:' + value;
	}
	
	this.add(build.input('time', value, { 'step': '0.001' }));
	
	var action = "var time = this.previousSibling.getSeconds();";
		action += "svg.gotoTime(time);";
	
	this.addButtonOk(action);
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroAnimationContextMenu = function(event, index, isInvertible) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	var selText = windowAnimation.selected.length > 0 ? "selected" : "keyframes";
	
	tArray.push([ build.icon("arrow-up-white"), "Move up" ]);
	tArray.push([ build.icon("plus-white"), "Duplicate" ]);
	tArray.push([ build.icon("arrow-down-white"), "Move down" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("clock-black"), "Balance " + selText ]);
	if(isInvertible) {
		tArray.push([ build.icon("arrow-double-horizontal-black"), "Invert " + selText ]);
	}
	tArray.push([ build.icon("trash-black"), "Remove " + selText ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("up", '+index+');' });
	rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("duplicate", '+index+');' });
	rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("down", '+index+');' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("balance", '+index+');' });
	if(isInvertible) {
		rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("invert", '+index+');' });
	}
	rAttributes.push({ 'onclick': 'popup.hide();windowAnimation.contextMenuEvaluate("delete", '+index+');' });
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show({'x': event.clientX, 'y': event.clientY });
}

popup.prototype.macroLayerContextMenu = function(event, targetId) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	var selText = windowAnimation.selected.length > 0 ? "selected" : "keyframes";
	
	tArray.push([ build.icon("plus-white"), "Add layer..." ]);
	tArray.push([ build.icon("edit-white"), "Rename layer..." ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("arrow-up-white"), "Raise layer" ]);
	tArray.push([ build.icon("arrow-down-white"), "Lower layer" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("copy-white"), "Duplicate layer" ]);
	tArray.push([ build.icon("trash-black"), "Delete layer" ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("add", "'+targetId+'");' });
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("rename", "'+targetId+'");' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("raise", "'+targetId+'");' });
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("lower", "'+targetId+'");' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("duplicate", "'+targetId+'");' });
	rAttributes.push({ 'onclick': 'popup.hide();windowLayers.contextMenuEvaluate("delete", "'+targetId+'");' });
	
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show({'x': event.clientX, 'y': event.clientY });
}

popup.prototype.macroContextMenu = function(target) {
	this.reset();
	
	var evaluated = svg.evaluateEventPosition( { 'clientX': target.x, 'clientY': target.y } );
	
	var tArray = [];
	var rAttributes = [];
	
	var selText = windowAnimation.selected.length > 0 ? "selected" : "keyframes";
	
	tArray.push([ build.icon("arrow-undo-black"), "Undo" ]);
	tArray.push([ build.icon("arrow-redo-black"), "Redo" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("ex-white"), "Cut" ]);
	tArray.push([ build.icon("edit-white"), "Paste" ]);
	tArray.push([ build.icon("copy-white"), "Copy" ]);
	/*
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("arrow-circle-white"), "Rotate..." ]);
	tArray.push([ build.icon("arrow-double-horizontal-white"), "Scale..." ]);
	*/
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("copy-black"), "Duplicate" ]);
	tArray.push([ build.icon("trash-black"), "Delete" ]);
	
	if(svg.history.index >= 0) {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.history.undo();' });
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(svg.history.index < svg.history.histArray.length-1) {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.history.redo();' });
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(svg.selected != svg.svgElement) {
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.cut(svg.selected);' });
	} else {
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(svg.elementTemp) {
		if(svg.selected.getAttribute('inkscape:groupmode') == 'layer' || svg.selected == svg.svgElement) {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste('+evaluated.x+', '+evaluated.y+', svg.selected);'});
		} else {
			rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste('+evaluated.x+', '+evaluated.y+', svg.selected.parentNode, svg.selected);'});
		}
	} else {
		rAttributes.push({ 'class': 'disabled' });
	}
	
	if(svg.selected != svg.svgElement) {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.copy(svg.selected);' });
		/*
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.rotate({ "id": "'+target.target.id+'", "x": '+target.x+', "y": '+target.y+' });' });
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.scale({ "id": "'+target.target.id+'", "x": '+target.x+', "y": '+target.y+' });' });
		*/
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.duplicate(svg.selected);'});
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.duplicate(svg.selected);'});
	} else {
		rAttributes.push({ 'class': 'disabled' });
		/*
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'class': 'disabled' });
		rAttributes.push({ 'class': 'disabled' });
		*/
		rAttributes.push({ 'class': 'hr' });
		rAttributes.push({ 'class': 'disabled' });
		rAttributes.push({ 'class': 'disabled' });
	}
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}


popup.prototype.macroMenuFile = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	tArray.push([ build.icon("folder-black"), "Open..." ]);
	tArray.push([ build.icon("floppy-black"), "Save and download" ]);
	tArray.push([ build.icon("arrow-end-black"), "Export..." ]);
	tArray.push([ build.icon("edit-black"), "Document properties..." ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroOpen();' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.save();' });
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroExport();' });
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroDocument();' });
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroMenuEdit = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	tArray.push([ build.icon("arrow-undo-black"), "Undo" ]);
	tArray.push([ build.icon("arrow-redo-black"), "Redo" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("ex-white"), "Cut" ]);
	tArray.push([ build.icon("edit-white"), "Paste" ]);
	tArray.push([ build.icon("copy-white"), "Copy" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("copy-black"), "Duplicate" ]);
	tArray.push([ build.icon("trash-black"), "Delete" ]);
	
	if(svg.history.index >= 0) {
		rAttributes.push({ 'onclick': 'popup.hide();svg.history.undo();' });
	} else { rAttributes.push({ 'class': 'disabled' }); }
	if(svg.history.index < svg.history.histArray.length-1) {
		rAttributes.push({ 'onclick': 'popup.hide();svg.history.redo();' });
	} else { rAttributes.push({ 'class': 'disabled' }); }
	
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.cut(svg.selected);' });
	
	if(svg.selected.getAttribute('inkscape:groupmode') == 'layer' || svg.selected == svg.svgElement) {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste(null, null, svg.selected);'});
	} else {
		rAttributes.push({ 'onclick': 'event.stopPropagation();popup.hide();svg.paste(null, null, svg.selected.parentNode, svg.selected);'});
	}
	
	rAttributes.push({ 'onclick': 'popup.hide();svg.copy(svg.selected);' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.duplicate(svg.selected);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.delete(svg.selected);' });

	
	if(svg.selected == svg.svgElement) {
		rAttributes[3] = { 'class': 'disabled' };
		rAttributes[5] = { 'class': 'disabled' };
		rAttributes[7] = { 'class': 'disabled' };
		rAttributes[8] = { 'class': 'disabled' };
	}
	
	if(!svg.elementTemp) {
		rAttributes[4] = { 'class': 'disabled' };
	}
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroMenuObject = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	tArray.push([ build.icon("group-white"), "Group" ]);
	tArray.push([ build.icon("ungroup-white"), "Ungroup" ]);
	tArray.push([ "", "" ]);
	tArray.push([ build.icon("gear-white"), "Object to animation state..." ]);
	tArray.push([ build.icon("gears-white"), "Create animated group..." ]);
	tArray.push([ build.icon("folder-white"), "Manage animation states..." ]);
	
	rAttributes.push({ 'onclick': 'popup.hide();svg.group();' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.ungroup();' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();menu.refresh();popup.macroToAnimationState(document.getElementById("anigenMenu"), svg.selected);' });
	rAttributes.push({ 'onclick': 'popup.hide();menu.refresh();popup.macroNewAnimationGroup(document.getElementById("anigenMenu"));' });
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroAnimationStatesManager();' });
	
	if(svg.selected == svg.svgElement) {
		rAttributes[0] = { 'class': 'disabled' };
		rAttributes[1] = { 'class': 'disabled' };
	}
	if(svg.selected == svg.svgElement || svg.selected.getAttribute('anigen:type') == 'animationGroup' || svg.selected.hasAnimation()) {
		rAttributes[3] = { 'class': 'disabled' };
	}
	if(!svg.animationStates) {
		rAttributes[4] = { 'class': 'disabled' };
		rAttributes[5] = { 'class': 'disabled' };
	}
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroMenuAnimation = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	tArray.push([ build.icon("animate-translate-black"), "Translate" ]);
	tArray.push([ build.icon("animate-motion-black"), "Move through path" ]);
	tArray.push([ build.icon("animate-rotate-black"), "Rotate" ]);
	tArray.push([ build.icon("animate-scale-black"), "Scale" ]);
	tArray.push([ build.icon("animate-skewx-black"), "Skew horizontally" ]);
	tArray.push([ build.icon("animate-skewy-black"), "Skew vertically" ]);
	tArray.push([ build.icon("animate-attribute-black"), "Animate attribute..." ]);
	
	tArray.push([ "", "" ]);
	
	tArray.push([ build.icon("arrow-circle-white"), "Loop animation..." ]);
	tArray.push([ build.icon("restart-black"), "Restart all" ]);
	tArray.push([ build.icon("stopwatch-white"), "Pause / unpause" ]);
	
	
	rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 2, null, { select: true }, null);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 1, null, { select: true }, null);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 3, null, { select: true }, null);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 4, null, { select: true }, null);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 5, null, { select: true }, null);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.createAnimation(svg.selected, 6, null, { select: true }, null);' });
	rAttributes.push({ 'onclick': 'popup.hide();menu.refresh();popup.macroAnimateTypes(document.getElementById("anigenMenu"), svg.selected);' });
	rAttributes.push({ 'class': 'hr' });
	rAttributes.push({ 'onclick': 'popup.hide();menu.refresh();popup.input(document.getElementById("anigenMenu"), "number", infoEditor.clock.maxTime || 0, "value = parseFloat(value);if(value==null || isNaN(value) || value < 0){return;}infoEditor.clock.setMaxTime(value);", null);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.gotoTime(0);' });
	rAttributes.push({ 'onclick': 'popup.hide();svg.pauseToggle();' });
	
	if(svg.selected == svg.svgElement) {
		rAttributes[0] = { 'class': 'disabled' };
		rAttributes[1] = { 'class': 'disabled' };
		rAttributes[2] = { 'class': 'disabled' };
		rAttributes[3] = { 'class': 'disabled' };
		rAttributes[4] = { 'class': 'disabled' };
		rAttributes[5] = { 'class': 'disabled' };
		rAttributes[6] = { 'class': 'disabled' };
	}
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}

popup.prototype.macroMenuHelp = function(target) {
	this.reset();
	
	var tArray = [];
	var rAttributes = [];
	
	/*
	tArray.push([ build.icon("magnifier-black"), "Manual..." ]);
	tArray.push([ "", "" ]);
	*/
	tArray.push([ build.icon("question-white"), "About..." ]);
	
	/*
	rAttributes.push({ 'onclick': 'popup.hide();window.open("manual.html", "_blank");' });
	rAttributes.push({ 'class': 'hr' });
	*/
	rAttributes.push({ 'onclick': 'popup.hide();overlay.macroAbout();' });
	
	this.add(build.table(tArray, null, rAttributes)).setAttribute('class', 'popup-menu');
	
	this.show(target);
}


popup.prototype.macroLayerNew = function(targetId) {
	this.reset();
	
	var currentLayer;
	if(targetId) {
		currentLayer = document.getElementById(targetId);
	} else {
		currentLayer = svg.getCurrentLayer();
	}
	
	this.add(build.input("text", "New layer"));
	
	var action;
	
	if(currentLayer) {
		this.add(build.select([
			{ 'text': 'Above current', 'value': 'above' },
			{ 'text': 'Below current', 'value': 'below' },
			{ 'text': 'As sublayer of current', 'value': 'sublayer' }
		]));
		action = "svg.addLayer(this.previousElementSibling.previousElementSibling.value, this.previousElementSibling.value);"
	} else {
		action = "svg.addLayer(this.previousElementSibling.value, null);"
	}
	
	this.addButtonOk(action);
	this.addButtonCancel();
	
	this.show();
}

popup.prototype.macroLayerRename = function(target) {
	this.reset();
	
	var target = document.getElementById(target);
	if(!target) { return; }
	
	this.add(build.input('text', target.getAttribute('inkscape:label')));
	
	this.addButtonOk("svg.renameLayer('"+target.id+"', this.previousElementSibling.value);");
	this.addButtonCancel();
	
	this.show(windowLayers.footer.children[0]);
}

popup.prototype.macroAnimateTypes = function(target, element) {
	this.reset();
	
	var animatable = svg.getAnimatableAttributes(element.nodeName);
	
	var options = [ ];
	for(var i = 0; i < animatable.length; i++) {
		options.push({ 'id': i, 'text': animatable[i], 'value': animatable[i], 'title': svg.getAttributeDesription(animatable[i]) });
	}
	
	this.add(build.select(options));
	
	this.addButtonOk('svg.createAnimation("'+element.id+'", 0, null, { select: true }, { attribute: this.previousSibling.value } );');
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroToAnimationState = function(target, element) {
	this.reset();
	
	var childCount = element.getElementsByTagName('', true, true).length;
	
	var options = [];
	options.push({ 'text': 'New group', 'value': '', 'selected': true });
	
	for(var i in svg.animationStates) {
		if(!svg.animationStates[i] || !svg.animationStates[i][0] || svg.animationStates[i][0].children.length == childCount) {
			options.push({ 'text': i, 'value': i });
		}
	}
	
	this.add(build.input('text', element.id, { 'onfocus': 'if(this.value == "'+element.id+'") { this.value = null; }' } ));
	this.add(build.select(options, { 'onchange': 'this.nextSibling.style.display = this.value == "" ? null : "none";' } ));
	this.add(build.input('text', 'New group', { 'onfocus': 'if(this.value == "New group") { this.value = null; }' } ));
	
	this.addButtonOk('svg.newAnimState("'+element.id+'", this.previousElementSibling.previousElementSibling.previousElementSibling.value, this.previousElementSibling.previousElementSibling.value != "" ? this.previousElementSibling.previousElementSibling.value : this.previousElementSibling.value);');
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroNewAnimationGroup = function(target) {
	this.reset();
	
	var options = [];
	
	for(var i in svg.animationStates) {
		options.push({ 'text': i, 'value': i });
	}
	if(options.length == 0) { return; }
	
	this.add(build.select(options));
	
	this.addButtonOk('svg.newAnimGroup(this.previousElementSibling.value);');
	this.addButtonCancel();
	
	this.show(target);
}

popup.prototype.macroSlider = function(target, value, attributes, actionYes, actionNo, hasNumericInput) {
	this.reset();
	
	if(hasNumericInput) {
		if(attributes.onchange) { attributes.onchange = 'this.nextElementSibling.value = this.value;' + attributes.onchange; }
		if(attributes.onmousemove) { attributes.onmousemove = 'this.nextElementSibling.value = this.value;' + attributes.onmousemove; }
	}
			
	this.add(build.input('range', value, attributes));
	
	if(hasNumericInput) {
		var attrInput = { 'onchange': 'this.previousElementSibling.value = this.value;' }
		if(attributes.onchange) { attrInput.onchange += attributes.onchange; }			
		if(attributes && attributes.min) { attrInput.min = attributes.min; }
		if(attributes && attributes.max) { attrInput.max = attributes.max; }
		if(attributes && attributes.step) { attrInput.min = attributes.step; }
		
		this.add(build.input('number', value, attrInput)).focus();
	}
	
	this.addButtonOk(actionYes);
	this.addButtonCancel(actionNo);
	
	this.show(target);
}

popup.prototype.rotate = function(target) {
	this.reset();
	
	var element = document.getElementById(target.id);
	
	var rotation = element.getTransformBase().decompose().rotation || 0;
	
	this.macroSlider(target, rotation, { 'min': '-360', 'max': '360', 'step': '1',
		'onchange': 'var val=parseFloat(this.value);var el=document.getElementById("'+target.id+'");svg.rotateTo(el, val);',
		'onmousemove': 'var val=parseFloat(this.value);var el=document.getElementById("'+target.id+'");svg.rotateTo(el, val);' },
		'svg.select();', 'var el=document.getElementById("'+target.id+'");svg.rotateTo(el, '+rotation+');', true);
	
	this.show(target);
}

popup.prototype.scale = function(target) {
	this.reset();
	
	var element = document.getElementById(target.id);
	
	var scaleX = element.getTransformBase().decompose().scaleX || 1;
	var scaleY = element.getTransformBase().decompose().scaleY || 1;
	
	this.macroSlider(target, scaleX*100, { 'min': 1, 'max': 200, 'step': '1',
		'onchange': 'var val=parseFloat(this.value);var el=document.getElementById("'+target.id+'");svg.scaleTo(el, val/100);',
		'onmousemove': 'var val=parseFloat(this.value);var el=document.getElementById("'+target.id+'");svg.scaleTo(el, val/100);' },
		null, 'var el=document.getElementById("'+target.id+'");svg.scaleTo(el, '+scaleX+', '+scaleY+');', true);
	
	this.show(target);
}