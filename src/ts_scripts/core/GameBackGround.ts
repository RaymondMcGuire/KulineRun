/* =========================================================================
 *
 *  GameBackGround.ts
 *  game view scene - background
 *
 * ========================================================================= */
/// <reference path="./System.ts" />
module ECS {
    declare var PIXI:any;

    export class BackGroundElement{
        sprites:any;
        spriteWidth:number;
        spriteHeight:number;
        speed;number;
        constructor(texture:any,y:number,owner:any,width:number=940){
            this.sprites = [];
            this.spriteWidth = texture.width-5;
            this.spriteHeight = texture.height-1;
            var amount = Math.ceil(width / this.spriteWidth);
            if(amount < 3)amount = 3;
            
            for (var i=0; i < amount; i++) 
            {
                var sprite = new PIXI.Sprite(texture);
                //sprite.position.y = y;
                owner.addChild(sprite);
                this.sprites.push(sprite);
            };	
                          
            this.speed = 1;
        }

        setPosition(position:any){
            var h = this.spriteWidth;
            
            for (var i=0; i < this.sprites.length; i++) 
            {
                var pos = -position * this.speed;
                pos += i *  h ;
                pos %=  h * this.sprites.length ;
                pos +=  h/2;

                this.sprites[i].position.x = pos;
            };	
        }
    }

    export class GameBackGroundSystem extends System{

        vines:GameVines;

        width:number;
        scrollPosition:number;
        bgTex:BackGroundElement;
        rearSilhouette:any;
        rearCanopy:BackGroundElement;
        farCanopy:BackGroundElement;
        roofLeaves:BackGroundElement;
        frontSilhouette:BackGroundElement;

        tree1:any;
        tree2:any;
        cloud1:any;
        cloud2:any;
        BackGroundContainer:any;

        constructor(){
                super("view-background")
                //PIXI.DisplayObjectContainer.call( this );
                this.BackGroundContainer = new PIXI.Container();

                this.width = GameConfig.width;
                this.scrollPosition = 1500;

                var bgTex = PIXI.loader.resources["img/bg_up.png"].texture;

                this.bgTex = new BackGroundElement(bgTex, -195, this.BackGroundContainer);

                this.tree1 = PIXI.Sprite.fromFrame("tree1.png");
                this.tree1.anchor.x = 0.5;
                this.tree1.anchor.y = 0.5;
                this.tree1.width = 200;
                this.tree1.height = 350;

                this.tree1.position.y = this.bgTex.spriteHeight - this.tree1.height/2;

                this.BackGroundContainer.addChild(this.tree1);
                
                this.tree2 = PIXI.Sprite.fromFrame("tree2.png");
                this.tree2.anchor.x = 0.5;
                this.tree2.anchor.y = 0.5;
                this.tree2.width = 200;
                this.tree2.height = 350;
                this.tree2.position.y = this.bgTex.spriteHeight - this.tree2.height/2;

                this.BackGroundContainer.addChild(this.tree2);

                this.cloud1 = PIXI.Sprite.fromFrame("cloud1.png");
                this.cloud1.position.y = GameConfig.height/5;
                this.BackGroundContainer.addChild(this.cloud1);
                
                this.cloud2 = PIXI.Sprite.fromFrame("cloud2.png");
                this.cloud2.position.y = GameConfig.height/8;
                this.BackGroundContainer.addChild(this.cloud2);;
                
                this.bgTex.speed = 1/2;

                GameConfig.app.ticker.add((delta)=> {
                   // console.log("background run!");
                    this.scrollPosition = GameConfig.camera.x + 8000;

                    var intervalDistance = GameConfig.width;
                    
                    var treePos = -this.scrollPosition * 1.5/2;
                    treePos %= this.width + intervalDistance;
                    treePos += this.width + intervalDistance;
                    treePos -= this.tree1.width/2;
                    this.tree1.position.x = treePos -GameConfig.xOffset;
                    
                    var treePos2 = -(this.scrollPosition + this.width/2) * 1.5/2;
                    treePos2 %= this.width + intervalDistance;
                    treePos2 += this.width + intervalDistance;
                    treePos2 -= this.tree2.width/2;
                    this.tree2.position.x = treePos2 -GameConfig.xOffset;
            
                    var cloud1Pos = -this.scrollPosition * 1.5/2;
                    cloud1Pos %= this.width + intervalDistance;
                    cloud1Pos += this.width + intervalDistance;
                    cloud1Pos -= this.cloud1.width/2;
                    this.cloud1.position.x = cloud1Pos -GameConfig.xOffset;
                    
                    var cloud2Pos = -(this.scrollPosition + this.width/2) * 1.5/2;
                    cloud2Pos %= this.width + intervalDistance;
                    cloud2Pos += this.width + intervalDistance;
                    cloud2Pos -= this.cloud2.width/2;
                    this.cloud2.position.x = cloud2Pos -GameConfig.xOffset;
    
                    this.bgTex.setPosition(this.scrollPosition);
                });
        }
    }
    //GameBackground.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
                        
    // GameBackground.prototype.updateTransform = function()
    // {
    //     this.scrollPosition = GameConfig.camera.x + 8000;

    //     var treePos = -this.scrollPosition * 1.5/2;
    //     treePos %= this.width + 556;
    //     treePos += this.width + 556;
    //     treePos -= this.tree1.width/2;
    //     this.tree1.position.x = treePos -GameConfig.xOffset;
        
    //     var treePos2 = -(this.scrollPosition + this.width/2) * 1.5/2;
    //     treePos2 %= this.width + 556;
    //     treePos2 += this.width + 556;
    //     treePos2 -= this.tree2.width/2;
    //     this.tree2.position.x = treePos2 -GameConfig.xOffset;

    //     var cloud1Pos = -this.scrollPosition * 1.5/2;
    //     cloud1Pos %= this.width + 556;
    //     cloud1Pos += this.width + 556;
    //     cloud1Pos -= this.cloud1.width/2;
    //     this.cloud1.position.x = cloud1Pos -GameConfig.xOffset;
        
    //     var cloud2Pos = -(this.scrollPosition + this.width/2) * 1.5/2;
    //     cloud2Pos %= this.width + 556;
    //     cloud2Pos += this.width + 556;
    //     cloud2Pos -= this.cloud2.width/2;
    //     this.cloud2.position.x = cloud2Pos -GameConfig.xOffset;
        
    //     this.bgTex.setPosition(this.scrollPosition);
    //     //this.rearSilhouette.setPosition(this.scrollPosition);
    //     //this.rearCanopy.setPosition(this.scrollPosition);
    //    // this.farCanopy.setPosition(this.scrollPosition);
    //     //this.frontSilhouette.setPosition(this.scrollPosition);
        
    //     //this.roofLeaves.setPosition(this.scrollPosition);
        
    //     //this.vines.setPosition(this.scrollPosition);
        
        
    //     PIXI.DisplayObjectContainer.prototype.updateTransform.call( this );
    // }
}