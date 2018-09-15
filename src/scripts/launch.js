var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Utils;
(function (Utils) {
    ;
    var HashSet = /** @class */ (function () {
        function HashSet() {
            this.items = {};
        }
        HashSet.prototype.set = function (key, value) {
            this.items[key] = value;
        };
        HashSet.prototype["delete"] = function (key) {
            return delete this.items[key];
        };
        HashSet.prototype.has = function (key) {
            return key in this.items;
        };
        HashSet.prototype.get = function (key) {
            return this.items[key];
        };
        HashSet.prototype.len = function () {
            return Object.keys(this.items).length;
        };
        HashSet.prototype.forEach = function (f) {
            for (var k in this.items) {
                f(k, this.items[k]);
            }
        };
        return HashSet;
    }());
    Utils.HashSet = HashSet;
})(Utils || (Utils = {}));
/* =========================================================================
 *
 *  Component.ts
 *  Each entity can obtain many components
 *
 * ========================================================================= */
/// <reference path="./HashSet.ts" />
var ECS;
(function (ECS) {
    var Component = /** @class */ (function () {
        function Component(name) {
            this.name = name;
        }
        return Component;
    }());
    ECS.Component = Component;
})(ECS || (ECS = {}));
/* =========================================================================
 *
 *  Entity.js
 *  Each entity has an unique ID
 *
 * ========================================================================= */
/// <reference path="./Component.ts" />
/// <reference path="./HashSet.ts" />
var ECS;
(function (ECS) {
    var Entity = /** @class */ (function () {
        function Entity(name) {
            this.name = name;
            this.id = (+new Date()).toString(16) +
                (Math.random() * 100000000 | 0).toString(16) +
                this.count;
            this.count++;
            this.components = new Utils.HashSet();
        }
        Entity.prototype.addComponent = function (component) {
            this.components.set(component.name, component);
            //console.log("add ["+component.name+"] component");
        };
        Entity.prototype.removeComponent = function (component) {
            var name = component.name;
            var deletOrNot = this.components["delete"](name);
            if (deletOrNot) {
                console.log("delete [" + name + "] success!");
            }
            else {
                console.log("delete [" + name + "] fail! not exist!");
            }
        };
        return Entity;
    }());
    ECS.Entity = Entity;
    var ThreeJsMoveEntity = /** @class */ (function () {
        function ThreeJsMoveEntity(startPos, endPos) {
            this.startPos = startPos;
            this.endPos = endPos;
        }
        return ThreeJsMoveEntity;
    }());
    ECS.ThreeJsMoveEntity = ThreeJsMoveEntity;
})(ECS || (ECS = {}));
/* =========================================================================
 *
 *  System.ts
 *  system using for controlling the game
 *
 * ========================================================================= */
/// <reference path="./Entity.ts" />
/// <reference path="./HashSet.ts" />
/// <reference path="./Utils.ts" />
var ECS;
(function (ECS) {
    function update() {
        ECS.GameConfig.game.update();
        requestAnimationFrame(update);
    }
    ECS.update = update;
    var System = /** @class */ (function () {
        function System(name) {
            this.name = name;
        }
        System.prototype.Execute = function () {
            console.log("[" + this.name + "]System Execute!");
        };
        return System;
    }());
    ECS.System = System;
    var LoadingSystem = /** @class */ (function (_super) {
        __extends(LoadingSystem, _super);
        function LoadingSystem() {
            return _super.call(this, "loading") || this;
        }
        LoadingSystem.prototype.StressTestCompleted = function () {
            this.stressTest.end();
            ECS.GameConfig.resize();
            window.addEventListener('resize', function () {
                ECS.GameConfig.resize();
            });
        };
        LoadingSystem.prototype.Execute = function () {
            var _this = this;
            _super.prototype.Execute.call(this);
            //FidoAudio.init();
            this.stressTest = new PIXI.StressTest(function () {
                _this.stressTest.end();
                ECS.GameConfig.interactive = false;
                var loader = new PIXI.AssetLoader([
                    "img/stretched_hyper_tile.jpg",
                    "img/doroCat.png",
                    "img/dash_stock.png",
                    "img/blade.png",
                    "img/SplashAssets.json",
                    "img/WorldAssets-hd.json",
                    "img/PixiAssets-hd.json",
                    "img/platform.png",
                    "img/bg_up.png",
                    "img/bg_down.png",
                    "img/floatingGround.png",
                    "assets/background/BackgroundAssets.json",
                    "assets/food/food.json",
                    "assets/playUI/playPanel.json",
                    "assets/playUI/number.json",
                    "assets/character/chara1.json",
                    "img/blackSquare.jpg",
                ]);
                loader.addEventListener('onComplete', function (event) {
                    console.log("data assets loaded!");
                    _this.stressTest.remove();
                    _this.init();
                });
                loader.load();
                ECS.GameConfig.resize();
            });
        };
        LoadingSystem.prototype.init = function () {
            ECS.GameConfig.gameMode = ECS.GAMEMODE.INTRO;
            ECS.GameConfig.interactive = false;
            ECS.GameConfig.game = new ECS.GameKernel();
            var game = ECS.GameConfig.game;
            document.body.appendChild(game.view.renderer.view);
            game.view.renderer.view.style.position = "absolute";
            game.view.renderer.view.webkitImageSmoothingEnabled = false;
            game.view.showHud();
            //bind event 
            var evtSys = new EventListenerSystem();
            evtSys.bindEvent();
            requestAnimationFrame(update);
            ECS.GameConfig.resize();
            ECS.GameConfig.interactive = false;
            FidoAudio.play('gameMusic');
            game.start();
            game.player.jump();
            ECS.GameConfig.gameMode = ECS.GAMEMODE.PLAYING;
        };
        return LoadingSystem;
    }(System));
    ECS.LoadingSystem = LoadingSystem;
    var MainSystem = /** @class */ (function (_super) {
        __extends(MainSystem, _super);
        function MainSystem(GlobalDatas, othSystems) {
            var _this = _super.call(this, "main") || this;
            _this.GlobalDatas = GlobalDatas;
            _this.OtherSystems = othSystems;
            _this.MainSystem = _this;
            return _this;
        }
        MainSystem.prototype.Execute = function () {
            _super.prototype.Execute.call(this);
            var g = this.GlobalDatas;
            var m = this.MainSystem;
            this.OtherSystems.forEach(function (key, val) {
                val.GlobalDatas = g;
                val.MainSystem = m;
                val.Execute();
            });
        };
        return MainSystem;
    }(System));
    ECS.MainSystem = MainSystem;
    var EventListenerSystem = /** @class */ (function (_super) {
        __extends(EventListenerSystem, _super);
        function EventListenerSystem() {
            return _super.call(this, "eventlistener") || this;
        }
        EventListenerSystem.prototype.bindEvent = function () {
            //for pc version
            window.addEventListener("keydown", this.onKeyDown, true);
            window.addEventListener("keyup", this.onKeyUp, true);
            window.addEventListener("touchstart", this.onTouchStart, true);
        };
        EventListenerSystem.prototype.onKeyDown = function (event) {
            if (event.keyCode == 32 || event.keyCode == 38) {
                if (ECS.GameConfig.game.isPlaying && !ECS.GameConfig.game.player.startJump && !ECS.GameConfig.game.player.isPlayingNinjiaEffect)
                    ECS.GameConfig.game.player.jump();
                if (ECS.GameConfig.game.isPlaying && ECS.GameConfig.game.player.isJumped && !ECS.GameConfig.game.player.isPlayingNinjiaEffect)
                    ECS.GameConfig.game.player.jumpTwo();
            }
            else if (event.keyCode == 40) {
                if (ECS.GameConfig.game.isPlaying && !ECS.GameConfig.game.player.isJumped && ECS.GameConfig.game.player.onGround) {
                    ECS.GameConfig.game.player.slide(true);
                }
            }
            else if (event.keyCode == 39) {
                if (ECS.GameConfig.game.isPlaying && ECS.GameConfig.specialMode == ECS.SPECIALMODE.JAPANMODE) {
                    ECS.GameConfig.game.player.view.textures = ECS.GameConfig.game.player.dashFrames;
                    ECS.GameConfig.game.player.ninjiaOperate();
                }
                else if (ECS.GameConfig.game.isPlaying && ECS.GameConfig.specialMode == ECS.SPECIALMODE.INDONMODE) {
                    ECS.GameConfig.game.player.view.textures = ECS.GameConfig.game.player.runningFrames;
                    ECS.GameConfig.game.player.indoOperate();
                }
            }
        };
        EventListenerSystem.prototype.onKeyUp = function (event) {
            if (event.keyCode == 40) {
                if (ECS.GameConfig.game.isPlaying && ECS.GameConfig.game.player.isSlide) {
                    ECS.GameConfig.game.player.slide(false);
                }
            }
        };
        EventListenerSystem.prototype.onTouchStart = function (event) {
            if (event.target.type !== 'button') {
                if (ECS.GameConfig.game.isPlaying && !(ECS.GameConfig.playerMode == ECS.PLAYMODE.JUMPING1))
                    ECS.GameConfig.game.player.jump();
                if (ECS.GameConfig.game.isPlaying && (ECS.GameConfig.playerMode == ECS.PLAYMODE.JUMPING1))
                    ECS.GameConfig.game.player.jumpTwo();
            }
        };
        return EventListenerSystem;
    }(System));
    ECS.EventListenerSystem = EventListenerSystem;
})(ECS || (ECS = {}));
/// <reference path="./core/Component.ts" />
/// <reference path="./core/System.ts" />
/// <reference path="./core/Entity.ts" />
/// <reference path="./core/HashSet.ts" />
var load = function () {
    var load_system = new ECS.LoadingSystem();
    load_system.Execute();
};
document.getElementById("btn_play").onclick = function () {
    document.getElementById("global").style.display = "none";
    load();
};
/* =========================================================================
 *
 *  GameCharacter.ts
 *  character controller
 *
 * ========================================================================= */
var ECS;
(function (ECS) {
    var GameCharacter = /** @class */ (function () {
        function GameCharacter() {
            this.isSlide = false;
            this.ninjiaEffectNumber = 0;
            this.isPlayingNinjiaEffect = false;
            this.isPlayingInoEffect = false;
            console.log("init character!");
            this.position = new PIXI.Point();
            this.runningFrames = [
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-01.png"),
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-02.png"),
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-03.png"),
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-04.png"),
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-05.png"),
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-06.png"),
            ];
            this.indoTightFrame = [
                PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/INDONTIGHT/boom0001.png"),
                PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/INDONTIGHT/boom0002.png"),
                PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/INDONTIGHT/boom0003.png"),
                PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/INDONTIGHT/boom0004.png")
            ];
            this.jumpFrames = [
                PIXI.Texture.fromFrame("CHARACTER/JUMP/Jump.png"),
            ];
            this.slideFrame = [
                PIXI.Texture.fromFrame("CHARACTER/SLIDE/Slide.png"),
            ];
            this.dashFrames = [
                PIXI.Texture.fromFrame("CHARACTER/POWER/DASH/dash0002.png")
            ];
            this.shootFrame = [
                PIXI.Texture.fromFrame("CHARACTER/POWER/SHOOT/shoot0001.png"),
                PIXI.Texture.fromFrame("CHARACTER/POWER/SHOOT/shoot0002.png")
            ];
            this.view = new PIXI.MovieClip(this.runningFrames);
            this.view.animationSpeed = 0.23;
            this.view.anchor.x = 0.5;
            this.view.anchor.y = 0.65;
            this.view.height = 135;
            this.view.width = 75;
            this.position.y = 477;
            this.ground = 477;
            this.gravity = 9.8;
            this.baseSpeed = 8;
            this.speed = new PIXI.Point(this.baseSpeed, 0);
            this.activeCount = 0;
            this.isJumped = false;
            this.accel = 0;
            this.width = 26;
            this.height = 37;
            this.onGround = true;
            this.rotationSpeed = 0;
            this.joyRiding = false;
            this.level = 1;
            this.realAnimationSpeed = 0.23;
            this.volume = 0.3;
            //start speed
            this.vStart = 30;
            this.mass = 65;
            this.angle = Math.PI * 45 / 360;
            this.startJump = false;
            this.b_jumpTwo = false;
            this.smooth = 0.05;
            this.cnt = 0;
            this.shinobiEffect1 = new PIXI.Sprite(PIXI.Texture.fromImage("img/dash_stock.png"));
            this.shinobiEffect1.anchor.x = -1.5;
            this.shinobiEffect1.anchor.y = 5.5;
            this.shinobiEffect1.scale.x = 0.2;
            this.shinobiEffect1.scale.y = 0.2;
            this.shinobiEffect2 = new PIXI.Sprite(PIXI.Texture.fromImage("img/dash_stock.png"));
            this.shinobiEffect2.anchor.x = 0;
            this.shinobiEffect2.anchor.y = 5.5;
            this.shinobiEffect2.scale.x = 0.2;
            this.shinobiEffect2.scale.y = 0.2;
            this.shinobiEffect3 = new PIXI.Sprite(PIXI.Texture.fromImage("img/dash_stock.png"));
            this.shinobiEffect3.anchor.x = 1.5;
            this.shinobiEffect3.anchor.y = 5.5;
            this.shinobiEffect3.scale.x = 0.2;
            this.shinobiEffect3.scale.y = 0.2;
            this.backEffect = new PIXI.Sprite(PIXI.Texture.fromImage("img/blade.png"));
            this.backEffect.anchor.x = 0.8;
            this.backEffect.anchor.y = 0.5;
            this.backEffect.scale.x = 1;
            this.backEffect.scale.y = 1;
            this.specialEffectView = new PIXI.Sprite(PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/DASH/dash-shinobi-new.png"));
            this.specialEffectView.anchor.x = 0.2;
            this.specialEffectView.anchor.y = 0.5;
            this.specialEffectView.scale.x = 2;
            this.specialEffectView.scale.y = 2;
            this.indoEffect = new PIXI.Sprite(PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/SHOOT/maung shoot-new.png"));
            this.indoEffect.anchor.x = 0.2;
            this.indoEffect.anchor.y = 0.6;
            this.indoEffect.scale.x = 2;
            this.indoEffect.scale.y = 2;
            this.marioEffect = new PIXI.Sprite(PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/MARIO/maung ninja.png"));
            this.marioEffect.anchor.x = 0.1;
            this.marioEffect.anchor.y = 0.52;
            this.marioEffect.scale.x = 2;
            this.marioEffect.scale.y = 2;
            this.indonTight = new PIXI.MovieClip(this.indoTightFrame);
            this.indonTight.animationSpeed = 0.1;
            this.indonTight.anchor.x = 0.5;
            this.indonTight.anchor.y = 0.5;
            this.indonTight.height = ECS.GameConfig.height / 2;
            this.indonTight.width = ECS.GameConfig.width / 2;
            //this.view.addChild(this.indonTight);
            //this.indonTight.play();
        }
        GameCharacter.prototype.update = function () {
            if (this.isDead) {
                //console.log("died"); continue update
                this.updateDieing();
            }
            else {
                this.updateRunning();
            }
        };
        GameCharacter.prototype.joyrideMode = function () {
            this.joyRiding = true;
            //FidoAudio.setVolume('runRegular', 0);
            //FidoAudio.play('hyperMode');
            TweenLite.to(this.speed, 0.3, {
                x: 20,
                ease: Cubic.easeIn
            });
            this.realAnimationSpeed = 0.23 * 4;
        };
        GameCharacter.prototype.normalMode = function () {
            this.joyRiding = false;
            //FidoAudio.setVolume('runFast', 0);
            //if(this.onGround === true) FidoAudio.setVolume('runRegular', this.volume);
            TweenLite.to(this.speed, 0.6, {
                x: this.baseSpeed,
                ease: Cubic.easeOut
            });
            this.realAnimationSpeed = 0.23;
        };
        GameCharacter.prototype.chkOnGround = function () {
            if (Math.abs(this.position.y - this.ground) <= 1) {
                return true;
            }
            return false;
        };
        GameCharacter.prototype.resetSpecialFoods = function () {
            for (var i = 0; i < 4; i++) {
                ECS.GameConfig.game.view.specialFood.digits[i].texture = ECS.GameConfig.game.view.specialFood.foods[i];
            }
        };
        GameCharacter.prototype.ninjiaOperate = function () {
            if (this.ninjiaEffectNumber < 3 && !this.isPlayingNinjiaEffect) {
                //console.log("dash");
                this.isPlayingNinjiaEffect = true;
                ECS.GameConfig.tmpTimeClockStart = ECS.GameConfig.time.currentTime;
                this.view.addChild(this.specialEffectView);
                switch (this.ninjiaEffectNumber) {
                    case 0:
                        this.view.removeChild(this.shinobiEffect1);
                        break;
                    case 1:
                        this.view.removeChild(this.shinobiEffect2);
                        break;
                    case 2:
                        this.view.removeChild(this.shinobiEffect3);
                        break;
                }
                ECS.GameConfig.game.player.speed.x *= 10;
                this.ninjiaEffectNumber++;
            }
        };
        GameCharacter.prototype.indoOperate = function () {
            if (!this.isPlayingInoEffect) {
                ECS.GameConfig.tmpTimeClockStart = ECS.GameConfig.time.currentTime;
                ECS.GameConfig.game.player.view.addChild(ECS.GameConfig.game.player.indoEffect);
                this.view.addChild(this.indonTight);
                this.indonTight.play();
                this.isPlayingInoEffect = true;
                this.view.textures = this.shootFrame;
            }
        };
        GameCharacter.prototype.ninjaMode = function () {
            if (this.isPlayingNinjiaEffect) {
                ECS.GameConfig.tmpTimeClockEnd = ECS.GameConfig.time.currentTime;
                var DuringTime = ECS.GameConfig.timeClock();
                //console.log(DuringTime);
                if (DuringTime > 200) {
                    this.view.textures = this.runningFrames;
                    this.speed.x /= 10;
                    this.view.removeChild(this.specialEffectView);
                    this.isPlayingNinjiaEffect = false;
                    if (this.ninjiaEffectNumber == 3) {
                        this.ninjiaEffectNumber = 0;
                        ECS.GameConfig.specialMode = ECS.SPECIALMODE.NONE;
                        ECS.GameConfig.game.pickupManager.pickedUpPool = [];
                        ECS.GameConfig.game.pickupManager.canPickOrNot = true;
                        this.resetSpecialFoods();
                        this.view.removeChild(this.backEffect);
                        console.log("ninja finished!");
                    }
                }
            }
        };
        GameCharacter.prototype.marioMode = function () {
            ECS.GameConfig.tmpTimeClockEnd = ECS.GameConfig.time.currentTime;
            var DuringTime = ECS.GameConfig.timeClock();
            //console.log(DuringTime);
            if (DuringTime > 5000) {
                console.log("mario finished!");
                ECS.GameConfig.specialMode = ECS.SPECIALMODE.NONE;
                ECS.GameConfig.game.pickupManager.pickedUpPool = [];
                ECS.GameConfig.game.pickupManager.canPickOrNot = true;
                this.speed.x /= 2;
                this.view.removeChild(this.marioEffect);
                this.resetSpecialFoods();
            }
        };
        GameCharacter.prototype.indoMode = function () {
            if (this.isPlayingInoEffect) {
                this.indonTight.textures = this.indoTightFrame;
                ECS.GameConfig.tmpTimeClockEnd = ECS.GameConfig.time.currentTime;
                var DuringTime = ECS.GameConfig.timeClock();
                if (DuringTime > 1000) {
                    console.log("indo finished!");
                    this.isPlayingInoEffect = false;
                    ECS.GameConfig.specialMode = ECS.SPECIALMODE.NONE;
                    ECS.GameConfig.game.pickupManager.pickedUpPool = [];
                    ECS.GameConfig.game.pickupManager.canPickOrNot = true;
                    this.view.removeChild(this.indonTight);
                    this.view.removeChild(this.indoEffect);
                    this.resetSpecialFoods();
                }
            }
        };
        GameCharacter.prototype.updateRunning = function () {
            this.view.animationSpeed = this.realAnimationSpeed * ECS.GameConfig.time.DELTA_TIME * this.level;
            this.indonTight.animationSpeed = this.realAnimationSpeed * ECS.GameConfig.time.DELTA_TIME * this.level;
            switch (ECS.GameConfig.playerMode) {
                case ECS.PLAYMODE.JUMPING1:
                    this.speed.y = -this.vStart * Math.sin(this.angle);
                    break;
                case ECS.PLAYMODE.JUMPING2:
                    this.speed.y = -this.vStart * Math.sin(this.angle);
                    break;
                case ECS.PLAYMODE.FALL:
                    //should have gravity
                    this.speed.y += this.gravity * ECS.GameConfig.time.DELTA_TIME * this.smooth;
                    break;
                case ECS.PLAYMODE.RUNNING:
                    this.speed.y = 0;
                    break;
            }
            if (!this.chkOnGround() && (ECS.GameConfig.playerMode == ECS.PLAYMODE.JUMPING1 || ECS.GameConfig.playerMode == ECS.PLAYMODE.JUMPING2))
                ECS.GameConfig.playerMode = ECS.PLAYMODE.FALL;
            else if (ECS.GameConfig.playerMode == ECS.PLAYMODE.FALL && this.chkOnGround())
                ECS.GameConfig.playerMode = ECS.PLAYMODE.RUNNING;
            //console.log(GameConfig.playerMode);            
            this.position.x += this.speed.x * ECS.GameConfig.time.DELTA_TIME * this.level;
            this.position.y += this.speed.y * ECS.GameConfig.time.DELTA_TIME;
            //console.log(this.speed.y);
            if (this.onGround !== this.onGroundCache) {
                this.onGroundCache = this.onGround;
                if (this.onGround && ECS.GameConfig.playerMode == ECS.PLAYMODE.RUNNING) {
                    this.view.textures = this.runningFrames;
                }
                else if (ECS.GameConfig.playerMode == ECS.PLAYMODE.JUMPING1 || ECS.GameConfig.playerMode == ECS.PLAYMODE.JUMPING2) {
                    this.view.textures = this.jumpFrames;
                }
            }
            if (ECS.GameConfig.playerMode == ECS.PLAYMODE.SLIDE) {
                this.view.textures = this.slideFrame;
            }
            else if (this.onGround && ECS.GameConfig.playerMode != ECS.PLAYMODE.SLIDE) {
                //console.log(GameConfig.specialMode);
                switch (ECS.GameConfig.specialMode) {
                    case ECS.SPECIALMODE.NONE:
                        this.view.textures = this.runningFrames;
                        break;
                    case ECS.SPECIALMODE.NINJAMODE:
                        this.view.textures = this.runningFrames;
                        break;
                    case ECS.SPECIALMODE.JAPANMODE:
                        this.view.textures = this.runningFrames;
                        break;
                    case ECS.SPECIALMODE.INDONMODE:
                        this.view.textures = this.runningFrames;
                        break;
                }
            }
            else if (ECS.GameConfig.playerMode == ECS.PLAYMODE.JUMPING1 || ECS.GameConfig.playerMode == ECS.PLAYMODE.JUMPING2) {
                this.view.textures = this.jumpFrames;
            }
            switch (ECS.GameConfig.specialMode) {
                case ECS.SPECIALMODE.NONE:
                    break;
                case ECS.SPECIALMODE.NINJAMODE:
                    this.marioMode();
                    break;
                case ECS.SPECIALMODE.JAPANMODE:
                    if (this.ninjiaEffectNumber <= 3) {
                        this.ninjaMode();
                    }
                    break;
                case ECS.SPECIALMODE.INDONMODE:
                    this.indoMode();
                    break;
            }
            ECS.GameConfig.camera.x = this.position.x - 100;
            this.view.position.x = this.position.x - ECS.GameConfig.camera.x;
            this.view.position.y = this.position.y - ECS.GameConfig.camera.y;
            this.view.rotation += (this.speed.y * 0.05 - this.view.rotation) * 0.1;
        };
        GameCharacter.prototype.updateDieing = function () {
            this.speed.x *= 0.999;
            if (this.onGround)
                this.speed.y *= 0.99;
            this.speed.y += 0.1;
            this.accel += (0 - this.accel) * 0.1 * ECS.GameConfig.time.DELTA_TIME;
            this.speed.y += this.gravity * ECS.GameConfig.time.DELTA_TIME;
            ;
            this.position.x += this.speed.x * ECS.GameConfig.time.DELTA_TIME;
            ;
            this.position.y += this.speed.y * ECS.GameConfig.time.DELTA_TIME;
            ;
            ECS.GameConfig.camera.x = this.position.x - 100;
            this.view.position.x = this.position.x - ECS.GameConfig.camera.x;
            this.view.position.y = this.position.y - ECS.GameConfig.camera.y;
            if (this.speed.x < 5) {
                this.view.rotation += this.rotationSpeed * (this.speed.x / 5) * ECS.GameConfig.time.DELTA_TIME;
            }
            else {
                this.view.rotation += this.rotationSpeed * ECS.GameConfig.time.DELTA_TIME;
            }
        };
        GameCharacter.prototype.jumpTwo = function () {
            //console.log("jump two");
            if (this.isDead) {
                if (this.speed.x < 5) {
                    this.isDead = false;
                    this.speed.x = 10;
                }
            }
            if (Math.abs(this.position.y - this.ground) > 1) {
                ECS.GameConfig.playerMode = ECS.PLAYMODE.JUMPING2;
                //this.b_jumpTwo = true;
            }
            // else
            // {
            //     this.b_jumpTwo = false;
            // }
        };
        GameCharacter.prototype.slide = function (isSlide) {
            if (this.isDead) {
                if (this.speed.x < 5) {
                    this.isDead = false;
                    this.speed.x = 10;
                }
            }
            if (Math.abs(this.position.y - this.ground) <= 1) {
                this.isSlide = isSlide;
                if (isSlide)
                    ECS.GameConfig.playerMode = ECS.PLAYMODE.SLIDE;
                else
                    ECS.GameConfig.playerMode = ECS.PLAYMODE.RUNNING;
            }
        };
        GameCharacter.prototype.jump = function () {
            //console.log("click jump");
            if (this.isDead) {
                if (this.speed.x < 5) {
                    this.isDead = false;
                    this.speed.x = 10;
                }
            }
            // if(Math.abs(this.position.y-this.ground)>1)
            // {
            //     this.isJumped = true;
            //     this.startJump = false;
            // }
            // else
            // {
            //     this.isJumped = false;
            //     this.startJump = true;
            // }
            ECS.GameConfig.playerMode = ECS.PLAYMODE.JUMPING1;
        };
        GameCharacter.prototype.die = function () {
            if (this.isDead)
                return;
            TweenLite.to(ECS.GameConfig.time, 0.5, {
                speed: 0.1,
                ease: Cubic.easeOut,
                onComplete: function () {
                    //FidoAudio.play('deathJingle');
                    TweenLite.to(ECS.GameConfig.time, 2, {
                        speed: 1,
                        delay: 1
                    });
                }
            });
            this.isDead = true;
            this.bounce = 0;
            this.speed.x = 15;
            this.speed.y = -15;
            this.rotationSpeed = 0.3;
            this.view.stop();
        };
        GameCharacter.prototype.boil = function () {
            if (this.isDead)
                return;
            this.isDead = true;
        };
        GameCharacter.prototype.fall = function () {
            this.startJump = false;
            //this.b_jumpTwo = false;
            this.isJumped = true;
        };
        GameCharacter.prototype.isAirbourne = function () { };
        GameCharacter.prototype.stop = function () {
            this.view.stop();
        };
        GameCharacter.prototype.resume = function () {
            this.view.play();
        };
        return GameCharacter;
    }());
    ECS.GameCharacter = GameCharacter;
    var GameEnemy = /** @class */ (function () {
        function GameEnemy() {
            this.isEatNow = false;
            this.position = new PIXI.Point();
            // this.view = new PIXI.Sprite(PIXI.Texture.fromFrame("img/doroCat.png"));
            // this.view.anchor.x = 0.5;
            // this.view.anchor.y = 0.5;
            // this.view.width = 150;
            // this.view.height=150;
            this.isHit = false;
            this.width = 150;
            this.height = 150;
            this.speed = -10 + Math.random() * 20;
            ;
            this.moveingFrames = [
                PIXI.Texture.fromFrame("CHARACTER/NEKO/WALK/neko0001.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/WALK/neko0002.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/WALK/neko0003.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/WALK/neko0004.png"),
            ];
            this.stealFrames = [
                PIXI.Texture.fromFrame("CHARACTER/NEKO/STEAL/steal0001.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/STEAL/steal0002.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/STEAL/steal0003.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/STEAL/steal0004.png")
            ];
            this.view = new PIXI.MovieClip(this.moveingFrames);
            this.view.animationSpeed = 0.23;
            this.view.anchor.x = 0.5;
            this.view.anchor.y = 0.5;
            this.view.height = 150;
            this.view.width = 150;
        }
        GameEnemy.prototype.reset = function () {
            if (this.explosion) {
                this.view.removeChild(this.explosion);
                this.explosion.reset();
            }
            this.isHit = false;
            this.view.width = 157;
        };
        GameEnemy.prototype.hit = function () {
            if (this.isHit)
                return;
            this.isHit = true;
            if (!this.explosion)
                this.explosion = new ECS.Explosion();
            this.explosion.explode();
            this.view.addChild(this.explosion);
            this.view.setTexture(PIXI.Texture.fromImage("img/empty.png"));
        };
        GameEnemy.prototype.update = function () {
            this.view.animationSpeed = 0.23 * ECS.GameConfig.time.DELTA_TIME;
            this.view.position.x = this.position.x - ECS.GameConfig.camera.x;
            if (!this.isEatNow) {
                this.position.x += this.speed * Math.sin(ECS.GameConfig.time.DELTA_TIME);
                ECS.GameConfig.tmpTimeClockStart1 = ECS.GameConfig.time.currentTime;
            }
            else {
                ECS.GameConfig.tmpTimeClockEnd1 = ECS.GameConfig.time.currentTime;
                if (ECS.GameConfig.timeClock1() > 2000) {
                    this.isEatNow = false;
                    this.view.textures = this.moveingFrames;
                }
            }
            this.view.position.y = this.position.y;
        };
        return GameEnemy;
    }());
    ECS.GameEnemy = GameEnemy;
    var Partical = /** @class */ (function () {
        function Partical() {
            PIXI.Sprite.call(this, PIXI.Texture.fromFrame("starPops0004.png"));
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;
            this.speed = new PIXI.Point();
        }
        return Partical;
    }());
    ECS.Partical = Partical;
    Partical.prototype = Object.create(PIXI.Sprite.prototype);
    var GameCharacterTrail = /** @class */ (function () {
        function GameCharacterTrail(stage) {
            this.stage = stage;
            this.target = new PIXI.Point();
            this.particals = [];
            this.particalPool = new ECS.GameObjectPool(Partical);
            this.max = 100;
            this.count = 0;
        }
        GameCharacterTrail.prototype.update = function () {
            if (this.target.isFlying && !this.target.isDead) {
                this.count++;
                if (this.count % 3) {
                    var partical = this.particalPool.getObject();
                    this.stage.addChild(partical);
                    partical.position.x = this.target.view.position.x + (Math.random() * 10) - 5 - 20;
                    partical.position.y = this.target.view.position.y + 50;
                    partical.direction = 0;
                    partical.dirSpeed = Math.random() > 0.5 ? -0.1 : 0.1;
                    partical.sign = this.particals.length % 2 ? -1 : 1;
                    partical.scaly = Math.random() * 2 - 1; // - this.target.speed.x * 0.3;
                    partical.speed.y = this.target.accel * 3;
                    partical.alphay = 2;
                    partical.rotation = Math.random() * Math.PI * 2;
                    partical.scale.x = partical.scale.y = 0.2 + Math.random() * 0.5;
                    this.particals.push(partical);
                }
            }
            for (var i = 0; i < this.particals.length; i++) {
                var partical = this.particals[i];
                partical.dirSpeed += 0.003 * partical.sign;
                if (partical.dirSpeed > 2)
                    partical.dirSpeed = 2;
                partical.direction += partical.dirSpeed;
                partical.speed.x = Math.sin(partical.direction); // *= 1.1;
                partical.speed.y = Math.cos(partical.direction);
                partical.position.x += partical.speed.x * 5 * partical.scaly;
                partical.position.y += partical.speed.y * 3;
                partical.alphay *= 0.85;
                partical.rotation += partical.speed.x * 0.1;
                partical.alpha = partical.alphay > 1 ? 1 : partical.alphay;
                if (partical.alpha < 0.01) {
                    this.stage.removeChild(partical);
                    this.particals.splice(i, 1);
                    //this.particalPool.returnObject(partical);
                    i--;
                }
            }
        };
        return GameCharacterTrail;
    }());
    ECS.GameCharacterTrail = GameCharacterTrail;
    var ParticalFire = /** @class */ (function () {
        function ParticalFire() {
            PIXI.Sprite.call(this, PIXI.Texture.fromFrame("fireCloud.png"));
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;
            this.speed = new PIXI.Point();
        }
        return ParticalFire;
    }());
    ECS.ParticalFire = ParticalFire;
    ParticalFire.prototype = Object.create(PIXI.Sprite.prototype);
    var GameCharacterTrailFire = /** @class */ (function () {
        function GameCharacterTrailFire(stage) {
            this.stage = stage;
            this.target = new PIXI.Point();
            this.particals = [];
            this.particalPool = new ECS.GameObjectPool(ParticalFire);
            this.max = 100;
            this.count = 0;
            this.mOffset = PIXI.mat3.create(); //PIXI.mat3.identity(PIXI.mat3.create());
            this.mOffset[2] = -30; //this.position.x;
            this.mOffset[5] = 30; //this.position.y;
            this.spare = PIXI.mat3.create(); //PIXI.mat3.identity();
        }
        GameCharacterTrailFire.prototype.update = function () {
            //PIXI.Rope.prototype.updateTransform.call(this);
            if (this.target.isDead) {
                this.mOffset;
                PIXI.mat3.multiply(this.mOffset, this.target.view.localTransform, this.spare);
                this.count++;
                if (this.count % 3) {
                    var partical = this.particalPool.getObject();
                    this.stage.addChild(partical);
                    partical.position.x = this.spare[2];
                    partical.position.y = this.spare[5];
                    partical.speed.x = 1 + Math.random() * 2;
                    partical.speed.y = 1 + Math.random() * 2;
                    partical.speed.x *= -1;
                    partical.speed.y *= 1;
                    partical.alphay = 2;
                    partical.rotation = Math.random() * Math.PI * 2;
                    partical.scale.x = partical.scale.y = 0.2 + Math.random() * 0.5;
                    this.particals.push(partical);
                }
            } // add partical!
            for (var i = 0; i < this.particals.length; i++) {
                var partical = this.particals[i];
                partical.scale.x = partical.scale.y *= 1.02;
                partical.alphay *= 0.85;
                partical.alpha = partical.alphay > 1 ? 1 : partical.alphay;
                partical.position.x += partical.speed.x * 2;
                partical.position.y += partical.speed.y * 2;
                if (partical.alpha < 0.01) {
                    this.stage.removeChild(partical);
                    this.particals.splice(i, 1);
                    //this.particalPool.returnObject(partical);
                    i--;
                }
            }
            ;
        };
        return GameCharacterTrailFire;
    }());
    ECS.GameCharacterTrailFire = GameCharacterTrailFire;
})(ECS || (ECS = {}));
/* =========================================================================
 *
 *  GameConfig.ts
 *  config file
 *
 * ========================================================================= */
var ECS;
(function (ECS) {
    var GameRunTime = /** @class */ (function () {
        function GameRunTime() {
            this.DELTA_TIME = 1;
            this.lastTime = Date.now();
            this.speed = 1;
        }
        GameRunTime.prototype.update = function () {
            var time = Date.now();
            var currentTime = time;
            this.currentTime = currentTime;
            //console.log("current time:"+currentTime);
            var passedTime = currentTime - this.lastTime;
            this.DELTA_TIME = ((passedTime) * 0.06);
            this.DELTA_TIME *= this.speed;
            if (this.DELTA_TIME > 2.3)
                this.DELTA_TIME = 2.3;
            this.lastTime = currentTime;
        };
        return GameRunTime;
    }());
    ECS.GameRunTime = GameRunTime;
    var FOODMODE;
    (function (FOODMODE) {
        FOODMODE[FOODMODE["JAPAN"] = 0] = "JAPAN";
        FOODMODE[FOODMODE["INDON"] = 1] = "INDON";
    })(FOODMODE = ECS.FOODMODE || (ECS.FOODMODE = {}));
    var SPECIALMODE;
    (function (SPECIALMODE) {
        SPECIALMODE[SPECIALMODE["NONE"] = 0] = "NONE";
        SPECIALMODE[SPECIALMODE["JAPANMODE"] = 1] = "JAPANMODE";
        SPECIALMODE[SPECIALMODE["INDONMODE"] = 2] = "INDONMODE";
        SPECIALMODE[SPECIALMODE["NINJAMODE"] = 3] = "NINJAMODE";
    })(SPECIALMODE = ECS.SPECIALMODE || (ECS.SPECIALMODE = {}));
    var GAMEMODE;
    (function (GAMEMODE) {
        GAMEMODE[GAMEMODE["TITLE"] = 0] = "TITLE";
        GAMEMODE[GAMEMODE["COUNT_DOWN"] = 1] = "COUNT_DOWN";
        GAMEMODE[GAMEMODE["PLAYING"] = 2] = "PLAYING";
        GAMEMODE[GAMEMODE["GAME_OVER"] = 3] = "GAME_OVER";
        GAMEMODE[GAMEMODE["INTRO"] = 4] = "INTRO";
        GAMEMODE[GAMEMODE["PAUSED"] = 5] = "PAUSED";
    })(GAMEMODE = ECS.GAMEMODE || (ECS.GAMEMODE = {}));
    var PLAYMODE;
    (function (PLAYMODE) {
        PLAYMODE[PLAYMODE["RUNNING"] = 0] = "RUNNING";
        PLAYMODE[PLAYMODE["JUMPING1"] = 1] = "JUMPING1";
        PLAYMODE[PLAYMODE["JUMPING2"] = 2] = "JUMPING2";
        PLAYMODE[PLAYMODE["FALL"] = 3] = "FALL";
        PLAYMODE[PLAYMODE["SLIDE"] = 4] = "SLIDE";
    })(PLAYMODE = ECS.PLAYMODE || (ECS.PLAYMODE = {}));
    var GameConfig = /** @class */ (function () {
        function GameConfig() {
        }
        GameConfig.timeClock = function () {
            return this.tmpTimeClockEnd - this.tmpTimeClockStart;
        };
        GameConfig.timeClock1 = function () {
            return this.tmpTimeClockEnd1 - this.tmpTimeClockStart1;
        };
        GameConfig.resize = function () {
            window.scrollTo(0, 0);
            var h = 640;
            var width = window.innerWidth || document.body.clientWidth;
            var height = window.innerHeight || document.body.clientHeight;
            var ratio = height / h;
            if (this.game) {
                var view = this.game.view.renderer.view;
                view.style.height = h * ratio + "px";
                var newWidth = (width / ratio);
                view.style.width = width + "px";
                // this.logo.position.x = newWidth / 2;
                // this.logo.position.y = h / 2 - 20;
                // if (black) {
                //     black.scale.x = newWidth / 16;
                //     black.scale.y = h / 16;
                // }
                // this.countdown.position.x = newWidth / 2;
                // this.countdown.position.y = h / 2;
                this.game.view.resize(newWidth, h);
                // pauseButton.position.x = newWidth - 60;
                // pauseButton.position.y = h - 60;
                // pauseScreen.position.x = (newWidth * 0.5);
                // pauseScreen.position.y = h * 0.5;
                // resumeButton.position.x = (newWidth * 0.5);
                // resumeButton.position.y = (h * 0.5);
                // restartButton.position.x = (newWidth * 0.5) + 125;
                // restartButton.position.y = (h * 0.5);
                // soundOffButton.position.x = (newWidth * 0.5) - 125;
                // soundOffButton.position.y = (h * 0.5);
                // soundOnButton.position.x = (newWidth * 0.5) - 125;
                // soundOnButton.position.y = (h * 0.5);
            }
            this.width = (width / ratio);
            this.height = h;
        };
        GameConfig.xOffset = 0;
        GameConfig.high_mode = true;
        GameConfig.camera = new PIXI.Point();
        GameConfig.bundleId = "rw.raymond.wang";
        GameConfig.newHighScore = false;
        GameConfig.time = new GameRunTime();
        GameConfig.width = 800;
        GameConfig.height = 600;
        GameConfig.interactive = true;
        GameConfig.specialMode = SPECIALMODE.NONE;
        GameConfig.isOnPlat = false;
        return GameConfig;
    }());
    ECS.GameConfig = GameConfig;
})(ECS || (ECS = {}));
/* =========================================================================
 *
 *  GameItems.ts
 *  item
 *
 * ========================================================================= */
/// <reference path="./GameConfig.ts" />
var ECS;
(function (ECS) {
    function formatScore(n) {
        var nArray = n.toString().split("");
        var text = "";
        var total = nArray.length;
        var offset = (total % 3) - 1;
        for (var i = 0; i < total; i++) {
            text += nArray[i];
            //if((i - offset) % 3 == 0 && i != total-1)text+=",";	
        }
        return text;
    }
    var PickUp = /** @class */ (function () {
        function PickUp() {
            if (!this.pickupTextures)
                this.pickupTextures = ["pickup_01.png", "pickup_02.png", "pickup_03.png", "pickup_04.png", "pickup_05.png", "pickup_06.png", "pickup_07.png", "pickup_08.png"];
            this.position = new PIXI.Point();
            this.view = new PIXI.DisplayObjectContainer();
            this.clip = new PIXI.Sprite(PIXI.Texture.fromFrame(this.pickupTextures[Math2.randomInt(0, this.pickupTextures.length - 1)]));
            this.clip.anchor.x = 0.5;
            this.clip.anchor.y = 0.5;
            this.shine = PIXI.Sprite.fromFrame("pickupShine.png");
            this.shine.anchor.x = this.shine.anchor.y = 0.5;
            this.shine.scale.x = this.shine.scale.y = 1;
            this.shine.alpha = 0.5;
            this.view.addChild(this.shine);
            this.view.addChild(this.clip);
            this.width = 100;
            this.height = 100;
            this.count = Math.random() * 300;
        }
        PickUp.prototype.update = function () {
            if (!this.isPickedUp) {
                this.count += 0.1 * ECS.GameConfig.time.DELTA_TIME;
                this.clip.scale.x = 0.55 + Math.sin(this.count) * 0.1;
                this.clip.scale.y = 0.55 - Math.cos(this.count) * 0.1;
                this.clip.rotation = Math.sin(this.count * 1.5) * 0.2;
                this.shine.rotation = this.count * 0.2;
            }
            else {
                this.view.scale.x = 1 - this.ratio;
                this.view.scale.y = 1 - this.ratio;
                this.position.x = this.pickupPosition.x + (this.player.position.x - this.pickupPosition.x) * this.ratio;
                this.position.y = this.pickupPosition.y + (this.player.position.y - this.pickupPosition.y) * this.ratio;
            }
            this.view.position.x = this.position.x - ECS.GameConfig.camera.x;
            this.view.position.y = this.position.y;
        };
        return PickUp;
    }());
    ECS.PickUp = PickUp;
    var PowerBar = /** @class */ (function () {
        function PowerBar() {
            PIXI.DisplayObjectContainer.call(this);
            this.barBG = PIXI.Sprite.fromFrame("bulletTime_back.png");
            this.addChild(this.barBG);
            this.barBG.position.x = 20;
            this.barBG.position.y = 30;
            this.bar = PIXI.Sprite.fromFrame("powerFillBar.png");
            this.addChild(this.bar);
            this.bar.position.x = 20;
            this.bar.position.y = 30;
            this.frame = PIXI.Sprite.fromFrame("bulletTime_BG.png");
            this.addChild(this.frame);
            this.position.x = 100;
        }
        return PowerBar;
    }());
    ECS.PowerBar = PowerBar;
    PowerBar.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    var Specialfood = /** @class */ (function () {
        function Specialfood() {
            PIXI.DisplayObjectContainer.call(this);
            this.foods = ["Food Grey.png",
                "Food Grey.png",
                "Food Grey.png",
                "Food Grey.png"];
            this.activeFoods = ["Food.png",
                "Food.png",
                "Food.png",
                "Food.png"];
            for (var i = 0; i < 4; i++) {
                this.foods[i] = PIXI.Texture.fromFrame(this.foods[i]);
                this.activeFoods[i] = PIXI.Texture.fromFrame(this.activeFoods[i]);
            }
            this.startX = 10;
            this.digits = [];
            for (var i = 0; i < 4; i++) {
                this.digits[i] = new PIXI.Sprite(this.foods[i]);
                this.digits[i].scale.x = 0.6;
                this.digits[i].scale.y = 0.6;
                this.addChild(this.digits[i]);
                this.setFoodPic(this.digits[i], i * this.digits[i].width);
            }
        }
        return Specialfood;
    }());
    ECS.Specialfood = Specialfood;
    Specialfood.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    Specialfood.prototype.setFoodPic = function (ui, posx) {
        ui.position.x = this.startX + posx;
    };
    var PlayUIPanel = /** @class */ (function () {
        function PlayUIPanel() {
            PIXI.DisplayObjectContainer.call(this);
            this.playUI = ["Score.png",
                "Best Score.png",
                "Distance.png",
                "Pause.png"];
            for (var i = 0; i < this.playUI.length; i++) {
                this.playUI[i] = PIXI.Texture.fromFrame(this.playUI[i]);
            }
            this.startX = 600;
            this.digits = [];
            for (var i = 0; i < this.playUI.length; i++) {
                this.digits[i] = new PIXI.Sprite(this.playUI[i]);
                this.digits[i].scale.x = 0.6;
                this.digits[i].scale.y = 0.6;
                this.addChild(this.digits[i]);
                this.digits[i].position.x = this.startX;
                this.startX += this.digits[i].width;
            }
        }
        return PlayUIPanel;
    }());
    ECS.PlayUIPanel = PlayUIPanel;
    PlayUIPanel.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    var PlayControlPanel = /** @class */ (function () {
        function PlayControlPanel() {
            PIXI.DisplayObjectContainer.call(this);
            this.playUI = ["Score.png",
                "Best Score.png",
                "Distance.png",
                "Pause.png"];
            for (var i = 0; i < this.playUI.length; i++) {
                this.playUI[i] = PIXI.Texture.fromFrame(this.playUI[i]);
            }
            this.startX = 600;
            this.digits = [];
            for (var i = 0; i < this.playUI.length; i++) {
                this.digits[i] = new PIXI.Sprite(this.playUI[i]);
                this.digits[i].scale.x = 0.6;
                this.digits[i].scale.y = 0.6;
                this.addChild(this.digits[i]);
                this.digits[i].position.x = this.startX;
                this.startX += this.digits[i].width;
            }
        }
        return PlayControlPanel;
    }());
    ECS.PlayControlPanel = PlayControlPanel;
    PlayControlPanel.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    var Score = /** @class */ (function () {
        function Score() {
            PIXI.DisplayObjectContainer.call(this);
            this.ratio = 0;
            this.glyphs = {
                0: "Number-0.png",
                1: "Number-1.png",
                2: "Number-2.png",
                3: "Number-3.png",
                4: "Number-4.png",
                5: "Number-5.png",
                6: "Number-6.png",
                7: "Number-7.png",
                8: "Number-8.png",
                9: "Number-9.png"
            };
            for (var s in this.glyphs)
                this.glyphs[s] = PIXI.Texture.fromFrame(this.glyphs[s]);
            this.digits = [];
            for (var i = 0; i < 8; i++) {
                this.digits[i] = new PIXI.Sprite(this.glyphs[i]);
                this.addChild(this.digits[i]);
            }
            this.setScore(formatScore(12345));
        }
        return Score;
    }());
    ECS.Score = Score;
    Score.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    Score.prototype.setScore = function (score) {
        var split = formatScore(score).split("");
        var position = 0;
        var gap = -10;
        for (var i = 0; i < split.length; i++) {
            var digit = this.digits[i];
            digit.visible = true;
            digit.setTexture(this.glyphs[split[i]]);
            digit.position.x = position;
            position += digit.width + gap;
        }
        for (var i = 0; i < this.digits.length; i++) {
            this.digits[i].position.x -= position;
        }
        for (var i = split.length; i < this.digits.length; i++) {
            this.digits[i].visible = false;
        }
    };
    Score.prototype.jump = function () {
        this.ratio = 2.2;
    };
    var BestScore = /** @class */ (function () {
        function BestScore() {
            PIXI.DisplayObjectContainer.call(this);
            this.LocalStorage = new Fido.LocalStorage(ECS.GameConfig.bundleId);
            this.ratio = 0;
            this.glyphs = {
                0: "Number-0.png",
                1: "Number-1.png",
                2: "Number-2.png",
                3: "Number-3.png",
                4: "Number-4.png",
                5: "Number-5.png",
                6: "Number-6.png",
                7: "Number-7.png",
                8: "Number-8.png",
                9: "Number-9.png"
            };
            for (var s in this.glyphs)
                this.glyphs[s] = PIXI.Texture.fromFrame(this.glyphs[s]);
            this.digits = [];
            for (var i = 0; i < 8; i++) {
                this.digits[i] = new PIXI.Sprite(this.glyphs[i]);
                this.addChild(this.digits[i]);
            }
        }
        return BestScore;
    }());
    ECS.BestScore = BestScore;
    BestScore.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    BestScore.prototype.setScore = function (score) {
        var split = formatScore(score).split("");
        var position = 0;
        var gap = -10;
        for (var i = 0; i < split.length; i++) {
            var digit = this.digits[i];
            digit.visible = true;
            digit.setTexture(this.glyphs[split[i]]);
            digit.position.x = position;
            position += digit.width + gap;
        }
        for (var i = 0; i < this.digits.length; i++) {
            this.digits[i].position.x -= position;
        }
        for (var i = split.length; i < this.digits.length; i++) {
            this.digits[i].visible = false;
        }
    };
    BestScore.prototype.jump = function () {
        this.ratio = 2.2;
    };
    BestScore.prototype.update = function () {
        this.setScore(Math.round(parseInt(this.LocalStorage.get('highscore'))) || 0);
    };
    var Splash = /** @class */ (function () {
        function Splash() {
            this.textures = [PIXI.Texture.fromFrame("lavaFrame_01.png"),
                PIXI.Texture.fromFrame("lavaFrame_02.png"),
                PIXI.Texture.fromFrame("lavaFrame_03.png"),
                PIXI.Texture.fromFrame("lavaFrame_04.png"),
                PIXI.Texture.fromFrame("lavaFrame_05.png"),
                PIXI.Texture.fromFrame("lavaFrame_06.png"),
                PIXI.Texture.fromFrame("lavaFrame_07.png"),
                PIXI.Texture.fromFrame("lavaFrame_08.png"),
                PIXI.Texture.fromFrame("lavaFrame_09.png"),
                PIXI.Texture.fromFrame("lavaFrame_10.png"),
                PIXI.Texture.fromFrame("lavaFrame_11.png"),
                PIXI.Texture.fromFrame("lavaFrame_12.png")];
            PIXI.MovieClip.call(this, this.textures);
            this.anchor.x = 0.5;
            this.anchor.y = 1;
            this.scale.x = this.scale.y = 2;
            this.animationSpeed = 0.3;
            this.visible = false;
        }
        return Splash;
    }());
    ECS.Splash = Splash;
    Splash.prototype = Object.create(PIXI.MovieClip.prototype);
    Splash.prototype.splash = function (position) {
        this.realPosition = position.x;
        this.position.y = 620; //this.engine.steve.view.position.y;
        //this.gotoAndPlay(0)
        this.visible = true;
    };
    Splash.prototype.updateTransform = function () {
        if (!this.visible)
            return;
        PIXI.MovieClip.prototype.updateTransform.call(this);
        this.position.x = this.realPosition - ECS.GameConfig.camera.x;
        if (this.currentFrame > this.textures.length - 1) {
            //this.stop();
            this.visible = false;
        }
    };
})(ECS || (ECS = {}));
/* =========================================================================
 *
 *  GameKernel.ts
 *  game execute logical
 *
 * ========================================================================= */
/// <reference path="./GameConfig.ts" />
var ECS;
(function (ECS) {
    var GameKernel = /** @class */ (function () {
        function GameKernel() {
            this.view = new GameView(this);
            this.player = new ECS.GameCharacter();
            this.segmentManager = new ECS.SegmentManager(this);
            this.enemyManager = new ECS.EnemyManager(this);
            this.platManager = new ECS.PlatformManager(this);
            this.pickupManager = new ECS.PickupManager(this);
            this.floorManager = new ECS.FloorManager(this);
            this.collisionManager = new ECS.CollisionManager(this);
            this.LocalStorage = new Fido.LocalStorage(ECS.GameConfig.bundleId);
            this.player.view.visible = false;
            this.bulletMult = 1;
            this.pickupCount = 0;
            this.score = 0;
            this.joyrideMode = false;
            this.joyrideCountdown = 0;
            this.isPlaying = false;
            this.levelCount = 0;
            this.gameReallyOver = false;
            this.isDying = false;
            this.view.game.addChild(this.player.view);
        }
        GameKernel.prototype.start = function () {
            this.segmentManager.reset();
            this.enemyManager.destroyAll();
            this.pickupManager.destroyAll();
            this.platManager.destroyAll();
            this.isPlaying = true;
            this.gameReallyOver = false;
            this.score = 0;
            this.player.level = 1;
            this.player.position.y = 477;
            this.player.speed.y = 0;
            this.player.speed.x = this.player.baseSpeed;
            this.player.view.rotation = 0;
            this.player.isFlying = false;
            this.player.isDead = false;
            this.player.view.play();
            this.player.view.visible = true;
            this.segmentManager.chillMode = false;
            this.bulletMult = 1;
        };
        GameKernel.prototype.update = function () {
            //console.log("game update!!");
            ECS.GameConfig.time.update();
            var targetCamY = 0;
            if (targetCamY > 0)
                targetCamY = 0;
            if (targetCamY < -70)
                targetCamY = -70;
            ECS.GameConfig.camera.y = targetCamY;
            if (ECS.GameConfig.gameMode !== ECS.GAMEMODE.PAUSED) {
                this.player.update();
                this.collisionManager.update();
                this.platManager.update();
                this.segmentManager.update();
                this.floorManager.update();
                this.enemyManager.update();
                this.pickupManager.update();
                if (this.joyrideMode) {
                    this.joyrideCountdown -= ECS.GameConfig.time.DELTA_TIME;
                    if (this.joyrideCountdown <= 0) {
                        this.joyrideComplete();
                    }
                }
                this.levelCount += ECS.GameConfig.time.DELTA_TIME;
                if (this.levelCount > (60 * 60)) {
                    this.levelCount = 0;
                    this.player.level += 0.05;
                    ECS.GameConfig.time.speed += 0.05;
                }
            }
            else {
                if (this.joyrideMode) {
                    this.joyrideCountdown += ECS.GameConfig.time.DELTA_TIME;
                }
            }
            this.view.update();
        };
        GameKernel.prototype.reset = function () {
            this.enemyManager.destroyAll();
            this.platManager.destroyAll();
            this.floorManager.destroyAll();
            this.segmentManager.reset();
            this.view.zoom = 1;
            this.pickupCount = 0;
            this.levelCount = 0;
            this.player.level = 1;
            this.view.game.addChild(this.player.view);
        };
        GameKernel.prototype.joyrideComplete = function () {
            this.joyrideMode = false;
            this.pickupCount = 0;
            this.bulletMult += 0.3;
            this.view.normalMode();
            this.player.normalMode();
            this.enemyManager.destroyAll();
        };
        GameKernel.prototype.gameover = function () {
            this.isPlaying = false;
            this.isDying = true;
            this.segmentManager.chillMode = true;
            var nHighscore = this.LocalStorage.get('highscore');
            if (!nHighscore || this.score > nHighscore) {
                this.LocalStorage.store('highscore', this.score);
                ECS.GameConfig.newHighscore = true;
            }
            //this.onGameover();
            this.view.game.addChild(this.player.view);
            TweenLite.to(this.view, 0.5, {
                zoom: 2,
                ease: Cubic.easeOut
            });
            //this.reset();
            //this.start();
        };
        GameKernel.prototype.gameoverReal = function () {
            this.gameReallyOver = true;
            this.isDying = false;
            //this.onGameoverReal();
        };
        GameKernel.prototype.pickup = function (idx) {
            if (this.player.isDead)
                return;
            this.pickupCount++;
            // if(this.pickupCount >= 50 * this.bulletMult && !this.player.isDead)
            // {
            //     this.pickupCount = 0;
            //     this.joyrideMode = true;
            //     this.joyrideCountdown = 60 * 10;
            //     this.view.joyrideMode();
            //     this.player.joyrideMode();
            //     this.player.position.x = 0;
            //     GameConfig.camera.x = GameConfig.game.player.position.x - 100;
            //     this.enemyManager.destroyAll();
            //     this.pickupManager.destroyAll();
            //     this.floorManager.destroyAll();	
            //     this.segmentManager.reset();
            // }
        };
        return GameKernel;
    }());
    ECS.GameKernel = GameKernel;
    var BackGroundElement = /** @class */ (function () {
        function BackGroundElement(texture, y, owner, width) {
            if (width === void 0) { width = 940; }
            this.sprites = [];
            this.spriteWidth = texture.width - 5;
            var amount = Math.ceil(width / this.spriteWidth);
            if (amount < 3)
                amount = 3;
            for (var i = 0; i < amount; i++) {
                var sprite = new PIXI.Sprite(texture);
                sprite.position.y = y;
                owner.addChild(sprite);
                this.sprites.push(sprite);
            }
            ;
            this.speed = 1;
        }
        BackGroundElement.prototype.setPosition = function (position) {
            var h = this.spriteWidth;
            for (var i = 0; i < this.sprites.length; i++) {
                var pos = -position * this.speed;
                pos += i * h;
                pos %= h * this.sprites.length;
                pos += h / 2;
                //console.log(Math.floor(pos) - GameConfig.xOffset);
                this.sprites[i].position.x = pos; //Math.floor(pos) - GameConfig.xOffset
            }
            ;
        };
        return BackGroundElement;
    }());
    ECS.BackGroundElement = BackGroundElement;
    var GameVines = /** @class */ (function () {
        function GameVines(owner) {
            this.vines = [];
            this.owner = owner;
            for (var i = 0; i < 10; i++) {
                var vine = new PIXI.Sprite.fromFrame("01_hanging_flower3.png");
                vine.offset = i * 100 + Math.random() * 50;
                vine.speed = (1.5 + Math.random() * 0.25) / 2;
                vine.position.y = Math.random() * -200;
                owner.addChild(vine);
                vine.position.x = 200;
                this.vines.push(vine);
            }
            ;
            this.speed = 1;
        }
        GameVines.prototype.setPosition = function (position) {
            for (var i = 0; i < this.vines.length; i++) {
                var vine = this.vines[i];
                var pos = -(position + vine.offset) * vine.speed;
                pos %= this.owner.width;
                pos += this.owner.width;
                vine.position.x = pos;
            }
            ;
        };
        return GameVines;
    }());
    ECS.GameVines = GameVines;
    var GameBackground = /** @class */ (function () {
        function GameBackground(front) {
            console.log("init background!");
            PIXI.DisplayObjectContainer.call(this);
            this.width = 1000;
            this.scrollPosition = 1500;
            //console.log(PIXI.Texture);
            var bgTex = PIXI.Texture.fromImage("img/bg_up.png");
            //bgTex.width = 1281;
            bgTex.height = 500;
            this.bgTex = new BackGroundElement(bgTex, -195, this);
            //this.rearCanopy = new BackGroundElement(PIXI.Texture.fromFrame("03_rear_canopy.png"), 0, this);
            this.tree1 = PIXI.Sprite.fromFrame("tree1.png");
            this.tree1.width = 150;
            this.tree1.height = 150;
            this.tree1.position.y = 380;
            this.addChild(this.tree1);
            this.tree2 = PIXI.Sprite.fromFrame("tree2.png");
            this.tree2.width = 150;
            this.tree2.height = 150;
            this.tree2.position.y = 380;
            this.addChild(this.tree2);
            this.cloud1 = PIXI.Sprite.fromFrame("cloud1.png");
            this.cloud1.position.y = 100;
            this.addChild(this.cloud1);
            this.cloud2 = PIXI.Sprite.fromFrame("cloud2.png");
            this.cloud2.position.y = 50;
            this.addChild(this.cloud2);
            //this.farCanopy = new BackGroundElement(PIXI.Texture.fromFrame("02_front_canopy.png"), 0, this);
            //this.vines = new GameVines(this);
            //this.roofLeaves = new BackGroundElement(PIXI.Texture.fromFrame("00_roof_leaves.png"), 0, this);
            //this.frontSilhouette = new BackGroundElement(PIXI.Texture.fromFrame("01_front_silhouette.png"), 424, this);
            this.bgTex.speed = 1 / 2;
            //this.rearSilhouette.speed = 1.2/2;
            //this.rearCanopy.speed = 1.2/2;
            //this.farCanopy.speed = 1.5/2;
            //this.frontSilhouette.speed = 1.6/2;
            //this.roofLeaves.speed = 2/2;
        }
        return GameBackground;
    }());
    ECS.GameBackground = GameBackground;
    GameBackground.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    GameBackground.prototype.updateTransform = function () {
        this.scrollPosition = ECS.GameConfig.camera.x + 8000;
        var treePos = -this.scrollPosition * 1.5 / 2;
        treePos %= this.width + 556;
        treePos += this.width + 556;
        treePos -= this.tree1.width / 2;
        this.tree1.position.x = treePos - ECS.GameConfig.xOffset;
        var treePos2 = -(this.scrollPosition + this.width / 2) * 1.5 / 2;
        treePos2 %= this.width + 556;
        treePos2 += this.width + 556;
        treePos2 -= this.tree2.width / 2;
        this.tree2.position.x = treePos2 - ECS.GameConfig.xOffset;
        var cloud1Pos = -this.scrollPosition * 1.5 / 2;
        cloud1Pos %= this.width + 556;
        cloud1Pos += this.width + 556;
        cloud1Pos -= this.cloud1.width / 2;
        this.cloud1.position.x = cloud1Pos - ECS.GameConfig.xOffset;
        var cloud2Pos = -(this.scrollPosition + this.width / 2) * 1.5 / 2;
        cloud2Pos %= this.width + 556;
        cloud2Pos += this.width + 556;
        cloud2Pos -= this.cloud2.width / 2;
        this.cloud2.position.x = cloud2Pos - ECS.GameConfig.xOffset;
        this.bgTex.setPosition(this.scrollPosition);
        //this.rearSilhouette.setPosition(this.scrollPosition);
        //this.rearCanopy.setPosition(this.scrollPosition);
        // this.farCanopy.setPosition(this.scrollPosition);
        //this.frontSilhouette.setPosition(this.scrollPosition);
        //this.roofLeaves.setPosition(this.scrollPosition);
        //this.vines.setPosition(this.scrollPosition);
        PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
    };
    var JoyBackGround = /** @class */ (function () {
        function JoyBackGround() {
            PIXI.DisplayObjectContainer.call(this);
            this.width = 1000;
            this.scrollPosition = 1500;
            var SCALE = 1; // 0.5
            this.swoosh = new BackGroundElement(PIXI.Texture.fromImage("img/stretched_hyper_tile.jpg"), 0, this);
            this.swoosh.speed = 0.7;
            this.scale.y = 1.7;
            this.scale.x = 4;
        }
        return JoyBackGround;
    }());
    ECS.JoyBackGround = JoyBackGround;
    //Game View
    var GameView = /** @class */ (function () {
        function GameView(kernel) {
            console.log("init game view!");
            this.kernel = kernel;
            this.renderer = PIXI.autoDetectRenderer(600, 800);
            ECS.GameConfig.high_mode = (this.renderer instanceof PIXI.WebGLRenderer);
            this.stage = new PIXI.Stage();
            this.container = new PIXI.DisplayObjectContainer();
            this.container.hitArea = this.stage.hitArea;
            this.container.interactive = true;
            //init scene layer
            this.hud = new PIXI.DisplayObjectContainer();
            this.game = new PIXI.DisplayObjectContainer();
            this.gameFront = new PIXI.DisplayObjectContainer();
            this.container.addChild(this.game);
            this.container.addChild(this.gameFront);
            this.stage.addChild(this.container);
            this.stage.addChild(this.hud);
            this.normalBackground = new GameBackground(this.gameFront);
            //this.powerBar = new PowerBar();
            this.specialFood = new ECS.Specialfood();
            this.playUIPanel = new ECS.PlayUIPanel();
            this.score = new ECS.Score();
            this.bestScore = new ECS.BestScore();
            this.background = this.normalBackground;
            //this.score.position.x = GameConfig.width/2;
            this.game.addChild(this.background);
            this.hud.addChild(this.playUIPanel);
            this.hud.addChild(this.score);
            this.hud.addChild(this.bestScore);
            this.hud.addChild(this.specialFood);
            this.trail = new ECS.GameCharacterTrail(this.game);
            this.trail2 = new ECS.GameCharacterTrailFire(this.game);
            //this.powerBar.alpha = 0;
            this.score.alpha = 0;
            this.bestScore.alpha = 0;
            this.count = 0;
            this.zoom = 1;
            this.white = PIXI.Sprite.fromImage("img/whiteSquare.jpg");
            ECS.GameConfig.xOffset = this.container.position.x;
            //this.dust = new PixiDust();
            //this.container.addChild(this.dust);
            this.splash = new ECS.Splash();
            this.splash.position.y = 300;
            this.splash.position.x = 300;
            this.game.addChild(this.splash);
        }
        GameView.prototype.showHud = function () {
            var start = {
                x: ECS.GameConfig.width + 100,
                y: 0
            };
            this.score.alpha = 1;
            // this.score.position.x = start.x;
            // TweenLite.to(this.score.position, 1, {
            //     x: GameConfig.width - 295 - 20,
            //     ease: Elastic.easeOut
            // });
            this.bestScore.alpha = 1;
            //this.bestScore.position.x = 500;
            // this.bestScore.position.y -= 100;
            // TweenLite.to(this.bestScore.position, 1, {
            //     x: GameConfig.width - 20,
            //     ease: Elastic.easeOut
            // });
            // this.powerBar.alpha = 1;
            // this.powerBar.position.x = GameConfig.width;
            // TweenLite.to(this.powerBar.position, 1, {
            //     x: GameConfig.width - 295,
            //     ease: Elastic.easeOut,
            //     delay: 0.3
            // });
        };
        GameView.prototype.hideHud = function () {
        };
        GameView.prototype.update = function () {
            this.count += 0.01;
            var ratio = (this.zoom - 1);
            var position = -ECS.GameConfig.width / 2;
            var position2 = -this.kernel.player.view.position.x;
            var inter = position + (position2 - position) * ratio;
            this.container.position.x = inter * this.zoom;
            this.container.position.y = -this.kernel.player.view.position.y * this.zoom;
            this.container.position.x += ECS.GameConfig.width / 2;
            this.container.position.y += ECS.GameConfig.height / 2;
            ECS.GameConfig.xOffset = this.container.position.x;
            if (this.container.position.y > 0)
                this.container.position.y = 0;
            var yMax = -ECS.GameConfig.height * this.zoom;
            yMax += ECS.GameConfig.height;
            if (this.container.position.y < yMax)
                this.container.position.y = yMax;
            this.container.scale.x = this.zoom;
            this.container.scale.y = this.zoom;
            this.trail.target = this.kernel.player;
            this.trail2.target = this.kernel.player;
            this.trail.update();
            this.trail2.update();
            //this.dust.update();
            //this.lava.setPosition(GameConfig.camera.x + 4000);
            this.bestScore.update();
            this.score.setScore(Math.round(this.kernel.score));
            //this.powerBar.bar.scale.x = ((this.kernel.pickupCount / (50 * this.kernel.bulletMult)) * (248 / 252))
            this.renderer.render(this.stage);
        };
        GameView.prototype.joyrideMode = function () {
            this.game.removeChild(this.background);
            //this.background = this.joyBackground;
            this.game.addChildAt(this.background, 0);
            this.stage.addChild(this.white);
            this.white.alpha = 1;
            TweenLite.to(this.white, 0.7, {
                alpha: 0,
                ease: Sine.easeOut
            });
        };
        GameView.prototype.doSplash = function () {
            this.splash.splash(this.kernel.player.position);
        };
        GameView.prototype.normalMode = function () {
            this.game.removeChild(this.background);
            this.background = this.normalBackground;
            this.game.addChildAt(this.background, 0);
            this.stage.addChild(this.white);
            this.white.alpha = 1;
            TweenLite.to(this.white, 0.5, {
                alpha: 0,
                ease: Sine.easeOut
            });
        };
        GameView.prototype.resize = function (w, h) {
            //    console.log("Width ->" + w);
            //    console.log("Height -> " + h);
            ECS.GameConfig.width = w;
            ECS.GameConfig.height = h;
            this.renderer.resize(w, h);
            this.background.width = w;
            this.bestScore.position.x = 900;
            this.bestScore.position.y = 22;
            this.bestScore.scale.x = 0.3;
            this.bestScore.scale.y = 0.3;
            this.score.position.x = 740;
            this.score.position.y = 22;
            this.score.scale.x = 0.3;
            this.score.scale.y = 0.3;
            this.specialFood.position.x = 0;
            this.specialFood.position.y = 12;
            this.playUIPanel.position.x = 0;
            this.playUIPanel.position.y = 12;
            this.white.scale.x = w / 16;
            this.white.scale.y = h / 16;
            // this.powerBar.position.x = w - 295;
            // this.powerBar.position.y = 12;
        };
        return GameView;
    }());
    ECS.GameView = GameView;
})(ECS || (ECS = {}));
/* =========================================================================
 *
 *  GameManager.ts
 *  .....
 *
 * ========================================================================= */
/// <reference path="./GameItems.ts" />
var ECS;
(function (ECS) {
    var GameObjectPool = /** @class */ (function () {
        function GameObjectPool(classType) {
            this.classType = classType;
            this.pool = [];
        }
        GameObjectPool.prototype.getObject = function () {
            var object = this.pool.pop();
            if (!object) {
                object = new this.classType();
            }
            return object;
        };
        return GameObjectPool;
    }());
    ECS.GameObjectPool = GameObjectPool;
    var SegmentManager = /** @class */ (function () {
        function SegmentManager(engine) {
            console.log("init segmeng manager!");
            this.engine = engine;
            this.sections = data;
            this.count = 0;
            this.currentSegment = data[0];
            //console.log(this.currentSegment);
            this.startSegment = { length: 1135 * 2, floor: [0, 1135], blocks: [], coins: [], platform: [] },
                this.chillMode = true;
            this.last = 0;
            this.position = 0;
        }
        SegmentManager.prototype.reset = function (dontReset) {
            if (dontReset)
                this.count = 0;
            this.currentSegment = this.startSegment;
            this.currentSegment.start = -200;
            for (var i = 0; i < this.currentSegment.floor.length; i++) {
                this.engine.floorManager.addFloor(this.currentSegment.start + this.currentSegment.floor[i]);
            }
        };
        SegmentManager.prototype.update = function () {
            this.position = ECS.GameConfig.camera.x + ECS.GameConfig.width * 2;
            // look at where we are..
            var relativePosition = this.position - this.currentSegment.start;
            if (relativePosition > this.currentSegment.length) {
                if (this.engine.joyrideMode) {
                    var nextSegment = this.startSegment;
                    nextSegment.start = this.currentSegment.start + this.currentSegment.length;
                    this.currentSegment = nextSegment;
                    for (var i = 0; i < this.currentSegment.floor.length; i++) {
                        this.engine.floorManager.addFloor(this.currentSegment.start + this.currentSegment.floor[i]);
                    }
                    return;
                }
                //var nextSegment = this.startSegment;//this.sections[this.count % this.sections.length];
                var nextSegment = this.sections[this.count % this.sections.length];
                // section finished!
                nextSegment.start = this.currentSegment.start + this.currentSegment.length;
                this.currentSegment = nextSegment;
                // add the elements!
                for (var i = 0; i < this.currentSegment.floor.length; i++) {
                    this.engine.floorManager.addFloor(this.currentSegment.start + this.currentSegment.floor[i]);
                }
                var blocks = this.currentSegment.blocks;
                var length = blocks.length / 2;
                for (var i = 0; i < length; i++) {
                    this.engine.enemyManager.addEnemy(this.currentSegment.start + blocks[i * 2], blocks[(i * 2) + 1]);
                }
                var pickups = this.currentSegment.coins;
                var length = pickups.length / 2;
                for (var i = 0; i < length; i++) {
                    //random distribute
                    var seed = Math.random() * 10;
                    var curType = ECS.FOODMODE.INDON;
                    if (seed > 5) {
                        curType = ECS.FOODMODE.JAPAN;
                    }
                    this.engine.pickupManager.addPickup(this.currentSegment.start + pickups[i * 2], pickups[(i * 2) + 1], curType);
                }
                var platforms = this.currentSegment.platform;
                var length = platforms.length / 2;
                for (var i = 0; i < length; i++) {
                    this.engine.platManager.addPlatform(this.currentSegment.start + platforms[i * 2], platforms[(i * 2) + 1]);
                }
                this.count++;
            }
        };
        return SegmentManager;
    }());
    ECS.SegmentManager = SegmentManager;
    var Platform = /** @class */ (function () {
        function Platform() {
            this.position = new PIXI.Point();
            this.numberOfBlock = -3 + Math.random() * (8 - 5) + 5;
            this.views = [];
            for (var i = 0; i < this.numberOfBlock * 2; i++) {
                var view = new PIXI.Sprite(PIXI.Texture.fromFrame("img/floatingGround.png"));
                view.anchor.x = 0.5;
                view.anchor.y = 0.5;
                view.width = 50;
                view.height = 50;
                this.views.push(view);
            }
            this.width = 50 * this.numberOfBlock * 2;
            this.height = 50;
        }
        Platform.prototype.update = function () {
            for (var i = -this.numberOfBlock; i < this.numberOfBlock; i++) {
                this.views[i + this.numberOfBlock].position.x = this.position.x + 50 * i - ECS.GameConfig.camera.x;
                ;
                this.views[i + this.numberOfBlock].position.y = this.position.y;
            }
        };
        return Platform;
    }());
    ECS.Platform = Platform;
    var PlatformManager = /** @class */ (function () {
        function PlatformManager(engine) {
            console.log("init platform manager!");
            this.engine = engine;
            this.platforms = [];
            this.platformPool = new GameObjectPool(Platform);
        }
        PlatformManager.prototype.update = function () {
            for (var i = 0; i < this.platforms.length; i++) {
                var platform = this.platforms[i];
                platform.update();
                // this.platforms.splice(i, 1);
                // for(var i=0;i<platform.numberOfBlock;i++){
                //     if(platform.views[i].position.x < -500 -GameConfig.xOffset && !this.engine.player.isDead)
                //     {                        
                //         this.engine.view.gameFront.removeChild(platform.views[i]);
                //     }  
                // }
                // i--;
            }
        };
        PlatformManager.prototype.destroyAll = function () {
            for (var i = 0; i < this.platforms.length; i++) {
                var platform = this.platforms[i];
                this.platforms.splice(i, 1);
                // for(var i=0;i<platform.numberOfBlock;i++){
                //     if(platform.views[i].position.x < -500 -GameConfig.xOffset && !this.engine.player.isDead)
                //     {                        
                //         this.engine.view.gameFront.removeChild(platform.views[i]);
                //     }  
                // }
                i--;
            }
            this.platforms = [];
        };
        PlatformManager.prototype.addPlatform = function (x, y) {
            var platform = this.platformPool.getObject();
            platform.position.x = x;
            platform.position.y = y;
            for (var i = -platform.numberOfBlock; i < platform.numberOfBlock; i++) {
                platform.views[i + platform.numberOfBlock].position.x = platform.position.x + 50 * i - ECS.GameConfig.camera.x;
                ;
                platform.views[i + platform.numberOfBlock].position.y = platform.position.y;
                this.platforms.push(platform);
                this.engine.view.gameFront.addChild(platform.views[i + platform.numberOfBlock]);
            }
        };
        return PlatformManager;
    }());
    ECS.PlatformManager = PlatformManager;
    var EnemyManager = /** @class */ (function () {
        function EnemyManager(engine) {
            console.log("init enemy manager!");
            this.engine = engine;
            this.enemies = [];
            this.enemyPool = new GameObjectPool(ECS.GameEnemy);
            this.spawnCount = 0;
        }
        EnemyManager.prototype.update = function () {
            for (var i = 0; i < this.enemies.length; i++) {
                var enemy = this.enemies[i];
                enemy.update();
                if (enemy.view.position.x < -100 - ECS.GameConfig.xOffset && !this.engine.player.isDead) {
                    ////this.enemyPool.returnObject(enemy);
                    this.enemies.splice(i, 1);
                    this.engine.view.gameFront.removeChild(enemy.view);
                    i--;
                }
                else if (enemy.isHit) {
                    this.enemies.splice(i, 1);
                    this.engine.view.gameFront.removeChild(enemy.view);
                    i--;
                }
            }
        };
        EnemyManager.prototype.addEnemy = function (x, y) {
            var enemy = this.enemyPool.getObject();
            enemy.position.x = x;
            enemy.position.y = y;
            enemy.view.play();
            this.enemies.push(enemy);
            this.engine.view.gameFront.addChild(enemy.view);
        };
        EnemyManager.prototype.destroyAll = function () {
            for (var i = 0; i < this.enemies.length; i++) {
                var enemy = this.enemies[i];
                enemy.reset();
                //this.enemyPool.returnObject(enemy);
                this.engine.view.gameFront.removeChild(enemy.view);
            }
            this.enemies = [];
        };
        EnemyManager.prototype.destroyAllOffScreen = function () {
            for (var i = 0; i < this.enemies.length; i++) {
                var enemy = this.enemies[i];
                if (enemy.x > ECS.GameConfig.camera.x + ECS.GameConfig.width) {
                    this.engine.view.game.removeChild(enemy.view);
                    this.enemies.splice(i, 1);
                    i--;
                }
            }
        };
        return EnemyManager;
    }());
    ECS.EnemyManager = EnemyManager;
    var PickupManager = /** @class */ (function () {
        function PickupManager(engine) {
            this.canPickOrNot = true;
            this.MAX_PICKUP_NUM = 4;
            console.log("init pick up manager!");
            this.engine = engine;
            this.pickups = [];
            this.pickupPool = new GameObjectPool(ECS.PickUp);
            this.spawnCount = 0;
            this.pos = 0;
            this.pickedUpPool = [];
        }
        PickupManager.prototype.update = function () {
            for (var i = 0; i < this.pickups.length; i++) {
                var pickup = this.pickups[i];
                pickup.update();
                if (pickup.isPickedUp) {
                    pickup.ratio += (1 - pickup.ratio) * 0.3 * ECS.GameConfig.time.DELTA_TIME;
                    if (pickup.ratio > 0.99) {
                        //this.pickupPool.returnObject(pickup);
                        this.pickups.splice(i, 1);
                        this.engine.view.game.removeChild(pickup.view);
                        i--;
                    }
                }
                else {
                    if (pickup.view.position.x < -100 - ECS.GameConfig.xOffset) {
                        // remove!
                        this.engine.view.game.removeChild(pickup.view);
                        this.pickups.splice(i, 1);
                        i--;
                    }
                }
            }
        };
        PickupManager.prototype.addPickup = function (x, y, type) {
            var pickup = this.pickupPool.getObject();
            pickup.position.x = x;
            pickup.position.y = y;
            pickup.foodType = type;
            this.pickups.push(pickup);
            this.engine.view.game.addChild(pickup.view);
        };
        PickupManager.prototype.removePickup = function (index, isPlayer, enemyEntity) {
            if (isPlayer === void 0) { isPlayer = true; }
            if (enemyEntity === void 0) { enemyEntity = undefined; }
            //collect food
            var pickup = this.pickups[index];
            pickup.isPickedUp = true;
            if (isPlayer) {
                pickup.player = this.engine.player;
                pickup.pickupPosition = { x: pickup.position.x, y: pickup.position.y }; //.clone();
                pickup.ratio = 0;
                //judge food pool, 0 jap 1 indo
                if (this.pickedUpPool.length < this.MAX_PICKUP_NUM - 1) {
                    //console.log("collect food, type:"+pickup.foodType);
                    this.pickedUpPool.push(pickup.foodType);
                    this.engine.view.specialFood.digits[this.pickedUpPool.length - 1].texture = this.engine.view.specialFood.activeFoods[this.pickedUpPool.length - 1];
                }
                else if (this.pickedUpPool.length == this.MAX_PICKUP_NUM - 1 && this.canPickOrNot) {
                    //console.log("collect food, type:"+pickup.foodType);
                    this.pickedUpPool.push(pickup.foodType);
                    this.engine.view.specialFood.digits[this.pickedUpPool.length - 1].texture = this.engine.view.specialFood.activeFoods[this.pickedUpPool.length - 1];
                    //count for jan food
                    var cnt = 0;
                    for (var i = 0; i < this.pickedUpPool.length; i++) {
                        if (this.pickedUpPool[i] == 0) {
                            cnt++;
                        }
                    }
                    var otherCnt = 4 - cnt;
                    var specialMode = ECS.SPECIALMODE.NINJAMODE;
                    if (cnt > otherCnt) {
                        specialMode = ECS.SPECIALMODE.JAPANMODE;
                        ECS.GameConfig.game.player.view.addChild(ECS.GameConfig.game.player.shinobiEffect1);
                        ECS.GameConfig.game.player.view.addChild(ECS.GameConfig.game.player.shinobiEffect2);
                        ECS.GameConfig.game.player.view.addChild(ECS.GameConfig.game.player.shinobiEffect3);
                        ECS.GameConfig.game.player.view.addChild(ECS.GameConfig.game.player.backEffect);
                        //console.log("change special mode:japan");
                    }
                    else if (cnt < otherCnt) {
                        specialMode = ECS.SPECIALMODE.INDONMODE;
                        ECS.GameConfig.tmpTimeClockStart = ECS.GameConfig.time.currentTime;
                        ECS.GameConfig.game.player.view.addChild(ECS.GameConfig.game.player.indoEffect);
                        //console.log("change special mode:indo");
                    }
                    else {
                        specialMode = ECS.SPECIALMODE.NINJAMODE;
                        ECS.GameConfig.tmpTimeClockStart = ECS.GameConfig.time.currentTime;
                        ECS.GameConfig.game.player.view.addChild(ECS.GameConfig.game.player.marioEffect);
                        ECS.GameConfig.game.player.speed.x *= 2;
                        //console.log("change special mode:ninja");
                    }
                    ECS.GameConfig.specialMode = specialMode;
                    this.canPickOrNot = false;
                }
            }
            else {
                //eat by cat
                pickup.player = enemyEntity;
                pickup.pickupPosition = { x: pickup.position.x, y: pickup.position.y }; //.clone();
                pickup.ratio = 0;
            }
        };
        PickupManager.prototype.destroyAll = function () {
            for (var i = 0; i < this.pickups.length; i++) {
                var pickup = this.pickups[i];
                // remove!
                //this.pickupPool.returnObject(pickup);
                this.engine.view.game.removeChild(pickup.view);
            }
            this.pickups = [];
        };
        PickupManager.prototype.destroyAllOffScreen = function () {
            for (var i = 0; i < this.pickups.length; i++) {
                var pickup = this.pickups[i];
                if (pickup.x > ECS.GameConfig.camera.x + ECS.GameConfig.width) {
                    //this.pickupPool.returnObject(pickup);
                    this.engine.view.game.removeChild(pickup.view);
                    this.pickups.splice(i, 1);
                    i--;
                }
            }
        };
        return PickupManager;
    }());
    ECS.PickupManager = PickupManager;
    var Floor = /** @class */ (function () {
        function Floor() {
            PIXI.Sprite.call(this, PIXI.Texture.fromImage("img/bg_down.png"));
        }
        return Floor;
    }());
    ECS.Floor = Floor;
    Floor.prototype = Object.create(PIXI.Sprite.prototype);
    var FloorManager = /** @class */ (function () {
        function FloorManager(engine) {
            console.log("init floor manager!");
            this.engine = engine;
            this.count = 0;
            this.floors = [];
            this.floorPool = new GameObjectPool(Floor);
        }
        FloorManager.prototype.update = function () {
            for (var i = 0; i < this.floors.length; i++) {
                var floor = this.floors[i];
                floor.position.x = floor.x - ECS.GameConfig.camera.x - 16;
                if (floor.position.x < -1135 - ECS.GameConfig.xOffset - 16) {
                    //this.floorPool.returnObject(floor)
                    this.floors.splice(i, 1);
                    i--;
                    this.engine.view.gameFront.removeChild(floor);
                }
            }
        };
        FloorManager.prototype.addFloor = function (floorData) {
            var floor = this.floorPool.getObject();
            floor.x = floorData;
            floor.position.y = 520;
            this.engine.view.gameFront.addChild(floor);
            this.floors.push(floor);
        };
        FloorManager.prototype.destroyAll = function () {
            for (var i = 0; i < this.floors.length; i++) {
                var floor = this.floors[i];
                //this.floorPool.returnObject(floor);
                this.engine.view.gameFront.removeChild(floor);
            }
            this.floors = [];
        };
        return FloorManager;
    }());
    ECS.FloorManager = FloorManager;
    var CollisionManager = /** @class */ (function () {
        function CollisionManager(engine) {
            this.isOnPlat = false;
            console.log("init collision manager!");
            this.engine = engine;
        }
        CollisionManager.prototype.update = function () {
            this.playerVsBlock();
            this.playerVsPickup();
            this.playerVsFloor();
            this.playerVsPlat();
            this.catVsPickup();
        };
        CollisionManager.prototype.playerVsBlock = function () {
            var enemies = this.engine.enemyManager.enemies;
            var player = this.engine.player;
            var floatRange = 0;
            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];
                if (player.isSlide) {
                    floatRange = 10;
                }
                else if (ECS.GameConfig.specialMode == ECS.SPECIALMODE.INDONMODE && ECS.GameConfig.game.player.isPlayingInoEffect) {
                    floatRange = -2000;
                }
                else {
                    floatRange = 0;
                }
                var xdist = enemy.position.x - player.position.x;
                var ydist = enemy.position.y - player.position.y;
                //detect japan mode and ninjia mode
                if (xdist > -enemy.width / 2 + floatRange && xdist < enemy.width / 2 - floatRange) {
                    var ydist = enemy.position.y - player.position.y;
                    if (ydist > -enemy.height / 2 - 20 + floatRange && ydist < enemy.height / 2 - floatRange) {
                        ECS.GameConfig.game.score += 10;
                        ECS.GameConfig.game.view.score.jump();
                        switch (ECS.GameConfig.specialMode) {
                            case ECS.SPECIALMODE.NONE:
                                player.die();
                                this.engine.gameover();
                                enemy.hit();
                                break;
                            case ECS.SPECIALMODE.INDONMODE:
                                if (floatRange == -2000) {
                                    enemy.hit();
                                }
                                else {
                                    player.die();
                                    this.engine.gameover();
                                    enemy.hit();
                                }
                                break;
                            case ECS.SPECIALMODE.JAPANMODE:
                                if (ECS.GameConfig.game.player.isPlayingNinjiaEffect) {
                                    enemy.hit();
                                }
                                else {
                                    player.die();
                                    this.engine.gameover();
                                    enemy.hit();
                                }
                                break;
                            case ECS.SPECIALMODE.NINJAMODE:
                                enemy.hit();
                                break;
                        }
                    }
                }
            }
        };
        CollisionManager.prototype.catVsPickup = function () {
            var pickups = this.engine.pickupManager.pickups;
            var enemies = this.engine.enemyManager.enemies;
            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];
                if (enemy.isHit)
                    continue;
                //console.log("cat eat!");
                for (var j = 0; j < pickups.length; j++) {
                    var pickup = pickups[j];
                    if (pickup.isPickedUp)
                        continue;
                    //console.log("chk cat eat!");
                    var xdist = pickup.position.x - enemy.position.x;
                    if (xdist > -pickup.width / 2 && xdist < pickup.width / 2) {
                        var ydist = pickup.position.y - enemy.position.y;
                        //console.log("cat eat food1!");
                        if (ydist > -pickup.height / 2 - 20 && ydist < pickup.height / 2) {
                            //console.log("cat eat food!");
                            enemy.view.textures = enemy.stealFrames;
                            enemy.isEatNow = true;
                            this.engine.pickupManager.removePickup(j, false, enemy);
                            //this.engine.pickup(i);
                        }
                    }
                }
            }
        };
        CollisionManager.prototype.playerVsPickup = function () {
            var pickups = this.engine.pickupManager.pickups;
            var player = this.engine.player;
            for (var i = 0; i < pickups.length; i++) {
                var pickup = pickups[i];
                if (pickup.isPickedUp)
                    continue;
                var xdist = pickup.position.x - player.position.x;
                if (xdist > -pickup.width / 2 && xdist < pickup.width / 2) {
                    var ydist = pickup.position.y - player.position.y;
                    if (ydist > -pickup.height / 2 - 20 && ydist < pickup.height / 2) {
                        this.engine.pickupManager.removePickup(i);
                        this.engine.pickup(i);
                    }
                }
            }
        };
        CollisionManager.prototype.playerVsPlat = function () {
            var player = this.engine.player;
            var platforms = this.engine.platManager.platforms;
            for (var i = 0; i < platforms.length; i++) {
                var plat = platforms[i];
                var xdist = plat.position.x - player.position.x;
                //check jump to the plat or not
                if (xdist > -plat.width / 2 && xdist < plat.width / 2) {
                    var ydist = plat.position.y - player.position.y;
                    if (ydist > -plat.height / 2 - 20 && ydist < plat.height / 2) {
                        if (player.position.y < plat.position.y - 10) {
                            player.position.y = plat.position.y - plat.height / 2 - player.height / 2;
                            //console.log("plat!");
                            player.ground = player.position.y;
                            // player.startJump = false;
                            // player.isJumped = false;
                            // player.cnt =0;
                            ECS.GameConfig.isOnPlat = true;
                            player.onGround = true;
                        }
                    }
                }
            }
            //check leave the plat
            if (ECS.GameConfig.isOnPlat) {
                var flag = true;
                for (var i = 0; i < platforms.length; i++) {
                    var plat = platforms[i];
                    var xdist = plat.position.x - player.position.x;
                    if (xdist > -plat.width / 2 && xdist < plat.width / 2) {
                        var ydist = plat.position.y - plat.height / 2 - player.height / 2 - player.position.y;
                        if (ydist <= 0) {
                            //console.log("noy");
                            flag = false;
                        }
                    }
                }
                if (flag) {
                    ECS.GameConfig.isOnPlat = false;
                    ;
                    player.ground = 477;
                    ECS.GameConfig.playerMode = ECS.PLAYMODE.FALL;
                }
            }
        };
        CollisionManager.prototype.playerVsFloor = function () {
            var floors = this.engine.floorManager.floors;
            var player = this.engine.player;
            var max = floors.length;
            player.onGround = false;
            if (player.position.y > 610) {
                if (this.engine.isPlaying) {
                    player.boil();
                    this.engine.view.doSplash();
                    this.engine.gameover();
                }
                else {
                    player.speed.x *= 0.95;
                    if (!ECS.GameConfig.interactive) {
                        //game end
                        //showGameover();
                        ECS.GameConfig.interactive = true;
                    }
                    if (player.bounce === 0) {
                        player.bounce++;
                        player.boil();
                        this.engine.view.doSplash();
                    }
                    return;
                }
            }
            for (var i = 0; i < max; i++) {
                var floor = floors[i];
                var xdist = floor.x - player.position.x + 1135;
                if (player.position.y > 477) {
                    if (xdist > 0 && xdist < 1135) {
                        if (player.isDead) {
                            player.bounce++;
                            if (player.bounce > 2) {
                                return;
                            }
                            //FidoAudio.play('thudBounce');
                            player.speed.y *= -0.7;
                            player.speed.x *= 0.8;
                            if (player.rotationSpeed > 0) {
                                player.rotationSpeed = Math.random() * -0.3;
                            }
                            else if (player.rotationSpeed === 0) {
                                player.rotationSpeed = Math.random() * 0.3;
                            }
                            else {
                                player.rotationSpeed = 0;
                            }
                        }
                        else {
                            player.speed.y = -0.3;
                        }
                        if (!player.isFlying) {
                            player.position.y = 478;
                            player.onGround = true;
                        }
                    }
                }
            }
            if (player.position.y < 0) {
                //player.position.y = 0;
                //player.speed.y *= 0;
            }
        };
        return CollisionManager;
    }());
    ECS.CollisionManager = CollisionManager;
})(ECS || (ECS = {}));
/* =========================================================================
 *
 *  GamePartical.ts
 *  partical effect
 *
 * ========================================================================= */
var ECS;
(function (ECS) {
    var ExplosionPartical = /** @class */ (function () {
        function ExplosionPartical(id) {
            PIXI.Sprite.call(this, PIXI.Texture.fromFrame(id));
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;
            this.speed = new PIXI.Point();
        }
        return ExplosionPartical;
    }());
    ECS.ExplosionPartical = ExplosionPartical;
    ExplosionPartical.prototype = Object.create(PIXI.Sprite.prototype);
    var Explosion = /** @class */ (function () {
        function Explosion() {
            PIXI.DisplayObjectContainer.call(this);
            this.particals = [];
            this.top = new ExplosionPartical("asplodeInner02.png");
            this.bottom = new ExplosionPartical("asplodeInner01.png");
            this.top.position.y = -20;
            this.bottom.position.y = 20;
            this.top.position.x = 20;
            this.bottom.position.x = 20;
            this.anchor = new PIXI.Point();
            this.addChild(this.top);
            this.addChild(this.bottom);
            this.particals = [this.top, this.bottom];
            for (var i = 0; i < 5; i++) {
                this.particals.push(new ExplosionPartical("asplodeSpike_01.png"));
                this.particals.push(new ExplosionPartical("asplodeSpike_02.png"));
            }
            this.clouds = [];
            for (var i = 0; i < 5; i++) {
                var cloud = new PIXI.Sprite.fromFrame("dustSwirl.png");
                this.clouds.push(cloud);
                this.addChild(cloud);
            }
            this.reset();
        }
        return Explosion;
    }());
    ECS.Explosion = Explosion;
    Explosion.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    Explosion.prototype.explode = function () {
        this.exploding = true;
    };
    Explosion.prototype.reset = function () {
        for (var i = 0; i < 5; i++) {
            var cloud = this.clouds[i];
            cloud.anchor.x = 0.5;
            cloud.anchor.y = 0.5;
            cloud.scaleTarget = 2 + Math.random() * 2;
            cloud.scale.x = cloud.scale.x = 0.5;
            cloud.alpha = 0.75;
            cloud.position.x = (Math.random() - 0.5) * 150;
            cloud.position.y = (Math.random() - 0.5) * 150;
            cloud.speed = new PIXI.Point(Math.random() * 20 - 10, Math.random() * 20 - 10);
            cloud.state = 0;
            cloud.rotSpeed = Math.random() * 0.05;
        }
        for (var i = 0; i < this.particals.length; i++) {
            var partical = this.particals[i];
            this.addChild(partical);
            var angle = (i / this.particals.length) * Math.PI * 2;
            var speed = 7 + Math.random();
            partical.directionX = Math.cos(angle) * speed;
            partical.directionY = Math.sin(angle) * speed;
            partical.rotation = -angle;
            partical.rotationSpeed = Math.random() * 0.02;
        }
    };
    Explosion.prototype.updateTransform = function () {
        if (this.exploding) {
            for (var i = 0; i < this.clouds.length; i++) {
                var cloud = this.clouds[i];
                cloud.rotation += cloud.rotSpeed;
                if (cloud.state === 0) {
                    cloud.scale.x += (cloud.scaleTarget - cloud.scale.x) * 5;
                    cloud.scale.y = cloud.scale.x;
                    if (cloud.scale.x > cloud.scaleTarget - 0.1)
                        cloud.state = 1;
                }
                else {
                    cloud.position.x += cloud.speed.x * 0.05;
                    cloud.position.y += cloud.speed.y * 0.05;
                }
            }
            for (var i = 0; i < this.particals.length; i++) {
                var partical = this.particals[i];
                partical.directionY += 0.1;
                partical.directionX *= 0.99;
                partical.position.x += partical.directionX;
                partical.position.y += partical.directionY;
                partical.rotation += partical.rotationSpeed;
            }
        }
        PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
    };
})(ECS || (ECS = {}));
