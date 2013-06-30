

define(['jquery', "Player", "IA"], function(jQuery, Player, IA) {

        jQuery.noConflict();
        var $j = jQuery;

        var Moulin = Class.create();
        Moulin.prototype = {

                initialize:function(levelIA, levelIA2, nameJ1, nameJ2, timeThinkIA){

                    //General
                    this.levelIA = parseInt(levelIA);
                    this.levelIA2 = parseInt(levelIA2);

                    if(this.levelIA2 == -1)
                    {
                        this.playerOne = new Player();
                        this.playerOne.name = (nameJ1 != "") ? nameJ1 : "J1";
                    }
                    else
                    {
                        this.playerOne = new IA(this.levelIA2);
                    }
                    

                    if(this.levelIA == -1)
                    {
                        this.playerTwo = new Player();
                        this.playerTwo.name = (nameJ2 != "") ? nameJ2 : "J2";
                    }
                    else
                    {
                        this.playerTwo = new IA(this.levelIA);
                    }

                    if(this.playerOne.type == "IA" && this.playerTwo.type == "IA")
                    {
                        this.timeThinkIA = timeThinkIA;
                        if(this.playerOne.name == this.playerTwo.name)
                        {
                            this.playerTwo.name = this.playerOne.name + " Clone"
                        }
                    }
                    
                    
                    this.actualPlayer = undefined;
                    this.otherPlayer = undefined;
                    this.actualPhase = 1;

                    //GameBoard
                    this.board = this.getEmptyGameBoard();
                    this.board.moulins = new Array();
                },

                start : function (){
                    //Donner au hasard une couleur au joueur
                    var randomColor = Math.round(Math.random());
                    this.playerOne.color = (randomColor == 1) ? "blanc" : "noir";
                    this.playerOne.id = (randomColor == 1) ? 1 : 2;
                    this.playerTwo.color = (randomColor == 1) ? "noir" : "blanc";
                    this.playerTwo.id = (randomColor == 1) ? 2 : 1;
                    if(this.playerTwo.type == "IA")
                    {
                        this.playerTwo.brain.id = this.playerTwo.id;
                    }
                    if(this.playerOne.type == "IA")
                    {
                        this.playerOne.brain.id = this.playerOne.id;
                    }

                    //Hasard qui commence
                    var randomFirstPlayer = Math.round((Math.random()));
                    this.actualPlayer = (randomFirstPlayer == 1) ? this.playerOne : this.playerTwo;
                    this.otherPlayer = (randomFirstPlayer == 1) ? this.playerTwo : this.playerOne;

                    //Init Event
                    this.initEventForGame();

                    //Lauchn the phase1
                    this.phase1();
                },

                initEventForGame: function(){
                    var self = this;

                    //Event: On player play during phase 1
                    $j(document).on('player_phase1_play', function(e, coup) {

                        //Put the choice in gameboard
                        self.board[coup.X][coup.Y] = self.actualPlayer.id;
                        var selector = "#s_" + coup.X + "_" + coup.Y;
                        $j(selector).addClass(self.actualPlayer.color + "P");  

                        //Collect Moulin exist for the case IA need to remove an adverse piece;
                        self.collectMoulin();                    

                        //Verification Moulin
                        var moulinFound = self.verifMoulin(coup);
                        if(!moulinFound)
                        {
                            if(self.playerOne.pieceToPlace > 0 || self.playerTwo.pieceToPlace > 0)
                            {
                                if(self.actualPlayer.type == "IA" && self.otherPlayer.type == "IA")
                                {
                                    setTimeout(function(){
                                        self.nextPlayer();
                                        self.phase1();
                                    }, self.timeThinkIA);
                                }
                                else
                                {
                                    self.nextPlayer();
                                    self.phase1();
                                }                                
                            }
                            else
                            {
                                self.actualPhase = 2;
                                if(self.actualPlayer.type == "IA" && self.otherPlayer.type == "IA")
                                {
                                    setTimeout(function(){
                                        self.nextPlayer();
                                        self.phase2();
                                    }, self.timeThinkIA);
                                }
                                else
                                {
                                    self.nextPlayer();
                                    self.phase2();
                                }  
                            }
                        }

                        self.notifyPhase();
                    });

                    //Event: On player play during phase 2
                    $j(document).on('player_phase2_play', function(e, coup) {

                        //Verification if player lose by no more moves left
                        if(coup.X == -1 && coup.Y == -1) 
                        {
                            self.playerLose();
                            return null; //Left the game
                        }

                        //Put the choice in gameboard
                        self.board[coup.X][coup.Y] = self.actualPlayer.id;
                        self.board[coup.XP][coup.YP] = 0;

                        /* Animation */

                        //Get position start and end
                        var selectorS = "#s_" + coup.XP + "_" + coup.YP;
                        var selectorE = "#s_" + coup.X + "_" + coup.Y;
                        var topS =  $j(selectorS).css("top");
                        var leftS = $j(selectorS).css("left");
                        var topE =  $j(selectorE).css("top");
                        var leftE = $j(selectorE).css("left");

                        //distance to move
                        var dTop  = '+=' + (parseInt(topE) - parseInt(topS));
                        var dLeft = '+=' + (parseInt(leftE) - parseInt(leftS));

                        //Animate the move
                        $j(selectorS).css('background-color', ''); 
                        $j(selectorS).animate({
                            top: dTop,
                            left: dLeft
                          }, 1000, function() {
                            //When animation end, set the piece at the new position, remove the old and move the old to is normal position
                            var classColor = self.actualPlayer.color + "P";
                            $j(selectorE).addClass(classColor);
                            $j(selectorS).removeClass("blancP noirP");
                            $j(selectorS).css("top", topS);
                            $j(selectorS).css("left", leftS);


                            /* Continue the code only after the animation complete */

                            //Collect Moulin exist for the case IA need to remove an adverse piece;
                            self.collectMoulin();

                            //Verification Moulin
                            var moulinFound = self.verifMoulin(coup);
                            if(!moulinFound)
                            {
                                if(self.actualPlayer.type == "IA" && self.otherPlayer.type == "IA")
                                {
                                    setTimeout(function(){
                                        self.nextPlayer();
                                        self.phase2();
                                    }, self.timeThinkIA);
                                }
                                else
                                {
                                    self.nextPlayer();
                                    self.phase2();
                                }
                            }

                            self.notifyPhase();
                        });
                        
                    });

                    //Event: On player made a Moulin
                    $j(document).on('player_moulinMade_play', function(e, coup) {
                        if(coup !=  null && coup.X != -1)
                        {
                            self.board[coup.X][coup.Y] = 0;
                            var selector = "#s_" + coup.X + "_" + coup.Y;
                            $j(selector).fadeOut(800, function(){
                                $j(selector).removeClass("noirP blancP");
                                $j(selector).show();
                            });
                            self.otherPlayer.pieceOnBoard--;
                        }

                        //Change to next player
                        if(self.actualPhase == 1)
                        {
                            if(self.playerOne.pieceToPlace > 0 || self.playerTwo.pieceToPlace > 0)
                            {
                                
                                if(self.actualPlayer.type == "IA" && self.otherPlayer.type == "IA")
                                {
                                    setTimeout(function(){
                                        self.nextPlayer();
                                        self.phase1();
                                    }, self.timeThinkIA);
                                }
                                else
                                {
                                    setTimeout(function(){
                                        self.nextPlayer();
                                        self.phase1();
                                    },1000);
                                }
                            }
                            else
                            {
                                self.actualPhase = 2;
                                if(self.actualPlayer.type == "IA" && self.otherPlayer.type == "IA")
                                {
                                    setTimeout(function(){
                                        self.nextPlayer();
                                        self.phase2();
                                    }, self.timeThinkIA);
                                }
                                else
                                {
                                    self.nextPlayer();
                                    self.phase2();
                                }  
                            }
                        }
                        else if(self.actualPhase == 2)
                        {
                            if(self.actualPlayer.type == "IA" && self.otherPlayer.type == "IA")
                                {
                                    setTimeout(function(){
                                        self.nextPlayer();
                                        self.phase2();
                                    }, self.timeThinkIA);
                                }
                                else
                                {
                                    self.nextPlayer();
                                    self.phase2();
                                }
                        }
                        

                        self.notifyPhase();
                     });
                },

                phase1: function(){
                    //Notif
                    this.notify();

                    //Ask to current player what he want to do
                    this.actualPlayer.playPhase1(this.board);
                    
                    //See function initEventForGame for event in this phase (player_phase1_play, player_moulinMade_play)
                },

                phase2: function(){
                    //verify player lose by number of piece inferior to 3
                    if(this.actualPlayer.pieceOnBoard < 3) 
                    {
                        this.playerLose();
                        return null; //Left the game
                    }

                    //Notif
                    this.notify();

                    //Ask to current player what he want to do
                    this.actualPlayer.playPhase2(this.board);
                    
                    //See function initEventForGame for event in this phase (player_phase2_play, player_moulinMade_play)
                },

                notify: function(){
                    if(this.actualPlayer.type == "IA")
                    {
                        if(this.actualPlayer.type == "IA" && this.otherPlayer.type == "IA")
                            $j("#notif").html(this.actualPlayer.name + " réfléchie...");
                        else
                            $j("#notif").html("L'ordinateur réfléchie...");
                    }
                    else
                    {
                        if(this.actualPhase == 1)
                            $j("#notif").html("A ton tour, met un pion sur le plateau ! <br />(" + this.actualPlayer.name + " / " + this.actualPlayer.color + ")");
                        else
                            $j("#notif").html("A ton tour, bouge un de tes pions ! <br />(" + this.actualPlayer.name + " / " + this.actualPlayer.color + ")");
                    }
                    
                },

                notifyPhase: function(){
                    var text = "<br />Phase " + this.actualPhase + ": <br /><br />";

                    if(this.actualPhase == 1)
                    {
                        text += "Pions restants à poser: <br />";
                        text += "Joueur 1 (" + this.playerOne.name + "): " + this.playerOne.pieceToPlace + " <br />";
                        text += "Joueur 2 (" + this.playerTwo.name + "): " + this.playerTwo.pieceToPlace + " <br />";
                    }
                    else
                    {
                        text += "Pions sur la plateau par joueur: <br />";
                        text += "Joueur 1 (" + this.playerOne.name + "): " + this.playerOne.pieceOnBoard + " <br />";
                        text += "Joueur 2 (" + this.playerTwo.name + "): " + this.playerTwo.pieceOnBoard + " <br />";
                    }
                    
                    $j("#notifPhase").html(text);
                },

                playerLose: function(){
                    $j("#notif").html(this.otherPlayer.name + " gagne la partie !");

                    if(this.actualPlayer.type == "IA" && this.otherPlayer.type == "IA")
                        $j("#div_end_game").html(this.otherPlayer.name  + " semble avoir battu " + this.actualPlayer.name + " !");                   
                    else
                        $j("#div_end_game").html((this.otherPlayer.type != "IA") ? "Tu as gagné " + this.otherPlayer.name + "!" : "Tu as perdu... " + this.otherPlayer.name + " est plus fort que toi !");
                    
                    $j("#div_end_game").fadeIn();
                    setTimeout(function(){$j("#div_end_game").fadeOut();}, 3000);

                    if(this.actualPlayer.type != "IA" || this.otherPlayer.type != "IA")
                    {
                        if((this.actualPlayer.type == "human" || this.otherPlayer.type == "human") && this.actualPlayer.type != this.otherPlayer.type)
                        {
                            if(this.actualPlayer.name != "Boris")
                            {
                                $j.ajax({
                                    type: "POST",
                                    url: "http://maxime.tual.free.fr/jeudumoulin/log.php?upload=VLh4CvkcGSrgFwTaKKppu3r7",
                                    data: { user: this.otherPlayer.name }
                                });
                            }                           
                        }                       
                    }
                    
                },

                verifMoulin: function(coup){
                    var s1 = undefined;
                    var s2 = undefined;
                    var s3 = undefined;
                    var s4 = undefined;
                    var s5 = undefined;
                    var s6 = undefined;

                    switch(coup.Y)
                    {
                        case 0:
                            s1 = this.board[coup.X][0];
                            s2 = this.board[coup.X][1];
                            s3 = this.board[coup.X][2];

                            s4 = this.board[coup.X][0];
                            s5 = this.board[coup.X][6];
                            s6 = this.board[coup.X][7];
                            break;

                        case 1:
                            s1 = this.board[coup.X][0];
                            s2 = this.board[coup.X][1];
                            s3 = this.board[coup.X][2];

                            s4 = this.board[0][1];
                            s5 = this.board[1][1];
                            s6 = this.board[2][1];
                            break;

                        case 2:
                            s1 = this.board[coup.X][0];
                            s2 = this.board[coup.X][1];
                            s3 = this.board[coup.X][2];

                            s4 = this.board[coup.X][2];
                            s5 = this.board[coup.X][3];
                            s6 = this.board[coup.X][4];
                            break;

                        case 3:
                            s1 = this.board[coup.X][2];
                            s2 = this.board[coup.X][3];
                            s3 = this.board[coup.X][4];

                            s4 = this.board[0][3];
                            s5 = this.board[1][3];
                            s6 = this.board[2][3];
                            break;

                        case 4:
                            s1 = this.board[coup.X][2];
                            s2 = this.board[coup.X][3];
                            s3 = this.board[coup.X][4];

                            s4 = this.board[coup.X][4];
                            s5 = this.board[coup.X][5];
                            s6 = this.board[coup.X][6];
                            break;

                        case 5:
                            s1 = this.board[coup.X][4];
                            s2 = this.board[coup.X][5];
                            s3 = this.board[coup.X][6];

                            s4 = this.board[0][5];
                            s5 = this.board[1][5];
                            s6 = this.board[2][5];
                            break;

                        case 6:
                            s1 = this.board[coup.X][4];
                            s2 = this.board[coup.X][5];
                            s3 = this.board[coup.X][6];

                            s4 = this.board[coup.X][6];
                            s5 = this.board[coup.X][7];
                            s6 = this.board[coup.X][0];
                            break;

                        case 7:
                            s1 = this.board[coup.X][6];
                            s2 = this.board[coup.X][7];
                            s3 = this.board[coup.X][0];

                            s4 = this.board[0][7];
                            s5 = this.board[1][7];
                            s6 = this.board[2][7];                    
                            break;

                        default:
                            break;
                    }

                    if(s1 != undefined) //We admit if s1 != undefined so are all the sommets (1 to 6)
                    {
                        if((s1 == s2 && s1 == s3 && s1 != 0) || (s4 == s5 && s4 == s6 && s4 != 0))
                        {

                            $j('#notif').html(this.actualPlayer.name + " a fait un moulin ! (" + this.actualPlayer.color + ")");
                            this.actualPlayer.playMoulinMade(this.board);
                            return true;
                        }
                    }
                    
                    return false;
                },

                collectMoulin: function(){
                    this.board.moulins = new Array(); //Contains all sommets we are part of moulin

                    //Verification 4 lines of the current square
                    for(var i = 0; i < 3; i++)
                    {
                        for(var j = 0; j < 8; j+=2) 
                        {
                            if(this.board[i][j] != 0 && this.board[i][j] == this.board[i][j+1] && this.board[i][j] == this.board[i][((j+2)%8)])
                            {
                                this.board.moulins.push("" + i + j);
                                this.board.moulins.push("" + i + (j+1));
                                this.board.moulins.push("" + i + ((j+2)%8));
                            }
                        }   
                    }

                    //Verif 4 specials lines
                    for(var j = 1; j < 8; j+= 2) // 1 - 3 - 5 - 7
                    {
                        if(this.board[0][j] != 0 && this.board[0][j] == this.board[1][j] && this.board[0][j] == this.board[2][j])
                        {
                            this.board.moulins.push("" + 0 + j);
                            this.board.moulins.push("" + 1 + j);
                            this.board.moulins.push("" + 2 + j);
                        }
                    }
                    
                },

                getEmptyGameBoard: function(){
                    var board = new Array();
                    
                    for(var i = 0; i < 3; i++)
                    {
                         board[i] = new Array();

                         for(var j = 0; j < 8; j++)
                        {
                            board[i][j] = 0;
                        }
                    }
                   
                   return board;
                },

                nextPlayer: function(){
                    if(this.actualPlayer.id == this.playerOne.id)
                    {
                        this.actualPlayer = this.playerTwo;
                        this.otherPlayer = this.playerOne;
                    }
                    else {
                        this.actualPlayer = this.playerOne;
                        this.otherPlayer = this.playerTwo;
                    }
                }

        };

        return Moulin;
});
