define([], function() {

        var BrainName = Class.create();
        BrainName.prototype = {

                initialize:function(levelIA){
                    
                    //Brain configurations
                    this.id = undefined;
                    this.name = "BrainName";

                },


                /* Function call when IA play during phase 1 */
                /* Receive the actual board (array), board[0] contains the 8 nodes 
                of the first square, board[1] contains the 8 nodes of the second square,...
                Example: board[1][5] contain an integer representing the state of the node 
                in the second square, position six.
                Value possible in board (node):
				0: Empty node
				1: ID Player
				2: ID Player
				Remember Note -> ID Actual brain store in this.id (see initialize function)
                */
                /* Return an object call move
                   move.X = coord x of the move
                   move.Y = coord y of the move
				   Example:
				   var move = new Object();
				   move.X = 1;
				   move.Y = 5;
                */
                playPhase1: function(board){

                    
                    //return move;
                },

                /* Function call when IA play during phase 2 */
                /* Receive the actual board (array), board[0] contains the 8 nodes 
                of the first square, board[1] contains the 8 nodes of the second square,...
                Example: board[1][5] contains an integer representing the state of the node 
                in the second square, position six.
                Value possible in board:
				0: Empty node
				1: ID Player
				2: ID Player
				Remember Note -> ID Actual brain store in this.is (see initialize function)
                */
                /* Return an object call move which represent a movement of one piece
                   move.XP = coord x of the selected piece
                   move.YP = coord y of the selected piece
                   move.X = coord x of the move (end place for the piece)
                   move.Y = coord y of the move (end place for the piece)

				   Example:
				   var move = new Object();
				   move.XP = 1;
				   move.YP = 5;
				   move.X = 1;
				   move.Y = 4;
                */
                playPhase2: function(board){

                    //return move;
                },

                /* Function call when IA play have made a moulin and need to delete one adverse piece */
                /* Receive the actual board (array), board[0] contains the 8 nodes 
                of the first square, board[1] contains all 8 nodes of the second square,...
                Example: board[1][5] contains an integer representing the state of the node 
                in the second square, position six.
                Value possible in board:
				0: Empty node
				1: ID Player
				2: ID Player
				Remember Note -> ID Actual brain store in this.is (see initialize)

				The board var have a propertie: "moulins", it's an Array and contains all the nodes
				contains in a moulin (use to don't delete one piece in moulin)
                */
                /* Return an object call move
                   move.X = coord x of the move
                   move.Y = coord y of the move
				   Example:
				   var move = new Object();
				   move.X = 1;
				   move.Y = 5;
                */
                playMoulinMade: function(board){

                    

                    //return move;
                }

        };

        return BrainName;
});