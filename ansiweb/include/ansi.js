	var KEY_LEFT=37;
	var KEY_RIGHT=39;
	var KEY_UP=38;
	var KEY_DOWN=40;

	var KEY_F1 = 112;//49;
	var KEY_F2 = 113;//50;
	var KEY_F3 = 114;//51;
	var KEY_F4 = 115;//52;
	var KEY_F5 = 116;//53;
	var KEY_F6 = 117;//54;
	var KEY_F7 = 118;//55;
	var KEY_F8 = 119;//56;
	var KEY_F9 = 120;//57;
	var KEY_F10 = 121;//58;
	var KEY_TAB = 9;
	var KEY_HOME = 36;
	var KEY_END = 35;
	

	var rowLength=80;
	var rows=1000;
	var data = new Array(rows*rowLength);
	var blockData= new Array(1*1);
	

	var height=25;
	var width=80;
	var scroll=0;
	var set=0;

	var mode=0;
	var MODE_EDIT=0;
	var MODE_BLOCK_FILL_SELECT=1;
	var MODE_BLOCK_FILL=2;
	var MODE_BLOCK_EDIT=3;
	var MODE_BLOCK_MOVE=4;
	var MODE_BLOCK_MOVE_MOVE=5;
	var MODE_BLOCK_COPY=6;
	
	var blockinput=false; 

	var sets = new Array(new Array(176,177,178,219,223,220,221,222,254,250), new Array(50,55,56,57));
	var currentset=0;
	
	var currentColor=7;
	var currentColorBG=0;
  
	var ansiHeight=0;
	var hideCursor=false;

	var ansiID=-1;
	var dataset=false;
	var showmarker=false;
	
	var cols=new Array();
	cols[0]=new rgba(0,0,0,1);
	cols[1]=new rgba(0,0,171,1);
	cols[2]=new rgba(0,171,0,1);
	cols[3]=new rgba(0,171,171,1);
	cols[4]=new rgba(171,0,0,1);
	cols[5]=new rgba(171,0,171,1);
	cols[6]=new rgba(171,87,0,1);
	cols[7]=new rgba(171,171,171,1);
	cols[8]=new rgba(87,87,87,1);
	cols[9]=new rgba(87,87,255,1); // ?????
	cols[10]=new rgba(87,255,87,1);
	cols[11]=new rgba(87,255,255,1);
	cols[12]=new rgba(255,87,87,1);
	cols[13]=new rgba(255,87,255,1);
	cols[14]=new rgba(255,255,87,1);
	cols[15]=new rgba(255,255,255,1);
  

  // classes
  function vec2()
  {
	this.x=0;
	this.y=0;
  }
  
  function rgba(rr,gg,bb,aa)
  {
	this.r=rr;
	this.g=gg;
	this.b=bb;
	this.a=aa;
  }  
  function achar()
  {
	this.chr=32;
	this.bg=0;
	this.color=7;
	
	this.getData=function(){return this.chr+","+this.bg+","+this.color};
  }
  
  ///////////////////////////////////////////////////////////

	var cursorPos=new vec2();
	var shiftPos=new vec2();
	
	var blockPos=new vec2();
	var blockSize=new vec2();
	

	
	var altDown=false;
	var ctrlDown=false;
	var shiftDown=false;

	




	function setcurrentColorBG(which)
	{
		for(var i=0;i<8;i++)
			document.getElementById("bgcolor"+i).style.border="1px solid black";
		document.getElementById("bgcolor"+which).style.border="1px dotted white";
	
		currentColorBG=which;
		redrawkeys();
	}
	
	function setCurrentColor(which)
	{
		for(var i=0;i<16;i++)
			document.getElementById("color"+i).style.border="1px solid black";
		document.getElementById("color"+which).style.border="1px dotted white";
		
		currentColor=which;
		redrawkeys();
	}








	function onkeypress(evt)
	{
		if(blockinput)return true;

		var charCode = evt.charCode;
		if(charCode==0)return false;
		//debuglog.innerHTML="<br/>keycode: "+evt.keyCode+debuglog.innerHTML;
        //alert(String.fromCharCode(charCode));
		var k=String.fromCharCode(charCode);

		if(altDown==true && k=="i")
		{
			insertLine();
		}
		else
		if(altDown==true && k=="y")
		{
			deleteLine();
		}
		else
		if(altDown==true && k=="u")
		{
			currentColorBG=data[(cursorPos.y+scroll)*rowLength+cursorPos.x].bg;
			currentColor=data[(cursorPos.y+scroll)*rowLength+cursorPos.x].color;
			
			redrawkeys();
		}
		else


		if(mode==MODE_BLOCK_EDIT)
		{
			
			if(k=="m")
			{
				setMode(MODE_BLOCK_MOVE);
				setMode(MODE_BLOCK_MOVE_MOVE);
			}
			if(k=="c")
			{
				setMode(MODE_BLOCK_COPY);
				setMode(MODE_BLOCK_MOVE_MOVE);
			}
			if(k=="f")
			{
				setMode(MODE_BLOCK_FILL_SELECT);
			}
			if(k=="e")blockErase();
						
		}
		else
		if(mode==MODE_BLOCK_MOVE_MOVE)
		{
			if(k=="p")
				pasteBlockData(cursorPos.x,cursorPos.y);
		}
		else
		if(mode==MODE_BLOCK_FILL_SELECT)
		{
			if(k=="c")setMode(MODE_BLOCK_FILL);
			if(k=="f")blockFillForeGround();
			if(k=="k")blockFillBackGround();
		}
		else
		if(mode==MODE_BLOCK_FILL)
		{
			blockFillChar(charCode);
		}
		else
		{
			data[(cursorPos.y+scroll)*rowLength+cursorPos.x].chr=charCode;
			data[(cursorPos.y+scroll)*rowLength+cursorPos.x].bg=currentColorBG;
			data[(cursorPos.y+scroll)*rowLength+cursorPos.x].color=currentColor;
			cursorPos.x++;
			
			testCursorValid();
			redrawPreview();
			
			var canvas = document.getElementById("offcanvas");
			var ctx = canvas.getContext("2d");
			redrawCursorLines(ctx);
			redraw();
		}
		
		testCursorValid()
		
		return false;
	} 
	
	
	function setStatus(s)
	{
		editstatus.innerHTML=s;
	}

	function setMode(m)
	{
		switch(m)
		{
			case MODE_BLOCK_EDIT:
				setStatus('<a onClick="setMode(BLOCK_EDIT_MOVE);" class="editstatusbutton">M move</a> / <a onClick="setMode(BLOCK_EDIT_COPY);" class="editstatusbutton">C copy</a> / <a onClick="blockErase();" class="editstatusbutton">E erase</a> / <a onClick="blockFill();" class="editstatusbutton">F fill</a> / ESC quit block edit');
			break;
			case MODE_BLOCK_FILL_SELECT:
				setStatus('c:char / f:foreground / k:back / esc quit block edit');
			break;

			case MODE_BLOCK_FILL:
				setStatus('type char to fill / esc quit block edit');
			break;

			case MODE_BLOCK_MOVE:
				setStatus('move cursor / flip: X, Y / esc quit block edit');
				copyBlockData();
				blockErase();
			break;
			
			case MODE_BLOCK_COPY:
				setStatus('move cursor / flip: X, Y / esc quit block edit');
				copyBlockData();
			break;
			
			case MODE_BLOCK_MOVE_MOVE:
				setStatus('move cursor / P paste / quit block edit');
			break;
			
		}
		mode=m;
	}

	function copyBlockData()
	{
		blockData= new Array(blockSize.x*blockSize.y);

		for(var x=0;x<blockSize.x;x++)
			for(var y=0;y<blockSize.y;y++)
			{
				blockData[x+y*blockSize.x]=new achar();
				blockData[x+y*blockSize.x].chr=data[x+blockPos.x+(y+blockPos.y)*width].chr;
				blockData[x+y*blockSize.x].color=data[x+blockPos.x+(y+blockPos.y)*width].color;
				blockData[x+y*blockSize.x].bg=data[x+blockPos.x+(y+blockPos.y)*width].bg;
			}
	}
	
	function pasteBlockData(xx, yy)
	{
		var canvas = document.getElementById("offcanvas");
		var ctx = canvas.getContext("2d");

		for(var x=0;x<blockSize.x;x++)
			for(var y=0;y<blockSize.y;y++)
			{
				data[xx+x+(y+yy)*width]=blockData[x+y*blockSize.x];
				redrawLine(ctx, y+yy);
			}

	} 
	
	function blockFillForeGround()
	{
		for(var x=0;x<blockSize.x;x++)
		{
			for(var y=0;y<blockSize.y;y++)
			{
				data[x+blockPos.x+(y+blockPos.y)*width].color=currentColor;
			}
		}

		redrawBlockLines();
		setMode(MODE_BLOCK_EDIT);
	}

	function blockFillBackGround()
	{
		for(var x=0;x<blockSize.x;x++)
		{
			for(var y=0;y<blockSize.y;y++)
			{
				data[x+blockPos.x+(y+blockPos.y)*width].bg=currentColorBG;
			}
		}

		redrawBlockLines();
		mode=MODE_BLOCK_EDIT;
		setMode(MODE_BLOCK_EDIT);
	}
	
	function blockFillChar(charCode)
	{
		for(var x=0;x<blockSize.x;x++)
		{
			for(var y=0;y<blockSize.y;y++)
			{
				data[x+blockPos.x+(y+blockPos.y)*width].chr=charCode;
			}
		}

		redrawBlockLines();
		mode=MODE_BLOCK_EDIT;
		setMode(MODE_BLOCK_EDIT);
	}

	function blockErase()
	{
		for(var x=0;x<blockSize.x;x++)
		{
			for(var y=0;y<blockSize.y;y++)
			{
				data[x+blockPos.x+(y+blockPos.y)*width].chr=0;
			}
		}

		redrawBlockLines();
		mode=MODE_BLOCK_EDIT;
		setMode(MODE_BLOCK_EDIT);
	}

	

	function onKeyUp(evt)
	{
		if(blockinput)return true;
		
		if(evt.keyCode==18)altDown=false;
		if(evt.keyCode==17)ctrlDown=false;
		if(evt.keyCode==16)
		{
			shiftDown=false;
			if(shiftPos.x!=cursorPos.x)
			setMode(MODE_BLOCK_EDIT);
		}
	}

	function updateMarker()
	{
		if(shiftPos.x==-1)
		{
			showmarker=false;
			document.getElementById("marker").style.display="none";
			return;	
		}

		document.getElementById("marker").style.display="block";

		var absx=Math.abs(shiftPos.x-cursorPos.x);
		var absy=Math.abs(shiftPos.y-cursorPos.y);
	
		var x=shiftPos.x;
		absx+=1;
		absy+=1;
		
		if(shiftPos.x > cursorPos.x)
			x=cursorPos.x;
		
		var y=shiftPos.y;
		if(shiftPos.y > cursorPos.y)
			y=cursorPos.y;

		blockPos.x=x;
		blockPos.y=y;
		blockSize.x=absx;
		blockSize.y=absy;

		console.log("hello world")

		document.getElementById("marker").style.width=(absx)*fontwidth;
		document.getElementById("marker").style.height=(absy)*fontheight;

		document.getElementById("marker").style.marginLeft=x*fontwidth;
		document.getElementById("marker").style.marginTop=y*fontheight;
	}

	function onKeyDown(evt)
	{
		if(blockinput)return true;
		
		var canvas = document.getElementById("offcanvas");
		var ctx = canvas.getContext("2d");

	//	debuglog.innerHTML="<br/>keycode: "+evt.keyCode+debuglog.innerHTML;



		switch(evt.keyCode)
		{
			case 17:
				ctrlDown=true;
				
			break;
			case 18:
				altDown=true;
				
			break;
			case 16:
			
				if(shiftDown==false)
				{
					shiftPos.x=cursorPos.x;
					shiftPos.y=cursorPos.y;
				}
				shiftDown=true;
				
			break;
			case 27:
				mode=0;
				setStatus("");
				showmarker=false;
				shiftPos.x=-1;
				updateMarker();
			break;
				
			case KEY_RIGHT:
			if(ctrlDown)
				moveAllRight(ctx);
			else
				cursorPos.x+=1;
			if(shiftDown)updateMarker();
			break;

			case KEY_LEFT:
			if(ctrlDown)
				moveAllLeft(ctx);
			else
				cursorPos.x-=1;
			if(shiftDown)updateMarker();
			break;

			case KEY_UP:
				cursorPos.y-=1;
				if(shiftDown)updateMarker();
			break;

			case KEY_DOWN:
				cursorPos.y+=1;
				if(shiftDown)updateMarker();
			break;
			
			 
			
			case 9:
				cursorPos.x+=8;
				if(shiftDown)updateMarker();
			break;
			
			case 8:
				cursorPos.x--;
				data[cursorPos.x+cursorPos.y*width]=new achar();
				
			break;
			
			case KEY_HOME:
				cursorPos.x=0;
			break;
			case KEY_END:
				cursorPos.x=width-1;
			break;
			
			case KEY_F1:
				insertchar(ctx,0);
			break;
			case KEY_F2:
				insertchar(ctx,1);
			break;
			case KEY_F3:
				insertchar(ctx,2);
			break;
			case KEY_F4:
				insertchar(ctx,3);
			break;
			case KEY_F5:
				insertchar(ctx,4);
			break;
			case KEY_F6:
				insertchar(ctx,5);
			break;
			case KEY_F7:
				insertchar(ctx,6);
			break;
			case KEY_F8:
				insertchar(ctx,7);
			break;
			case KEY_F9:
				insertchar(ctx,8);
			break;
			case KEY_F10:
				insertchar(ctx,9);
			break;


/*			
			case 32:
				data[(cursorPos.y+scroll)*rowLength+cursorPos.x].chr=32;
				data[(cursorPos.y+scroll)*rowLength+cursorPos.x].bg=currentColorBG;
				cursorPos.x++;
				redrawPreview();
			break;
*/

			case 13:
				cursorPos.x=0;
				cursorPos.y++;
			break;
			
			case 34:
				redrawLine(ctx, cursorPos.y) ;
				scroll+=25;
				

			     $('#offcanvas').animate(
				  { 
					top:(scroll)*-16
				  }, 150 ,"swing",function(){hideCursor=false;redraw();document.getElementById("marker").style.marginTop=-scroll*fontheight;}
				);

				hideCursor=true;
				redraw();
				redrawPreview();
			break;
			case 33:
				redrawLine(ctx, cursorPos.y) ;
				scroll-=25;
				if(scroll<0)
				{
					scroll=0;
					cursorPos.y=0;
				}
				
			     $('#offcanvas').animate(
				  { 
					top:(scroll)*-16
				  }, 150 ,"swing",function(){hideCursor=false;redraw();document.getElementById("marker").style.marginTop=-scroll*fontheight;}
				  );
				
				hideCursor=true;
				redraw();
				redrawPreview();
			break;
			
	
		}
		testCursorValid();
		redrawCursorLines(ctx);
		redraw();

		
		return false;
	}
  
 
$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);


function insertLine()
{
	var canvas = document.getElementById("offcanvas");
	var ctx = canvas.getContext("2d");
	
	for(var y=ansiHeight;y>=0;y--)
	{
		if(y>=cursorPos.y-1+scroll)
		{
			for(var x=0;x<width;x++)
			{
				if(y==cursorPos.y-1+scroll)data[(y+1)*width+x]=new achar();
				else data[(y+1)*width+x]=data[y*width+x];
			}
		}
	}
	
	for(var y=ansiHeight;y>=0;y--)
		redrawLine(ctx, y);

	redrawPreviewComplete();
	drawCursor(ctx)
}


function deleteLine()
{
	var canvas = document.getElementById("offcanvas");
	var ctx = canvas.getContext("2d");

	for(var y=0;y<ansiHeight;y++)
	{
		if(y>=cursorPos.y-1+scroll)
		{
			for(var x=0;x<width;x++)
			{
				if(y==cursorPos.y-1+scroll)data[(y+1)*width+x]=new achar();
				else data[(y)*width+x]=data[(y+1)*width+x];
			}
		}
	}

	for(var y=ansiHeight;y>=0;y--)
		redrawLine(ctx, y);

	redrawPreviewComplete();
	drawCursor(ctx)
}


function moveAllLeft(ctx)
{
	for(var y=0;y<ansiHeight;y++)
	{
		for(var x=cursorPos.x;x<width;x++)
		{
			data[y*width+x]=data[y*width+x+1];
			data[y*width+79]=new achar();
		}
		redrawLine(ctx, y);	
	}
	redrawPreviewComplete();
}

function moveAllRight(ctx)
{
	for(var y=0;y<ansiHeight;y++)
	{
		for(var x=width-1;x>cursorPos.x;x--)
		{
			data[y*width+x]=data[y*width+x-1];
			
		}
		data[y*width+cursorPos.x]=new achar();
		redrawLine(ctx, y);	
	}
	redrawPreviewComplete();
}

function log(s)
{
	debuglog.innerHTML="<br/>"+s;//+debuglog.innerHTML;
}


function insertchar(ctx,which)
{
	if(mode==MODE_BLOCK_FILL)
	{
		blockFillChar(sets[currentset][which]);
	}
	else
	if(mode==0)
	{
		data[(cursorPos.y+scroll)*rowLength+cursorPos.x].chr=sets[currentset][which];
		data[(cursorPos.y+scroll)*rowLength+cursorPos.x].color=currentColor;
		data[(cursorPos.y+scroll)*rowLength+cursorPos.x].bg=currentColorBG;
		cursorPos.x++;
		redrawCursorLine(ctx);
		if(cursorPos.y+scroll>ansiHeight)ansiHeight=cursorPos.y+scroll;
	}
	redrawPreview();
}


function testCursorValid()
{
	if(cursorPos.x<0)cursorPos.x=0;
	if(cursorPos.x>width-1)cursorPos.x=width-1;

	var mustRedraw=false;
	
	if(cursorPos.y<0)
	{
		scroll--;
		if(scroll<0)scroll=0;
		cursorPos.y=0;
		document.getElementById("offcanvas").style.top=-scroll*fontheight;
		document.getElementById("marker").style.marginTop=-scroll*fontheight;
	}
	else
	if(cursorPos.y==height)
	{
		cursorPos.y=height-1;
		scroll++;
		if(scroll-height>rows)scroll--;
		
		document.getElementById("offcanvas").style.top=-scroll*fontheight;
		document.getElementById("marker").style.marginTop=-scroll*fontheight;
	}

	document.getElementById("ansipos").innerHTML=(cursorPos.x+1)+","+(1+cursorPos.y+scroll);
	//$("#ansipos").innerHTML="blabal";//innerHTML=
}

function drawCursor(ctx)
{
	if(hideCursor==false)
	{
		ctx.fillStyle = "rgba(128, 128, 128, 0.5)";
		ctx.fillRect (cursorPos.x*fontwidth, (cursorPos.y+scroll)*fontheight, 8, fontheight);
		ctx.fillStyle = "rgb(0,0,0)";
	}
}

function redrawCursorLine(ctx)
{
	redrawLine(ctx, cursorPos.y);	
}

function redrawBlockLines()
{
	var canvas = document.getElementById("offcanvas");
	var ctx = canvas.getContext("2d");

	for(var y=blockPos.y;y<blockPos.y+blockSize.y;y++)
	{
		redrawLine(ctx, y);
	}
}



function redrawCursorLines(ctx)
{
	if(cursorPos.y-1>=0)redrawLine(ctx, cursorPos.y-1);
	redrawLine(ctx, cursorPos.y);
	redrawLine(ctx, cursorPos.y+1);
}


function redrawLine(ctx, y) 
{
	ctx.fillRect (0, (y+scroll)*fontheight, width*fontwidth, fontheight);
	
	for(var x=0;x<rowLength;x++)
	{
		var which=(y+scroll)*rowLength+x;
		
		try
		{
			//background (h4x)
			if(data[which].bg>=0)
				ctx.drawImage(img, 219*fontwidth,data[which].bg*fontheight,fontwidth,fontheight,x*fontwidth,(y+scroll)*fontheight,9,fontheight);
	
			//char
			if(data[which].chr!=32)
				ctx.drawImage(img, data[which].chr*fontwidth,data[which].color*fontheight,fontwidth,fontheight,x*fontwidth,(y+scroll)*fontheight,fontwidth,fontheight);
		}
		catch(e){}
	}
}


var imgd;

function redraw() 
{
	var canvas = document.getElementById("offcanvas");
	var ctx = canvas.getContext("2d");
	
	var d = new Date();
	timestart=d.getMilliseconds();
	drawCursor(ctx);
}

function init()
{
	for(var i=0;i<16;i++)
		document.getElementById("color"+i).style.backgroundColor="rgb("+cols[i].r+","+cols[i].g+","+cols[i].b+")";
	for(var i=0;i<8;i++)
		document.getElementById("bgcolor"+i).style.backgroundColor="rgb("+cols[i].r+","+cols[i].g+","+cols[i].b+")";
		


	var offcanvas = document.getElementById("offcanvas");
	var offctx = offcanvas.getContext("2d");

	offctx.fillStyle = "rgb(0,0,0)";
	offctx.fillRect (0, 0, offcanvas.width,offcanvas.height);


	if(dataset==true)
	{
		for(var i=0;i<ansiHeight;i++)
		{
			redrawLine(offctx,i);
		}
		

	}
	else
	{
		for(var i=0;i<data.length;i++)data[i]=new achar();
	}
	
	
	
	
	
	var canvas = document.getElementById("smallcanvas");
	var ctx = canvas.getContext("2d");
	
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.fillRect (0, 0, canvas.width,canvas.height);
	
	
}

function redrawkeys() 
{
	var canvas = document.getElementById("canvaskeys");
	var ctx = canvas.getContext("2d");

	ctx.fillStyle = "rgb("+cols[currentColorBG].r+","+cols[currentColorBG].g+","+cols[currentColorBG].b+")";
	ctx.fillRect (0, 0, 500,fontheight);

	for(var i=0;i<sets[currentset].length;i++)
	{
		var p=i*9*4;
		var myS = new String('1234567890:'); 
		
		var col=0;
		if(currentColorBG==0 || currentColorBG==1 )col=7;

		
		ctx.drawImage(img, myS.charCodeAt(i)*fontwidth,col*fontheight,fontwidth,fontheight,p+9+fontwidth,0,fontwidth,fontheight);
		ctx.drawImage(img, myS.charCodeAt(10)*fontwidth,col*fontheight,fontwidth,fontheight,p+18+fontwidth,0,fontwidth,fontheight);
		ctx.drawImage(img, sets[currentset][i]*fontwidth,currentColor*fontheight,fontwidth,fontheight,p+27+fontwidth,0,fontwidth,fontheight);
	}
	
}

// preview





function redrawPreview()
{
	var canvas = document.getElementById("smallcanvas");
	var ctx = canvas.getContext("2d");
	redrawPreviewLine(ctx,cursorPos.y+scroll);
}

function redrawPreviewComplete()
{
	var canvas = document.getElementById("smallcanvas");
	var ctx = canvas.getContext("2d");
	
	for(var y=0;y<ansiHeight+2;y++)
	{
		redrawPreviewLine(ctx,y);
	}
}

function redrawPreviewLine(ctx,y)
{
	
	
	var pixelWidth=2;
	var pixelHeight=4;
	
	for(var x=0;x<width;x++)
	{

		//for(var y=0;y<ansiHeight+2;y++)
		{
			//178,177,176,219,223,220,221,222,254,250
			var dwhich=y*width+x;

			
			var a="1.0"
			if(data[dwhich].chr==178)a="0.75";
			if(data[dwhich].chr==177)a="0.50";
			if(data[dwhich].chr==176)a="0.25";
			
			var which=data[dwhich].color;
			var colFG = "rgba("+cols[which].r+","+cols[which].g+","+cols[which].b+","+a+")";
			
			var which=data[dwhich].bg;
			
			
			var colBG = "rgba("+cols[which].r+","+cols[which].g+","+cols[which].b+",1.0)";
		
			var xp=x*pixelWidth;
			var yp=y*pixelHeight;
	
			switch(data[dwhich].chr)
			{
				case 32:
					ctx.fillStyle = colBG;
					ctx.fillRect (xp,yp, pixelWidth,pixelHeight);
				break;
				case 219:
					ctx.fillStyle = colFG;
					ctx.fillRect (xp,yp, pixelWidth,pixelHeight);
				break;
				case 178:
				case 177:
				case 176:
					ctx.fillStyle = colBG;
					ctx.fillRect (xp,yp, pixelWidth,pixelHeight);
					ctx.fillStyle = colFG;
					ctx.fillRect (xp,yp, pixelWidth,pixelHeight);
				break;
				
				case 223:
					ctx.fillStyle = colBG;
					ctx.fillRect (xp,yp+pixelHeight/2, pixelWidth,pixelHeight/2);
					ctx.fillStyle = colFG;
					ctx.fillRect (xp,yp, pixelWidth,pixelHeight/2);					
				break;
				case 220:
					ctx.fillStyle = colFG;
					ctx.fillRect (xp,yp+pixelHeight/2, pixelWidth,pixelHeight/2);
					ctx.fillStyle = colBG;
					ctx.fillRect (xp,yp, pixelWidth,pixelHeight/2);					
				break;
				
				case 221:
					ctx.fillStyle = colBG;
					ctx.fillRect (xp+pixelWidth/2,yp, +pixelWidth/2,pixelHeight);
					ctx.fillStyle = colFG;
					ctx.fillRect (xp,yp, pixelWidth/2,pixelHeight);
				break;
				case 222:
					ctx.fillStyle = colFG;
					ctx.fillRect (xp+pixelWidth/2,yp, +pixelWidth/2,pixelHeight);
					ctx.fillStyle = colBG;
					ctx.fillRect (xp,yp, pixelWidth/2,pixelHeight);
				break;
				
			}
			//ctx.fillRect (5,5, 10,10);
			

	//ctx.fillRect (x,y, 8, 16);
		
		}
		
		
		// border around current area
		//ctx.fillStyle = "rgba(180,180,180,0.2)";
		//ctx.fillRect (0,scroll*pixelHeight, 11,pixelHeight*height);
		//ctx.fillRect (0,(scroll+height)*pixelHeight, pixelWidth*width,1);
		
	}
}

function getData()
{
	var ret="";
	for(var i=0;i<(ansiHeight+1)*width;i++)
	{
		ret+=data[i].getData()+",";
	}
	
	return ret;
}


function resetSaveButton()
{
	document.getElementById("savebutton").innerHTML="save";
}

function save()
{
	document.getElementById("savebutton").innerHTML="( saving... )";

	$.post('/ajax_saveansi/', {
	    data: getData(),
	    id: ansiID
	}, function() {
	    document.getElementById("savebutton").innerHTML="( saved \\o/ )";
	    setTimeout("resetSaveButton();",2000);
	});
}

function setdata(arr)
{
	dataset=true;
	for(var i=0;i<data.length;i++)data[i]=new achar();

	for(var i=0;i<arr.length/3;i++)
	{
		data[i].chr=arr[i*3+0];
		data[i].bg=arr[i*3+1];
		data[i].color=arr[i*3+2];
	}
	ansiHeight=arr.length/3/width;

}


jQuery.preloadImages = function()
{
  for(var i = 0; i<arguments.length; i++)
  {
    jQuery("<img>").attr("src", arguments[i]);
  }
}

function resizeCanvas(size)
{
	var siz=document.getElementById("canvdiv").style.height;
	siz=siz.replace("px","");
	siz=parseInt(siz);
	siz+=size;
	document.getElementById("canvdiv").style.height=siz;
	height=Math.round(siz/fontheight);
}

function toggleHelp()
{

	if(document.getElementById("edithelp").style.display!="block")
	{
		document.getElementById("edithelp").style.display="block";
		document.getElementById("canvdiv").style.display="none";
	}
	else
	{
		document.getElementById("edithelp").style.display="none";
		document.getElementById("canvdiv").style.display="block";
	}
	
}



