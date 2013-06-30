define(['jquery'], function(jQuery) {

        jQuery.noConflict();
        var $j = jQuery;

        var Jarvis = Class.create();
        Jarvis.prototype = {

                initialize:function(levelIA){
                    
                    //Brain configurations
                    this.id = undefined;
                    this.name = "Jarvis";

                    //Jarvis configurations
                    this.mapBrain = undefined;
                    this.actualPhase = 1;

                },

         
                playPhase1: function(board){

                	//Id opponent
                	var idOpponent = (this.id == 1) ? 2 : 1;

                	//All nodes are assign to priority 0
                	this.mapBrain = this.getBaseMapBrain(board);

                	//Assign priority to node which allow to finish a line : 20
                	this.detectFinishLine(board, this.id);

                	//Assign priority to node which allow to prevent the opponent to finish a line  : 15
                	this.detectFinishLine(board, idOpponent);

                	//Assign priority to node which allow to pass in situation pre-double line : 5
                	this.detectPreDoubleLine(board, this.id);

                	//Assign priority to node which allow to pass in situation double line : 10 
                	this.detectDoubleLine(board, this.id);

                	//Assign priority to node which allow to prevent the opponent to pass in situation pre-double line : 3
                	this.detectPreDoubleLine(board, idOpponent);

                	//Assign priority to node which allow to prevent the opponent to pass in situation double line : 9
                	this.detectDoubleLine(board, idOpponent);


                	//Best moves calculation
                	var moves = new Array();
                	var maxPriority = 0;
                	for(var i = 0; i < 3; i++)
                	{
                		for(var j = 0; j < 8; j++)
                		{
                			if(this.mapBrain[i][j] >= maxPriority && this.mapBrain[i][j] != -1)
                			{
                				if(this.mapBrain[i][j] > maxPriority)
                				{
                					moves = new Array();
                					maxPriority = this.mapBrain[i][j];
                				}
                				var move = new Object();
                				move.X = i;
                				move.Y = j; 
                				moves.push(move);
                			}
                		}
                	}

                	//Get one move in the best moves array
                	var move = this.getRandomInArray(moves);

                	//Send move to IA
                    return move;
                },
   
                playPhase2: function(board){
                	this.actualPhase = 2;

					//Id opponent
                	var idOpponent = (this.id == 1) ? 2 : 1;

                    //Get all possibles moves and set priority to 0
                    var moves = this.getMovesPossibles(board, this.id);
                    var movesOpponent = this.getMovesPossibles(board, idOpponent);

                    //Looking for moves allow to make moulin
                    this.detectMoveMoulin(board, moves, this.id);

                    //Looking for moves allow to prevent moulin from oppenent (1 or 2 moves prevent)
                    this.detectMoveMoulin(board, movesOpponent, idOpponent);
                    this.detectOpponentMoveMoulin(board, moves, movesOpponent);

                    //Looking for moves allow to make moulin in two moves
                    this.detectMoveMoulinTwoMoves(board, moves);

                    //Don't break moulin when opponent will make moulin next move
                    this.detectBreakMoulinIsWrong(moves, movesOpponent);

                    //Don't move if it allow to the oppenent to make a moulin next move
                    this.detectMovePieceIsWrong(board, moves);

                    if(moves.length == 0)
                    {
                    	//No more move left, the IA lose
                        return {X: -1, Y: -1};
                    }
                    else
                    {
                        //Best moves calculation
                		var movesP = new Array();
                		var maxPriority = -1000; // -1000 for never be first maxPriority at the end
	                	for(var i = 0; i < moves.length; i++)
	                	{
	                		if(moves[i].priority >= maxPriority)
	                		{
	                			if(moves[i].priority > maxPriority)
	                			{
	                				movesP = new Array();
	                				maxPriority = moves[i].priority;
	                			}
	                			movesP.push(moves[i]);
	                		}
	                	}

	                	//Get one move in the best moves array
	                	var move = this.getRandomInArray(movesP);
                        
                        return move;
                    }
                },

                playMoulinMade: function(board){
					//Id opponent
                	var idOpponent = (this.id == 1) ? 2 : 1;
                    var piecesOpponent = new Array();
                    var piecesOpponentMoulins = new Array();

                    //Count number of ennemie pieces left and not in moulin
                    var nbPieceAdverse = 0;
                    for (var i = 0; i < 3; i++) 
                    {
                        for (var j =0; j < 8; j++) 
                        {
                            if(board[i][j] == idOpponent) //Pieces ennemie
                                if($j.inArray("" + i + j, board.moulins) == -1) //Not contains in a moulin
                                    piecesOpponent.push({X: i, Y: j, priority: 0}); 
                                else
                                	piecesOpponentMoulins.push({X: i, Y: j, priority: 0}); 
                        }
                    }

                    //If no piece to delete send to IA null answer (-1,-1)
                    if(piecesOpponent.length == 0)
                    {
                        //Except if pieces in moulins on board we can delete one of them
                    	if(piecesOpponentMoulins.length > 0)
                    	{
                    		return this.getRandomInArray(piecesOpponentMoulins);
                    	}
                    	else
                    	{
                    		//Send coup to IA
                        	return {X: -1, Y: -1};
                    	}                        
                    }

                    if(this.actualPhase == 1)
                    {
                    	//Detect remove retire double line
                    	//Detect remove retire one line (one line == 2 piece + 1 empty node)
                    	this.detectRemoveRetireLine(board, piecesOpponent);                    	

                    	//Piece link with 2 others (probably can make a moulin)
	                    //this.detectPieceLinkToTwoOthers(board, piecesOpponent); 
	                    /*Not implement for difficulty, function not finish, don't use it*/
                    }
                    else if(this.actualPhase == 2)
                    {
                    	//Piece which can made a moulin next move
	                    this.detectPieceMadeMoulinNextMove(board, piecesOpponent, idOpponent);

	                    //Piece link with 2 others (probably can make a moulin)
	                    //this.detectPieceLinkToTwoOthers(board, piecesOpponent);
	                    /*Not implement for difficulty, function not finish, don't use it*/
                    }
                    
                    //Looking for the ones with the most priority
                    var moves = new Array();
                    var maxPriority = -1000;
                    for(var i = 0; i < piecesOpponent.length; i++)
                    {
                    	if(piecesOpponent[i].priority >= maxPriority)
                    	{                   		
                    		if(piecesOpponent[i].priority > maxPriority)
                    		{
                    			moves = new Array();
                    			maxPriority = piecesOpponent[i].priority;
                    		}
                    		moves.push(piecesOpponent[i]);
                    	}
                    }

                    //Get one move in the best moves array
	                var move = this.getRandomInArray(moves);

                    //Send coup to IA
                    return move;
                },

                getRandomInArray: function(theArray){
                	var random = Math.floor((Math.random()*theArray.length)+0);
                	return theArray[random];
                },

                getBaseMapBrain: function(board){
                    var mapBrain = new Array();
                    
                    for(var i = 0; i < 3; i++)
                    {
                         mapBrain[i] = new Array();

                        for(var j = 0; j < 8; j++)
                        {
                            mapBrain[i][j] = 0;
                        }
                    }
                   
                    for(var i = 0; i < 3; i++)
                    {
                        for(var j = 0; j < 8; j++)
                        {
                        	if(board[i][j] != 0)
                        	{
                        		mapBrain[i][j] = -1;
                        	}
                        }
                    }

                    return mapBrain;
                },

                detectFinishLine: function(board, playerId){

                	//Array containing Nodes which allow to finish a moulin
                	var moulinsAlmost = new Array(); 

                    //Verification 4 lines of the current square
                    for(var i = 0; i < 3; i++)
                    {
                        for(var j = 0; j < 8; j+=2) 
                        {
                        	//Count the nb of piece in the line
                        	var nbId = 0;
                            if(board[i][j] == playerId)
                            	nbId++;
                            if(board[i][(j+1)%8] == playerId)
                            	nbId++;
                            if(board[i][(j+2)%8] == playerId)
                            	nbId++;

                            //If Two piece of the player detect
                            if(nbId == 2)
                            {
                            	//Found the empty node to add it in moulinsAlmost
                            	var move = new Object();
                            	move.X = i;
                            	move.Y = undefined;
                            	if(board[i][j] == 0){ move.Y = j; }
                            	if(board[i][(j+1)%8] == 0){ move.Y = (j+1)%8; }
                            	if(board[i][(j+2)%8] == 0){ move.Y = (j+2)%8; }
                            	if(move.Y != undefined) 
                            		moulinsAlmost.push(move);
                            }                           
                        }   
                    }

                    //Verif 4 specials lines
                    for(var j = 1; j < 8; j+= 2) // 1 - 3 - 5 - 7
                    {

                    	//Count the nb of piece in the line
                        	var nbId = 0;
                            if(board[0][j] == playerId)
                            	nbId++;
                            if(board[1][j] == playerId)
                            	nbId++;
                            if(board[2][j] == playerId)
                            	nbId++;

                            //If Two piece of the player detect
                            if(nbId == 2)
                            {
                            	//Found the empty node to add it in moulinsAlmost
                            	var move = new Object();
                            	move.Y = j;
                            	move.X = undefined;
                            	if(board[0][j] == 0){ move.X = 0; }
                            	if(board[1][j] == 0){ move.X = 1; }
                            	if(board[2][j] == 0){ move.X = 2; }
                            	if(move.X != undefined) 
                            		moulinsAlmost.push(move);
                            }     
                    }

                    //Add priorities to the mapBrain
                    var priority = (playerId == this.id) ? 20 : 15;
                    for(var i = 0; i < moulinsAlmost.length; i++)
	                {
	                    this.mapBrain[moulinsAlmost[i].X][moulinsAlmost[i].Y] += priority
	                }             
                },
                
                detectPreDoubleLine: function(board, playerId){

                	var preDoubleLineMoves = new Array();

                	//For each nodes
                	for(var i = 0; i < 3; i++)
                	{
                		for(var j = 0; j < 8; j++)
                		{
                			if(board[i][j] == 0)
                			{
                				if(j % 2 == 0) //If the node is a corner
                				{
                					//Verify by the opposite corner
                					var oppositeCorner = (j + 4) % 8;
                					if(board[i][oppositeCorner] == playerId)
                					{
                						if(board[i][((j+1)%8)] == 0 && board[i][((j+2)%8)] == 0 && board[i][((j+3)%8)] == 0)
                							preDoubleLineMoves.push({X: i, Y: j});
                						if(board[i][((j+5)%8)] == 0 && board[i][((j+6)%8)] == 0 && board[i][((j+7)%8)] == 0)
                							preDoubleLineMoves.push({X: i, Y: j});
                					}

                					//(square level have different verif to do)
                					var addI = new Array();
                					if(i == 0){ addI.push(1);}
                					if(i == 1){ addI.push(1, -1);}
                					if(i == 2){ addI.push(-1);}

                					//For each verif to do
                					for(var k = 0; k < addI.length; k++)
                					{
                						//Looking for situation twice (example: jT=3 && jT=1)
                						var loop = 0;
                						while(loop != 2)
                						{
                							var jT = (loop == 0) ? (j+1) % 8 : (j+7) % 8;
                							var jTi = (loop == 0) ? (j+7) % 8: (j+1) % 8;

                							//Verify if node have a piece
                							if(board[i+addI[k]][jT] == playerId)
	                						{
	                							var countEmpty = 0;
	                							if(board[0][jT] == 0){ countEmpty++; }
	                							if(board[1][jT] == 0){ countEmpty++; }
	                							if(board[2][jT] == 0){ countEmpty++; }

	                							//If other node for lines empty push the move
	               								if(board[i][jTi] == 0 && countEmpty >= 2)
	               									preDoubleLineMoves.push({X: i, Y: j});
	               							}
	               							loop++;
                						}
                					}
                				}
                				else //Else is a middle edge
                				{
                					//Verify for middle next edge
                					if(board[i][((j+2)%8)] == playerId)
                					{
                						if(board[i][((j+7)%8)] == 0 && board[i][((j+1)%8)] == 0 && board[i][((j+3)%8)] == 0)
                							preDoubleLineMoves.push({X: i, Y: j});               				
                					} 
                					//Verify for middle previous edge
                					if(board[i][((j-2)%8)] == playerId)
                					{
                						if(board[i][((j+7)%8)] == 0 && board[i][((j+1)%8)] == 0 && board[i][((j+3)%8)] == 0)
                							preDoubleLineMoves.push({X: i, Y: j});               				
                					} 


                					//(square level have different verif to do)
                					var addI = new Array();
                					if(i == 0){ addI.push(1);}
                					if(i == 1){ addI.push(1, -1);}
                					if(i == 2){ addI.push(-1);}

                					for(var k = 0; k < addI.length; k++)
                					{
                						var loop = 0;
                						while(loop != 2)
                						{
                							var jT = (loop == 0) ? (j+1) % 8 : (j+7) % 8;
                							var jTi = (loop == 0) ? (j+7) % 8 : (j+1) % 8;

	                						if(board[i+addI[k]][jT] == playerId)
	                						{
	                							var countEmpty = 0;
		                						if(board[0][j] == 0){ countEmpty++; }
		                						if(board[1][j] == 0){ countEmpty++; }
		                						if(board[2][j] == 0){ countEmpty++; }

	                							if(board[i+addI[k]][jTi] == 0 && countEmpty >= 2)
	                								preDoubleLineMoves.push({X: i, Y: j});
	                						}
	                						loop++;
	                					}
                					}
                				}            				
                			}
                		}
                	}

                	//Add priorities to the mapBrain
                    var priority = (playerId == this.id) ? 5 : 3;
                    for(var i = 0; i < preDoubleLineMoves.length; i++)
	                {
	                    this.mapBrain[preDoubleLineMoves[i].X][preDoubleLineMoves[i].Y] += priority;
	                    if(this.mapBrain[preDoubleLineMoves[i].X][preDoubleLineMoves[i].Y] > 8 && this.mapBrain[preDoubleLineMoves[i].X][preDoubleLineMoves[i].Y] < 20)
	                    	this.mapBrain[preDoubleLineMoves[i].X][preDoubleLineMoves[i].Y] = 8;
	                }
                },

                detectDoubleLine: function(board, playerId){

                	var doubleLineMoves = new Array(); 

                	for(var i = 0; i < 3; i++)
                	{
                		for(var j = 0; j < 8; j++)
                		{
                			if(board[i][j] == 0)
                			{
	                			var nbPreMoulinBefore = this.getNbPreMoulins(board, playerId);
	                			var boardModify = this.getCopyBoard(board);
	                			boardModify[i][j] = playerId;
	                			var nbPreMoulinAfter = this.getNbPreMoulins(boardModify, playerId);

	                			if((nbPreMoulinBefore < nbPreMoulinAfter) && ((nbPreMoulinAfter - nbPreMoulinBefore) == 2))
	                			{
	                				var move = new Object();
	                				move.X = i;
	                				move.Y = j;
	                				doubleLineMoves.push(move);
	                			}
                			}
                		}
                	}

                	//Add priorities to the mapBrain
                    var priority = (playerId == this.id) ? 10 : 9;
                    for(var i = 0; i < doubleLineMoves.length; i++)
	                {
	                    this.mapBrain[doubleLineMoves[i].X][doubleLineMoves[i].Y] += priority
	                }
                },

                getNbPreMoulins: function(board, playerId){
                	var nbPreMoulins = 0;

                    //Verification 4 lines of the current square
                    for(var i = 0; i < 3; i++)
                    {
                        for(var j = 0; j < 8; j+=2) 
                        {
                        	//Count the nb of piece in the line
                        	var nbId = 0;
                            if(board[i][j] == playerId)
                            	nbId++;
                            if(board[i][(j+1)%8] == playerId)
                            	nbId++;
                            if(board[i][(j+2)%8] == playerId)
                            	nbId++;

                            //If Two piece of the player detect
                            if(nbId == 2)
                            {
                            	//Found the empty node to add it in moulinsAlmost
                            	var move = new Object();
                            	move.X = i;
                            	move.Y = undefined;
                            	if(board[i][j] == 0){ move.Y = j; }
                            	if(board[i][(j+1)%8] == 0){ move.Y = (j+1)%8; }
                            	if(board[i][(j+2)%8] == 0){ move.Y = (j+2)%8; }
                            	if(move.Y != undefined) 
                            		nbPreMoulins++;
                            }                           
                        }   
                    }

                    //Verif 4 specials lines
                    for(var j = 1; j < 8; j+= 2) // 1 - 3 - 5 - 7
                    {

                    	//Count the nb of piece in the line
                        	var nbId = 0;
                            if(board[0][j] == playerId)
                            	nbId++;
                            if(board[1][j] == playerId)
                            	nbId++;
                            if(board[2][j] == playerId)
                            	nbId++;

                            //If Two piece of the player detect
                            if(nbId == 2)
                            {
                            	//Found the empty node to add it in moulinsAlmost
                            	var move = new Object();
                            	move.Y = j;
                            	move.X = undefined;
                            	if(board[0][j] == 0){ move.X = 0; }
                            	if(board[1][j] == 0){ move.X = 1; }
                            	if(board[2][j] == 0){ move.X = 2; }
                            	if(move.X != undefined) 
                            		nbPreMoulins++;
                            }     
                    }

                    return nbPreMoulins;
                },

                getNbMoulins: function(board){
                    //Nb of moulins
                    var nbMoulins = 0;

                    //Verification 4 lines of the current square
                    for(var i = 0; i < 3; i++)
                    {
                        for(var j = 0; j < 8; j+=2) 
                        {
                            if(board[i][j] != 0 && board[i][j] == board[i][(j+1)%8] && board[i][j] == board[i][((j+2)%8)])
                                nbMoulins++;
                        }   
                    }

                    //Verif 4 specials lines
                    for(var j = 1; j < 8; j+= 2) // 1 - 3 - 5 - 7
                    {
                        if(board[0][j] != 0 && board[0][j] == board[1][j] && board[0][j] == board[2][j])
                            nbMoulins++;
                    }

                    //Return Nb of moulins detected
                    return nbMoulins;
                },

                getCopyBoard: function(board){
					var boardCopy = new Array();

					for(var i = 0; i < 3; i++)
                	{
                		boardCopy[i] = new Array();
                		for(var j = 0; j < 8; j++)
                		{
                			boardCopy[i][j] = board[i][j];
                		}
                	} 

                	return boardCopy;
                },

                detectMoveMoulin: function(board, moves, playerId){

                	for(var i = 0; i < moves.length; i++)
                	{
                		var move = moves[i]
                		var boardCopy = this.getCopyBoard(board);
                		boardCopy[move.XP][move.YP] = 0;
                		boardCopy[move.X][move.Y] = playerId;

                		var moulins = this.collectMoulinNodes(board);
                		var nodeIsInMoulin = this.isNodeInMoulinsNodes({X: move.XP, Y: move.YP}, moulins);

                		var nbMoulinsBefore = this.getNbMoulins(board);
                		var nbMoulinsAfter = this.getNbMoulins(boardCopy);

                		if((nbMoulinsAfter > nbMoulinsBefore) || (nodeIsInMoulin && nbMoulinsAfter == nbMoulinsBefore))
                		{
                			move.priority += 20;
                		}
                	}
                },

                detectOpponentMoveMoulin:  function(board, moves, movesOpponent){

                	for(var i = 0; i < movesOpponent.length; i++)
                	{
                		if(movesOpponent[i].priority == 20)
                		{
	                		for(var j = 0; j < moves.length; j++)
	                		{
	                			if(moves[j].X == movesOpponent[i].X && moves[j].Y == movesOpponent[i].Y)
	                			{
	                				moves[j].priority += 15;
	                			}	                				
	                			else
	                			{
	                				var move = moves[j];
			                		var boardCopy = this.getCopyBoard(board);
			                		boardCopy[move.XP][move.YP] = 0;
			                		boardCopy[move.X][move.Y] = this.id;
	                				var movesNode = this.getMovesPossiblesForOneNode(boardCopy, {X: move.X, Y: move.Y});
	                				this.detectMoveMoulin(boardCopy, movesNode); 

	                				for(var k = 0; k < movesNode.length; k++)
			                		{
			                			if(movesNode[k].priority == 20)
			                			{
			                				moves[i].priority +=3;
			                			}
			                		}
	                			}

	                		}
	                	}
                	}
                },

                detectMoveMoulinTwoMoves: function(board, moves){

                	//For each moves possible for the player
                	for(var i = 0; i < moves.length; i++)
                	{
                		//Simulate the move
                		var move = moves[i];
                		var boardCopy = this.getCopyBoard(board);
                		boardCopy[move.XP][move.YP] = 0;
                		boardCopy[move.X][move.Y] = this.id;

                		//Get new move for the moved node
                		var movesNode = this.getMovesPossiblesForOneNode(boardCopy, {X: move.X, Y: move.Y});
                		
                		//Detect change if this new place allow to make a moulin in one move
                		this.detectMoveMoulin(boardCopy, movesNode, this.id);  

                		//If possibility of moulin detect assign prioprity 10 to the current moves
                		//because he allow to make a moulin in 2 moves
                		for(var j = 0; j < movesNode.length; j++)
                		{
                			if(movesNode[j].priority == 20)
                			{
                				moves[i].priority +=10;
                			}

                			//Think 2 moves in advance (repeat the procedure for each possible moves)
                			var move2 = movesNode[j];
	                		var boardCopy2 = this.getCopyBoard(boardCopy);
	                		boardCopy2[move2.XP][move2.YP] = 0;
	                		boardCopy2[move2.X][move2.Y] = this.id;
	                		var movesNode2 = this.getMovesPossiblesForOneNode(boardCopy2, {X: move2.X, Y: move2.Y});	                		
	                		this.detectMoveMoulin(boardCopy2, movesNode2);  

	                		for(var k = 0; k < movesNode2.length; k++)
	                		{
	                			if(movesNode2[k].priority == 20)
	                			{
	                				moves[i].priority +=5;
	                			}
	                		}
                		}            			
                	}
                },

                detectBreakMoulinIsWrong: function(moves, movesOpponent){
                	//For each moves possible of the opponent
                	for(var i = 0; i < movesOpponent.length; i++)
                    {
                    	//We looking for a move represent a move which allow to made a moulin
                    	if(movesOpponent[i].priority >= 20)
                    	{
                    		//If found, set all moves which break a moulin to less priority (dont't break moulin)
                    		for(var j = 0; j < moves.length; j++)
                    		{
                    			if(moves[j].priority >= 10 && moves[j].priority < 15)
                    			{
                    				moves[j].priority -= 15; //Set to negative for don't break
                    			}
                    		}
                    	}
                    }
                },

                detectMovePieceIsWrong: function(board, moves){
					var idOpponent = (this.id == 1) ? 2 : 1;

					//For each moves
                	for(var i = 0; i < moves.length; i++)
                	{
                		//We simulate the move
                		var move = moves[i];
	                	var boardCopy = this.getCopyBoard(board);
	                	boardCopy[move.XP][move.YP] = 0;
	                	boardCopy[move.X][move.Y] = this.id;

	                	//Get opponent moves in this situation + priorities
                    	var movesOpponent = this.getMovesPossibles(boardCopy, idOpponent);
                    	this.detectMoveMoulin(boardCopy, movesOpponent, idOpponent);

                    	//For each opponent moves in this situation
                		for(var j = 0; j < movesOpponent.length; j++)
                		{
                			//If the move of the opponent have a high priority (>=20)
                			//&& the move is right where our piece is right now
                			// DONT MOVE
                			if(movesOpponent[j].priority >= 20 && movesOpponent[j].X == moves[i].XP && movesOpponent[j].Y == moves[i].YP)
                			{
                				moves[i].priority -= 10;
                			}
                		}
                	}
                },

                getMovesPossibles: function(board, playerId){

                	//Get all possibles moves and set priority to 0
                    var moves = new Array();

                    for(var i = 0; i < 3; i++)
                    {
                        for(var j = 0; j < 8; j++)
                        {
                            if(board[i][j] == playerId)
                            {
                                if(j % 2 == 0)
                                {
                                    if(board[i][(j+1)%8] == 0)
                                        moves.push({XP: i, YP:j, X: i, Y: (j+1)%8, priority: 0});

                                    if(board[i][(j+7)%8] == 0)
                                        moves.push({XP: i, YP:j, X: i, Y: (j+7)%8, priority: 0});

                                    continue;
                                }
                                else
                                {
                                    if(board[i][(j+7)%8] == 0)
                                        moves.push({XP: i, YP:j, X: i, Y: (j+7)%8, priority: 0});

                                    if(board[i][(j+1)%8] == 0)
                                        moves.push({XP: i, YP:j, X: i, Y: (j+1)%8, priority: 0});

                                    if(i == 0 || i == 1)
                                        if(board[i+1][j] == 0)
                                            moves.push({XP: i, YP:j, X: i+1, Y: j, priority: 0});

                                    if(i == 1 || i == 2)
                                        if(board[i-1][j] == 0)
                                            moves.push({XP: i, YP:j, X: i-1, Y: j, priority: 0});

                                    continue;               
                                }
                            }      
                        }
                    }

                    return moves;
                },

                getMovesPossiblesForOneNode: function(board, node){
                	//Get all possibles moves for the node
                    var moves = new Array();

                    var i = node.X;
                    var j = node.Y;

                    if(j % 2 == 0)
                    {
                        if(board[i][(j+1)%8] == 0)
                            moves.push({XP: i, YP:j, X: i, Y: (j+1)%8, priority: 0});

                        var addJ = (j == 0) ? +7 : -1; //Case 0

                        if(board[i][(j+7)%8] == 0)
                            moves.push({XP: i, YP:j, X: i, Y: (j+7)%8, priority: 0});
                    }
                    else
                    {
                        if(board[i][(j+7)%8] == 0)
                            moves.push({XP: i, YP:j, X: i, Y: (j+7)%8, priority: 0});

                        var addJ = (j == 7) ? -7 : 1; //Case 7

                        if(board[i][(j+1)%8] == 0)
                            moves.push({XP: i, YP:j, X: i, Y: (j+1)%8, priority: 0});

                        if(i == 0 || i == 1)
                            if(board[i+1][j] == 0)
                                moves.push({XP: i, YP:j, X: i+1, Y: j, priority: 0});

                        if(i == 1 || i == 2)
                            if(board[i-1][j] == 0)
                                moves.push({XP: i, YP:j, X: i-1, Y: j, priority: 0});
             
                    }  

                    return moves;              
                },

                collectMoulinNodes: function(board){
                    var moulins = new Array(); //Contains all sommets we are part of moulin

                    //Verification 4 lines of the current square
                    for(var i = 0; i < 3; i++)
                    {
                        for(var j = 0; j < 8; j+=2) 
                        {
                            if(board[i][j] != 0 && board[i][j] == board[i][(j+1)%8] && board[i][j] == board[i][((j+2)%8)])
                            {
                                moulins.push({X: i, Y: j});
                                moulins.push({X: i, Y: (j+1)%8});
                                moulins.push({X: i, Y: ((j+2)%8)});
                            }
                        }   
                    }

                    //Verif 4 specials lines
                    for(var j = 1; j < 8; j+= 2) // 1 - 3 - 5 - 7
                    {
                        if(board[0][j] != 0 && board[0][j] == board[1][j] && board[0][j] == board[2][j])
                        {
                            moulins.push({X: 0, Y: j});
                            moulins.push({X: 1, Y: j});
                            moulins.push({X: 2, Y: j});
                        }
                    }

                    return moulins;
                },

                isNodeInMoulinsNodes: function(node, moulins){
                	for(var i = 0; i < moulins.length; i++)
                	{
                		if(node.X == moulins[i].X && node.Y == moulins[i].Y)
                			return true;
                	}
                	return false;
                },

                detectPieceMadeMoulinNextMove: function(board, piecesOpponent, playerId){

                	for(var i = 0; i < piecesOpponent.length; i++)
                	{
                		var movesNode = this.getMovesPossiblesForOneNode(board, piecesOpponent[i]);
                		this.detectMoveMoulin(board, movesNode, playerId);

                		for(var j = 0; j < movesNode.length; j++)
                		{
                			if(movesNode[j].priority == 20)
                			{
                				piecesOpponent[i].priority += 20;
                			}
                		}
                	}
                },

                detectPieceLinkToTwoOthers: function(board, piecesOpponent){


                	var i = 0;
                	while(piecesOpponent[i] != undefined)
                	{
                		var nbNeighborsNode = 0;
                		var pieceActualNeighbors = new Array();
                		pieceActualNeighbors.push(piecesOpponent[i]);


                		var j = 0;
                		while(pieceActualNeighbors[j] != undefined)
                		{
                			if(piecesOpponent[i].Y % 2 == 0)
	                		{
	                			if(board[i][(j+1)%8] == this.id || board[i][(j+1)%8] == 0)
	                			{
	                				if(!this.haveBeenUseBefore({X: i, Y: (j+1)%8}))
	                				{
	                					pieceActualNeighbors.push(board[i][(j+1)%8]);
	                					nbNeighborsNode += (board[i][(j+1)%8] == this.id) ? 1 : 0;
	                				}
	                			}

	                			if(board[i][(j+7)%8] == this.id || board[i][(j+7)%8] == 0)
	                			{
	                				if(!this.haveBeenUseBefore({X: i, Y: (j+7)%8}))
	                				{
										pieceActualNeighbors.push(board[i][(j+7)%8]);
	                					nbNeighborsNode += (board[i][(j+7)%8] == this.id) ? 1 : 0;
	                				}
	                			}
	                		}
	                		else
	                		{

	                			if(board[i][(j+1)%8] == this.id || board[i][(j+1)%8] == 0)
	                			{
	                				if(!this.haveBeenUseBefore({X: i, Y: (j+1)%8}))
	                				{
	                					pieceActualNeighbors.push(board[i][(j+1)%8]);
	                					nbNeighborsNode += (board[i][(j+1)%8] == this.id) ? 1 : 0;
	                				}
	                			}

	                			if(board[i][(j+7)%8] == this.id || board[i][(j+7)%8] == 0)
	                			{
	                				if(!this.haveBeenUseBefore({X: i, Y: (j+7)%8}))
	                				{
										pieceActualNeighbors.push(board[i][(j+7)%8]);
	                					nbNeighborsNode += (board[i][(j+7)%8] == this.id) ? 1 : 0;
	                				}
	                			}

	                			var addI = new Array();
	                			if(i == 0){ addI.push(1); }
	                			if(i == 1){ addI.push(1, -1); }
	                			if(i == 2){ addI.push(-1); }

	                			for(var k = 0; k < addI.length; k++)
	                			{
	                				if(board[i+addI[k]][j] == this.id || board[i+addI[k]][j] == 0)
		                			{
		                				if(!this.haveBeenUseBefore({X: i+addI[k], Y: j}))
		                				{
											pieceActualNeighbors.push(board[i+addI[k]][j]);
		                					nbNeighborsNode += (board[i+addI[k]][j] == this.id) ? 1 : 0;
		                				}
		                			}
	                			}
	                		}
	                		j++;
                		}        
                		i++;
                	}
                },

                haveBeenUseBefore: function(pieceActualNeighbors, node){
                	for(var i = 0; i < pieceActualNeighbors.length; i++)
                	{
                		if(node.X == pieceActualNeighbors[i].X && node.Y == pieceActualNeighbors[i].Y)
                		{
                			return true;
                		}
                	}
                	return false;
                },

                detectRemoveRetireLine: function(board, piecesOpponent){
                	//Id opponent
                	var idOpponent = (this.id == 1) ? 2 : 1;

                	for(var i = 0; i < piecesOpponent.length; i++)
                	{
                		var piece = piecesOpponent[i];
                		var boardCopy = this.getCopyBoard(board);
                		boardCopy[piece.X][piece.Y] = 0;

                		var nbDoubleLineBefore = this.getNbPreMoulins(board, idOpponent);
                		var nbDoubleLineAfter = this.getNbPreMoulins(boardCopy, idOpponent);

                		if((nbDoubleLineBefore - nbDoubleLineAfter) == 2)
                		{
                			piecesOpponent[i].priority += 20;
                		}
                		else if((nbDoubleLineBefore - nbDoubleLineAfter) == 1)
                		{
                			piecesOpponent[i].priority += 10;
                		}
                	}
                }
                
        };


        return Jarvis;
});