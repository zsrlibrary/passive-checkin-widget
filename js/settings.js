"use strict";

var RiseVision = RiseVision || {};
RiseVision.WorldClock = {};
RiseVision.WorldClock.Settings = {};

RiseVision.WorldClock.Settings = function () {
	this.settings = new RiseVision.Common.Settings();
}
RiseVision.WorldClock.Settings.prototype.init = function() {
	var self = this;

	//Populate Format dropdown.
	$("<option>").val("12-hour-seconds").text(new Date().toString("h:mm:ss tt")).attr("selected", "selected").appendTo("#format");
	$("<option>").val("12-hour").text(new Date().toString("h:mm tt")).appendTo("#format");
	$("<option>").val("24-hour-seconds").text(new Date().toString("H:mm:ss")).appendTo("#format");
	$("<option>").val("24-hour").text(new Date().toString("H:mm")).appendTo("#format");

	//Tooltips
	$("label[for='use-local-time'], label[for='show-title'], label[for='placement'], label[for='padding']").on("click", function() {
		$(this).popover("toggle");
	});

	$("#placement").change(function() {
		var val = $(this).val();

		if ((val == "top") || (val == "bottom")) {
			$("div.halign").show();
			$("div.valign").hide();
		}
		else {
			$("div.halign").hide();
			$("div.valign").show();
		}
	});

	$("input:checkbox").change(function() {
		if ($(this).val() == "use-local-time") {
			if ($(this).is(":checked")) {
				$("div.time-zone").hide();
			}
			else {
				$("div.time-zone").show();
				$("#time-zone").focus();
			}
		}
		else if ($(this).val() == "show-title") {
			if ($(this).is(":checked")) {
				$("div.title").show();
				$("#title").focus();
			}
			else {
				$("div.title").hide();
			}
		}
		else if ($(this).val() == "show-second-hand") {
			if ($(this).is(":checked")) {
				$("div.second-hand").show();
			}
			else {
				$("div.second-hand").hide();
			}
		}
	});

	$("input[name='clock-type']").change(function() {
		var val = $(this).val();

		if ($(this).is(":checked")) {
			if (val == "analog") {
				$("div.analog").show();
				$("div.digital").hide();
			}
			else {
				$("div.analog").hide();
				$("div.digital").show();
			}
		}
	});

	$("#save").on("click", function() {
		self.getSettings();
	});

	$("#cancel, #settings-close").on("click", function() {
		gadgets.rpc.call("", "rscmd_closeSettings", null);
	});

	$("#help").on("click", function() {
		window.open("http://www.risevision.com/help/users/what-are-gadgets/free-gadgets/rise-vision-world-clock/", "_blank");
	});

	$(".alert").hide();

	//Request additional parameters from the Viewer.
	gadgets.rpc.call("", "rscmd_getAdditionalParams", function(result) {
		//Settings have been saved before.
		if (result) {
			var prefs = new gadgets.Prefs();

			result = JSON.parse(result);
			self.result = result;

			$("#use-local-time").attr("checked", prefs.getBool("use-local-time"));
			$("#time-zone").val(prefs.getString("time-zone"));
			$("#show-title").attr("checked", prefs.getBool("show-title"));
			$("#title").val(prefs.getString("title"));
			$("#placement").val(prefs.getString("placement"));
			$("#padding").val(prefs.getInt("padding"));
			$("#horizontal-align").val(prefs.getString("horizontal-align"));
			$("#vertical-align").val(prefs.getString("vertical-align"));
			$("#frame-color").val(prefs.getString("frame-color"));
			$("#face-color").val(prefs.getString("face-color"));
			$("#hand-color").val(prefs.getString("hand-color"));
			$("#frame-width").val(prefs.getInt("frame-width"));
			$("#hour-tick-width").val(prefs.getInt("hour-tick-width"));
			$("#minute-tick-width").val(prefs.getInt("minute-tick-width"));
			$("#hand-width").val(prefs.getInt("hand-width"));
			$("#show-second-hand").attr("checked", prefs.getBool("show-second-hand"));
			$("#second-hand-color").val(prefs.getString("second-hand-color"));
			$("#second-hand-width").val(prefs.getInt("second-hand-width"));
			$("#format").val(prefs.getString("format"));

			$("input[type='radio'][name='clock-type']").each(function() {
				if ($(this).val() == prefs.getString("clock-type")) {
					$(this).attr("checked", "checked");
				}
			});

			//Title Font
			$("#title-font").fontPicker({
				"i18n-prefix" : "title-font",
				"defaults" : {
					"font" : result["title-font"],
					"font-url" : result["title-font-url"],
					"font-size" : result["title-font-size"],
					"is-bold" : result["title-bold"],
					"is-italic" : result["title-italic"],
					"color" : result["title-color"]
				}
			});

			//Numbers Font
			$("#numbers-font").fontPicker({
				"i18n-prefix" : "numbers-font",
				"defaults" : {
					"font" : result["numbers-font"],
					"font-url" : result["numbers-font-url"],
					"font-size" : result["numbers-font-size"],
					"is-bold" : result["numbers-bold"],
					"is-italic" : result["numbers-italic"],
					"color" : result["numbers-color"]
				}
			});

			//Digital Font
			$("#digital-font").fontPicker({
				"i18n-prefix" : "digital-font",
				"defaults" : {
					"font" : result["digital-font"],
					"font-url" : result["digital-font-url"],
					"is-bold" : result["digital-bold"],
					"is-italic" : result["digital-italic"],
					"color" : result["digital-color"]
				}
			});

			//Colors
			$("#frame-color").fontPicker({
				"i18n-prefix" : "frame-color",
				"defaults" : {
					"color" : prefs.getString("frame-color")
				}
			});
			$("#face-color").fontPicker({
				"i18n-prefix" : "face-color",
				"defaults" : {
					"color" : prefs.getString("face-color")
				}
			});
			$("#hand-color").fontPicker({
				"i18n-prefix" : "hand-color",
				"defaults" : {
					"color" : prefs.getString("hand-color")
				}
			});
			$("#second-hand-color").fontPicker({
				"i18n-prefix" : "second-hand-color",
				"defaults" : {
					"color" : prefs.getString("second-hand-color")
				}
			});
			$("#background-color").fontPicker({
				"i18n-prefix" : "background-color",
				"defaults" : {
					"color" : prefs.getString("background-color")
				}
			});
		}
		//Settings have never been saved.
		else {
			//Initialize font pickers.
			$("#title-font").fontPicker({
				"i18n-prefix" : "title-font"
			});
			$("#numbers-font").fontPicker({
				"i18n-prefix" : "numbers-font",
				"defaults" : {
					"font-size" : "48"
				}
			});
			$("#digital-font").fontPicker({
				"i18n-prefix" : "digital-font",
				"visibility" : {
					"font-size" : false
				}
			});
			$("#frame-color").fontPicker({
				"i18n-prefix" : "frame-color",
				"visibility" : {
					"font" : false,
					"font-size" : false,
					"variants" : false,
					"text" : false
				}
			});
			$("#face-color").fontPicker({
				"i18n-prefix" : "face-color",
				"defaults" : {
					"color" : "rgba(255, 255, 255, 1)"
				},
				"visibility" : {
					"font" : false,
					"font-size" : false,
					"variants" : false,
					"text" : false
				}
			});
			$("#hand-color").fontPicker({
				"i18n-prefix" : "hand-color",
				"visibility" : {
					"font" : false,
					"font-size" : false,
					"variants" : false,
					"text" : false
				}
			});
			$("#second-hand-color").fontPicker({
				"i18n-prefix" : "second-hand-color",
				"defaults" : {
					"color" : "rgba(255, 0, 0, 1)"
				},
				"visibility" : {
					"font" : false,
					"font-size" : false,
					"variants" : false,
					"text" : false
				}
			});
			$("#background-color").fontPicker({
				"i18n-prefix" : "background-color",
				"defaults" : {
					"color" : ""
				},
				"visibility" : {
					"font" : false,
					"font-size" : false,
					"variants" : false,
					"text" : false
				}
			});
		}

		//Handle tooltips programmatically since some UI elements are already bound to the click event.
		$("[data-toggle='popover']").popover({
			trigger : "manual"
		});

		//Manually trigger event handlers so that the visibility of fields can be set.
		$("input:checkbox").trigger("change");
		$("input[name='clock-type']").trigger("change");
		$("#placement").trigger("change");

		//Translate
		i18n.init({ fallbackLng: "en" }, function(t) {
			$(".widget-wrapper").i18n().show();
			$(".form-control").selectpicker();

			//Set buttons to be sticky only after settings is visible.
			$(".sticky-buttons").sticky({
				container: $(".widget-wrapper"),
				topSpacing: 41,	//top margin + border of settings
				getWidthFrom: $(".widget-wrapper")
			});

		});
	});
}
RiseVision.WorldClock.Settings.prototype.getSettings = function() {
	var alerts = document.getElementById("settings-alert"), errorFound = false, additionalParams = null, prefs = null, params = "", settings = null, selected = 0;

	$("#settings-alert").empty();

	//Perform validation.
	errorFound = (clock.settings.validateRequired($("#title"), alerts, "Title")) ? true : errorFound;
	errorFound = (clock.settings.validateNumeric($("#padding"), alerts, "Padding")) ? true : errorFound;
	errorFound = (clock.settings.validateNumeric($("#frame-width"), alerts, "Frame Width")) ? true : errorFound;
	errorFound = (clock.settings.validateNumeric($("#hour-tick-width"), alerts, "Hour Tick Width")) ? true : errorFound;
	errorFound = (clock.settings.validateNumeric($("#minute-tick-width"), alerts, "Minute Tick Width")) ? true : errorFound;
	errorFound = (clock.settings.validateNumeric($("#hand-width"), alerts, "Hour / Minute Hand Width")) ? true : errorFound;
	errorFound = (clock.settings.validateNumeric($("#second-hand-width"), alerts, "Second Hand Width")) ? true : errorFound;

	if (errorFound) {
		$(".alert").show();
	}
	else {
		//Save new values.
		params = ($("#use-local-time").is(":checked")) ? "up_use-local-time=true" : "up_use-local-time=false";
		params += "&up_time-zone=" + $("#time-zone").val();
		params += ($("#show-title").is(":checked")) ? "&up_show-title=true" : "&up_show-title=false";
		params += "&up_title=" + $("#title").val() + "&up_placement=" + $("#placement").val();
		params += ($("#padding").val() == "") ? "&up_padding=0" : "&up_padding= " + $("#padding").val();
		params += "&up_horizontal-align=" + $("#horizontal-align").val() + "&up_vertical-align=" + $("#vertical-align").val();

		//Clock Type
		selected = $("input[type='radio'][name='clock-type']:checked");

		if (selected.length > 0) {
			params += "&up_clock-type=" + selected.val();
		}

		params += "&up_frame-color=" + $("#frame-color").data("font-picker").getColor() + "&up_face-color=" + $("#face-color").data("font-picker").getColor() + "&up_hand-color=" + $("#hand-color").data("font-picker").getColor();
		params += ($("#show-second-hand").is(":checked")) ? "&up_show-second-hand=true" : "&up_show-second-hand=false";
		params += "&up_second-hand-color=" + $("#second-hand-color").data("font-picker").getColor() + "&up_frame-width=" + $("#frame-width").val() + "&up_hour-tick-width=" + $("#hour-tick-width").val() + "&up_minute-tick-width=" + $("#minute-tick-width").val() + "&up_hand-width=" + $("#hand-width").val() + "&up_second-hand-width=" + $("#second-hand-width").val() + "&up_format=" + $("#format").val() + "&up_background-color=" + $("#background-color").data("font-picker").getColor();

		settings = {
			"params" : params,
			"additionalParams" : JSON.stringify(clock.saveAdditionalParams())
		};

		$(".alert").hide();

		gadgets.rpc.call("", "rscmd_saveSettings", null, settings);
	}
}
RiseVision.WorldClock.Settings.prototype.saveAdditionalParams = function() {
	var additionalParams = {}, titleFontPicker = $("#title-font").data("font-picker"), numbersFontPicker = $("#numbers-font").data("font-picker"), digitalFontPicker = $("#digital-font").data("font-picker");

	//Title Font
	additionalParams["title-font"] = titleFontPicker.getFont();
	additionalParams["title-font-style"] = titleFontPicker.getFontStyle();
	additionalParams["title-font-url"] = titleFontPicker.getFontURL();
	additionalParams["title-font-size"] = titleFontPicker.getFontSize();
	additionalParams["title-bold"] = titleFontPicker.getBold();
	additionalParams["title-italic"] = titleFontPicker.getItalic();
	additionalParams["title-color"] = titleFontPicker.getColor();

	//Numbers Font
	additionalParams["numbers-font"] = numbersFontPicker.getFont();
	additionalParams["numbers-font-style"] = numbersFontPicker.getFontStyle();
	additionalParams["numbers-font-url"] = numbersFontPicker.getFontURL();
	additionalParams["numbers-font-size"] = numbersFontPicker.getFontSize();
	additionalParams["numbers-bold"] = numbersFontPicker.getBold();
	additionalParams["numbers-italic"] = numbersFontPicker.getItalic();
	additionalParams["numbers-color"] = numbersFontPicker.getColor();

	//Digital Font
	additionalParams["digital-font"] = digitalFontPicker.getFont();
	additionalParams["digital-font-style"] = digitalFontPicker.getFontStyle();
	additionalParams["digital-font-url"] = digitalFontPicker.getFontURL();
	additionalParams["digital-bold"] = digitalFontPicker.getBold();
	additionalParams["digital-italic"] = digitalFontPicker.getItalic();
	additionalParams["digital-color"] = digitalFontPicker.getColor();

	return additionalParams;
}