

define(['jquery'], function(jQuery) {

        jQuery.noConflict();
        var $j = jQuery;

        var Player = Class.create();
        Player.prototype = {

                initialize:function(){
                    
                    //PLayer configurations
                    this.color = undefined;
                    this.pieceToPlace = 9;
                    this.pieceOnBoard = 0;
                    this.name = "Joueur";
                    this.id = 1;
                    this.type = "human";

                    this.youTurn = false;
                    this.phaseGame = undefined;
                    this.board = undefined;
                    this.selectedPiece = undefined;
                    this.movesPossible = undefined;

                    
                    this.initEventForPlayer();

                },

                initEventForPlayer: function(){
                    var self = this;

                    //Player play on click on sommet
                    $j(".sommet").on('click', function(){

                        //Only play if it's the turn of the player
                        if(self.youTurn)
                        {
                            //Case phase of game
                            if(self.phaseGame == 1) //Phase 1
                            {
                                //Get the coup
                                var idBox = $j(this).attr('id');
                                var splitCoord = idBox.split('_');
                                var coup = new Object();
                                coup.X = parseInt(splitCoord[1]);
                                coup.Y = parseInt(splitCoord[2]);

                                //Verifiy if it's possible
                                if(self.board[coup.X][coup.Y] == 0)
                                {

                                    self.youTurn = false;
                                    self.pieceToPlace--;
                                    self.pieceOnBoard++;

                                    //Send coup
                                    $j(document).trigger('player_phase1_play', coup);                                
                                }
                            }
                            else if(self.phaseGame == 2) // Phase 2
                            {
                                
                                //Allow to select one piece to move
                                if(self.selectedPiece == undefined)
                                {
                                    //Get the coup
                                    var idBox = $j(this).attr('id');
                                    var splitCoord = idBox.split('_');
                                    var coup = new Object();
                                    coup.X = parseInt(splitCoord[1]);
                                    coup.Y = parseInt(splitCoord[2]);

                                    //Verifiy if the selected piece belong to the player
                                    if(self.board[coup.X][coup.Y] == self.id)
                                    {
                                        self.selectedPiece = coup;
                                        $j(this).css('background-color', 'rgba(255, 0, 0, 0.5)');
                                    }
                                }
                                else //If piece to move already selected, allow to select the new position
                                {
                                    //Get the coup
                                    var idBox = $j(this).attr('id');
                                    var splitCoord = idBox.split('_');
                                    var coup = new Object();
                                    coup.X = parseInt(splitCoord[1]);
                                    coup.Y = parseInt(splitCoord[2]);

                                    //Verify if it's the same sommet in selectedPiece
                                    if(coup.X == self.selectedPiece.X && coup.Y == self.selectedPiece.Y)
                                    {
                                        //in case player change is mind
                                        self.selectedPiece = undefined; 
                                        $j(this).css('background-color', '');
                                    }
                                    else
                                    {
                                        if(self.board[coup.X][coup.Y] == 0 && self.moveInPossibleList({XP: self.selectedPiece.X, YP: self.selectedPiece.Y, X: coup.X, Y: coup.Y})) // Case empty && possible
                                        {
                                            self.youTurn = false;
                                            $j(document).trigger('player_phase2_play', {XP: self.selectedPiece.X, YP: self.selectedPiece.Y, X: coup.X, Y: coup.Y}); 
                                            self.selectedPiece = undefined; 
                                        }                                        
                                    }
                                }

                            }
                            else if(self.phaseGame == 3) // Made Moulin
                            {
                                //Get the coup
                                var idBox = $j(this).attr('id');
                                var splitCoord = idBox.split('_');
                                var coup = new Object();
                                coup.X = parseInt(splitCoord[1]);
                                coup.Y = parseInt(splitCoord[2]);

                                //Id opponent
                                var idOpponent = (self.id == 1) ? 2 : 1;
                                //Count nb pieceAdverse
                                var nbPieceAdverse = 0;
                                for (var i = 0; i < 3; i++) 
                                {
                                    for (var j =0; j < 8; j++) 
                                    {
                                        if(self.board[i][j] == idOpponent) //Pieces ennemie
                                            if($j.inArray("" + i + j, self.board.moulins) == -1) //Not contains in a moulin
                                                nbPieceAdverse++;
                                    }
                                }

                                //Verifiy if it's possible
                                if(self.board[coup.X][coup.Y] != 0 && self.board[coup.X][coup.Y] != self.id)
                                {
                                    if(($j.inArray("" + coup.X + coup.Y, self.board.moulins) == -1) || nbPieceAdverse == 0)
                                    {
                                        self.youTurn = false;

                                        //Send coup
                                        $j(document).trigger('player_moulinMade_play', coup);
                                    }
                                }
                            }
                        }

                    });

                },
               
                playPhase1: function(board){
                    this.youTurn = true;  
                    this.board = board;  
                    this.phaseGame = 1;          
                },

                playPhase2: function(board){
                    this.youTurn = true;  
                    this.board = board;  
                    this.phaseGame = 2;  

                    //Get moves possible for player
                    this.movesPossible = this.getMovesPossible(this.board);

                    //Verify the player can move something
                    if(this.movesPossible.length == 0)
                    {
                        //No more move left, the player lose
                        this.youTurn = false;
                        $j(document).trigger('player_phase2_play', {X: -1, Y: -1}); 
                    }
                },

                playMoulinMade: function(board){
                    this.youTurn = true;  
                    this.board = board;  
                    this.phaseGame = 3;   

                    //Count number of ennemie pieces left and not in moulin
                    var nbPieceAdverse = 0;
                    for (var i = board.length - 1; i >= 0; i--) {
                        for (var j = board[i].length - 1; j >= 0; j--) {
                            if(board[i][j] != 0 && board[i][j] != this.id) //Pieces ennemie
                                nbPieceAdverse++;                 
                        }
                    }

                    if(nbPieceAdverse == 0)
                    {
                        this.youTurn = false;
                        //Send coup
                        $j(document).trigger('player_moulinMade_play', {X: -1, Y: -1});
                    }
                },

                getMovesPossible: function(board){
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

                    return moves;
                },

                moveInPossibleList: function(coup){
                    for(var i = 0; i < this.movesPossible.length; i++)
                    {
                        if((coup.X == this.movesPossible[i].X))
                        {
                            if((coup.Y == this.movesPossible[i].Y))
                            {
                                if((coup.XP == this.movesPossible[i].XP))
                                {
                                    if((coup.YP == this.movesPossible[i].YP))
                                    {
                                        return true;
                                    }   
                                }
                            }   
                        }
                    }
                    return false;
                }

        };

        return Player;
});
