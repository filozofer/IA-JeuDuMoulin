
define(['jquery'], function(jQuery) {

        jQuery.noConflict();
        var $j = jQuery;

        var Boris = Class.create();
        Boris.prototype = {

                initialize:function(levelIA){
                    
                    //PLayer configurations
                    this.id = undefined;
                    this.name = "Boris";

                },

               
                playPhase1: function(board){

                    var empty = false;
                    while(!empty)
                    {
                        var coup = new Object();
                        coup.X = Math.floor((Math.random()*3)+0);
                        coup.Y = Math.floor((Math.random()*8)+0);

                        if(board[coup.X][coup.Y] == 0)
                            empty = true;             
                    }

                    return coup;
                },

                playPhase2: function(board){

                    //Get all possibles moves
                    var moves = new Array();

                    for(var i = 0; i < 3; i++)
                    {
                        for(var j = 0; j < 8; j++)
                        {
                            if(board[i][j] == this.id)
                            {
                                if(j % 2 == 0)
                                {
                                    if(board[i][j+1] == 0)
                                        moves.push({XP: i, YP:j, X: i, Y: j+1});

                                    var addJ = (j == 0) ? +7 : -1; //Case 0

                                    if(board[i][j+addJ] == 0)
                                        moves.push({XP: i, YP:j, X: i, Y: j+addJ});

                                    continue;
                                }
                                else
                                {
                                    if(board[i][j-1] == 0)
                                        moves.push({XP: i, YP:j, X: i, Y: j-1});

                                    var addJ = (j == 7) ? -7 : 1; //Case 7

                                    if(board[i][j+addJ] == 0)
                                        moves.push({XP: i, YP:j, X: i, Y: j+addJ});

                                    if(i == 0 || i == 1)
                                        if(board[i+1][j] == 0)
                                            moves.push({XP: i, YP:j, X: i+1, Y: j});

                                    if(i == 1 || i == 2)
                                        if(board[i-1][j] == 0)
                                            moves.push({XP: i, YP:j, X: i-1, Y: j});

                                    continue;               
                                }
                            }      
                        }
                    }

                    
                    if(moves.length != 0)
                    {
                        //Random from moves
                        var random = Math.floor(Math.random() * moves.length);
                        //Send to IA coup
                        return moves[random];
                    }
                    else
                    {
                        //No more move left, the player lose
                        return {X: -1, Y: -1};
                    }
                },

                playMoulinMade: function(board){

                    var coup = undefined;
                    var piecesOpponentMoulins = new Array();

                    //Count number of ennemie pieces left and not in moulin
                    var nbPieceAdverse = 0;
                    for (var i = board.length - 1; i >= 0; i--) {
                        for (var j = board[i].length - 1; j >= 0; j--) {
                            if(board[i][j] != 0 && board[i][j] != this.id) //Pieces ennemie
                                if($j.inArray("" + i + j, board.moulins) == -1) //Not contains in a moulin
                                    nbPieceAdverse++;
                                else
                                	piecesOpponentMoulins.push({X: i, Y: j});
                        }
                    }

                    //If no piece to delete send to IA null answer (-1,-1)
                    if(nbPieceAdverse == 0)
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


                    //Random from nb of ennemies left
                    var random = Math.floor((Math.random() * nbPieceAdverse) + 1);
                    
                    //Looking for the one to remove
                    for (var i = board.length - 1; i >= 0; i--) {
                        for (var j = board[i].length - 1; j >= 0; j--) {
                            if(board[i][j] != 0 && board[i][j] != this.id)
                            {
                                if($j.inArray("" + i + j, board.moulins) == -1)
                                {
                                    random--;
                                    if(random == 0)
                                    {
                                        coup = new Object();
                                        coup.X = i;
                                        coup.Y = j;
                                    }
                                }
                            }
                        }
                    }

                    //Send coup to IA
                    return coup;
                }

        };

        return Boris;
});