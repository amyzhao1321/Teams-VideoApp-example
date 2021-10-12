class FilterOrchestrator {

    constructor() {
  
      // filter
      this.filter;
  
      // data
      this.outputFrame;
  
      // effect tracker
      this.currentEffect;
      this.currentWidth;
      this.currentHeight;
  
      // timer
      this.setPreliminaryTime = 0.0;
      this.openglDrawTime = 0.0;
      this.openglDataTransferTime = 0.0;
      this.dataAligmentTime = 0.0;
  
      this.init();
    }
  
    init() {
      if (gl === undefined || canvas === undefined){
        throw "Please first create canvas and gl context."
      }
    }
  
    setPreliminary(effect, imageWidth, imageHeight) {
      this.setCanvas(imageWidth, imageHeight);
      this.setOutputFrame(imageWidth, imageHeight);
      this.setResolution(imageWidth, imageHeight);
      this.setFilter(effect);
    }
  
    setCanvas(imageWidth, imageHeight) {
      if (canvas == undefined){
        throw "Canvas has not been initialized."
      }
      canvas.width = imageWidth;
      canvas.height = imageHeight;
    }
  
    setOutputFrame(imageWidth, imageHeight) {
      if (this.outputFrame === undefined || imageWidth != this.currentWidth || imageHeight != this.currentHeight) {
        this.outputFrame = new Uint8Array(imageWidth * imageHeight * 4);
      }
    }
  
    setResolution(imageWidth, imageHeight) {
      this.currentWidth = imageWidth;
      this.currentHeight = imageHeight;
    }
  
    setFilter(effect) {
      if (this.filter === undefined || effect != this.currentEffect) {
  
        switch (effect) {
          case "oldschool":
            this.filter = new OldschooldFilter();
            break;
          case "whitecat":
            this.filter = new WhitecatFilter();
            break;
          case "blackwhite":
            this.filter = new BlackWhiteFilter();
            break;
          case "cool":
            this.filter = new CoolFilter();
            break;
          case "amaro":
            this.filter = new AmaroFilter();
            break;
          case "antique":
            this.filter = new AntiqueFilter();
            break;
          case "brooklyn":
            this.filter = new BrooklynFilter();
            break;
          case "emerald":
            this.filter = new EmeraldFilter();
            break;
          case "fairytale":
            this.filter = new FairytaleFilter();
            break;
          case "hudson":
            this.filter = new HudsonFilter();
            break;
          case "nostalgia":
            this.filter = new NostalgiaFilter();
            break;
          case "romance":
            this.filter = new RomanceFilter();
            break;
          default:
            throw "No filter exists.";
        }
  
        this.currentEffect = effect;
      }
    }
  
    getRGBTransformedFrame(image, imageWidth, imageHeight,  effect) {
      if (effect === undefined) {
        return;
      }
      console.log("Current Frame Effect: ", effect)
  
      var setPreliminaryStartTime = Date.now()
      this.setPreliminary(effect, imageWidth, imageHeight);
      this.setPreliminaryTime = Date.now() - setPreliminaryStartTime;
  
      var openglDrawStartTime = Date.now()
  
      var vertices = new Float32Array([
        -1, -1, 0, 0.0, 0.0,
        -1, 1, 0, 0.0, 1.0,
        1, 1, 0, 1.0, 1.0,
        1, -1, 0, 1.0, 0.0,
      ])
  
      var indices = new Int16Array([0, 1, 2, 0, 2, 3
      ])
  
      const dataY = new Uint8ClampedArray(image.slice(0,  imageWidth * imageHeight), 0, imageWidth * imageHeight);
      const dataUV = new Uint8ClampedArray(image.slice(imageWidth * imageHeight, image.length), 0, imageWidth / 2 * imageHeight / 2);
  
      this.filter.onDrawFrame(dataY, dataUV, vertices, indices, imageWidth, imageHeight);
      this.openglDrawTime = Date.now() - openglDrawStartTime
  
      var openglDataTransferStartTime = Date.now()
      gl.readPixels(0, 0, imageWidth, imageHeight, gl.RGBA, gl.UNSIGNED_BYTE, this.outputFrame);
  
      this.openglDataTransferTime = Date.now() - openglDataTransferStartTime
    }
  
    dataAligment(nv12Input, imageWidth, imageHeight) {
      var dataAligmentStartTime = Date.now();
  
      for (let i = 0; i < imageHeight * imageWidth; i += 1) {
        nv12Input[i] = this.outputFrame[4 * i];
      }
  
      var widthIndex = 0;
      var curIndex = 0;
  
      for (let i = imageHeight * imageWidth; i < nv12Input.length; i += 2) {
        //smaple effect just change the value to 100, which effect some pixel value of video frame
  
        nv12Input[i] = this.outputFrame[4 * curIndex + 1];
        nv12Input[i + 1] = this.outputFrame[4 * curIndex + 2];
  
        widthIndex += 2
        curIndex += 2
  
        if (widthIndex > imageWidth) {
          curIndex += imageWidth;
          widthIndex = widthIndex % imageWidth;
        }
      }
      
      this.dataAligmentTime = Date.now() - dataAligmentStartTime;
    }
  
    processImage(nv12Input, imageWidth, imageHeight, effect){
      this.getRGBTransformedFrame(nv12Input, imageWidth, imageHeight, effect);
      this.dataAligment(nv12Input, imageWidth, imageHeight)
    }
  
    getTimeTracker(){
      return {
        "setPreliminaryTime" : this.setPreliminaryTime,
        "openglDrawTime" : this.openglDrawTime,
        "openglDataTransferTime" : this.openglDataTransferTime,
        "dataAligmentTime" : this.dataAligmentTime
      }
    }
  }