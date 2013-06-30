
define(['jquery', 'Moulin'], function(jQuery, Moulin) {

    jQuery(function($) {

        var game = undefined;

        //Init App
        var initApp = function() {

            $.ajax({
                type: "POST",
                url: "http://maxime.tual.free.fr/jeudumoulin/log.php?log=VLh4CvkcGSrgFwTaKKppu3r7"
            });
            

            $('#opponent').on('change', function(){
                var value = $(this).val();
                
                if(value == "human")
                {
                    $("#lvl_ia_j1").hide();
                    $("#name_j1").show();
                    $("#lvl_ia").hide();
                    $("#name_j2").show();
                    $("#label_time_ia_think").hide();
                    $("#time_ia_think").hide();
                }
                else if(value == "ia")
                {
                    $("#lvl_ia_j1").hide();
                    $("#name_j1").show();                    
                    $("#name_j2").hide();
                    $("#lvl_ia").show();
                    $("#label_time_ia_think").hide();
                    $("#time_ia_think").hide();
                }
                else if(value == "iavsia")
                {
                    $("#name_j1").hide();
                    $("#lvl_ia_j1").show();
                    $("#name_j2").hide();
                    $("#lvl_ia").show();
                    $("#label_time_ia_think").show();
                    $("#time_ia_think").show();
                }
            });

            $("#play_restart_button").on('click', function(){
                var value = $(this).html();
                if(value == "Jouer")
                {
                    $(this).html("Reset");

                    var opponent = $("#opponent").val();
                    if(opponent == "human")
                    {
                        initGame(-1, -1, $("#name_j1").val(), $("#name_j2").val(), 0);
                    }
                    else if(opponent == "ia")
                    {
                        initGame($("#lvl_ia").val(), -1, $("#name_j1").val(), "IA", 0);
                    }
                    else if(opponent == "iavsia")
                    {
                        var timeThinkIA = parseInt($("#time_ia_think").val());
                        initGame($("#lvl_ia").val(), $("#lvl_ia_j1").val(), $("#name_j1").val(), "IA", timeThinkIA);
                    }
                    
                }
                else if(value == "Reset")
                {
                    $(this).html("Jouer");
                    resetGame();
                }               

            });

        };

        //Load the Game (canvas part)
        var initGame = function(levelIA, levelIA2, nameJ1, nameJ2, timeThinkIA) {
            
            game = new Moulin(levelIA, levelIA2, nameJ1, nameJ2, timeThinkIA);
            game.start();

        };

        var resetGame = function() {

            location.reload();
        };

        initApp();
    });

});
