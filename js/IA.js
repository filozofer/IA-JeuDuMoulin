

define(['jquery', 'brains/boris', 'brains/jarvis'], function(jQuery, Boris, Jarvis) {

        jQuery.noConflict();
        var $j = jQuery;

        var IA = Class.create();
        IA.prototype = {

                initialize:function(levelIA){
                    
                    //PLayer configurations
                    this.color = undefined;
                    this.pieceToPlace = 9;
                    this.pieceOnBoard = 0;
                    this.id = 2;
                    this.type = "IA";

                    this.brain = undefined;
                    this.name = undefined;

                    //Get Brain
                    switch(levelIA)
                    {
                        case 0:
                            this.brain = new Boris();
                            this.name = this.brain.name;
                            break;

                        case 1:
                            this.brain = new Jarvis();
                            this.name = this.brain.name;
                            break;

                        default:
                            this.brain = new Boris();
                            this.name = this.brain.name;
                            break;
                    }          

                },

               
                playPhase1: function(board){

                    //Ask to the brain to play
                    var coup = this.brain.playPhase1(board);

                    //Change pieces value
                    this.pieceToPlace--;
                    this.pieceOnBoard++;

                    //Send coup
                    $j(document).trigger('player_phase1_play', coup);
                },

                playPhase2: function(board){

                    //Ask to the brain to play
                    var coup = this.brain.playPhase2(board);

                    //Send coup
                    $j(document).trigger('player_phase2_play', coup);                   
                },

                playMoulinMade: function(board){

                    //Ask to the brain to play
                    var coup = this.brain.playMoulinMade(board);

                    //Send coup
                    $j(document).trigger('player_moulinMade_play', coup);
                }

        };

        return IA;
});
