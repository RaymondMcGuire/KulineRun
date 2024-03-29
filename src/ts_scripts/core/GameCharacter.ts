/* =========================================================================
 *
 *  GameCharacter.ts
 *  character controller
 *
 * ========================================================================= */
/// <reference path="./GameConfig.ts" />
/// <reference path="./GameBackGround.ts" />
/// <reference path="./GameManager.ts" />
module ECS {
    declare var PIXI: any;
    declare var TweenLite: any;
    declare var Cubic: any;

    export class GameCharacter{
        position:any;
        runningFrames:any;
        jumpFrames:any;
        slideFrame:any;
        dashFrames:any;
        shootFrame:any;
        indoTightFrame:any;
        marioFrame:any;

        view:any;
        ground:number;
        gravity:number;
        baseSpeed:number;
        speed:any;
        activeCount:number;
        isJumped:boolean;
        accel:number;
        width:number;
        height:number;
        onGround:boolean;
        rotationSpeed :number;
        joyRiding :boolean;
        level :number;
        realAnimationSpeed :number;
        volume :number;
        isDead:boolean;
        isActive:boolean;
        bounce:number;

        floorHeight:number;
        floorSpriteHeight:number;

        vStart:number;
        mass:number;
        angle:number;
        isSlide:boolean=false;
        startJump:boolean;
        b_jumpTwo:boolean;
        smooth:number;
        cnt:number;

        specialEffectView:any;
        shinobiEffect1:any;
        shinobiEffect2:any;
        shinobiEffect3:any;
        backEffect:any;

        marioEffect:any;
        indoEffect:any;
        indonTight:any;

        ninjiaEffectNumber:number =0;
        isPlayingNinjiaEffect:boolean = false;
        isPlayingInoEffect:boolean = false;

        //speed up
        speedUpList:any;

        constructor(){

            //console.log("init character!");
            this.position = new PIXI.Point();
            this.speedUpList = [];
	
            this.runningFrames = [
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-01.png"),
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-02.png"),
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-03.png"),
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-04.png"),
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-05.png"),
                PIXI.Texture.fromFrame("CHARACTER/RUN/Character-06.png"),
            ];

            this.indoTightFrame =[
                PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/INDONTIGHT/boom0001.png"),
                PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/INDONTIGHT/boom0002.png"),
                PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/INDONTIGHT/boom0003.png"),
                PIXI.Texture.fromFrame("CHARACTER/POWER EFFECTS/INDONTIGHT/boom0004.png")
            ]

            this.jumpFrames =[
                PIXI.Texture.fromFrame("CHARACTER/JUMP/Jump.png"),
            ];

            this.slideFrame =[
                PIXI.Texture.fromFrame("CHARACTER/SLIDE/Slide.png"),
            ];
            
            this.dashFrames = [
                PIXI.Texture.fromFrame("CHARACTER/POWER/DASH/dash0002.png")
            ];
            
            this.shootFrame = [
                PIXI.Texture.fromFrame("CHARACTER/POWER/SHOOT/shoot0001.png"),
                PIXI.Texture.fromFrame("CHARACTER/POWER/SHOOT/shoot0002.png")
            ];

            this.view = new PIXI.extras.AnimatedSprite(this.runningFrames);
            this.view.animationSpeed = 0.23;
            
            this.view.anchor.x = 0.5;
            this.view.anchor.y = 0.5;
            this.view.height=115 *GameConfig.height /GameConfig.fixedHeight;
            this.view.width=65*GameConfig.height /GameConfig.fixedHeight;
            this.position.x =  (<GameBackGroundSystem>(GameConfig.allSystem.get("background"))).bgTex.spriteWidth +100;
            if(!GameConfig.device.desktop) this.position.x =  2*(<GameBackGroundSystem>(GameConfig.allSystem.get("background"))).bgTex.spriteWidth +100;

            this.floorSpriteHeight = (<GameBackGroundSystem>(GameConfig.allSystem.get("background"))).bgTex.spriteHeight;

            //refresh floor position
            this.refreshFloorHeight();

            this.gravity = 9.8;
            
            this.baseSpeed = 12;
            this.speed = new PIXI.Point(this.baseSpeed, 0);
            
            this.activeCount = 0;
            this.isJumped = false;
            this.accel =0;
            
            this.width = 26
            this.height = 37;
            
            this.onGround = true;
            this.rotationSpeed = 0;
            this.joyRiding = false;
            this.level = 1;
            this.realAnimationSpeed = 0.23;
            
            this.volume = 0.3;

            //start speed
            this.vStart = 35;
            this.mass = 65;
            this.angle =Math.PI * 45/360;
            this.startJump =false;
            this.b_jumpTwo = false;
            this.smooth = 0.05;
            this.cnt =0;

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


            this.indonTight = new PIXI.extras.AnimatedSprite(this.indoTightFrame);
            this.indonTight.animationSpeed = 0.1;
            
            this.indonTight.anchor.x = 0.5;
            this.indonTight.anchor.y = 0.5;
            this.indonTight.height=GameConfig.height/2;
            this.indonTight.width=GameConfig.width/2;

            this.view.play();
            //GameConfig.app.start();
        }

        update()
        {
            if(this.isDead)
            {
                this.updateDieing();
            }
            else
            {
                this.updateRunning();
            }
        }

        normalMode()
        {
            this.joyRiding = false;

            TweenLite.to(this.speed, 0.6, {
                x : this.baseSpeed, 
                ease : Cubic.easeOut
            });
            this.realAnimationSpeed = 0.23;
        }

        chkOnGround(){

            if(this.onGround){
                return true;
            }

            return false;
        }


        resetSpecialFoods(){
            for(var i =0;i<4;i++){
                GameConfig.game.view.specialFood.digits[i].texture = GameConfig.game.view.specialFood.foods[i];
            }
        }

        ninjiaOperate(){
            if(this.ninjiaEffectNumber <3 && !this.isPlayingNinjiaEffect){
                //console.log("dash");
                this.isPlayingNinjiaEffect=true;
                GameConfig.tmpTimeClockStart = GameConfig.time.currentTime;
                this.view.addChild(this.specialEffectView);
                
                switch(this.ninjiaEffectNumber){
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
                
                this.speed.x*=10;
                this.ninjiaEffectNumber++;
            }
        }

        indoOperate(){
            if(!this.isPlayingInoEffect){
                //chara animation
                this.view.textures = this.shootFrame;
                this.view.play();

                GameConfig.tmpTimeClockStart = GameConfig.time.currentTime;
                this.view.addChild(this.indoEffect);
                
                //effect play
                (<GameViewSystem>(GameConfig.allSystem.get("view"))).game.addChild(this.indonTight);
                this.indonTight.textures = this.indoTightFrame;
                this.indonTight.play();
                this.isPlayingInoEffect = true;
            }
        }

        ninjaMode(){


            if(this.isPlayingNinjiaEffect){
                GameConfig.tmpTimeClockEnd = GameConfig.time.currentTime;
                var DuringTime = GameConfig.timeClock();
                //console.log(DuringTime);
                if(DuringTime > 200){
                    this.view.textures = this.runningFrames;
                    this.view.play();
                    this.speed.x/=10;
     
                    this.view.removeChild(this.specialEffectView);
                    this.isPlayingNinjiaEffect = false;
                    if(this.ninjiaEffectNumber ==3){
                      
                            this.ninjiaEffectNumber =0;
                            GameConfig.specialMode = SPECIALMODE.NONE;
                            GameConfig.game.pickupManager.pickedUpPool = [];
                            GameConfig.game.pickupManager.canPickOrNot = true;
                            this.resetSpecialFoods();
                            this.view.removeChild(this.backEffect);
                            //console.log("ninja finished!");
            
                    }
                }
            }
       
        }

        marioMode(){
            GameConfig.tmpTimeClockEnd = GameConfig.time.currentTime;
            var DuringTime = GameConfig.timeClock();
            //console.log(DuringTime);
            if(DuringTime > 10000){
                //console.log("mario finished!");
                GameConfig.specialMode = SPECIALMODE.NONE;
                GameConfig.game.pickupManager.pickedUpPool = [];
                GameConfig.game.pickupManager.canPickOrNot = true;
                this.speed.x/=2;
                this.view.removeChild(this.marioEffect);
                this.resetSpecialFoods();
                GameConfig.audio.stop("superMarioMode");
                GameConfig.audio.play("GameMusic");
            }
        }

        indoMode(){
            if(this.isPlayingInoEffect){

                this.indonTight.position.x = this.position.x - GameConfig.camera.x;
                this.indonTight.position.y = this.position.y - GameConfig.camera.y;
                GameConfig.tmpTimeClockEnd = GameConfig.time.currentTime;
                var DuringTime = GameConfig.timeClock();
                if(DuringTime > 1000){
                    //console.log("indo finished!");
                    this.isPlayingInoEffect = false;
                    GameConfig.specialMode = SPECIALMODE.NONE;
                    GameConfig.game.pickupManager.pickedUpPool = [];
                    GameConfig.game.pickupManager.canPickOrNot = true;

                    (<GameViewSystem>(GameConfig.allSystem.get("view"))).game.removeChild(this.indonTight);
                    this.view.removeChild(this.indoEffect);
                    this.resetSpecialFoods();
                }
            }

        }

        refreshFloorHeight(){
            this.floorHeight = this.floorSpriteHeight - this.view.height * 0.5;
            this.view.position.y =this.floorHeight;
            this.position.y = this.floorHeight;
            this.ground = this.floorHeight;
        }

        updateRunning()
        {
            this.view.animationSpeed = this.realAnimationSpeed * GameConfig.time.DELTA_TIME * this.level;
            this.indonTight.animationSpeed = this.realAnimationSpeed * GameConfig.time.DELTA_TIME * this.level;


            //speed up when user reach some points
            var judgeImPoints = Math.floor(GameConfig.game.distanceScore / 2);
            if(judgeImPoints!=0 && !this.speedUpList.includes(judgeImPoints) && GameConfig.game.distanceScore<20){
                //console.log("speed up!");
                this.speedUpList.push(judgeImPoints);
                this.speed.x *=1.1;
            }
            


            switch( GameConfig.playerMode){
                case PLAYMODE.JUMPING1:
  
                    this.speed.y = -this.vStart * Math.sin(this.angle) ;  
                break;
                case PLAYMODE.JUMPING2:
                
                    this.speed.y = -this.vStart * Math.sin(this.angle) ;  
                break;
                case PLAYMODE.FALL:
                    //should have gravity
                     this.speed.y += this.gravity  * GameConfig.time.DELTA_TIME *this.smooth;
                break;
                case PLAYMODE.RUNNING:
                    this.speed.y=0;
                break;
                case PLAYMODE.SLIDE:
                this.speed.y=0;
                break;
                
            }


            if(!this.chkOnGround() && (GameConfig.playerMode == PLAYMODE.JUMPING1 || GameConfig.playerMode == PLAYMODE.JUMPING2 ))GameConfig.playerMode = PLAYMODE.FALL;
            else if(GameConfig.playerMode == PLAYMODE.FALL &&  this.chkOnGround()) GameConfig.playerMode = PLAYMODE.RUNNING; 
          
            
            this.position.x += this.speed.x * GameConfig.time.DELTA_TIME * this.level;
            this.position.y += this.speed.y * GameConfig.time.DELTA_TIME;
    
            if(this.onGround && GameConfig.playerMode == PLAYMODE.RUNNING &&  this.view.textures != this.runningFrames && !this.isPlayingInoEffect)
            {
                this.view.anchor.y = 0.5;
                this.view.textures = this.runningFrames;
                this.view.play();
            }else if(GameConfig.playerMode == PLAYMODE.SLIDE &&  this.view.textures != this.slideFrame ){
                this.view.anchor.y = 0.1;
                this.view.textures = this.slideFrame;
                this.view.play();
            }else if((GameConfig.playerMode == PLAYMODE.JUMPING1  || GameConfig.playerMode == PLAYMODE.JUMPING2) &&  this.view.textures != this.jumpFrames){
                this.view.textures = this.jumpFrames;
                this.view.play();
            }


            switch(GameConfig.specialMode){
                case SPECIALMODE.NONE:
                
                break;
                case SPECIALMODE.NINJAMODE:
                this.marioMode();
        

                break;
                case SPECIALMODE.JAPANMODE:
                if(this.ninjiaEffectNumber<=3){
                    this.ninjaMode();
                }


                break;
                case SPECIALMODE.INDONMODE:
                
                this.indoMode();
 
                break;
            }

    
            GameConfig.camera.x = this.position.x - 100;
            GameConfig.game.distanceScore = Math.floor(this.position.x/10000);
            
            this.view.position.x = this.position.x - GameConfig.camera.x;
            this.view.position.y = this.position.y - GameConfig.camera.y;


            this.view.rotation += (this.speed.y * 0.05 - this.view.rotation) * 0.1;
        }

        updateDieing()
        {
            this.speed.x *= 0.999;
            
            if(this.onGround) this.speed.y *= 0.99;
            
            this.speed.y += 0.1;
            this.accel += (0 - this.accel) * 0.1 * GameConfig.time.DELTA_TIME;
            
            this.speed.y += this.gravity  * GameConfig.time.DELTA_TIME;;
            
            this.position.x += this.speed.x  * GameConfig.time.DELTA_TIME;;
            this.position.y += this.speed.y  * GameConfig.time.DELTA_TIME;;

            GameConfig.camera.x = this.position.x - 100;
            
            this.view.position.x = this.position.x - GameConfig.camera.x;
            this.view.position.y = this.position.y - GameConfig.camera.y;
            
            if(this.speed.x < 5)
            {
                this.view.rotation += this.rotationSpeed * (this.speed.x / 5) * GameConfig.time.DELTA_TIME;
            }
            else
            {
                this.view.rotation += this.rotationSpeed * GameConfig.time.DELTA_TIME;
            }
        }
        
        jump()
        {
            if(this.isDead)
            {
                if(this.speed.x < 5)
                {
                    this.isDead = false
                    this.speed.x = 10;
                }
            }

            this.startJump = true;
            GameConfig.playerMode = PLAYMODE.JUMPING1;
        }

        jumpTwo()
        {
            if(this.isDead)
            {
                if(this.speed.x < 5)
                {
                    this.isDead = false
                    this.speed.x = 10;
                }
            }

            this.startJump = false;
            GameConfig.playerMode = PLAYMODE.JUMPING2;
        
        }

        slide(isSlide:boolean){
                 if(this.isDead)
                 {
                     if(this.speed.x < 5)
                     {
                         this.isDead = false
                         this.speed.x = 10;
                     }
                 }

                // console.log(isSlide);
                 
                 if(GameConfig.playerMode != PLAYMODE.SLIDE && this.position.y == this.ground)
                 {
                     this.isSlide = isSlide;
                     if(isSlide) GameConfig.playerMode = PLAYMODE.SLIDE;
                     
                 }else if(!isSlide){
                    //console.log("slide finish");
                    this.onGround = true;
                    this.position.y = this.ground;
                    this.isSlide = isSlide;
                    GameConfig.playerMode = PLAYMODE.RUNNING;
                 }
        }



        die()
        {
            if(this.isDead) return;

            GameConfig.audio.play("playerDead");
            TweenLite.to(GameConfig.time, 0.5, {
                speed : 0.1, 
                ease : Cubic.easeOut, 
                onComplete : function()
                {
                    TweenLite.to(GameConfig.time, 2, {
                        speed : 1, 
                        delay : 1
                    });
                }
            });

            this.isDead = true;
            this.bounce = 0;
            this.speed.x = 15;
            this.speed.y = -15;
            this.rotationSpeed = 0.3;
            this.view.stop();
        }


        boil()
        {
            if(this.isDead) return;
        
            
            this.isDead = true;
        }

        fall()
        {
            this.startJump = false;
            //this.b_jumpTwo = false;
            this.isJumped = true;
        }

        isAirbourne(){}

        stop()
        {
            this.view.stop();
        }

        resume()
        {
            this.view.play();
        }
    }



    export class GameEnemy{

        position:any;
        view:any;
        isHit:boolean;
        width:number;
        height:number;

        moveingFrames:any;
        stealFrames:any;
        
        speed:number;
        isEatNow:boolean=false;
        isExploded:boolean = false;
        constructor(){
            this.position = new PIXI.Point();
                        
            this.isHit = false;
            this.width = 150;
            this.height = 150;
            this.speed = -10 + Math.random()*20;;

            this.moveingFrames = [
                PIXI.Texture.fromFrame("CHARACTER/NEKO/WALK/neko0001.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/WALK/neko0002.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/WALK/neko0003.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/WALK/neko0004.png"),
            ];

            this.stealFrames =[
                PIXI.Texture.fromFrame("CHARACTER/NEKO/STEAL/steal0001.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/STEAL/steal0002.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/STEAL/steal0003.png"),
                PIXI.Texture.fromFrame("CHARACTER/NEKO/STEAL/steal0004.png")
            ]

            this.view = new PIXI.extras.AnimatedSprite(this.moveingFrames);
            this.view.animationSpeed = 0.23;
            
            this.view.anchor.x = 0.5;
            this.view.anchor.y = 0.5;

            this.view.height =  GameConfig.height * 130/GameConfig.fixedHeight;
            this.view.width =  GameConfig.height * 130/GameConfig.fixedHeight;

            this.view.play();
        }

        reset(){
            
            this.isHit = false;

        }

        hit()
        {   
            if(this.isHit) return;
            this.isHit = true;
            
            GameConfig.audio.play("catDead");
            this.view.setTexture(PIXI.Texture.fromImage("img/empty.png"))
        }

        update()
        {
            this.view.animationSpeed = 0.23 * GameConfig.time.DELTA_TIME;

            this.view.position.x = this.position.x - GameConfig.camera.x ;

            if(!this.isEatNow){
                this.position.x += this.speed  * Math.sin(GameConfig.time.DELTA_TIME);
                GameConfig.tmpTimeClockStart1 = GameConfig.time.currentTime;
            }else{
                GameConfig.tmpTimeClockEnd1 = GameConfig.time.currentTime;
                if(GameConfig.timeClock1()>2000){
                    this.isEatNow = false;
                    this.view.textures = this.moveingFrames;
                    this.view.play();
                    GameConfig.audio.play("catCome");
                }
            }
            this.view.position.y = this.position.y;
        }
    }
}