	// shorthand for document.getElementById
	var $ = function (s) { return document.getElementById(s); };
	
	function onDeviceReady() {
		
		// Mobile: start watching accelerometer changes
		startWatchAccelerometer();

	
		// Desktop: disable default for arrows and space keys
		document.addEventListener('keydown',  function(evt) {
			evt = (evt) ? evt : ((window.event) ? event : null);
			if (!evt) return;
			if (evt.keyCode == 32 || evt.keyCode == 37 || evt.keyCode == 38 || evt.keyCode == 39 || evt.keyCode == 40) {
				evt.preventDefault();			
			}
		}, false);
		
	
		// sizes
		var scene_w = APPWIDTH; 
		var scene_h = APPHEIGHT; 
		var heli_w = 125;
		var heli_h = 66;
		var man_w = 25;
		var man_h = 50;
		var bomb_w = 12;
		var bomb_h = 18;
		var ground_h = 106;
	
		// animation parameters
		var heli_speed = 0.7; // 2 for desktop
		var man_direction = 1; 
		var man_speed = 1.5;
		var man_alive = true;
	
		// layers
		var background, foreground;
		// sprites
		var sprBackgroundDay, sprBackgroundNight, sprGround, sprMan, sprHelicopter, sprStars, sprClouds, sprBomb, sprResult;
		// cycles
		var mancycle, helicycle;
		// input
		var input;
		// shoot
		var shoot = false;
		var dropped = false;
		// Gameend
		var ended = false;
		// ticker
		var ticker;
		// scene
		var scene;
	
		// create scene
		scene = sjs.Scene({ w: scene_w, h: scene_h, parent: $('app')});
	
		// preload images
		scene.loadImages([
			'img/bg_day.png',
			'img/bg_night.png',
			'img/bomb.png',
			'img/btn_play.png',
			'img/clouds.png',
			'img/spr_helicopter.png',
			'img/spr_man.png',
			'img/ground.png',
			'img/stars.png',
			'img/youlose.png',
			'img/youwin.png'
		], function() {
			// simulate loading time with setTimeout
			setTimeout(function() {
				// create background layer
				background = scene.Layer('background');
				sprBackgroundDay = scene.Sprite('img/bg_day.png', { layer: background, backgroundRepeat: 'repeat-x', color: '#a6e7f7', size:[APPWIDTH, APPHEIGHT] });
				sprBackgroundNight = scene.Sprite('img/bg_night.png', { layer: background, backgroundRepeat: 'repeat-x', color: '#002027', size:[APPWIDTH, APPHEIGHT], opacity: 0 });
				sprGround = scene.Sprite('img/ground.png', { layer: background, y: scene_h - ground_h, size:[APPWIDTH, ground_h]});
				sprStars = scene.Sprite('img/stars.png', { layer: background, y: 50, x: (APPWIDTH - 150)/2, opacity: 0 });
				sprClouds = scene.Sprite('img/clouds.png', { layer: background, y: 20, x: (APPWIDTH - 300)/2 });
				sprBackgroundDay.update();
				sprBackgroundNight.update();
				sprGround.update();
				sprStars.update();
				sprClouds.update();
				sprBackgroundDay.setBackgroundRepeat('no-repeat');
	
				// create foreground layer
				foreground = scene.Layer('foreground');
	
				// create bomb and put offscreen
				sprBomb = scene.Sprite('img/bomb.png', { layer: foreground, x: -100 });
				sprBomb.yspeed = 0;
				sprBomb.gravity = 0.2;
	
				// create helicopter 
				sprHelicopter = scene.Sprite("img/spr_helicopter.png", { layer: foreground, w: heli_w, h: heli_h, x: (scene_w - heli_w) / 2, y: 100 });
	
				// create helicopter animation
				helicycle = scene.Cycle([
					[0, 0, 7], // sprite image 1
					[heli_w, 0, 7]  // sprite image 2
				]);
				helicycle.addSprite(sprHelicopter);
				var xv = 0;
	
				// create man 
				sprMan = scene.Sprite("img/spr_man.png", { layer: foreground, w: man_w, h: man_h, y: scene_h - ground_h - man_h});
				sprMan.scale(-1, 1);
	
				// create man animation
				mancycle = scene.Cycle([
					[3, 5, 1],
					[33, 5, 1],
					[63, 5, 2],
					[93, 5, 2],
					[123, 5, 2],
					[153, 5, 2],
					[183, 5, 2]
				]);
				mancycle.addSprite(sprMan);

				// create input
			    input = scene.Input();
	
				// start game
				function paint(ticker) {
					// animate sprites
					helicycle.next(ticker.lastTicksElapsed);
					mancycle.next(ticker.lastTicksElapsed);
					
					// enable shooting
					if (input.keyboard.space) { 
						// Space is also a tap on mobile (see SpriteJS documentation)
						shoot = true;
					}

					// Move the helicopter
					// Mobile ... > accelerometer
					if(accelerationObject.x != null) {
						sprHelicopter.move(accelerationObject.x,0);
					}
					// Desktop ... > arrow keys				
					if (!input.keyboard.left && !input.keyboard.right)
                		xv = xv / 1.3;
		            if (input.keyboard.left) {
		            	xv = Math.max(-3.5, xv - 1);
		            }
		           	if (input.keyboard.right) xv = Math.min(3.5, xv + 1)
		            sprHelicopter.move(xv,0);

					// Don't forget
					sprHelicopter.update();
					

					// move bomb 
					// Hint: start the bomb outside the screen 
					if(shoot) {
						if(!dropped) {
							sprBomb.setX(sprHelicopter.x + sprHelicopter.w / 2 - sprBomb.w / 2);
							sprBomb.setY(sprHelicopter.y + sprHelicopter.h / 2 - sprBomb.h / 2);
							dropped = true;
						}

                    	sprBomb.move(0, sprBomb.yspeed);
                    	sprBomb.yspeed += sprBomb.gravity;

						if(sprBomb.collidesWith(sprMan) && !ended) {
							sprResult = scene.Sprite('img/youwin.png', { layer: background, x: 100, w: APPWIDTH});
							sprResult.update();
						}

						if(sprBomb.collidesWith(sprGround) && !ended) {
							sprResult = scene.Sprite('img/youlose.png', { layer: background, x: 100, w: APPWIDTH});
							sprResult.update();
						}

						if(sprBomb.collidesWith(sprGround) || sprBomb.collidesWith(sprMan)) {
							sprBomb.yspeed = 0;
							sprBomb.setX(-100);
							shoot = false;
							dropped = false;
							ended = true;
						}
					}

					// Don't forget
					sprBomb.update();
	
	
					
					// move man
					if (man_alive) {
						sprMan.setX(sprMan.x + man_direction * man_speed);
						if (sprMan.x >= scene_w - man_w) {
							man_direction = -1;
							sprMan.scale(1, 1);
						}
						if (sprMan.x <= 0) {
							man_direction = 1;
							sprMan.scale(-1, 1);
						}
						sprMan.update();
					}
					
				}
	
				// create game ticker
				ticker = scene.Ticker(paint, {tickDuration: 30});
			    ticker.run();
	
			}, 1000)
		});
	}
	
	
	// Mobile
	document.addEventListener('deviceready', onDeviceReady, false);
	//window.addEventListener('load', onDeviceReady, false);
	
