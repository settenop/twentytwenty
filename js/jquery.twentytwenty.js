(function ($) {

  $.fn.twentytwenty = function (options) {
    var options = $.extend({
      default_offset_pct: 0.5,
      orientation: 'horizontal',
      before_label: 'Before',
      after_label: 'After',
      no_overlay: false,
      move_slider_on_hover: false,
      move_with_handle_only: true,
      click_to_move: false
    }, options);

    return this.each(function () {

      var sliderPct = options.default_offset_pct;
      var container = $(this);
      var sliderOrientation = options.orientation;
      var beforeDirection = (sliderOrientation === 'vertical') ? 'down' : 'left';
      var afterDirection = (sliderOrientation === 'vertical') ? 'up' : 'right';


      container.wrap("<div class='twentytwenty-wrapper twentytwenty-" + sliderOrientation + "'></div>");
      if (!options.no_overlay) {
        container.append("<div class='twentytwenty-overlay'></div>");
        var overlay = container.find(".twentytwenty-overlay");
        overlay.append("<div class='twentytwenty-before-label' data-content='" + options.before_label + "'></div>");
        overlay.append("<div class='twentytwenty-after-label' data-content='" + options.after_label + "'></div>");
      }
      var beforeImg = container.find("img:first");
      if (beforeImg.length === 0) {
        beforeImg = container.find(".before");
      }
      beforeImg.wrap("<div class='before-wrap'></div>").find(".before-wrap");
      var beforeImgWrap = container.find(".before-wrap");
      var afterImg = container.find("img:last");
      if (afterImg.length === 0) {
        afterImg = container.find(".after");
      }
      afterImg.wrap("<div class='after-wrap'></div>");
      var afterImgWrap = container.find(".after-wrap");
      container.append("<div class='twentytwenty-handle'></div>");
      var slider = container.find(".twentytwenty-handle");
      slider.append("<span class='twentytwenty-" + beforeDirection + "-arrow'></span>");
      slider.append("<span class='twentytwenty-" + afterDirection + "-arrow'></span>");
      container.addClass("twentytwenty-container");
      beforeImg.addClass("twentytwenty-before");
      afterImg.addClass("twentytwenty-after");
      // w and h were inside calcOffset, and they were slow to calculate
      var w = beforeImg.width();
      var h = beforeImg.height();
      var calcOffset = function (dimensionPct) {
        return {
          w: w + "px",
          h: h + "px",
          cw: (dimensionPct * w) + "px",
          ch: (dimensionPct * h) + "px"
        };
      };

      var adjustContainer = function (pct) {
        var beforeScale = pct;
        var beforeInverseScale = beforeScale ? 1 / beforeScale : 0;
        if (sliderOrientation === 'vertical') {
          beforeImgWrap.css("transform", "scale3d(1," + beforeScale + ",1)");
          beforeImg.css("transform", "scale3d(1," + beforeInverseScale + ",1)");
        }
        else {
          beforeImgWrap.css("transform", "scale3d(" + beforeScale + ",1,1)");
          beforeImg.css("transform", "scale3d(" + beforeInverseScale + ",1,1)");
        }
      };

      var adjustSlider = function (pct) {
        var offset = calcOffset(pct);
        slider.css(
          "transform",
          (sliderOrientation === "vertical")
            ? "translate3d(0," + offset.ch + ",0)"
            : "translate3d(" + offset.cw + ",0,0)");
        adjustContainer(pct);
      };

      // Return the number specified or the min/max number if it outside the range given.
      var minMaxNumber = function (num, min, max) {
        return Math.max(min, Math.min(max, num));
      };

      // Calculate the slider percentage based on the position.
      var getSliderPercentage = function (positionX, positionY) {
        var sliderPercentage = (sliderOrientation === 'vertical') ?
          (positionY - offsetY) / imgHeight :
          (positionX - offsetX) / imgWidth;

        return minMaxNumber(sliderPercentage, 0, 1);
      };


      $(window).on("resize.twentytwenty", function (e) {
        beforeImgWrap.css("position", "static");
        afterImgWrap.css("position", "static");
        beforeImgWrap.width('');
        beforeImgWrap.height('');
        afterImgWrap.width('');
        afterImgWrap.height('');
        adjustSlider(sliderPct);
        beforeImgWrap.width(beforeImg.width());
        beforeImgWrap.height(beforeImg.height());
        beforeImgWrap.css("position", "absolute");
        afterImgWrap.width(afterImg.width());
        afterImgWrap.height(afterImg.height());
        afterImgWrap.css("position", "absolute");
        container.css("height", beforeImg.height());
        w = beforeImg.width();
        h = beforeImg.height();
      });

      var offsetX = 0;
      var offsetY = 0;
      var imgWidth = 0;
      var imgHeight = 0;
      var onMoveStart = function (e) {
        if (((e.distX > e.distY && e.distX < -e.distY) || (e.distX < e.distY && e.distX > -e.distY)) && sliderOrientation !== 'vertical') {
          e.preventDefault();
        }
        else if (((e.distX < e.distY && e.distX < -e.distY) || (e.distX > e.distY && e.distX > -e.distY)) && sliderOrientation === 'vertical') {
          e.preventDefault();
        }
        container.addClass("active");
        offsetX = container.offset().left;
        offsetY = container.offset().top;
        imgWidth = beforeImg.width();
        imgHeight = beforeImg.height();
      };
      var onMove = function (e) {
        if (container.hasClass("active")) {
          sliderPct = getSliderPercentage(e.pageX, e.pageY);
          adjustSlider(sliderPct);
        }
      };
      var onMoveEnd = function () {
        container.removeClass("active");
      };

      var moveTarget = options.move_with_handle_only ? slider : container;
      moveTarget.on("movestart", onMoveStart);
      moveTarget.on("move", onMove);
      moveTarget.on("moveend", onMoveEnd);

      if (options.move_slider_on_hover) {
        container.on("mouseenter", onMoveStart);
        container.on("mousemove", onMove);
        container.on("mouseleave", onMoveEnd);
      }

      slider.on("touchmove", function (e) {
        e.preventDefault();
      });

      container.find("img").on("mousedown", function (event) {
        event.preventDefault();
      });

      if (options.click_to_move) {
        container.on('click', function (e) {
          offsetX = container.offset().left;
          offsetY = container.offset().top;
          imgWidth = beforeImg.width();
          imgHeight = beforeImg.height();

          sliderPct = getSliderPercentage(e.pageX, e.pageY);
          adjustSlider(sliderPct);
        });
      }

      $(window).trigger("resize.twentytwenty");

      beforeImgWrap.css("transformOrigin", sliderOrientation === "horizontal" ? "left" : "top");
      beforeImg.css("transformOrigin", sliderOrientation === "horizontal" ? "left" : "top");
      if (sliderOrientation === "horizontal") {
        slider.css("left", 0);
      } else {
        slider.css("top", 0);
      }

      function animAdjustSlider(val) {
        adjustSlider(val / 100);
      }
      function animateStep(subject, step, additionalOptions) {
        var opt = {
          duration: step.duration,
          step: animAdjustSlider
        };
        if (additionalOptions) {
          opt = Object.assign({}, opt, additionalOptions);
        }
        return $(subject).animate({
          counter: step.to
        }, opt);
      }
      function disablePointerEvents() {
        container.css("pointerEvents", "none");
      }
      function enablePointerEvents() {
        container.css("pointerEvents", "inherit");
      }
      $(container).on("anim_slide", function (e, opt) {
        var steps = opt.steps;
        var subject = { counter: steps[0].from };
        var i = 0;
        disablePointerEvents();
        var stepsLength = opt.steps.length;
        for (i = 0; i < stepsLength; ++i) {
          if (i === opt.steps.length - 1) {
            subject = animateStep(subject, steps[i], {
              complete: enablePointerEvents
            });
          } else {
            subject = animateStep(subject, steps[i]);
          }
        }
      });
    });
  };
})(jQuery);