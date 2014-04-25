var RiseVision = RiseVision || {};
RiseVision.NagiosCheckin = {};
RiseVision.NagiosCheckin.Controller = {};

RiseVision.NagiosCheckin.Controller = function() {
	this.rsW = prefs.getInt("rsW");
	this.rsH = prefs.getInt("rsH");
	this.useLocalTime = prefs.getBool("use-local-time");
	this.timeZone = prefs.getString("time-zone");
	this.showTitle = prefs.getBool("show-title");
	this.placement = prefs.getString("placement");
	this.horizontalAlign = prefs.getString("horizontal-align");
	this.verticalAlign = prefs.getString("vertical-align");
	this.clockType = prefs.getString("clock-type");
	this.frameColor = prefs.getString("frame-color");
	this.faceColor = prefs.getString("face-color");
	this.handColor = prefs.getString("hand-color");
	this.frameWidth = prefs.getInt("frame-width");
	this.hourTickWidth = prefs.getInt("hour-tick-width");
	this.minuteTickWidth = prefs.getInt("minute-tick-width");
	this.handWidth = prefs.getInt("hand-width");
	this.showSecondHand = prefs.getBool("show-second-hand");
	this.secondHandColor = prefs.getString("second-hand-color");
	this.secondHandWidth = prefs.getInt("second-hand-width");
	this.format = prefs.getString("format");
}
RiseVision.NagiosCheckin.Controller.prototype.getAdditionalParams = function(name, value) {
	var styleNode, rules;

	if (name == "additionalParams") {
		if (value) {
			styleNode = document.createElement("style");
			value = JSON.parse(value);

			//Load fonts.
			if (controller.showTitle) {
				controller.titleFont = new RiseVision.Common.Font(value["title-font"], value["title-font-style"], value["title-font-url"], "titleFont");
				controller.titleFontSize = value["title-font-size"];
				controller.titleColor = value["title-color"];
				controller.titleBold = value["title-bold"];
				controller.titleItalic = value["title-italic"];
			}

			if (controller.clockType == "analog") {
				controller.numbersFont = new RiseVision.Common.Font(value["numbers-font"], value["numbers-font-style"], value["numbers-font-url"], "numbersFont");
				controller.canvasFont = "";

				if (value["numbers-bold"]) {
					controller.canvasFont = "bold ";
				}

				if (value["numbers-italic"]) {
					controller.canvasFont += "italic ";
				}

				controller.canvasFont += value["numbers-font-size"] + "px ";
				controller.canvasFont += controller.numbersFont.getFontFamily();
				controller.numbersColor = value["numbers-color"];
			} else {
				controller.digitalFont = new RiseVision.Common.Font(value["digital-font"], value["digital-font-style"], value["digital-font-url"], "digitalFont");

				$("#digitalClock").css("font-family", controller.digitalFont.getFontFamily());

				if (value["digital-bold"]) {
					$("#digitalClock").css("font-weight", "bold");
				}

				if (value["digital-italic"]) {
					$("#digitalClock").css("font-style", "italic");
				}

				$("#digitalClock").css("color", value["digital-color"]);
			}
		}
	}

	//If custom fonts are being loaded, give them enough time to load before drawing the clock.
	//Doesn't seem to make any difference.
	//    if (isLoadingFont) {
	//	setTimeout(function() {
	//	    controller.init();
	//	}, 1000);
	//    }
	//    else {
		controller.init();
	//}
}

RiseVision.NagiosCheckin.Controller.prototype.init = function() {
	var $title, canvas, $analogClock = $("#analogClock");

	//Title
	if (this.showTitle) {
		$title = $("<div id='title' class='titleFont'></div>");
		$title.text(prefs.getString("title"));
		$title.addClass(prefs.getString("clock-type") + " " + this.placement);
		$title.css("padding", prefs.getString("padding") + "px");
		$title.css("font-family", this.titleFont.getFontFamily());
		$title.css("font-size", this.titleFontSize + "px").css("color", this.titleColor);

		if (this.titleBold) {
			$title.css("font-weight", "bold");
		}

		if (this.titleItalic) {
			$title.css("font-style", "italic");
		}

		if ((this.placement == "top") || (this.placement == "bottom")) {
			$title.addClass("halign" + this.horizontalAlign);

			if (this.placement == "top") {
				$("#container").prepend($title);
			} else {
				$("#container").append($title);
			}
		} else {//Left or Right
			$title.addClass("valign" + this.verticalAlign);

			if (this.verticalAlign == "middle") {
				$title.css("line-height", this.rsH - prefs.getInt("padding") * 2 + "px");
				$("#container").css("text-align", "left");
			}

			$("#container").prepend($title);
		}
	}

	timezoneJS.timezone.zoneFileBasePath = "https://s3.amazonaws.com/Common-Production/TimezoneJS/Olson";
	timezoneJS.timezone.init({
		async : false
	});

	if (prefs.getString("clock-type") == "analog") {
		canvas = document.getElementById("analogClock");

		$("#container").width(this.rsW).height(this.rsH);
		$("#digitalClock").hide();

		//Calculate dimensions of clock canvas. Must be a square.
		if (this.showTitle) {
			if ((this.placement == "top") || (this.placement == "bottom")) {
				this.clockSize = this.rsH - $("#title").outerHeight();

				if (this.clockSize > this.rsW) {
					this.clockSize = this.rsW;
				}

				canvas.width = this.clockSize;
				canvas.height = this.clockSize;

				$("#container").addClass("haligncenter");
			} else {
				if (this.verticalAlign == "middle") {
					this.clockSize = this.rsW - $("#title").outerWidth();

					if (this.clockSize > this.rsH) {
						this.clockSize = this.rsH;
					}

					//Vertical alignment
					$analogClock.addClass("valign");
					$analogClock.css("margin-top", -this.clockSize / 2 + "px");
				} else {
					this.clockSize = this.rsH - $("#title").outerHeight();

					if (this.clockSize > this.rsW) {
						this.clockSize = this.rsW
					}

					$("#container").addClass("haligncenter");
				}

				canvas.width = this.clockSize;
				canvas.height = this.clockSize;
			}
		} else {
			//Ensure clock's canvas is a square.
			if (this.rsW > this.rsH) {//Landscape
				this.clockSize = this.rsH;

				//Center horizontally.
				$("#container").addClass("haligncenter");
			} else if (this.rsW < this.rsH) {//Portrait
				this.clockSize = this.rsW;

				//Center vertically.
				$analogClock.css("margin-top", (this.rsH / 2) - (this.clockSize / 2) + "px");
			} else {
				this.clockSize = this.rsW;
			}

			canvas.width = this.clockSize;
			canvas.height = this.clockSize;
		}

		//this.drawAnalog();
	} else {
		$analogClock.hide();

		this.setBodyScale();
		//this.drawDigital();

		//Vertical alignment
		if (this.showTitle) {
			if ((this.placement == "top") || (this.placement == "bottom")) {
				$("#digitalClock").css("line-height", this.rsH - $("#title").outerHeight() + "px");
			} else {
				$("#digitalClock").css("line-height", this.rsH + "px");
			}
		} else {
			$("#digitalClock").css("line-height", this.rsH + "px");
		}
	}

	readyEvent();
}
/* This function is adapted from code located at http://www.neilwallis.com/projects/html5/clock/ */
RiseVision.NagiosCheckin.Controller.prototype.drawAnalog = function() {
	var self = this, canvas = document.getElementById("analogClock"), c2d, now, hours, minutes, seconds;

	if (canvas.getContext) {
		c2d = canvas.getContext("2d");

		c2d.clearRect(0, 0, this.clockSize, this.clockSize);

		c2d.font = this.canvasFont;
		c2d.textBaseline = "middle";
		c2d.textAlign = "center";
		c2d.lineWidth = 1;
		c2d.save();

		//Frame and face
		c2d.strokeStyle = this.frameColor;
		c2d.fillStyle = this.faceColor;
		c2d.lineWidth = this.frameWidth;
		c2d.beginPath();
		c2d.arc(this.clockSize / 2, this.clockSize / 2, (this.clockSize / 2) - (this.frameWidth / 2), 0, Math.PI * 2, true);
		c2d.fill();
		c2d.stroke();

		c2d.strokeStyle = this.numbersColor;
		c2d.fillStyle = this.numbersColor;
		c2d.save();

		c2d.translate(this.clockSize / 2, this.clockSize / 2);

		//Ticks and numerals
		for (var i = 1; i <= 60; i++) {
			ang = Math.PI / 30 * i;
			sang = Math.sin(ang);
			cang = Math.cos(ang);

			//If modulus of divide by 5 is zero then draw an hour marker/numeral.
			if (i % 5 == 0) {
				c2d.lineWidth = this.hourTickWidth;
				sx = sang * this.clockSize / 2.9;
				sy = cang * -this.clockSize / 2.9;
				ex = sang * this.clockSize / 2.3;
				ey = cang * -this.clockSize / 2.3;
				nx = sang * this.clockSize / 3.55;
				ny = cang * -this.clockSize / 3.55;

				c2d.fillText(i / 5, nx, ny);
				//Else this is a minute marker.
			} else {
				c2d.lineWidth = this.minuteTickWidth;
				sx = sang * this.clockSize / 2.5;
				sy = cang * this.clockSize / 2.5;
				ex = sang * this.clockSize / 2.3;
				ey = cang * this.clockSize / 2.3;
			}

			c2d.beginPath();
			c2d.moveTo(sx, sy);
			c2d.lineTo(ex, ey);
			c2d.stroke();
		}

		//Get the time.
		now = this.useLocalTime ? new Date() : new timezoneJS.Date(new Date(), this.timeZone);
		hours = now.getHours();
		minutes = now.getMinutes();
		seconds = now.getSeconds();

		c2d.strokeStyle = this.handColor;
		c2d.lineWidth = this.handWidth;
		c2d.save();

		//Draw clock pointers but this time rotate the canvas rather than
		//calculating x/y start/end positions.
		//Hour hand
		c2d.rotate(Math.PI / 6 * (hours + (minutes / 60) + (seconds / 3600)));
		c2d.beginPath();
		c2d.moveTo(0, this.clockSize / 30);
		c2d.lineTo(0, -this.clockSize / 5);
		c2d.stroke();
		c2d.restore();
		c2d.save();

		//Minute hand
		c2d.rotate(Math.PI / 30 * (minutes + (seconds / 60)));
		c2d.beginPath();
		c2d.moveTo(0, this.clockSize / 15);
		c2d.lineTo(0, -this.clockSize / 2.5);
		c2d.stroke();
		c2d.restore();
		c2d.save();

		//Second hand
		if (this.showSecondHand) {
			c2d.rotate(Math.PI / 30 * seconds);
			c2d.strokeStyle = this.secondHandColor;
			c2d.lineWidth = this.secondHandWidth;
			c2d.beginPath();
			c2d.moveTo(0, this.clockSize / 15);
			c2d.lineTo(0, -this.clockSize / 2.5);
			c2d.stroke();
		}

		c2d.restore();

		//Additional restore to go back to state before translate.
		//Alternative would be to simply reverse the original translate.
		c2d.restore();

		this.timeoutID = setTimeout(function() {
			self.drawAnalog();
		}, 1000);
	}
}
RiseVision.NagiosCheckin.Controller.prototype.drawDigital = function() {
	var self = this, ampm = " AM", now = this.useLocalTime ? new Date() : new timezoneJS.Date(new Date(), this.timeZone), hours = now.getHours(), minutes = now.getMinutes(), seconds = now.getSeconds(), dispTime = "";

	if (hours >= 12) {
		ampm = " PM";
	}

	if (minutes <= 9) {
		minutes = "0" + minutes;
	}

	if (seconds <= 9) {
		seconds = "0" + seconds;
	}

	if ((this.format == "12-hour-seconds") || (this.format == "12-hour")) {
		if (hours > 12) {
			hours = hours - 12;
		}

		if (hours == 0) {
			hours = 12;
		}

		if (this.format == "12-hour-seconds") {//4:13:47 PM
			dispTime = hours + ":" + minutes + ":" + seconds + ampm;
		} else {//4:13 PM
			dispTime = hours + ":" + minutes + ampm;
		}
	} else if (this.format == "24-hour-seconds") {//16:13:47
		dispTime = hours + ":" + minutes + ":" + seconds;
	} else {//16:13
		dispTime = hours + ":" + minutes;
	}

	$("#digitalClock").html(dispTime);

	this.timeoutID = setTimeout(function() {
		self.drawDigital();
	}, 1000);
}
RiseVision.NagiosCheckin.Controller.prototype.setBodyScale = function() {
	var fontSize = parseInt($("#digitalClock").css("font-size")), width, height = this.rsH;

	if (((this.placement == "left") || (this.placement == "right")) && (this.verticalAlign == "middle")) {
		width = this.rsW - $("#title").outerWidth();
	} else {
		width = this.rsW;
	}

	//Use 00:00:00 AM format to create widest time possible.
	if (this.format == "12-hour-seconds") {
		$("#digitalClock").html("00:00:00 AM");
	} else if (this.format == "12-hour") {
		$("#digitalClock").html("00:00 AM");
	} else if (this.format == "24-hour-seconds") {
		$("#digitalClock").html("00:00:00");
	} else {
		$("#digitalClock").html("00:00");
	}

	//Continually increase the font size until the content grows bigger than the Placeholder.
	while ((document.getElementById("digitalClock").offsetWidth < width) && (document.getElementById("digitalClock").offsetHeight < height)) {
		$("#digitalClock").css("font-size", ++fontSize);
	}

	//It's too big; back up one.
	$("#digitalClock").css("font-size", --fontSize);
}
RiseVision.NagiosCheckin.Controller.prototype.play = function() {
	if (prefs.getString("clock-type") == "analog") {
		this.drawAnalog();
	} else {
		this.drawDigital();
	}
}
RiseVision.NagiosCheckin.Controller.prototype.pause = function() {
	clearTimeout(this.timeoutID);
}