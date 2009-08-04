/**
 * ansiWeb - an ANSI graphics editor based on web technologies
 * http://ansi.drastic.net/
 *
 * Copyright 2009 Thomas Kombüchen, Björn Odendahl
 * 
 * ansiWeb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ansiWeb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ansiWeb.  If not, see <http://www.gnu.org/licenses/>.
 */
ansiWeb = function() {	

	this.rgba = function(rr,gg,bb,aa)
	{
		this.r=rr;
		this.g=gg;
		this.b=bb;
		this.a=aa;

		this.getRGBString = function()
		{
			return 'rgb('+this.r+','+this.g+','+this.b+')';
		}

		this.getRGBAString = function()
		{
			return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
		}
	}  

	this.vec2 = function()
	{
		this.x = 0;
		this.y = 0;
	}

	this.achar = function()
	{
		this.chr	= 32;
		this.bg		=  0;
		this.color	=  7;
		
		this.getData = function()
		{
			return this.chr+','+this.bg+','+this.color
		}
	}

	this.aFont = function()
	{
		this.image  = null;
		this.width  = 0;
		this.height = 0;

		this.init = function(src, width, height, callbackObject)
		{
			this.image = $(new Image()).load(function() { callbackObject.checkPreload() }).attr('src', src).get(0);
			this.width = width;
			this.height = height;
		}
	}

	this.aCanvas = function()
	{
		this.colors = new Array();

		this.canvas			= null;
		this.canvasContext	= null;

		this.blockCanvas	= null;

		/**
		 * Font object
		 */
		this.font = null;

		/**
		 * Actual height (lines) of ANSI
		 */
		this.ansiHeight	= 0;

		this.init = function(htmlCanvasObject)
		{
			this.canvas = htmlCanvasObject;
			this.canvasContext = this.canvas.getContext('2d');
			this.clear();
		}

		this.setFont = function(font)
		{
			this.font = font;
		}

		this.setColors = function(colors)
		{
			this.colors = colors;
		}

		/**
		 * Copies given block from canvas to temporary block memory
		 * @param	{Integer}	x	x coordinate of block
		 * @param	{Integer}	y	y coordinate of block
		 * @param	{Integer}	w	width of block
		 * @param	{Integer}	h	height of block
		 * @return	void
		 */		
		this.copyBlock = function(x, y, w, h)
		{
			var width = w * this.font.width;
			var height = h * this.font.height;
			this.blockCanvas = $('<canvas width="'+width+'" height="'+height+'"></canvas>').get(0);
			var context = this.blockCanvas.getContext('2d');
			context.drawImage(this.canvas, x * this.font.width, y * this.font.height , width, height, 0, 0, width, height);
		}

		/**
		 * Pastes saved block to canvas at given coordinates
		 * @param	{Integer}	x	x coordinate to paste block to
		 * @param	{Integer}	y	y coordinate to paste block to
		 * @return	void
		 */		
		this.pasteBlock = function(x, y)
		{
			var width = this.blockCanvas.width;
			var height = this.blockCanvas.height;
			this.canvasContext.drawImage(this.blockCanvas, 0, 0, width, height, x * this.font.width, y * this.font.height, width, height);
		}

		/**
		 * Shifts columns left or right at cursor position, depending on direction
		 * @param	{Integer}	x			cursor x position
		 * @param	{Integer}	direction	1 for right, -1 for left
		 * @param	{Integer}	blank		number of column to blank
		 * @return	void
		 */		
		this.shiftColumns = function(x, direction, blank)
		{
			var shiftStart = x;
			var width = this.canvas.width - (x * this.font.width);
			var blockWidth = width;
			var height = this.ansiHeight * this.font.height;
			if (direction == -1) {
				shiftStart++;
				blockWidth -= this.font.width;
			}
			var tempCanvas = $('<canvas width="'+width+'" height="'+height+'"></canvas>').get(0);
			var tempCanvasContext = tempCanvas.getContext('2d');
			tempCanvasContext.drawImage(this.canvas, shiftStart * this.font.width, 0, blockWidth, height, 0, 0, blockWidth, height);
			this.canvasContext.fillRect(blank * this.font.width, 0, this.font.width, height);
			this.canvasContext.drawImage(tempCanvas, 0, 0, width, height, (shiftStart + direction) * this.font.width, 0, width, height);
		}

		/**
		 * Shifts rows up or down at cursor position, depending on direction
		 * @param	{Integer}	y			cursor y position
		 * @param	{Integer}	direction	1 for down, -1 for up
		 * @param	{Integer}	blank		number of row to blank
		 * @return	void
		 */		
		this.shiftRows = function(y, direction, blank)
		{
			var shiftStart = y;
			var width = this.canvas.width;
			var height = (this.ansiHeight - y) * this.font.height;
			var blockHeight = height;
			if (direction == -1) {
				shiftStart++;
				blockHeight -= this.font.height;
			}
			var tempCanvas = $('<canvas width="'+width+'" height="'+height+'"></canvas>').get(0);
			var tempCanvasContext = tempCanvas.getContext('2d');

			tempCanvasContext.drawImage(this.canvas, 0, shiftStart * this.font.height, width, blockHeight, 0, 0, width, blockHeight);
			this.canvasContext.fillRect( 0, blank * this.font.height, width, this.font.height);
			this.canvasContext.drawImage(tempCanvas, 0, 0, width, height, 0, (shiftStart + direction) * this.font.height, width, height);
		}

		/**
		 * Redraws the entire ANSI
		 * @param	{Array}		data	Array of achars
		 * @return	void
		 */
		this.draw = function(data) 
		{
			var width = this.canvas.width / this.font.width;

			for(var i=0; i < data.length && Math.floor(i / width) < this.ansiHeight; i++) {
				this.drawCharacter(i % width, Math.floor(i / width), data[i]);
			}
		}

		/**
		 * draws the characters of the specified block
		 *
		 * @param	{Integer}	x		x position start of block
		 * @param	{Integer}	y		y position start of block
		 * @param	{Integer}	w		width of block in columns
		 * @param	{Integer}	h		height of block in rows
		 * @param	{Array}		data	Array of achar objects of characters to draw
		 * @return	void
		 */		
		this.drawBlock = function(x, y, w, h, data)
		{
			var myData = data.slice();
			for (var cx = 0; cx < w; cx++) {
				for (cy = 0; cy < h; cy++) {
					this.drawCharacter(x + cx, y + cy, myData.shift());
				}
			}
		}

		/**
		 * draws the character at the given position
		 * @param	{Integer}	x		character x position
		 * @param	{Integer}	y		character y position
		 * @param	{Integer}	achar	achar object of character to draw
		 * @return	void
		 */
		this.drawCharacter = function(x, y, achar)
		{
			try {
				// background color
				if (achar.bg >= 0) {
					this.canvasContext.fillStyle = this.colors[achar.bg].getRGBString();
					this.canvasContext.fillRect(x * this.font.width,
													y * this.font.height,
													this.font.width,
													this.font.height);
				}
		
				// character color and character
				if (achar.chr != 32) {
					this.canvasContext.drawImage(this.font.image,
													achar.chr * this.font.width,
													achar.color * this.font.height,
													this.font.width,
													this.font.height,
													x * this.font.width,
													y * this.font.height,
													this.font.width,
													this.font.height);
				}
			} catch(e) {
			}

			this.ansiHeight = Math.max(this.ansiHeight, (y+1));
		}

		/**
		 * Clears the canvas
		 * @return	void
		 */
		this.clear = function()
		{
			this.canvasContext.fillStyle = 'rgb(0,0,0)';
			this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}

	/**
	 * Various key constants
	 */
	this.KEY_BACKSPACE	=   8;
	this.KEY_TAB		=   9;
	this.KEY_RETURN		=  13;
	this.KEY_SHIFT		=  16;
	this.KEY_CTRL		=  17;
	this.KEY_ALT		=  18;
	this.KEY_ESC		=  27;
	this.KEY_PAGEUP		=  33;
	this.KEY_PAGEDOWN	=  34;
	this.KEY_END		=  35;
	this.KEY_HOME		=  36;
	this.KEY_LEFT		=  37;
	this.KEY_RIGHT		=  39;
	this.KEY_UP			=  38;
	this.KEY_DOWN		=  40;
	this.KEY_F1			= 112;
	this.KEY_F2			= 113;
	this.KEY_F3			= 114;
	this.KEY_F4			= 115;
	this.KEY_F5			= 116;
	this.KEY_F6			= 117;
	this.KEY_F7			= 118;
	this.KEY_F8			= 119;
	this.KEY_F9			= 120;
	this.KEY_F10		= 121;

	/**
	 * Shift key down
	 */
	this.shiftDown	= false;

	/**
	 * Edit mode constants
	 */
	this.MODE_EDIT				= 0;
	this.MODE_BLOCK_FILL_SELECT	= 1;
	this.MODE_BLOCK_FILL		= 2;
	this.MODE_BLOCK_EDIT		= 3;
	this.MODE_BLOCK_MOVE		= 4;
	this.MODE_BLOCK_MOVE_MOVE	= 5;
	this.MODE_BLOCK_COPY		= 6;

	/**
	 * Current edit mode
	 */
	this.mode		= this.MODE_EDIT;

	/**
	 * ANSI color definitions
	 */
	this.colors = new Array(
		new this.rgba(0,0,0,1),
		new this.rgba(0,0,171,1),
		new this.rgba(0,171,0,1),
		new this.rgba(0,171,171,1),
		new this.rgba(171,0,0,1),
		new this.rgba(171,0,171,1),
		new this.rgba(171,87,0,1),
		new this.rgba(171,171,171,1),
		new this.rgba(87,87,87,1),
		new this.rgba(87,87,255,1),
		new this.rgba(87,255,87,1),
		new this.rgba(87,255,255,1),
		new this.rgba(255,87,87,1),
		new this.rgba(255,87,255,1),
		new this.rgba(255,255,87,1),
		new this.rgba(255,255,255,1)
	);

	/**
	 * Current character (foreground) color
	 */
	this.charColor			= 7;

	/**
	 * Current background color
	 */
	this.backgroundColor	= 0;

	/**
	 * Number of available background colors
	 *
	 * Standard ANSI only allows the first 8
	 * colors as background colors as usage
	 * of "colors" 8-15 will turn on BLINK
	 * instead. However, setting this to 16
	 * will enable what is commonly known as
	 * iCE color, allowing the use of the
	 * upper colors as background color,
	 * disabling character blinking.
	 */
	this.numBackgroundColors = 8;

	/**
	 * Special character set definitions
	 */
	this.specialCharacterSets = new Array(
		new Array(0xDA, 0xBF, 0xC0, 0xD9, 0xC4, 0xB3, 0xC3, 0xB4, 0xC1, 0xC2),
		new Array(0xC9, 0xBB, 0xC8, 0xBC, 0xCD, 0xBA, 0xCC, 0xB9, 0xCA, 0xCB),
		new Array(0xD5, 0xB8, 0xD4, 0xBE, 0xCD, 0xB3, 0xC6, 0xB5, 0xCF, 0xD1),
		new Array(0xD6, 0xB7, 0xD3, 0xBD, 0xC4, 0xBA, 0xC7, 0xB6, 0xD0, 0xD2),
		new Array(0xC5, 0xCE, 0xD8, 0xD7, 0xE8, 0xE9, 0x9B, 0x9C, 0x99, 0xEF),
		new Array(0xB0, 0xB1, 0xB2, 0xDB, 0xDF, 0xDC, 0xDD, 0xDE, 0xFE, 0xFA),
		new Array(0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0xF0, 0x7F, 0x0E, 0x0F),
		new Array(0x18, 0x19, 0x1E, 0x1F, 0x10, 0x11, 0x12, 0x1D, 0x14, 0x15),
		new Array(0xAE, 0xAF, 0xF2, 0xF3, 0xA9, 0xAA, 0xFD, 0xF6, 0xAB, 0xAC),
		new Array(0xE3, 0xF1, 0xF4, 0xF5, 0xEA, 0x9D, 0xE4, 0xF8, 0xFB, 0xFC),
		new Array(0xE0, 0xE1, 0xE2, 0xE5, 0xE6, 0xE7, 0xEB, 0xEC, 0xED, 0xEE),
		new Array(0x80, 0x87, 0xA5, 0xA4, 0x98, 0x9F, 0xF7, 0xF9, 0xAD, 0xA8),
		new Array(0x83, 0x84, 0x85, 0xA0, 0xA6, 0x86, 0x8E, 0x8F, 0x91, 0x92),
		new Array(0x88, 0x89, 0x8A, 0x82, 0x90, 0x8C, 0x8B, 0x8D, 0xA1, 0x9E),
		new Array(0x93, 0x94, 0x95, 0xA2, 0xA7, 0x96, 0x81, 0x97, 0xA3, 0x9A)
	);

	/**
	 * Current special character set
	 */
	this.currentset = 5;

	/**
	 * Length of a row in characters
	 */
	this.columns	= 80;

	/**
	 * Maximum number of rows
	 */
	this.rows		= 1000;

	/**
	 * Width of a tab
	 */
	this.tabWidth = 8;

	/**
	 * Display height (characters) of drawing area
	 */
	this.height		= 25;

	/**
	 * Display width (characters) of drawing area
	 */
	this.width		= 80;

	/**
	 * Scroll offset (lines) of drawing area
	 */
	this.scroll		= 0;

	/**
	 * Actual height (lines) of ANSI
	 */
	this.ansiHeight	= 0;

	/**
	 * ANSI ID
	 */
	this.ansiId		= -1;

	/**
	 * true if data was set
	 */	
	this.dataSet	= false;

	/**
	 * Array of achar, holding the ANSI data
	 */	
	this.data		= new Array(this.rows * this.columns);

	/**
	 * Current cursor position (relative to scroll offset)
	 */	
 	this.cursorPos	= new this.vec2();

	/**
	 * Cursor position at which Shift key was pressed (relative to scroll offset)
	 */		
	this.shiftPos	= new this.vec2();	

	/**
	 * Marked block position (relative to scroll offset)
	 */			
	this.blockPos	= new this.vec2();

	/**
	 * Marked block size
	 */			
	this.blockSize	= new this.vec2();

	/**
	 * Marked block data
	 */				
	this.blockData	= new Array(1*1);

	this.blockInput = false;

	this.mainCanvas				= null;
	this.previewCanvas			= null;

	this.baseElement			= null;
	this.cursorPositionText		= null;
	this.keysetCanvas			= null;
	this.keysetCanvasContext	= null;
	this.colorSelectorElement	= null;
	this.statusElement			= null;

	this.mainCanvasContainer	= null;
	this.mainCanvasElement		= null;
	this.previewCanvasContainer	= null;
	this.previewCanvasElement	= null;

	this.cursorElement			= null;
	this.blockMarkerElement		= null;
	this.previewAreaElememt		= null;

	this.helpScreen				= null;

	this.fonts = new Array(new Array(new this.aFont(), new this.aFont()));
	this.preloadCounter = 0;

	this.operaRepeatCounter = 0;
	this.operaRepeatEvent = null;

	this.init = function(type) {

		me = this;
		switch (type) {
			case 'amiga':
				this.fonts[0][0].init('images/font_amiga.png', 8, 11, me);
				this.fonts[0][1].init('images/font_amiga_preview.png', 2, 3, me);
				break;
			case 'ansi':
			default:
				this.fonts.push(new Array(new this.aFont, new this.aFont()));
				this.fonts[0][0].init('images/font_pc_80x25.png', 9, 16, me);
				this.fonts[0][1].init('images/font_pc_80x25_preview.png', 2, 4, me);
				this.fonts[1][0].init('images/font_pc_80x50.png', 9, 8, me);
				this.fonts[1][1].init('images/font_pc_80x50_preview.png', 2, 2, me);
				break;
		}
	}

	this.checkPreload = function()
	{
		this.preloadCounter++;
		if (this.preloadCounter == (this.fonts.length * 2)) {
			this.run();
		}
	}

	/**
	* Initializes the editor
	* @return	void
	*/
	this.run = function()
	{
		var canvasTest = $('<canvas></canvas>');
		if (!canvasTest.get(0) || !canvasTest.get(0).getContext) {
			alert('Sorry, your browser does not support the Canvas element and is therefore currently not supported by ansiWeb.');
			return;
		}

		me = this;
		
		this.baseElement = $('#ansiweb'+this.ansiId);
		var header = $('<div class="header"></div>').appendTo(this.baseElement);
		var nav = $('<div class="editnav"></div>').appendTo(header);

		this.saveButton = $('<a href="#ansiweb'+this.ansiId+'"> save </a>').appendTo(nav);
		this.saveButton.click(function() { me.save(); });
		el = $('<a href="#ansiweb'+this.ansiId+'"> - </a>').appendTo(nav);
		el.click(function() { me.resizeCanvas(-16*4); });
		el = $('<a href="#ansiweb'+this.ansiId+'"> + </a>').appendTo(nav);
		el.click(function() { me.resizeCanvas(16*4); });
		el = $('<a href="#ansiweb'+this.ansiId+'"> help </a>').appendTo(nav);
		el.click(function() { me.toggleHelp(); });
		
		var keys = $('<div></div>').appendTo(header);
		this.cursorPositionText = $('<span>pos:</span>').appendTo(keys);
		var sets = $('<canvas width="500" height="16"></canvas>').appendTo(keys);
		this.keysetCanvas = sets.get(0);
		this.keysetCanvasContext = this.keysetCanvas.getContext('2d');
		this.colorSelectorElement = $('<div class="colorselectors"></div>').appendTo(header);
		$('<span>colors: </span>').appendTo(this.colorSelectorElement);
		this.statusElement = $('<div class="editstatus"></div>').appendTo(header);

		this.mainCanvasContainer = $('<div class="maincanvascontainer"></div>').appendTo(this.baseElement);

		this.mainCanvasElement = $('<canvas class="maincanvas" width="'+this.columns * this.fonts[0][0].width+'" height="'+this.rows * this.fonts[0][0].height+'"></canvas>').appendTo(this.mainCanvasContainer);
		this.mainCanvas = new this.aCanvas();
		this.mainCanvas.init(this.mainCanvasElement.get(0));
		this.mainCanvas.setFont(this.fonts[0][0]);
		this.mainCanvas.setColors(this.colors);

		this.previewCanvasContainer = $('<div class="previewcanvascontainer"></div>').appendTo(this.baseElement);
		this.previewCanvasElement = $('<canvas class="previewcanvas" width="'+this.columns * this.fonts[0][1].width+'" height="'+this.rows * this.fonts[0][1].height+'"></canvas>').appendTo(this.previewCanvasContainer);
		this.previewCanvas = new this.aCanvas();
		this.previewCanvas.init(this.previewCanvasElement.get(0));
		this.previewCanvas.setFont(this.fonts[0][1]);
		this.previewCanvas.setColors(this.colors);

		this.helpScreen = $('.ansiwebhelp');
		var offset = this.mainCanvasContainer.offset();
		this.helpScreen.css({
			'top' : offset.top,
			'left' : offset.left,
			'width' : parseInt(this.mainCanvasContainer.css('width')) - parseInt(this.helpScreen.css('padding-left')) - parseInt(this.helpScreen.css('padding-right')),
			'height' : parseInt(this.mainCanvasContainer.css('height')) - parseInt(this.helpScreen.css('padding-top')) - parseInt(this.helpScreen.css('padding-bottom'))
		});

		this.setupCursorMarker();
		this.setupPreviewFrameMarker();
		this.shiftPos.x = -1;
		this.blockMarkerElement = $('<div class="blockmarker"></div>').appendTo(this.mainCanvasContainer);
		this.updateBlockMarker();

		if (this.dataSet) {
			this.mainCanvas.ansiHeight = this.ansiHeight;
			this.previewCanvas.ansiHeight = this.ansiHeight;
			this.mainCanvas.draw(this.data);
			this.previewCanvas.draw(this.data);
		} else {
			for (var i = 0; i < this.data.length; i++) {
				this.data[i] = new this.achar();
			}
		}

		this.setupColorSelector();
		this.redrawKeys();
		this.resizeCanvas(0);
		this.testCursorValid();
		this.adjustCursorMarker();

		$(document).keyup(function(e) {me.onKeyUp(e);});
		$(document).keypress(function(e) {return me.onKeyPress(e);});
		$(document).keydown(function(e) {return me.onKeyDown(e);});
	}

	/**
	 * Creates the color selector elements
	 * @return	void
	 */
	this.setupColorSelector = function()
	{
		me = this;
		for(var i = 0; i < 16; i++) {
			var el = $('<a class="charcolor"></a>').appendTo(this.colorSelectorElement);
			el.css({'background-color' : this.colors[i].getRGBString()});
			el.attr('colorvalue', i);
			el.click(function() { me.setCharColor($(this).attr('colorvalue')); });
		}
		this.setCharColor(this.charColor);
		$('<span> bg: </span>').appendTo(this.colorSelectorElement);
		for(var i = 0; i < this.numBackgroundColors; i++) {
			var el = $('<a class="backgroundcolor"></a>').appendTo(this.colorSelectorElement);
			el.css({'background-color' :  this.colors[i].getRGBString()});
			el.attr('colorvalue', i);
			el.click(function() { me.setBackgroundColor($(this).attr('colorvalue')); });
		}
		this.setBackgroundColor(this.backgroundColor);
	}

	this.setupPreviewFrameMarker = function()
	{
		var offset = this.previewCanvasElement.offset();

		this.previewAreaElement = $('<div class="previewarea"></div>').appendTo(this.baseElement);
		this.previewAreaElement.css({	'position' : 'absolute', 
					'top' : offset.top + (this.scroll * this.previewCanvas.font.height) - parseInt(this.previewAreaElement.css('borderTopWidth')),
					'left' : offset.left - parseInt(this.previewAreaElement.css('border-left-width')),
					'width' : (this.width * this.previewCanvas.font.width),
					'height' : (this.height * this.previewCanvas.font.height)});
	}

	this.adjustPreviewFrameMarker = function()
	{
		this.previewCanvasElement.css({'top' : -Math.max((this.height + this.scroll) * this.previewCanvas.font.height - this.previewCanvasContainer.height(),0)});

		var offset = this.previewCanvasElement.offset();

		this.previewAreaElement.css({
			'top' : offset.top + (this.scroll * this.previewCanvas.font.height) - parseInt(this.previewAreaElement.css('borderTopWidth')),
			'left' : offset.left - parseInt(this.previewAreaElement.css('border-left-width')),
			'width' : (this.width * this.previewCanvas.font.width),
			'height' : (this.height * this.previewCanvas.font.height)});
	}

	this.setupCursorMarker = function()
	{
		this.cursorElement = $('<div class="cursor"></div>').appendTo(this.baseElement);
		this.cursorElement.css({	'position' : 'absolute', 
					'width' : this.mainCanvas.font.width,
					'height' : this.mainCanvas.font.height});

		this.adjustCursorMarker();
	}

	this.adjustCursorMarker = function()
	{
		var offset = this.mainCanvasContainer.offset();

		this.cursorElement.css({
			'top' : offset.top + ((this.cursorPos.y) * this.mainCanvas.font.height) - parseInt(this.cursorElement.css('borderTopWidth')),
			'left' : offset.left + (this.cursorPos.x * this.mainCanvas.font.width) - parseInt(this.cursorElement.css('border-left-width')),
			'width' : this.mainCanvas.font.width,
			'height' : this.mainCanvas.font.height});
	}

	/* 
	 * /--------------------------\
	 * 
	 *   Keyboard event handlers
	 * 
	 * \--------------------------/
	 */

	/**
	 * Handles actions of special key events
	 * @return	void
	 */		
	this.onSpecialKey = function(evt)
	{
		switch(evt.keyCode) {
			case this.KEY_SHIFT:
				if(!this.shiftDown) {
					this.shiftPos.x = this.cursorPos.x;
					this.shiftPos.y = this.cursorPos.y;
				}
				this.shiftDown = true;
				break;

			case this.KEY_ESC:
				this.mode = 0;
				this.setStatus('');
				this.shiftPos.x = -1;
				this.updateBlockMarker();
				break;

			case this.KEY_LEFT:
				if (evt.altKey) {
					this.deleteColumn();
					window.onbeforeunload = function() { return 'key right'; }
				} else if (evt.ctrlKey) {
					this.decCharColor();
				} else {
					this.cursorPos.x--;
					if (this.shiftDown) {
						this.updateBlockMarker();
					}
				}
				break;

			case this.KEY_RIGHT:
				if (evt.altKey) {
					this.insertColumn();
				} else if (evt.ctrlKey) {
					this.incCharColor();
				} else {
					this.cursorPos.x++;
					if (this.shiftDown) {
						this.updateBlockMarker();
					}
				}
				break;

			case this.KEY_UP:
				if (evt.ctrlKey) {
					this.incBackgroundColor();
				} else {
					this.cursorPos.y--;
					if (this.shiftDown) {
						this.updateBlockMarker();
					}
				}
				break;

			case this.KEY_DOWN:
				if (evt.ctrlKey) {
					this.decBackgroundColor();
				} else {
					this.cursorPos.y++;
					if (this.shiftDown) {
						this.updateBlockMarker();
					}
				}
				break;
			
			case this.KEY_TAB:
				this.cursorPos.x += this.tabWidth;
				if (this.shiftDown) {
					this.updateBlockMarker();
					// this.cursorPos.x -= this.tabWidth; // SHIFT + Tab is actually supposed to tab backwards
				}
				break;
			
			case this.KEY_BACKSPACE:
				this.cursorPos.x--;
				this.data[this.cursorPos.x + this.cursorPos.y * this.width] = new this.achar();			
				break;
			
			case this.KEY_HOME:
				this.cursorPos.x = 0;
				break;

			case this.KEY_END:
				this.cursorPos.x = this.width-1;
				break;
			
			case this.KEY_RETURN:
				this.cursorPos.x = 0;
				this.cursorPos.y++;
				break;
			
			case this.KEY_PAGEDOWN:
				this.scroll += this.height;
				if ((this.scroll + this.cursorPos.y) >= this.rows) {
					this.scroll = this.rows - this.height;
					this.cursorPos.y = this.height - 1;
				}
				me = this;
				this.mainCanvasElement.animate(
					{top:(me.scroll)*-me.mainCanvas.font.height}, 150, 'swing',
					function(){$('#'+me.blockMarkerId).css({'marginTop' : -me.scroll * me.mainCanvas.font.height});}
				);

				this.testCursorValid();
				this.adjustCursorMarker();
				this.adjustPreviewFrameMarker();
				break;

			case this.KEY_PAGEUP:
				this.scroll -= this.height;
				if (this.scroll < 0) {
					this.scroll = 0;
					this.cursorPos.y = 0;
				}
				me = this;				
				this.mainCanvasElement.animate(
					{top:(me.scroll)*-me.mainCanvas.font.height}, 150 , 'swing',
					function(){$('#'+me.blockMarkerId).css({'marginTop' : -me.scroll * me.mainCanvas.font.height});}
				  );
				
				this.testCursorValid();
				this.adjustCursorMarker();
				this.adjustPreviewFrameMarker();
				break;

			default:
				if (evt.keyCode >= this.KEY_F1 && evt.keyCode <= this.KEY_F10) {
					if (evt.altKey) {
						this.currentset = evt.keyCode - this.KEY_F1;
						this.redrawKeys();
					} else if (evt.ctrlKey && evt.keyCode <= this.KEY_F5) {
						this.currentset = (evt.keyCode - this.KEY_F1 + 10);
						this.redrawKeys();
					} else if (!evt.ctrlKey) {
						this.insertChar(evt.keyCode - this.KEY_F1);
					}
					// no idea how else to stop Safari from reloading (on F5)
					// or Chrome or Safari from closing the window (ALT/CTRL + F4)
					window.onbeforeunload = function() { return 'Unfortunately your browser won\'t allow Javascript to suppress the default action triggered by this function key and is attempting to leave the page. If you allow it to do so, all changes will be lost.'; }
				} else {
					// reset of onbeforeunload text; could be linked to a status flag so it will only be triggered if there are _unsaved_ changes
					window.onbeforeunload = function() { return 'Your browser is attempting to leave the page. If you allow it to do so, all changes will be lost.'; }
				}
		}
	}

	/**
	 * Evaluates keyup events
	 * @return	boolean
	 */		
	this.onKeyUp = function(evt)
	{
		if (this.blockInput) {
			return;
		}
		if (evt.keyCode == this.KEY_SHIFT) {
			this.shiftDown = false;
			if (this.shiftPos.x != this.cursorPos.x || this.shiftPos.y != this.cursorPos.y) {
				this.setMode(this.MODE_BLOCK_EDIT);
			}
		}

		if (this.operaRepeatEvent) {
			this.operaRepeatEvent = null;
		}
	}

	/**
	 * Evaluates keydown events
	 * @return	boolean
	 */		
	this.onKeyDown = function(evt)
	{
		if (this.blockInput && !((evt.altKey || evt.ctrlKey) && String.fromCharCode(evt.keyCode) == 'H')) {
			return false;
		}

		var handled = true;

		switch(evt.keyCode)
		{
			case this.KEY_SHIFT:
			case this.KEY_ALT:
			case this.KEY_CTRL:
			case this.KEY_ESC:
			case this.KEY_LEFT:
			case this.KEY_RIGHT:
			case this.KEY_UP:
			case this.KEY_DOWN:
			case this.KEY_TAB:
			case this.KEY_BACKSPACE:
			case this.KEY_HOME:
			case this.KEY_END:
			case this.KEY_RETURN:
			case this.KEY_PAGEDOWN:
			case this.KEY_PAGEUP:
			case this.KEY_F1:
			case this.KEY_F2:
			case this.KEY_F3:
			case this.KEY_F4:
			case this.KEY_F5:
			case this.KEY_F6:
			case this.KEY_F7:
			case this.KEY_F8:
			case this.KEY_F9:
			case this.KEY_F10:
			case this.KEY_F11:
			case this.KEY_F12:
				this.onSpecialKey(evt);
				break;

			default:
				var key = String.fromCharCode(evt.keyCode);

				switch (this.mode) {
					case this.MODE_BLOCK_EDIT:
						switch (key) {
							case 'C':
								this.setMode(this.MODE_BLOCK_COPY);
								this.setMode(this.MODE_BLOCK_MOVE_MOVE);
								break;
							case 'E':
								this.blockErase();
								break;
							case 'F':
								this.setMode(this.MODE_BLOCK_FILL_SELECT);
								break;
							case 'M':
								this.setMode(this.MODE_BLOCK_MOVE);
								this.setMode(this.MODE_BLOCK_MOVE_MOVE);
								break;
						}
						break;

					case this.MODE_BLOCK_MOVE_MOVE:
						switch (key) {
							case 'P': this.pasteBlockData(this.cursorPos.x, this.cursorPos.y); break;
						}
						break;

					case this.MODE_BLOCK_FILL_SELECT:
						switch (key) {
							case 'C': this.setMode(this.MODE_BLOCK_FILL); break;
							case 'F': this.blockFillCharColor(); break;
							case 'K': this.blockFillBackgroundColor(); break;
						}
						break;

					case this.MODE_BLOCK_FILL:
						blockFillChar(charCode);
						break;

					case this.MODE_EDIT:
						if (evt.altKey || evt.ctrlKey) {
							switch (key) {
								case '1':
								case '2':
								case '3':
								case '4':
								case '5':
								case '6':
								case '7':
								case '8':
								case '9': this.currentset = evt.keyCode - 49; this.redrawKeys(); break;
								case '0': this.currentset = 9; this.redrawKeys(); break;
								case 'A': break; // color menu (?obsolete?)
								case 'B': break; // block commands
								case 'C': this.clearScreen(); break;
								case 'D': break; // sauce screen
								case 'E': break; // switch canvas
								case 'F': this.deleteColumn(); break; // alternative for ALT+Cursor Left
								case 'G': this.insertColumn(); break; // alternative for ALT+Cursor Right
								case 'H': this.toggleHelp(); break;
								case 'I': this.insertLine(); break;
								case 'L': break; // load screen
								case 'M': this.toggleLineMode(); break;
								case 'O': break; // config screen
		//						case 'R': break; // block restore
								case 'R': this.mainCanvas.draw(this.data); this.previewCanvas.draw(this.data); break; // for debug purposes, ALT+R is redraw for now
								case 'S': break; // save screen
								case 'T': break; // tab setup
								case 'U': this.pickupColor(); break;
								case 'V': break; // switch vga viewing mode (?obsolete?)
								case 'X': break; // exit ;)
								case 'Y': this.deleteLine(); break;
								case 'Z': break; // toggle blinking/iCE color
							} 
						} else {
							handled = false;
						}
				}
		}

		this.testCursorValid();
		this.adjustCursorMarker();

		if (handled) {
			this.operaRepeatCounter = 0;
			this.operaRepeatEvent = evt;
			evt.cancelBubble = true;
			if (evt.stopPropagation) {
				evt.stopPropagation();
				evt.preventDefault();
			}
		} else {
			this.operaRepeatEvent = null;
		}
		return (!handled);
	}

	/**
	 * Evaluates keypress events
	 * @return	boolean
	 */		
	this.onKeyPress = function(evt)
	{
		if (this.blockInput) {
			return false;
		}

		var charCode = evt.which;

		if (charCode == 0 || this.mode != this.MODE_EDIT || evt.altKey) {
			return false;
		}

		if (this.operaRepeatEvent) {
			if (this.operaRepeatCounter) {
				this.onSpecialKey(this.operaRepeatEvent);
				this.testCursorValid();
				this.adjustCursorMarker();
			}
			this.operaRepeatCounter++;			
			return false;
		}

		var position = (this.cursorPos.y + this.scroll) * this.columns + this.cursorPos.x;
		this.data[position].chr	= charCode;
		this.data[position].bg	= this.backgroundColor;
		this.data[position].color= this.charColor;
		this.mainCanvas.drawCharacter(this.cursorPos.x, (this.cursorPos.y + this.scroll), this.data[position]);
		this.previewCanvas.drawCharacter(this.cursorPos.x, (this.cursorPos.y + this.scroll), this.data[position]);
		this.cursorPos.x++;
		this.ansiHeight = Math.max(this.ansiHeight, (this.cursorPos.y + this.scroll + 1));

		// make sure that block mode will not be triggered
		// when a character is entered that required the shift key
		if (this.shiftDown) {
			this.shiftPos.x++;
		}

		this.testCursorValid();
		this.adjustCursorMarker();
		return false;
	} 

	/* 
	 * /--------------------------\
	 * 
	 *   Color selection methods
	 * 
	 * \--------------------------/
	 */

	/**
	 * Sets the active background color
	 * @param	{Integer}	which	number of the color to be set to active background color (0-7, 0-15 respectively)
	 * @return	void
	 */
	this.setBackgroundColor = function(which)
	{
		var colors = this.colorSelectorElement.children('.backgroundcolor');
		colors.eq(this.backgroundColor).removeClass('selected');
		this.backgroundColor = which;
		colors.eq(this.backgroundColor).addClass('selected');
		this.redrawKeys();
	}

	/**
	 * Decreases the active background color
	 * @return	void
	 */
	this.decBackgroundColor = function() {
		this.setBackgroundColor((this.backgroundColor-1) & (this.numBackgroundColors-1));
	}

	/**
	 * Increases the active background color
	 * @return	void
	 */
	this.incBackgroundColor = function() {
		this.setBackgroundColor((this.backgroundColor+1) & (this.numBackgroundColors-1));
	}

	/**
	 * Sets the active character (foreground) color
	 * @param	{Integer}	which	number of the color to be set to active character color (0-15)
	 * @return	void
	 */
	this.setCharColor = function(which)
	{
		var colors = this.colorSelectorElement.children('.charcolor');
		colors.eq(this.charColor).removeClass('selected');
		this.charColor = which;
		colors.eq(this.charColor).addClass('selected');
		this.redrawKeys();
	}

	/**
	 * Decreases the active character (foreground) color
	 * @return	void
	 */
	this.decCharColor = function() {
		this.setCharColor((this.charColor-1) & 15);
	}

	/**
	 * Increases the active character (foreground) color
	 * @return	void
	 */
	this.incCharColor = function() {
		this.setCharColor((this.charColor+1) & 15);
	}

	/**
	 * Sets active character and background colors to those of the block beneath the cursor
	 * @return	void
	 */
	this.pickupColor = function() {
		var position = (this.cursorPos.y + this.scroll) * this.columns + this.cursorPos.x;
		this.setCharColor(this.data[position].color);
		this.setBackgroundColor(this.data[position].bg);
	}	

	/**
	 * Sets passed HTML code to status line
	 * @param	{String}	HTML code for status line
	 * @return	void
	 */
	this.setStatus = function(status)
	{
		this.statusElement.html(status);
	}

	/**
	* Sets editor mode
	* @param	{Integer}	numeric representation of editor modes (use MODE_* constants)
	* @return	void
	* @see		#MODE_EDIT
	* @see		#MODE_BLOCK_FILL_SELECT
	* @see		#MODE_BLOCK_FILL
	* @see		#MODE_BLOCK_EDIT
	* @see		#MODE_BLOCK_MOVE
	* @see		#MODE_BLOCK_MOVE_MOVE
	* @see		#MODE_BLOCK_COPY
	*/	
	this.setMode = function(mode)
	{
		switch(mode)
		{
			case this.MODE_BLOCK_EDIT:
				this.setStatus('<a onClick="setMode(BLOCK_EDIT_MOVE);" class="editstatusbutton">M move</a> / <a onClick="setMode(BLOCK_EDIT_COPY);" class="editstatusbutton">C copy</a> / <a onClick="blockErase();" class="editstatusbutton">E erase</a> / <a onClick="blockFill();" class="editstatusbutton">F fill</a> / ESC quit block edit');
				break;

			case this.MODE_BLOCK_FILL_SELECT:
				this.setStatus('c:char / f:foreground / k:back / esc quit block edit');
				break;

			case this.MODE_BLOCK_FILL:
				this.setStatus('type char to fill / esc quit block edit');
				break;

			case this.MODE_BLOCK_MOVE:
				this.setStatus('move cursor / flip: X, Y / esc quit block edit');
				this.copyBlockData();
				this.blockErase();
				break;
			
			case this.MODE_BLOCK_COPY:
				this.setStatus('move cursor / flip: X, Y / esc quit block edit');
				this.copyBlockData();
				break;
			
			case this.MODE_BLOCK_MOVE_MOVE:
				this.setStatus('move cursor / P paste / quit block edit');
				break;
			
		}
		this.mode = mode;
	}

	/**
	 * Clears screen and all ANSI data after issuing confirm dialog
	 * @return	void
	 */	
	this.clearScreen = function()
	{
		if (confirm('Do you really want to clear the screen?')) {
			this.mainCanvas.clear();
			this.previewCanvas.clear();
			// this does not only clear the screen, but also the ANSI data
			// is there anything else that needs to be set here for a clean slate?
			for (var i = 0; i < this.data.length; i++) {
				this.data[i] = new this.achar();
			}
			this.cursorPos	= new this.vec2();
			this.shiftPos	= new this.vec2();	
			this.blockPos	= new this.vec2();
			this.blockSize	= new this.vec2();
			this.adjustCursorMarker();
		}
	}

	/**
	 * Toggles between 25/50 line mode
	 * @return	void
	 */	
	this.toggleLineMode = function()
	{
		if (this.fonts.length == 2) {
			if (this.mainCanvas.font.height == 16) {
				this.mainCanvas.setFont(this.fonts[1][0]);
				this.previewCanvas.setFont(this.fonts[1][1]);
			} else {
				this.mainCanvas.setFont(this.fonts[0][0]);
				this.previewCanvas.setFont(this.fonts[0][1]);
			}
			this.mainCanvas.clear()
			this.mainCanvas.draw(this.data);
			this.previewCanvas.clear();
			this.previewCanvas.draw(this.data);
			this.redrawKeys();
			this.resizeCanvas(0);
		}
	}

	/**
	 * Sets ANSI ID
	 *
	 * @param	{Integer}	ID for the ANSI
	 * @return	void
	 */	
	this.setId = function(id)
	{
		this.ansiId = id;
	}

	/**
	 * Sets ANSI data for the editor
	 *
	 * ANSI data needs to be passed as integer triplets
	 * character code, background color, character color, 
	 * separated by comma
	 *
	 * @param	{String}	string with ANSI data
	 * @return	void
	 */	
	this.setData = function(arr)
	{
		this.dataSet = true;
		for(var i=0; i < this.data.length; i++) {
			this.data[i] = new this.achar();
		}

		for(var i=0; i < arr.length / 3; i++) {
			this.data[i].chr	= arr[i*3+0];
			this.data[i].bg		= arr[i*3+1];
			this.data[i].color	= arr[i*3+2];
		}

		this.ansiHeight = arr.length / 3 / this.columns;
	}

	/**
	 * Returns ANSI data
	 * @return	{String}	string with ANSI data
	 * @see		#setData	for format description
	 */	
	this.getData = function()
	{
		var ret = '';
		for (var i = 0; i < this.ansiHeight * this.columns; i++) {
			ret += this.data[i].getData()+',';
		}
		return ret;
	}

	this.resetSaveButton = function()
	{
		this.saveButton.html('save');
	}

	this.save = function()
	{
		this.saveButton.html('( saving... )');

		me = this;
		$.post('/ajax_saveansi/', {
			data: me.getData(),
			id: me.ansiId
		}, function() {
			me.saveButton.html('( saved \\o/ )');
			setTimeout('resetSaveButton();',2000);
		});
	}

	this.resizeCanvas = function(size)
	{
		var siz = this.mainCanvasContainer.css('height');
		siz = parseInt(siz.replace('px','')) + size;
		this.mainCanvasContainer.css({'height' : siz});
		this.height = Math.round(siz / this.mainCanvas.font.height);
	}

	/**
	 * Toggles visibility of help screen
	 *
	 * Note that while help screen is visible, all editor input is blocked.
	 * @return	void
	 */		
	this.toggleHelp = function()
	{
		if (this.helpScreen.css('display') != 'block') {
			this.helpScreen.css({'display' : 'block'});
			this.blockInput = true;
		} else {
			this.helpScreen.css({'display' : 'none'});
			this.blockInput = false;
		}
	}

	/**
	 * Inserts special character from current set at cursor position or fills block with it,
	 * depending on current mode
	 * @param	{Integer}	which	number of character of the current set to use
	 * @return	void
	 */		
	this.insertChar = function(which)
	{
		if (this.mode == this.MODE_BLOCK_FILL) {
			this.blockFillChar(this.specialCharacterSets[this.currentset][which]);
		} else if (this.mode == this.MODE_EDIT) {
			var position = (this.cursorPos.y + this.scroll) * this.columns + this.cursorPos.x;
			this.data[position].chr		= this.specialCharacterSets[this.currentset][which];
			this.data[position].color	= this.charColor;
			this.data[position].bg		= this.backgroundColor;
			this.mainCanvas.drawCharacter(this.cursorPos.x, (this.cursorPos.y + this.scroll), this.data[position]);
			this.previewCanvas.drawCharacter(this.cursorPos.x, (this.cursorPos.y + this.scroll), this.data[position]);
			this.cursorPos.x++;
			this.ansiHeight = Math.max(this.ansiHeight, (this.cursorPos.y + 1 + this.scroll));
		}
	}

	/**
	 * Ensures that the cursor stays within valid bounds of the canvas
	 * @return	void
	 */		
	this.testCursorValid = function()
	{
		this.cursorPos.x = Math.min(Math.max(0, this.cursorPos.x), this.width - 1);
		if (this.cursorPos.y < 0) {
			this.scroll--;
			this.scroll = Math.max(0, this.scroll);
			this.cursorPos.y = 0;
			this.mainCanvasElement.css({'top' : -this.scroll * this.mainCanvas.font.height});
			this.blockMarkerElement.css({'marginTop' : -this.scroll * this.mainCanvas.font.height});
		} else if (this.cursorPos.y == this.height) {
			this.cursorPos.y = this.height - 1;
			this.scroll++;
			if ((this.scroll + this.height) > this.rows) {
				this.scroll--;
			}
			this.mainCanvasElement.css({'top' : -this.scroll * this.mainCanvas.font.height});
			this.blockMarkerElement.css({'marginTop' : -this.scroll * this.mainCanvas.font.height});
		}

		this.cursorPositionText.html('pos: '+(this.cursorPos.x + 1)+','+(1 + this.cursorPos.y + this.scroll)+' ('+this.ansiHeight+')');
		this.adjustPreviewFrameMarker();
	}

	/* 
	 * /--------------------------\
	 * 
	 *   Block selection methods
	 * 
	 * \--------------------------/
	 */

	/**
	 * Copies selected block to block buffer
	 * @return	void
	 */	
	this.copyBlockData = function()
	{
		this.blockData = new Array(this.blockSize.x * this.blockSize.y);

		for(var x = 0; x < this.blockSize.x; x++) {
			for(var y = 0; y < this.blockSize.y; y++) {
				this.blockData[x + y * this.blockSize.x] = this.data[x + this.blockPos.x + (y + this.blockPos.y) * this.width];
			}
		}
		this.mainCanvas.copyBlock(this.blockPos.x, this.blockPos.y, this.blockSize.x, this.blockSize.y);
		this.previewCanvas.copyBlock(this.blockPos.x, this.blockPos.y, this.blockSize.x, this.blockSize.y);
	}

	/**
	 * Pastes data from block buffer to canvas at given position
	 * @param	{Integer}	x	x-position to paste block to
	 * @param	{Integer}	y	y-position to paste block to
	 * @return	void
	 */	
	this.pasteBlockData = function(x, y)
	{
		for(var cx = 0; cx < this.blockSize.x; cx++) {
			for(var cy = 0; cy < this.blockSize.y; cy++) {
				this.data[x + cx + (cy + y) * this.width] = this.blockData[cx + cy * this.blockSize.x];
			}
		}
		this.mainCanvas.pasteBlock(x, y);
		this.previewCanvas.pasteBlock(x, y);
	} 

	/**
	 * Fills selected block with active character color
	 * @return	void
	 */		
	this.blockFillCharColor = function()
	{
		var blockData = new Array();
		for(var x = 0; x < this.blockSize.x; x++) {
			for(var y = 0; y < this.blockSize.y; y++) {
				this.data[x + this.blockPos.x + (y + this.blockPos.y) * this.width].color = this.charColor;
				blockData.push(this.data[x + this.blockPos.x + (y + this.blockPos.y) * this.width]);
			}
		}
		this.mainCanvas.drawBlock(this.blockPos.x, this.blockPos.y, this.blockSize.x, this.blockSize.y, blockData);
		this.previewCanvas.drawBlock(this.blockPos.x, this.blockPos.y, this.blockSize.x, this.blockSize.y, blockData);
		this.setMode(this.MODE_BLOCK_EDIT);
	}

	/**
	 * Fills selected block with active background color
	 * @return	void
	 */		
	this.blockFillBackgroundColor = function()
	{
		var blockData = new Array();
		for(var x = 0; x < this.blockSize.x; x++) {
			for(var y = 0; y < this.blockSize.y; y++) {
				this.data[x + this.blockPos.x + (y + this.blockPos.y) * this.width].bg = this.backgroundColor;
				blockData.push(this.data[x + this.blockPos.x + (y + this.blockPos.y) * this.width]);
			}
		}
		this.mainCanvas.drawBlock(this.blockPos.x, this.blockPos.y, this.blockSize.x, this.blockSize.y, blockData);
		this.previewCanvas.drawBlock(this.blockPos.x, this.blockPos.y, this.blockSize.x, this.blockSize.y, blockData);
		this.setMode(this.MODE_BLOCK_EDIT);
	}

	/**
	 * Fills selected block given character
	 * @param	{Integer}	charCode	character code of character to fill block with
	 * @return	void
	 */		
	this.blockFillChar = function(charCode)
	{
		var blockData = new Array();
		for(var x = 0; x < this.blockSize.x; x++) {
			for(var y = 0; y < this.blockSize.y; y++) {
				this.data[x + this.blockPos.x + (y + this.blockPos.y) * this.width].chr = charCode;
				blockData.push(this.data[x + this.blockPos.x + (y + this.blockPos.y) * this.width]);
			}
		}
		this.mainCanvas.drawBlock(this.blockPos.x, this.blockPos.y, this.blockSize.x, this.blockSize.y, blockData);
		this.previewCanvas.drawBlock(this.blockPos.x, this.blockPos.y, this.blockSize.x, this.blockSize.y, blockData);
		this.setMode(this.MODE_BLOCK_EDIT);
	}

	/**
	 * Erases the selected block
	 * @return	void
	 */		
	this.blockErase = function()
	{
		this.blockFillChar(0);
	}

	/**
	 * Updates the block marker
	 * @return	void
	 */		
	this.updateBlockMarker = function()
	{
		if(this.shiftPos.x == -1)
		{
			this.blockMarkerElement.css({'display' : 'none'});
			return;
		}

		this.blockSize.x	= Math.abs(this.shiftPos.x - this.cursorPos.x) + 1;
		this.blockSize.y	= Math.abs(this.shiftPos.y - this.cursorPos.y) + 1;
		this.blockPos.x		= Math.min(this.shiftPos.x, this.cursorPos.x);
		this.blockPos.y		= Math.min(this.shiftPos.y, this.cursorPos.y);

		this.blockMarkerElement.css({
			'display'	: 'block',
			'width'		: this.blockSize.x * this.mainCanvas.font.width,
			'height'	: this.blockSize.y * this.mainCanvas.font.height,
			'marginLeft': this.blockPos.x  * this.mainCanvas.font.width,
			'marginTop'	: this.blockPos.y  * this.mainCanvas.font.height
		});
	}

	/* 
	 * /--------------------------\
	 * 
	 *   Line and column methods
	 * 
	 * \--------------------------/
	 */

	/**
	 * Returns an array containing a new blank line of achar objects
	 * @return	array
	 */		
	this.getNewLine = function()
	{
		var newLine = new Array();
		for (var x = 0; x < this.columns; x++) {
			newLine.push(new this.achar());
		}
		return newLine;
	}

	/**
	 * Inserts a new blank line below cursor position
	 * @return	void
	 */		
	this.insertLine = function()
	{
		if (this.cursorPos.y + this.scroll + 1 <= this.ansiHeight) {
			var below = this.data.splice((this.cursorPos.y + this.scroll) * this.columns, this.data.length - ((this.cursorPos.y + this.scroll) * this.columns));
			this.data = this.data.concat(this.getNewLine(), below);
			this.data.splice(this.rows * this.columns, this.data.length - this.rows * this.columns);
			this.mainCanvas.shiftRows(this.cursorPos.y + this.scroll, 1, this.cursorPos.y + this.scroll);
			this.previewCanvas.shiftRows(this.cursorPos.y + this.scroll, 1, this.cursorPos.y + this.scroll);
			this.ansiHeight = Math.min(this.rows, this.ansiHeight + 1);
			this.mainCanvas.ansiHeight = this.ansiHeight;
			this.previewCanvas.ansiHeight = this.ansiHeight;
		}
	}

	/**
	 * Deletes the current cursor line
	 * @return	void
	 */		
	this.deleteLine = function()
	{	if (this.cursorPos.y + this.scroll + 1 <= this.ansiHeight) {
			this.data.splice((this.cursorPos.y + this.scroll) * this.columns, this.columns);
			this.data = this.data.concat(this.getNewLine());
			this.mainCanvas.shiftRows(this.cursorPos.y + this.scroll, -1, this.ansiHeight - 1);
			this.previewCanvas.shiftRows(this.cursorPos.y + this.scroll, -1, this.ansiHeight - 1);
			this.ansiHeight = Math.max(1, this.ansiHeight - 1);
			this.mainCanvas.ansiHeight = this.ansiHeight;
			this.previewCanvas.ansiHeight = this.ansiHeight;
		 }
	}

	/**
	 * Moves content right of the cursor to the left, deleting the current cursor column
	 * @return	void
	 */		
	this.deleteColumn = function()
	{
		for (var y = 0; y < this.ansiHeight; y++) {
			this.data.splice((y + 1) * this.columns, 0, new this.achar());
			this.data.splice(y * this.columns + this.cursorPos.x, 1);
		}
		this.mainCanvas.shiftColumns(this.cursorPos.x, -1, (this.columns - 1));
		this.previewCanvas.shiftColumns(this.cursorPos.x, -1, (this.columns - 1));
	}

	/**
	 * Moves content to the right, inserting a blank column at cursor position
	 * @return	void
	 */		
	this.insertColumn = function()
	{
		for (var y = 0; y < this.ansiHeight; y++) {
			this.data.splice(y * this.columns + this.cursorPos.x, 0, new this.achar());
			this.data.splice((y + 1 ) * this.width, 1);
		}
		this.mainCanvas.shiftColumns(this.cursorPos.x, 1, this.cursorPos.x);
		this.previewCanvas.shiftColumns(this.cursorPos.x, 1, this.cursorPos.x);
	}

	/* 
	 * /--------------------------------\
	 * 
	 *   Keyset canvas drawing methods
	 * 
	 * \--------------------------------/
	 */

	/**
	 * Redraws the special characters set display
	 * @return	void
	 */
	this.redrawKeys = function() 
	{
		this.keysetCanvasContext.fillStyle = this.colors[this.backgroundColor].getRGBString();
		this.keysetCanvasContext.fillRect (0, 0, 500, this.keysetCanvas.height);

		for (var i = 0; i < this.specialCharacterSets[this.currentset].length; i++) {
			var p = i * 9 * 4;
			var myS = new String('1234567890:');
			
			var col = 0;
			if (this.backgroundColor == 0 || this.backgroundColor == 1 ) {
				col = 7;
			}

			this.keysetCanvasContext.drawImage(	this.mainCanvas.font.image,
							myS.charCodeAt(i) * this.mainCanvas.font.width,
							col * this.mainCanvas.font.height,
							this.mainCanvas.font.width,
							this.mainCanvas.font.height,
							p + 9 + this.mainCanvas.font.width,
							0,
							this.mainCanvas.font.width,
							this.mainCanvas.font.height);

			this.keysetCanvasContext.drawImage(	this.mainCanvas.font.image,
							myS.charCodeAt(10) * this.mainCanvas.font.width,
							col * this.mainCanvas.font.height,
							this.mainCanvas.font.width,
							this.mainCanvas.font.height,
							p + 18 + this.mainCanvas.font.width,
							0,
							this.mainCanvas.font.width,
							this.mainCanvas.font.height);

			this.keysetCanvasContext.drawImage(	this.mainCanvas.font.image,
							this.specialCharacterSets[this.currentset][i] * this.mainCanvas.font.width,
							this.charColor * this.mainCanvas.font.height,
							this.mainCanvas.font.width,
							this.mainCanvas.font.height,
							p + 27 + this.mainCanvas.font.width,
							0,
							this.mainCanvas.font.width,
							this.mainCanvas.font.height);
		}
	}
}
