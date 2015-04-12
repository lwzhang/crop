/**
 * Created with WebStorm.
 * User: JIN
 * Date: 2015/1/23
 * Time: 15:00
 *
 */
(function (win, doc) {
    var Capture = function () {
        this.dropBox = document.getElementById("dropBox");
        this.cutRect = null;
        this.mask = null;
        this.hiddenImage = null;
    };

    var p = Capture.prototype;

    p.init = function () {
        this.addDropEvent();
//        this.addCutEvent();
    };

    p.addDropEvent = function () {
        this.dropBox.ondragenter = this.handleEvent.bind(this);
        this.dropBox.ondragover = this.handleEvent.bind(this);
        this.dropBox.ondrop = this.handleEvent.bind(this);
    };

    p.handleEvent = function (e) {
        e.preventDefault();
        var reader = new FileReader();
        var that = this;
        if (e.type == "dragenter") {
            this.dropBox.innerHTML = "快到碗里来";
        }
        if (e.type == "drop") {
            var files = e.dataTransfer.files;
            reader.readAsDataURL(files[0]);
            reader.addEventListener("load", function () {
                var image = new Image();
                image.src = reader.result;
                image.addEventListener("load", function () {
                    var width = 400, height;
                    if (image.width > width) {
                        height = width / image.width * image.height;
                        that.dropBox.style.height = height + "px";
                    } else {
                        width = image.width;
                        height = image.height;
                    }
                    that.dropBox.innerHTML = "<img id='img' width=" + width + " height= " + height + " src='" + reader.result + "' />" +
                        "<div class='mask' style='background-color: black; opacity: 0.5; left: 0; top: 0; position: absolute; width: " + width + "px; height: " + height + "px; z-index: 2;'></div>";
                    that.createCutRect(reader.result, width, height);
                    that.addCutEvent();
                    that.overRect();
                }, false);
            }, false);
        }
    };

    p.createCutRect = function (file, width, height) {
        this.cutRect = document.createElement("div");
        this.dropBox.appendChild(this.cutRect);
        this.cutRect.id = "cutRect";
        this.cutRect.innerHTML = "<img id='hiddenImage' style='position: absolute;' width=" + width + " height= " + height + " src='" + file + "' />";
    };

    p.setImagePos = function (x, y) {
        this.hiddenImage = doc.getElementById("hiddenImage");
        this.hiddenImage.style.left = -x + "px";
        this.hiddenImage.style.top = -y + "px";
    };

    p.ImageUnDrag = function () {
        this.hiddenImage.ondragstart = function () {
            return false;
        };
    };

    p.addCutEvent = function () {
        var that = this;
        this.mask = doc.querySelector(".mask");
        this.mask.addEventListener("mousedown", function (evt) {
            var point = {"x": evt.clientX, "y": evt.clientY};
            var maskPos = that.mask.getBoundingClientRect();
            var left = point.x - maskPos.left,
                top = point.y - maskPos.top;
            var cutRect = that.cutRect;
            cutRect.style.width = 0;
            cutRect.style.height = 0;
            cutRect.style.display = "none";
            cutRect.style.left = left + "px";
            cutRect.style.top = top + "px";

            that.setImagePos(left + 1, top + 1);

            doc.onmousemove = function (e) {
                var width = e.clientX - point.x;
                var height = e.clientY - point.y;

                cutRect.style.display = "block";

                var rect = cutRect.getBoundingClientRect();

                if (rect.right >= maskPos.right) {
                    width = maskPos.right - point.x - 1;
                }
                if (rect.bottom >= maskPos.bottom) {
                    height = maskPos.bottom - point.y - 1;
                }
                if (width > height) {
                    cutRect.style.width = height + "px";
                    cutRect.style.height = height + "px";
                } else {
                    cutRect.style.width = width + "px";
                    cutRect.style.height = width + "px";
                }

                that.capture(parseInt(cutRect.style.left) + 1, parseInt(cutRect.style.top) + 1, parseInt(cutRect.style.width), parseInt(cutRect.style.height))
            };

            doc.onmouseup = function () {
                doc.onmousemove = null;
                doc.onmouseup = null;
            }
        }, false);
    };

    p.overRect = function () {
        var that = this;
        var cutRect = that.cutRect;
        cutRect.onmouseover = function () {
            cutRect.style.cursor = "all-scroll";
            that.ImageUnDrag();
            cutRect.onmousedown = function (evt) {
                evt.stopPropagation();
                var point = {"x": evt.clientX, "y": evt.clientY};
                var maskPos = that.mask.getBoundingClientRect();
                var left = parseInt(cutRect.style.left);
                var top = parseInt(cutRect.style.top);
                document.onmousemove = function (e) {
                    cutRect.style.left = left + e.clientX - point.x + "px";
                    cutRect.style.top = top + e.clientY - point.y + "px";
                    var rect = cutRect.getBoundingClientRect();
                    if (rect.left <= maskPos.left) {
                        cutRect.style.left = maskPos.left - that.dropBox.offsetLeft - 1 + "px";
                    }

                    if (rect.right >= maskPos.right) {
                        cutRect.style.left = maskPos.right - parseInt(cutRect.style.width) - that.dropBox.offsetLeft - 3 + "px";
                    }

                    if (rect.top <= maskPos.top) {
                        cutRect.style.top = maskPos.top - that.dropBox.offsetTop - 1 + "px";
                    }

                    if (rect.bottom >= maskPos.bottom) {
                        cutRect.style.top = maskPos.bottom - parseInt(cutRect.style.height) - that.dropBox.offsetTop - 3 + "px";
                    }

                    that.setImagePos(parseInt(cutRect.style.left) + 1, parseInt(cutRect.style.top) + 1);

                    that.capture(parseInt(cutRect.style.left) + 1, parseInt(cutRect.style.top) + 1, parseInt(cutRect.style.width), parseInt(cutRect.style.height))
                };

                document.onmouseup = function () {
                    document.onmousemove = null;
                    document.onmouseup = null;
                }
            };
        };
    };

    p.capture = function (x, y, w, h) {
        var canvas = document.getElementById("output");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var img = document.getElementById("img");
        var scaleX = img.width / img.naturalWidth;
        var scaleY = img.height / img.naturalHeight;
        ctx.drawImage(img, x / scaleX, y / scaleY, w /  scaleX, h / scaleY, 0, 0, 180, 180);
    };

    win.Capture = Capture;
}(window, document));