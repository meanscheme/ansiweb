function rgba(rr,gg,bb,aa)
{
	this.r=rr;
	this.g=gg;
	this.b=bb;
	this.a=aa;
}  

function achar()
{
	this.chr	= 32;
	this.bg		=  0;
	this.color	=  7;
	
	this.getData = function()
	{
		return this.chr+','+this.bg+','+this.color
	}
}

function vec2()
{
	this.x = 0;
	this.y = 0;
}

/*
jQuery.preloadImages = function()
{
  for(var i = 0; i<arguments.length; i++)
  {
	jQuery("<img>").attr("src", arguments[i]);
  }
}
*/

ansiWeb = function() {	

	this.fontImage = new Image();
	this.fontImage.src = 'images/font_pc_80x25.png';
	this.fontHeight = 16;
	this.fontWidth	=  9;

	this.tabWidth = 8;

	// some key constants for better readability
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

	// edit mode constants
	this.MODE_EDIT				= 0;
	this.MODE_BLOCK_FILL_SELECT	= 1;
	this.MODE_BLOCK_FILL		= 2;
	this.MODE_BLOCK_EDIT		= 3;
	this.MODE_BLOCK_MOVE		= 4;
	this.MODE_BLOCK_MOVE_MOVE	= 5;
	this.MODE_BLOCK_COPY		= 6;

	// current edit mode
	this.mode		= 0;

	// color definitions
	this.colors = new Array(
		new rgba(0,0,0,1),
		new rgba(0,0,171,1),
		new rgba(0,171,0,1),
		new rgba(0,171,171,1),
		new rgba(171,0,0,1),
		new rgba(171,0,171,1),
		new rgba(171,87,0,1),
		new rgba(171,171,171,1),
		new rgba(87,87,87,1),
		new rgba(87,87,255,1),
		new rgba(87,255,87,1),
		new rgba(87,255,255,1),
		new rgba(255,87,87,1),
		new rgba(255,87,255,1),
		new rgba(255,255,87,1),
		new rgba(255,255,255,1)
	);
	this.charColor			= 7;
	this.backgroundColor	= 0;
	this.numBackgroundColors = 8;

	// special character sets
	this.sets = new Array(
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
	this.currentset = 5;

	this.mainCanvasId		= 'offcanvas';
	this.previewCanvasId	= 'smallcanvas';
	this.keysetCanvasId		= 'canvaskeys';
	this.statusLineId		= 'editstatus';
	this.blockMarkerId		= 'marker';
	this.helpScreenId		= 'edithelp';
	this.cursorPosId		= 'ansipos';
	this.saveButtonId		= 'savebutton';
	this.colorSelectorId	= 'colorselectors';
	this.charColorSelectBaseId			= 'color';
	this.backgroundColorSelectBaseId	= 'bgcolor';

	this.mainCanvas				= null;
	this.mainCanvasContext		= null;
	this.previewCanvas			= null;
	this.previewCanvasContext	= null;
	this.keysetCanvas			= null;
	this.keysetCanvasContext	= null;

	// height/width/scroll position for canvas
	this.height		= 25;
	this.width		= 80;
	this.scroll		= 0;

	this.ansiHeight	= 0;

	// this is the actual ANSI 'size'
	this.rowLength	= 80;
	this.rows		= 1000;

	this.ansiId		= -1;
	this.data		= new Array(this.rows * this.rowLength);
	this.blockData	= new Array(1*1);

	this.dataset	= false;
	this.showmarker	= false;
	this.blockinput	= false; 
	this.hideCursor	= false;

 	this.cursorPos	= new vec2();
	this.shiftPos	= new vec2();	
	this.blockPos	= new vec2();
	this.blockSize	= new vec2();
	
	this.altDown	= false;
	this.ctrlDown	= false;
	this.shiftDown	= false;

	/**
	* Initializes the editor
	* @return	void
	*/
	this.init = function()
	{
		this.mainCanvas = $('#'+this.mainCanvasId).get(0);
		this.mainCanvasContext = this.mainCanvas.getContext('2d');
		this.clear();

		this.previewCanvas = $('#'+this.previewCanvasId).get(0);
		this.previewCanvasContext = this.previewCanvas.getContext('2d');
		this.clearPreview();

		this.keysetCanvas = $('#'+this.keysetCanvasId).get(0);
		this.keysetCanvasContext = this.keysetCanvas.getContext('2d');

		this.setupColorSelector();

		if (this.dataset) {
			for (var i = 0; i < this.ansiHeight; i++) {
				this.redrawLine(i);
			}
		} else {
			for (var i = 0; i < this.data.length; i++) {
				this.data[i] = new achar();
			}
		}

		this.redrawKeys();
		this.redrawPreviewComplete();
		this.resizeCanvas(0);
		this.testCursorValid();
		this.drawCursor();

		me = this;
		$(document).keydown(function(e) {return me.onKeyDown(e);});
		$(document).keyup(function(e) {return me.onKeyUp(e);});
		$(document).keypress(function(e) {return me.onKeyPress(e);});
	}

	/* 
	 * /--------------------------\
	 * 
	 *   Keyboard event handlers
	 * 
	 * \--------------------------/
	 */

	/**
	 * Evaluates keyup events
	 * @return	boolean
	 */		
	this.onKeyUp = function(evt)
	{
		if (this.blockinput) {
			return true;
		}

		switch (evt.keyCode) {
			case this.KEY_SHIFT:
				this.shiftDown = false;
				if (this.shiftPos.x != this.cursorPos.x) {
					this.setMode(this.MODE_BLOCK_EDIT);
				}
				break;

			case this.KEY_CTRL:
				this.ctrlDown = false;
				break;

			case this.KEY_ALT:
				this.altDown = false;
				break;
		}

		return false;
	}

	/**
	 * Evaluates keydown events
	 * @return	boolean
	 */		
	this.onKeyDown = function(evt)
	{
		if (this.blockinput) {
			return true;
		}

		switch(evt.keyCode)
		{
			case this.KEY_SHIFT:
				if(!this.shiftDown) {
					this.shiftPos.x = this.cursorPos.x;
					this.shiftPos.y = this.cursorPos.y;
				}
				this.shiftDown = true;
				break;

			case this.KEY_CTRL:
				this.ctrlDown	= true;
				break;

			case this.KEY_ALT:
				this.altDown	= true;
				break;
				
			case this.KEY_ESC:
				this.mode = 0;
				this.setStatus('');
				this.showmarker = false;
				this.shiftPos.x = -1;
				this.updateBlockMarker();
				break;

			case this.KEY_LEFT:
				if (this.altDown) {
					this.moveAllLeft();
				} else if (this.ctrlDown) {
					this.decCharColor();
				} else {
					this.cursorPos.x--;
					if (this.shiftDown) {
						this.updateBlockMarker();
					}
				}
				break;

			case this.KEY_RIGHT:
				if (this.altDown) {
					this.moveAllRight();
				} else if (this.ctrlDown) {
					this.incCharColor();
				} else {
					this.cursorPos.x++;
					if (this.shiftDown) {
						this.updateBlockMarker();
					}
				}				
				break;


			case this.KEY_UP:
				if (this.ctrlDown) {
					this.incBackgroundColor();
				} else {
					this.cursorPos.y--;
					if (this.shiftDown) {
						this.updateBlockMarker();
					}
				}
				break;

			case this.KEY_DOWN:
				if (this.ctrlDown) {
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
				this.data[this.cursorPos.x + this.cursorPos.y * this.width] = new achar();			
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
				this.redrawCursorLine();
				this.scroll += 25;
				me = this;
				$('#'+this.mainCanvasId).animate(
					{top:(me.scroll)*-16}, 150, 'swing',
					function(){me.hideCursor=false; me.redraw(); $('#'+me.blockMarkerId).css({'marginTop' : -me.scroll * me.fontHeight});}
				);

				this.hideCursor = true;
				this.redraw();
				this.redrawPreview();
				break;

			case this.KEY_PAGEUP:
				this.redrawCursorLine();
				this.scroll -= 25;
				if (this.scroll < 0) {
					this.scroll = 0;
					this.cursorPos.y = 0;
				}
				me = this;				
				$('#'+this.mainCanvasId).animate(
					{top:(me.scroll)*-16}, 150 , 'swing',
					function(){me.hideCursor=false; me.redraw(); $('#'+me.blockMarkerId).css({'marginTop' : -me.scroll * me.fontHeight});}
				  );
				
				this.hideCursor = true;
				this.redraw();
				this.redrawPreview();
				break;
		}

		if (evt.keyCode >= this.KEY_F1 && evt.keyCode <= this.KEY_F10) {
			if (this.altDown) {
				this.currentset = evt.keyCode - this.KEY_F1;
				this.redrawKeys();
			} else if (this.ctrlDown && evt.keyCode <= this.KEY_F5) {
				this.currentset = (evt.keyCode - this.KEY_F1 + 10);
				this.redrawKeys();
			} else {
				this.insertChar(evt.keyCode - this.KEY_F1);
			}
		}

		this.testCursorValid();
		this.redrawCursorLines();
		this.redraw();

		return false;
	}

	/**
	 * Evaluates keypress events
	 * @return	boolean
	 */		
	this.onKeyPress = function(evt)
	{
		if (this.blockinput) {
			return true;
		}

		var charCode = evt.charCode;

		if (charCode == 0) {
			return false;
		}

		var key = String.fromCharCode(charCode);

		switch (this.mode) {
			case this.MODE_BLOCK_EDIT:
				switch (key) {
					case 'c':
						this.setMode(this.MODE_BLOCK_COPY);
						this.setMode(this.MODE_BLOCK_MOVE_MOVE);
						break;
					case 'e':
						this.blockErase();
						break;
					case 'f':
						this.setMode(this.MODE_BLOCK_FILL_SELECT);
						break;
					case 'm':
						this.setMode(this.MODE_BLOCK_MOVE);
						this.setMode(this.MODE_BLOCK_MOVE_MOVE);
						break;
				}
				break;

			case this.MODE_BLOCK_MOVE_MOVE:
				switch (key) {
					case 'p': this.pasteBlockData(this.cursorPos.x, this.cursorPos.y); break;
				}
				break;

			case this.MODE_BLOCK_FILL_SELECT:
				switch (key) {
					case 'c': this.setMode(this.MODE_BLOCK_FILL); break;
					case 'f': this.blockFillCharColor(); break;
					case 'k': this.blockFillBackgroundColor(); break;
				}
				break;

			case this.MODE_BLOCK_FILL:
				blockFillChar(charCode);
				break;

			default:
				if (this.altDown) {
					switch (key) {
						case 'a': break; // color menu (?obsolete?)
						case 'b': break; // block commands
						case 'c': this.clearScreen(); break;
						case 'd': break; // sauce screen
						case 'e': break; // switch canvas
						case 'h': this.toggleHelp(); break;
						case 'i': this.insertLine(); break;
						case 'l': break; // load screen
						case 'm': this.toggleLineMode(); break;
						case 'o': break; // config screen
						case 'r': break; // block restore
						case 's': break; // save screen
						case 't': break; // tab setup
						case 'u': this.pickupColor(); break;
						case 'v': break; // switch vga viewing mode (?obsolete?)
						case 'x': break; // exit ;)
						case 'y': this.deleteLine(); break;
						case 'z': break; // toggle blinking/iCE color
					}
				} else {
					var position = (this.cursorPos.y + this.scroll) * this.rowLength + this.cursorPos.x;
					this.data[position].chr	= charCode;
					this.data[position].bg	= this.backgroundColor;
					this.data[position].color= this.charColor;
					this.cursorPos.x++;

					// make sure that block mode will not be triggered
					// when a character is entered that required the shift key
					if (this.shiftDown) {
						this.shiftPos.x++;
					}
					
					this.redrawPreview();
					this.redrawCursorLines();
					this.redraw();
				}
		}
		
		this.testCursorValid()
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
		for(var i=0; i < this.numBackgroundColors; i++) {
			$('#'+this.backgroundColorSelectBaseId+i).css({'border' : '1px solid black'});
		}
		$('#'+this.backgroundColorSelectBaseId+which).css({'border' : '1px dotted white'});
		this.backgroundColor = which;
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
		for(var i=0; i < 16; i++) {
			$('#'+this.charColorSelectBaseId+i).css({'border' : '1px solid black'});
		}
		$('#'+this.charColorSelectBaseId+which).css({'border' : '1px dotted white'});
		this.charColor = which;
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
		var position = (this.cursorPos.y + this.scroll) * this.rowLength + this.cursorPos.x;
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
		$('#'+this.statusLineId).html(status);
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

	this.clearScreen = function()
	{
		if (confirm('Do you really want to clear the screen?')) {
			this.clear();
			this.clearPreview();
			// this does not only clear the screen, but also the ANSI data
			// is there anything else that needs to be set here for a clean slate?
			for (var i = 0; i < this.data.length; i++) {
				this.data[i] = new achar();
			}
			this.cursorPos	= new vec2();
			this.shiftPos	= new vec2();	
			this.blockPos	= new vec2();
			this.blockSize	= new vec2();
			this.drawCursor();
		}

		// unsetting ALT key here since the confirm dialog
		// seems to swallow the keyup event
		this.altDown = false;
	}

	/**
	 * Toggles between 25/50 line mode
	 * @return	void
	 */	
	this.toggleLineMode = function()
	{
		if (this.fontHeight == 16) {
			this.fontHeight = 8;
			// small gotcha at this point:
			// changing font image source works, but takes
			// a moment to load, so when toggling for the
			// first time, screen displays garbage at first
			this.fontImage.src = 'images/font_pc_80x50.png';
		} else {
			this.fontHeight = 16;
			this.fontImage.src = 'images/font_pc_80x25.png';
		}
		this.clear()
		this.redraw();
		this.redrawKeys();
		this.clearPreview();
		this.redrawPreviewComplete();
		this.resizeCanvas(0);
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
		this.dataset = true;
		for(var i=0; i < this.data.length; i++) {
			this.data[i] = new achar();
		}

		for(var i=0; i < arr.length / 3; i++) {
			this.data[i].chr	= arr[i*3+0];
			this.data[i].bg		= arr[i*3+1];
			this.data[i].color	= arr[i*3+2];
		}

		this.ansiHeight = arr.length / 3 / this.width;
	}

	/**
	 * Returns ANSI data
	 * @return	{String}	string with ANSI data
	 * @see		#setData	for format description
	 */	
	this.getData = function()
	{
		var ret = '';
		for (var i = 0; i < (this.ansiHeight + 1) * this.width; i++) {
			ret += this.data[i].getData()+',';
		}
		return ret;
	}


	this.resetSaveButton = function()
	{
		$('#'+this.saveButtonId).html('save');
	}

	this.save = function()
	{
		$('#'+this.saveButtonId).html('( saving... )');

		me = this;
		$.post('/ajax_saveansi/', {
			data: me.getData(),
			id: me.ansiId
		}, function() {
			$('#'+me.saveButtonId).html('( saved \\o/ )');
			setTimeout('resetSaveButton();',2000);
		});
	}

	this.resizeCanvas = function(size)
	{
		var siz = $('#canvdiv').css('height');
		siz = parseInt(siz.replace('px','')) + size;
		$('#canvdiv').css({'height' : siz});
		this.height = Math.round(siz / this.fontHeight);
	}

	this.toggleHelp = function()
	{
		if ($('#'+this.helpScreenId).css('display') != 'block') {
			$('#'+this.helpScreenId).css({'display' : 'block'});
			$('#canvdiv').css({'display' : 'none'});
		} else {
			$('#'+this.helpScreenId).css({'display' : 'none'});
			$('#canvdiv').css({'display' : 'block'});
		}
	}

	this.setupColorSelector = function()
	{
		me = this;

		for(var i=0; i < 16; i++) {
			$('<a id="'+this.charColorSelectBaseId+i+'"></a>').appendTo('#'+this.colorSelectorId);
			$('#'+this.charColorSelectBaseId+i).css({'background-color' : 'rgb('+this.colors[i].r+','+this.colors[i].g+','+this.colors[i].b+')'});
			$('#'+this.charColorSelectBaseId+i).attr('colorvalue', i);
			$('#'+this.charColorSelectBaseId+i).click(function() { me.setCharColor($('#'+this.id).attr('colorvalue')); });
		}
		$('<span> bg: </span>').appendTo('#'+this.colorSelectorId);
		for(var i=0; i < this.numBackgroundColors; i++) {
			$('<a id="'+this.backgroundColorSelectBaseId+i+'"></a>').appendTo('#'+this.colorSelectorId);
			$('#'+this.backgroundColorSelectBaseId+i).css({'background-color' : 'rgb('+this.colors[i].r+','+this.colors[i].g+','+this.colors[i].b+')'});
			$('#'+this.backgroundColorSelectBaseId+i).attr('colorvalue', i);
			$('#'+this.backgroundColorSelectBaseId+i).click(function() { me.setBackgroundColor($('#'+this.id).attr('colorvalue')); });

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
			this.blockFillChar(this.sets[this.currentset][which]);
		} else if (this.mode == this.MODE_EDIT) {
			var position = (this.cursorPos.y + this.scroll) * this.rowLength + this.cursorPos.x;
			this.data[position].chr		= this.sets[this.currentset][which];
			this.data[position].color	= this.charColor;
			this.data[position].bg		= this.backgroundColor;
			this.cursorPos.x++;
			this.redrawCursorLine();
			this.ansiHeight = Math.max(this.ansiHeight, (this.cursorPos.y + this.scroll));
		}
		this.redrawPreview();
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
			$('#'+this.mainCanvasId).css({'top' : -this.scroll * this.fontHeight});
			$('#'+this.blockMarkerId).css({'marginTop' : -this.scroll * this.fontHeight});
		} else if (this.cursorPos.y == this.height) {
			this.cursorPos.y = this.height - 1;
			this.scroll++;
			if (this.scroll - this.height > this.rows) {
				this.scroll--;
			}
			$('#'+this.mainCanvasId).css({'top' : -this.scroll * this.fontHeight});
			$('#'+this.blockMarkerId).css({'marginTop' : -this.scroll * this.fontHeight});
		}

		$('#'+this.cursorPosId).html('pos: '+(this.cursorPos.x + 1)+','+(1 + this.cursorPos.y + this.scroll));
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
		this.blockData= new Array(this.blockSize.x * this.blockSize.y);

		for(var x = 0; x < this.blockSize.x; x++) {
			for(var y = 0; y < this.blockSize.y; y++) {
				var position = x + y * this.blockSize.x;
				var dataPosition = x + this.blockPos.x + (y + this.blockPos.y) * this.width;
				this.blockData[position]		= new achar();
				this.blockData[position].chr	= this.data[dataPosition].chr;
				this.blockData[position].color	= this.data[dataPosition].color;
				this.blockData[position].bg		= this.data[dataPosition].bg;
			}
		}
	}

	/**
	 * Pastes data from block buffer to canvas at given position
	 * @param	{Integer}	xx	x-position to paste block to
	 * @param	{Integer}	yy	y-position to paste block to
	 * @return	void
	 */	
	this.pasteBlockData = function(xx, yy)
	{
		for(var x = 0; x < this.blockSize.x; x++) {
			for(var y = 0; y < this.blockSize.y; y++) {
				this.data[xx + x + (y + yy) * this.width] = this.blockData[x + y * this.blockSize.x];
				this.redrawLine(y + yy);
			}
		}
	} 

	/**
	 * Fills selected block with active character color
	 * @return	void
	 */		
	this.blockFillCharColor = function()
	{
		for(var x = 0; x < this.blockSize.x; x++) {
			for(var y = 0; y < this.blockSize.y; y++) {
				this.data[x + this.blockPos.x + (y + this.blockPos.y) * this.width].color = this.charColor;
			}
		}
		this.redrawBlockLines();
		this.setMode(this.MODE_BLOCK_EDIT);
	}

	/**
	 * Fills selected block with active background color
	 * @return	void
	 */		
	this.blockFillBackgroundColor = function()
	{
		for(var x = 0; x < this.blockSize.x; x++) {
			for(var y = 0; y < this.blockSize.y; y++) {
				this.data[x + this.blockPos.x + (y + this.blockPos.y) * this.width].bg = this.backgroundColor;
			}
		}
		this.redrawBlockLines();
		this.setMode(this.MODE_BLOCK_EDIT);
	}

	/**
	 * Fills selected block given character
	 * @param	{Integer}	charCode	character code of character to fill block with
	 * @return	void
	 */		
	this.blockFillChar = function(charCode)
	{
		for(var x = 0; x < this.blockSize.x; x++) {
			for(var y = 0; y < this.blockSize.y; y++) {
				this.data[x + this.blockPos.x + (y + this.blockPos.y) * this.width].chr = charCode;
			}
		}
		this.redrawBlockLines();
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
			this.showmarker = false;
			$('#'+this.blockMarkerId).css({'display' : 'none'});
			return;
		}

		this.blockSize.x	= Math.abs(this.shiftPos.x - this.cursorPos.x) + 1;
		this.blockSize.y	= Math.abs(this.shiftPos.y - this.cursorPos.y) + 1;
		this.blockPos.x		= Math.min(this.shiftPos.x, this.cursorPos.x);
		this.blockPos.y		= Math.min(this.shiftPos.y, this.cursorPos.y);

		$('#'+this.blockMarkerId).css({	
			'display'	:	'block',
			'width'			: this.blockSize.x * this.fontWidth,
			'height'		: this.blockSize.y * this.fontHeight,
			'marginLeft'	: this.blockPos.x * this.fontWidth,
			'marginTop'		: this.blockPos.y * this.fontHeight
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
	 * Inserts a new blank line below cursor position
	 * @return	void
	 */		
	this.insertLine = function()
	{
		for (var y = this.ansiHeight; y >= 0; y--) {
			if (y >= this.cursorPos.y - 1 + this.scroll) {
				for (var x = 0; x < this.width; x++) {
					if (y == this.cursorPos.y - 1 + this.scroll) {
						this.data[(y + 1) * this.width + x] = new achar();
					} else {
						this.data[(y + 1) * this.width + x] = this.data[y * this.width + x];
					}
				}
			}
		}

		this.redraw();
		this.redrawPreviewComplete();
		this.drawCursor();
	}

	/**
	 * Deletes the current cursor line
	 * @return	void
	 */		
	this.deleteLine = function()
	{
		for (var y = 0; y < this.ansiHeight; y++) {
			if (y >= this.cursorPos.y - 1 + this.scroll) {
				for (var x = 0; x < this.width; x++) {
					if(y == this.cursorPos.y - 1 + this.scroll) {
						this.data[(y + 1) * this.width + x] = new achar();
					} else {
						this.data[y * this.width + x] = this.data[(y+1) * this.width + x];
					}
				}
			}
		}
		this.redraw();
		this.redrawPreviewComplete();
		this.drawCursor()
	}


	/**
	 * Moves content right of the cursor to the left, deleting the current cursor row
	 * @return	void
	 */		
	this.moveAllLeft = function()
	{
		for (var y = 0; y < this.ansiHeight; y++) {
			for (var x = this.cursorPos.x; x < this.width; x++) {
				this.data[y * this.width + x] = this.data[y * this.width + x + 1];
				this.data[y * this.width + 79] = new achar();
			}
		}
		this.redraw();
		this.redrawPreviewComplete();
	}

	/**
	 * Moves content to the right, inserting a blank row at cursor position
	 * @return	void
	 */		
	this.moveAllRight = function()
	{
		for (var y = 0; y < this.ansiHeight; y++) {
			for (var x = this.width - 1; x > this.cursorPos.x; x--) {
				this.data[y * this.width + x] = this.data[y * this.width + x - 1];
			}
			this.data[y * this.width + this.cursorPos.x] = new achar();
		}
		this.redraw();
		this.redrawPreviewComplete();
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
		this.keysetCanvasContext.fillStyle = 'rgb('+this.colors[this.backgroundColor].r+','+this.colors[this.backgroundColor].g+','+this.colors[this.backgroundColor].b+')';
		this.keysetCanvasContext.fillRect (0, 0, 500, this.keysetCanvas.height);

		for (var i = 0; i < this.sets[this.currentset].length; i++) {
			var p = i * 9 * 4;
			var myS = new String('1234567890:');
			
			var col = 0;
			if (this.backgroundColor == 0 || this.backgroundColor == 1 ) {
				col = 7;
			}

			this.keysetCanvasContext.drawImage(	this.fontImage,
							myS.charCodeAt(i) * this.fontWidth,
							col * this.fontHeight,
							this.fontWidth,
							this.fontHeight,
							p + 9 + this.fontWidth,
							0,
							this.fontWidth,
							this.fontHeight);

			this.keysetCanvasContext.drawImage(	this.fontImage,
							myS.charCodeAt(10) * this.fontWidth,
							col * this.fontHeight,
							this.fontWidth,
							this.fontHeight,
							p + 18 + this.fontWidth,
							0,
							this.fontWidth,
							this.fontHeight);

			this.keysetCanvasContext.drawImage(	this.fontImage,
							this.sets[this.currentset][i] * this.fontWidth,
							this.charColor * this.fontHeight,
							this.fontWidth,
							this.fontHeight,
							p + 27 + this.fontWidth,
							0,
							this.fontWidth,
							this.fontHeight);
		}
	}

	/* 
	 * /------------------------------\
	 * 
	 *   Main canvas drawing methods
	 * 
	 * \------------------------------/
	 */

	/**
	 * Draws the cursor
	 * @return	void
	 */		
	this.drawCursor = function()
	{
		if(!this.hideCursor) {
			this.mainCanvasContext.fillStyle = 'rgba(128, 128, 128, 0.5)';
			this.mainCanvasContext.fillRect(this.cursorPos.x * this.fontWidth, (this.cursorPos.y + this.scroll) * this.fontHeight, this.fontWidth, this.fontHeight);
			this.mainCanvasContext.fillStyle = 'rgb(0,0,0)';
		}

	}

	/**
	 * Redraws the entire ANSI
	 * @return	void
	 */
	this.redraw = function() 
	{
		for(var i=0;i < this.ansiHeight; i++) {
			this.redrawLine(i);
		}
		this.drawCursor();
	}

	/**
	 * Redraws the current cursor line
	 * @return	void
	 */		
	this.redrawCursorLine = function()
	{
		this.redrawLine(this.cursorPos.y);
	}

	/**
	 * Redraws the current cursor line as well as the line above and below cursor position
	 * @return	void
	 */
	this.redrawCursorLines = function()
	{
		if (this.cursorPos.y-1 >= 0) {
			this.redrawLine(this.cursorPos.y - 1);
		}
		this.redrawLine(this.cursorPos.y);
		this.redrawLine(this.cursorPos.y + 1);
	}

	/**
	 * Redraws the lines containing the currently selected block
	 * @return	void
	 */		
	this.redrawBlockLines = function()
	{
		for(var y = this.blockPos.y; y < this.blockPos.y + this.blockSize.y; y++)
		{
			this.redrawLine(y);
		}
	}

	/**
	 * Redraws the given line
	 * @param	{Integer}	y	number of the line to redraw (numbering starts at 0)
	 * @return	void
	 */
	this.redrawLine = function(y) 
	{
		this.mainCanvasContext.fillRect (0, (y + this.scroll) * this.fontHeight, this.width * this.fontWidth, this.fontHeight);
		
		for (var x = 0; x < this.rowLength; x++) {
			var which = (y + this.scroll) * this.rowLength + x;
			
			try
			{
				// background color
				if (this.data[which].bg >= 0) {
					this.mainCanvasContext.drawImage(this.fontImage,
													219 * this.fontWidth, // 219 is the ANSI full block character ;)
													this.data[which].bg * this.fontHeight,
													this.fontWidth,
													this.fontHeight,
													x * this.fontWidth,
													(y + this.scroll) * this.fontHeight,
													this.fontWidth,
													this.fontHeight);
				}
		
				// character color and character
				if (this.data[which].chr != 32) {
					this.mainCanvasContext.drawImage(this.fontImage,
													this.data[which].chr * this.fontWidth,
													this.data[which].color * this.fontHeight,
													this.fontWidth,
													this.fontHeight,
													x * this.fontWidth,
													( y +this.scroll) * this.fontHeight,
													this.fontWidth,
													this.fontHeight);
				}
			}
			catch(e){}
		}
	}

	/**
	 * Clears the canvas
	 * @return	void
	 */
	this.clear = function()
	{
		this.mainCanvasContext.fillStyle = "rgb(0,0,0)";
		this.mainCanvasContext.fillRect (0, 0, this.mainCanvas.width, this.mainCanvas.height);
	}

	/* 
	 * /---------------------------------\
	 * 
	 *   Preview canvas drawing methods
	 * 
	 * \---------------------------------/
	 */

	/**
	 * Redraws the current cursor line in the preview pane
	 * @return	void
	 */
	this.redrawPreview = function()
	{
		this.redrawPreviewLine(this.cursorPos.y + this.scroll);
	}

	/**
	 * Redraws the entire preview pane
	 * @return	void
	 */
	this.redrawPreviewComplete = function()
	{
		for(var y = 0; y < this.ansiHeight + 2; y++) {
			this.redrawPreviewLine(y);
		}
	}

	/**
	 * Redraws the given line in the preview pane
	 * @param	{Integer}	y	number of the line to redraw (numbering starts at 0)
	 * @return	void
	 */
	this.redrawPreviewLine = function(y)
	{
		var pixelWidth = 2;
		var pixelHeight = this.fontHeight / 4;
		
		for (var x = 0; x < this.width; x++) {

			var dwhich = y * this.width + x;

			// opacity setting (dithered blocks)
			switch (this.data[dwhich].chr) {
				case 176:	a = '0.25'; break;
				case 177:	a = '0.50'; break;
				case 178:	a = '0.75'; break;
				default:	a = '1.0';
			}
			
			var which = this.data[dwhich].color;
			var colFG = 'rgba('+this.colors[which].r+','+this.colors[which].g+','+this.colors[which].b+','+a+')';
			
			var which = this.data[dwhich].bg;
			var colBG = 'rgba('+this.colors[which].r+','+this.colors[which].g+','+this.colors[which].b+',1.0)';
		
			var xp = x * pixelWidth;
			var yp = y * pixelHeight;
	
			switch (this.data[dwhich].chr) {
				case 32: // space character == background color
					this.previewCanvasContext.fillStyle = colBG;
					this.previewCanvasContext.fillRect(xp, yp, pixelWidth, pixelHeight);
				break;

				case 219: // full block == character color
					this.previewCanvasContext.fillStyle = colFG;
					this.previewCanvasContext.fillRect (xp, yp, pixelWidth, pixelHeight);
				break;

				case 178:
				case 177:
				case 176: // dithered blocks
					this.previewCanvasContext.fillStyle = colBG;
					this.previewCanvasContext.fillRect (xp, yp, pixelWidth, pixelHeight);
					this.previewCanvasContext.fillStyle = colFG;
					this.previewCanvasContext.fillRect (xp, yp, pixelWidth, pixelHeight);
				break;
				
				case 223: // half block top
					this.previewCanvasContext.fillStyle = colBG;
					this.previewCanvasContext.fillRect (xp, yp + pixelHeight / 2, pixelWidth, pixelHeight / 2);
					this.previewCanvasContext.fillStyle = colFG;
					this.previewCanvasContext.fillRect (xp, yp, pixelWidth, pixelHeight / 2);					
				break;

				case 220: // half block bottom
					this.previewCanvasContext.fillStyle = colFG;
					this.previewCanvasContext.fillRect (xp, yp + pixelHeight / 2, pixelWidth, pixelHeight / 2);
					this.previewCanvasContext.fillStyle = colBG;
					this.previewCanvasContext.fillRect (xp, yp, pixelWidth, pixelHeight / 2);					
				break;
				
				case 221: // half block left
					this.previewCanvasContext.fillStyle = colBG;
					this.previewCanvasContext.fillRect (xp + pixelWidth / 2, yp, pixelWidth / 2, pixelHeight);
					this.previewCanvasContext.fillStyle = colFG;
					this.previewCanvasContext.fillRect (xp, yp, pixelWidth / 2, pixelHeight);
				break;

				case 222: // half block right
					this.previewCanvasContext.fillStyle = colFG;
					this.previewCanvasContext.fillRect (xp + pixelWidth / 2, yp, pixelWidth / 2, pixelHeight);
					this.previewCanvasContext.fillStyle = colBG;
					this.previewCanvasContext.fillRect (xp, yp, pixelWidth / 2, pixelHeight);
				break;	
			}
			
			// border around current area
			// this.previewCanvasContext.fillStyle = "rgba(180,180,180,0.2)";
			// this.previewCanvasContext.fillRect(0, this.scroll * pixelHeight, 11, pixelHeight * this.height);
			// this.previewCanvasContext.fillRect(0, (this.scroll + this.height) * pixelHeight, pixelWidth * this.width, 1);		
		}
	}

	/**
	 * clears the preview canvas
	 * @return	void
	 */	
	this.clearPreview = function()
	{
		this.previewCanvasContext.fillStyle = 'rgb(0,0,0)';
		this.previewCanvasContext.fillRect (0, 0, this.previewCanvas.width, this.previewCanvas.height);
	}

}
