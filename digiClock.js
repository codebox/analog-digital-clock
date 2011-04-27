function go(){
    var OFFSET_X = 20;
    var OFFSET_Y = 15;

    var imgLine = new Image();
    imgLine.src = './graphics/line.png';

    var imgBgLine = new Image();
    imgBgLine.src = './graphics/bgline.png';

    var imgDot = new Image();
    imgDot.src = './graphics/dot.png';

    var LINE_WIDTH  = imgLine.height;
    var LINE_LENGTH = imgLine.width;
    var DOT_WIDTH   = imgDot.width;
    var GAP         = 2 * DOT_WIDTH;
    var TICKS_PER_SEC = 30;

    var DIGIT_X_1 = OFFSET_X;
    var DIGIT_X_2 = DIGIT_X_1 + (2 * LINE_WIDTH + LINE_LENGTH + GAP);
    var DIGIT_X_3 = DIGIT_X_2 + (2 * LINE_WIDTH + LINE_LENGTH + 2 * GAP + DOT_WIDTH);
    var DIGIT_X_4 = DIGIT_X_3 + (2 * LINE_WIDTH + LINE_LENGTH + GAP);
    var DIGIT_X_5 = DIGIT_X_4 + (2 * LINE_WIDTH + LINE_LENGTH + 2 * GAP + DOT_WIDTH);
    var DIGIT_X_6 = DIGIT_X_5 + (2 * LINE_WIDTH + LINE_LENGTH + GAP);

    var DOT_X_1 = OFFSET_X + (3 * LINE_WIDTH + 2 * LINE_LENGTH + 2 * GAP);
    var DOT_X_2 = DOT_X_1 + 2 * GAP  + (3 * LINE_WIDTH + 2 * LINE_LENGTH + 2 * GAP);
    var DOT_Y_1 = OFFSET_Y + (2 * LINE_LENGTH + 3 * LINE_WIDTH) / 4;
    var DOT_Y_2 = OFFSET_Y + (2 * LINE_LENGTH + 3 * LINE_WIDTH) * 3 / 4 - DOT_WIDTH;

    var X1 = 0;
    var X2 = LINE_WIDTH + LINE_LENGTH;
    var Y1 = 0;
    var Y2 = LINE_WIDTH + LINE_LENGTH;
    var Y3 = 2 * LINE_WIDTH + 2 * LINE_LENGTH;

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var WIDTH  = Number(canvas.width);
    var HEIGHT = Number(canvas.height);

    function forEach(arr, fnDoThis){
        var i=0, l=arr.length;
        for(i=0; i<l; i++){
            if (false===fnDoThis(i, arr[i])){
                return;
            }
        }
    }

    function makeLine(x, y, degrees, scale, fnOnTickDoThis, imgObj){
        var line = {};
        var img = imgObj ? imgObj : imgLine;

        var ox = x, oy = y, oDegrees = degrees, oScale = scale;
        line.setPos = function(px,py){
            x = px;
            y = py;
        }

        line.move = function(dx, dy){
            line.setPos(x + dx, y + dy);
        };

        line.setAngle = function(pDegrees){
            degrees = pDegrees;
        };

        line.getAngle = function(){
            return degrees;
        };

        line.setScale = function(pScale){
            scale = pScale;
        };

        line.tick = function(tickValue){
            fnOnTickDoThis && fnOnTickDoThis(line, tickValue);
        };

        line.draw = function(xOffset, yOffset){
            ctx.save();
            var radians = degrees * Math.PI / 180;
            ctx.translate(x + xOffset, y + yOffset);
            ctx.translate(-LINE_WIDTH/2, LINE_WIDTH/2);
            ctx.rotate(radians);
            ctx.translate(LINE_WIDTH/2, -LINE_WIDTH/2);
            ctx.drawImage(img, 0, 0, LINE_LENGTH * scale, LINE_WIDTH);
            ctx.restore();
        };

        return line;    
    }

    function makeDigit(x, y){
        var digit = {};
        var lines = [];

        digit.addLine = function(line){
            lines.push(line);
        };

        digit.clearLines = function(){
            lines = [];
        };

        digit.tick = function(tickValue){
            forEach(lines, function(i,line){
                line && line.tick(tickValue);
            });
        };

        digit.draw = function(){
            forEach(lines, function(i,line){
                line && line.draw(x, y);
            });
        };

        return digit;
    }

    var digitHour1 = makeDigit(DIGIT_X_1, OFFSET_Y);
    var digitHour2 = makeDigit(DIGIT_X_2, OFFSET_Y);
    var digitMin1  = makeDigit(DIGIT_X_3, OFFSET_Y);
    var digitMin2  = makeDigit(DIGIT_X_4, OFFSET_Y);
    var digitSec1  = makeDigit(DIGIT_X_5, OFFSET_Y);
    var digitSec2  = makeDigit(DIGIT_X_6, OFFSET_Y);

    var digits = [digitHour1, digitHour2, digitMin1, digitMin2, digitSec1, digitSec2];
    var prevTime = getTimeParts();

    var tick = 0;   

    setInterval(function(){
        var tickValue = (tick % TICKS_PER_SEC) / TICKS_PER_SEC;
        ctx.clearRect(0, 0,WIDTH,HEIGHT);       

        drawDots();
        drawBgLines();

        if (tickValue === 0){
            var newTime = getTimeParts();

            forEach(digits, function(i, digit){
                var from = prevTime[i];
                var to   = newTime[i];

                digit.clearLines();
                var newLineArgLists = transforms[from][to];
                if (!newLineArgLists){
                    newLineArgLists = transforms[to][to];
                }

                forEach(pickOne(newLineArgLists), function(i,newLineArgList){
                    digit.addLine(makeLine.apply(null, newLineArgList));
                });                 

            });
            prevTime = newTime;

        } else {
            forEach(digits, function(i,digit){
                digit.tick(tickValue);  
            });

        }

        forEach(digits, function(i,digit){
            digit.draw();   
        });

        tick++;
    }, 1000 / TICKS_PER_SEC);

    function drawBgLines(){
        function drawBgDigit(xOffset){
            makeLine(xOffset + X1, OFFSET_Y + Y1,  0, 1, null, imgBgLine).draw(0,0);    
            makeLine(xOffset + X1, OFFSET_Y + Y1, 90, 1, null, imgBgLine).draw(0,0);    
            makeLine(xOffset + X2, OFFSET_Y + Y1, 90, 1, null, imgBgLine).draw(0,0);    
            makeLine(xOffset + X1, OFFSET_Y + Y2,  0, 1, null, imgBgLine).draw(0,0);    
            makeLine(xOffset + X1, OFFSET_Y + Y2, 90, 1, null, imgBgLine).draw(0,0);    
            makeLine(xOffset + X2, OFFSET_Y + Y2, 90, 1, null, imgBgLine).draw(0,0);    
            makeLine(xOffset + X1, OFFSET_Y + Y3,  0, 1, null, imgBgLine).draw(0,0);    
        }
        drawBgDigit(DIGIT_X_1);
        drawBgDigit(DIGIT_X_2);
        drawBgDigit(DIGIT_X_3);
        drawBgDigit(DIGIT_X_4);
        drawBgDigit(DIGIT_X_5);
        drawBgDigit(DIGIT_X_6);
    }

    function drawDots(){
        function drawDot(x, y){
            ctx.save();
            ctx.translate(x, y);
            ctx.drawImage(imgDot, 0, 0, DOT_WIDTH, DOT_WIDTH);
            ctx.restore();  
        }

        drawDot(DOT_X_1, DOT_Y_1);
        drawDot(DOT_X_1, DOT_Y_2);
        drawDot(DOT_X_2, DOT_Y_1);
        drawDot(DOT_X_2, DOT_Y_2);
    }

    function pickOne(arr){
        var totalWeight = 0;
        forEach(arr, function(i,item){
            totalWeight += item.weight;
        });

        var i = Math.random() * totalWeight;
        var weightSoFar = 0;
        var selectedMoves;

        forEach(arr, function(j,item){
            weightSoFar += item.weight;
            if (weightSoFar > i){
                selectedMoves = item.lines; 
                return false;
            }
        });

        return selectedMoves;
    }

    function getTimeParts(){
        var parts = [];
        var now = new Date();

        var hours = now.getHours();
        parts.push(Math.floor(hours / 10));
        parts.push(hours % 10);

        var mins = now.getMinutes();
        parts.push(Math.floor(mins / 10));
        parts.push(mins % 10);

        var secs = now.getSeconds();
        parts.push(Math.floor(secs / 10));
        parts.push(secs % 10);

        return parts;
    }

    var fnMoveDown = function(line){
        line.move(0, (LINE_LENGTH + LINE_WIDTH) / TICKS_PER_SEC);
    };

    var fnMoveUp = function(line){
        line.move(0, -(LINE_LENGTH + LINE_WIDTH) / TICKS_PER_SEC);
    };

    var fnMoveLeft = function(line){
        line.move(-(LINE_LENGTH + LINE_WIDTH) / TICKS_PER_SEC, 0);
    };

    var fnMoveRight = function(line){
        line.move((LINE_LENGTH + LINE_WIDTH) / TICKS_PER_SEC, 0);
    };

    var fnShrinkLeft = function(line, tickValue){
        line.setScale(1 - tickValue);
    };

    var fnShrinkRight = function(line, tickValue){
        fnMoveRight(line);
        line.setScale(1 - tickValue);
    };

    var fnShrinkDown = function(line, tickValue){
        fnMoveDown(line);
        line.setScale(1 - tickValue);
    };

    var fnGrowLeft = function(line, tickValue){
        fnMoveLeft(line);
        line.setScale(tickValue);
    };

    var fnGrowRight = function(line, tickValue){
        line.setScale(tickValue);
    };

    var fnRotateClockwise = function(line, tickValue){
        var angle = line.getAngle();
        line.setAngle(angle + (90 / TICKS_PER_SEC));
    };

    var fnRotateClockwise2 = function(line, tickValue){
        var angle = line.getAngle();
        line.setAngle(angle + (180 / TICKS_PER_SEC));
    };

    var fnRotateAntiClockwise = function(line, tickValue){
        var angle = line.getAngle();
        line.setAngle(angle - (90 / TICKS_PER_SEC));
    };

    var fnRotateAntiClockwise2 = function(line, tickValue){
        var angle = line.getAngle();
        line.setAngle(angle - (180 / TICKS_PER_SEC));
    };  

    var transforms = {

        '0' : {

            '0' : [
                    {'weight' : 27, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2, 90,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    },{'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, fnRotateClockwise], 
                            [X1, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, fnRotateClockwise], 
                            [X1, Y2, 90,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X2, Y3,180,  1, fnRotateClockwise],
                            [X1, Y3,270,  1, fnRotateClockwise]                 
                        ]
                    },{'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y2,270,  1, fnRotateClockwise2], 
                            [X1, Y2, 90,  1, fnMoveUp], 
                            [X2, Y1, 90,  1, fnMoveDown], 
                            [X2, Y2, 90,  1, fnRotateClockwise2], 
                            [X1, Y3,  0,  1, null]              
                        ]
                    },{'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, fnMoveDown], 
                            [X2, Y1, 90,  1, fnMoveLeft], 
                            [X1, Y2, 90,  1, fnMoveRight], 
                            [X2, Y2, 90,  1, fnMoveUp], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }
                ],          
            '1' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, fnShrinkRight], 
                            [X1, Y1, 90,  1, fnMoveRight], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2, 90,  1, fnMoveRight], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, fnShrinkRight]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X2, Y1,180,  1, fnRotateAntiClockwise], 
                            [X1, Y2,270,  1, fnShrinkLeft], 
                            [X1, Y2, 90,  1, fnShrinkLeft], 
                            [X2, Y3,180,  1, fnRotateClockwise], 
                            [X2, Y1, 90,  1, null], 
                            [X2, Y2, 90,  1, null]
                        ]
                    }
                ]
        },
        '1' : {
            '1' : [

                   {'weight' : 18, 'lines' : [
                            [X2, Y1, 90,  1, null], 
                            [X2, Y2, 90,  1, null]
                        ]
                    },{'weight' : 1, 'lines' : [
                            [X2, Y2,270,  1, fnRotateAntiClockwise2], 
                            [X2, Y2, 90,  1, fnMoveUp], 
                        ]
                    },{'weight' : 1, 'lines' : [
                            [X2, Y2, 90,  1, fnRotateClockwise2], 
                            [X2, Y1, 90,  1, fnMoveDown]
                        ]
                    }
             ],
            '2' : [
                    {'weight' : 1, 'lines' : [
                            [X2, Y1,  0,  0, fnGrowLeft], 
                            [X2, Y1, 90,  1, null], 
                            [X2, Y2,  0,  0, fnGrowLeft], 
                            [X2, Y2, 90,  1, fnMoveLeft], 
                            [X2, Y3,  0,  0, fnGrowLeft] 
                        ]
                    },{'weight' : 1, 'lines' : [
                            [X2, Y1, 90,  1, fnRotateClockwise], 
                            [X2, Y1, 90,  1, null], 
                            [X2, Y2, 90,  1, fnRotateClockwise], 
                            [X2, Y2, 90,  1, fnMoveLeft], 
                            [X2, Y3,270,  1, fnRotateAntiClockwise]
                        ]
                    }
                ]
        },
        '2' : {
            '0' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, fnRotateAntiClockwise], 
                            [X2, Y2,180,  1, fnRotateAntiClockwise], 
                            [X1, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null] 
                        ]
                    }
                ],      
            '2' : [
                    {'weight' : 9, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X1, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null] 
                        ]
                    },{'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X2, Y1, 90,  1, fnShrinkLeft], 
                            [X1, Y2,  0,  1, null], 
                            [X1, Y2, 90,  1, fnShrinkLeft], 
                            [X1, Y2,  0,  1, fnRotateClockwise], 
                            [X2, Y2,180,  1, fnRotateClockwise], 
                            [X1, Y3,  0,  1, null] 
                        ]
                    }
                ],          
            '3' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X1, Y2, 90,  1, fnMoveRight], 
                            [X1, Y3,  0,  1, null] 
                        ]
                    }
                ]
        },
        '3' : {
            '3' : [
                    {'weight' : 18, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null] 
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X2, Y2,180,  1, fnRotateClockwise], 
                            [X2, Y2, 90,  1, fnRotateClockwise], 
                            [X1, Y3,  0,  1, null] 
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X2, Y2,180,  1, fnRotateAntiClockwise], 
                            [X2, Y2,270,  1, fnRotateAntiClockwise], 
                            [X1, Y3,  0,  1, null]          
                        ]
                    }       
                ],          
            '4' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, fnRotateClockwise], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, fnShrinkRight] 
                        ]
                    }
                ]
        },
        '4' : {
            '4' : [
                    {'weight' : 9, 'lines' : [
                            [X1, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X2, Y2, 90,  1, null]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, fnMoveDown], 
                            [X2, Y2,180,  1, fnRotateClockwise], 
                            [X2, Y2, 90,  1, fnRotateClockwise]
                        ]
                    }
                ],
            '5' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, fnRotateClockwise], 
                            [X1, Y2,  0,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X2, Y3,  0,  0, fnGrowLeft] 
                        ]
                    }
                ]           
        },
        '5' : {
            '0' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X2, Y2,180,  1, fnRotateClockwise], 
                            [X1, Y2,  0,  1, fnRotateClockwise], 
                            [X2, Y2, 90,  1, null],
                            [X1, Y3,  0,  1, null] 
                        ]
                    }
                ],
            '5' : [
                    {'weight' : 9, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null] 
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1,  0,  1, fnRotateClockwise], 
                            [X1, Y1, 90,  1, fnShrinkLeft], 
                            [X1, Y2,  0,  1, null], 
                            [X2, Y2, 90,  1, fnShrinkLeft], 
                            [X2, Y2,180,  1, fnRotateAntiClockwise],
                            [X1, Y3,  0,  1, null] 
                        ]
                    }
                ],
            '6' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y2,  0,  1, fnRotateClockwise], 
                            [X2, Y2, 90,  0, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }
                ]           
        },
        '6' : {
            '6' : [
                    {'weight' : 27, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X1, Y2, 90,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, fnRotateClockwise], 
                            [X1, Y1,  0,  0, fnGrowRight], 
                            [X1, Y1, 90,  1, fnShrinkLeft], 
                            [X1, Y2,  0,  1, null], 
                            [X1, Y2, 90,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, fnRotateClockwise], 
                            [X1, Y3,270,  1, fnRotateClockwise], 
                            [X2, Y3,180,  1, fnRotateClockwise], 
                            [X2, Y2, 90,  1, fnRotateClockwise]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X1, Y2, 90,  1, fnRotateAntiClockwise], 
                            [X1, Y3,  0,  1, fnRotateAntiClockwise], 
                            [X2, Y3,270,  1, fnRotateAntiClockwise], 
                            [X2, Y2,180,  1, fnRotateAntiClockwise]
                        ]
                    }
                ],
            '7' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, fnMoveRight], 
                            [X1, Y2,  0,  1, fnShrinkRight], 
                            [X1, Y2, 90,  1, fnMoveRight], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, fnShrinkRight]
                        ]
                    }
                ]           
        },
        '7' : {
            '7' : [
                    {'weight' : 9, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X2, Y2, 90,  1, null]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X2, Y1,180,  0, fnGrowRight], 
                            [X2, Y1,180,  1, fnRotateAntiClockwise], 
                            [X2, Y1, 90,  1, fnMoveDown], 
                            [X2, Y2, 90,  1, fnShrinkDown]
                        ]
                    }
                ],
            '8' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1,  0,  1, fnRotateClockwise], 
                            [X2, Y1, 90,  1, null], 
                            [X2, Y2,  0,  0, fnGrowLeft], 
                            [X2, Y2, 90,  1, fnMoveLeft], 
                            [X2, Y2, 90,  1, null], 
                            [X2, Y3,  0,  0, fnGrowLeft]
                        ]
                    }
                ]           
        },
        '8' : {
            '8' : [
                    {'weight' : 18, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X1, Y2, 90,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, fnMoveDown], 
                            [X2, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, fnMoveLeft], 
                            [X1, Y2,  0,  1, null], 
                            [X1, Y2, 90,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1,  0,  1, fnRotateClockwise], 
                            [X1, Y1, 90,  1, fnShrinkLeft], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, fnShrinkLeft], 
                            [X1, Y2, 90,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X2, Y2, 90,  1, fnRotateClockwise], 
                            [X1, Y3,  0,  1, null]
                        ]                       
                    }
                ],
            '9' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X1, Y2, 90,  1, fnMoveRight], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X1, Y2, 90,  1, fnRotateAntiClockwise], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }
                ]
        },
        '9' : {
            '9' : [
                    {'weight' : 18, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, null], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X2, Y2,270,  1, fnRotateAntiClockwise], 
                            [X2, Y2,270,  0, fnGrowRight],
                            [X2, Y2,180,  1, fnRotateAntiClockwise], 
                            [X2, Y2, 90,  1, fnShrinkLeft], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }, {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, fnShrinkLeft], 
                            [X1, Y1, 90,  1, fnShrinkLeft], 
                            [X2, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, fnRotateClockwise], 
                            [X1, Y2,  0,  1, null], 
                            [X1, Y2,  0,  1, fnRotateAntiClockwise],
                            [X1, Y2,  0,  1, null],
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }
                ],
            '0' : [
                    {'weight' : 1, 'lines' : [
                            [X1, Y1,  0,  1, null], 
                            [X1, Y1, 90,  1, null], 
                            [X2, Y1, 90,  1, null], 
                            [X1, Y2,  0,  1, fnRotateClockwise], 
                            [X2, Y2, 90,  1, null], 
                            [X1, Y3,  0,  1, null]
                        ]
                    }
                ]
        }                                                                           
    };  
}

