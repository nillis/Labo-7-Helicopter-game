		var accelerationObject = {
				'x' : null,
				'y' : null,
				'z' : null,
				
		};

		//
	    // Start watching the acceleration
	    //
	    function startWatchAccelerometer() {
	        // Update acceleration every 25ms
	        if(navigator.accelerometer) {
		        var options = { frequency: 25 };
		        watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
		    }
	    }
	
	    // Stop watching the acceleration
	    //
	    function stopWatchAccelerometer() {
	        if (watchID) {
	            navigator.accelerometer.clearWatch(watchID);
	            watchID = null;
	        }
	    }
	
	    // onSuccess: Get a snapshot of the current acceleration
	    //
	    function onSuccess(acceleration) {
	    	accelerationObject = {
	    			'x' : acceleration.x,
					'y' : acceleration.y,
					'z' : acceleration.z,
			};

	    }
	
	    // onError: Failed to get the acceleration
	    //
	    function onError() {
	    	//Console.log('Accelerometer.js : Failed to get the acceleration');
	    }