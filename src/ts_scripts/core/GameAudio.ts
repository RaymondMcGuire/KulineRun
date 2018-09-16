/* =========================================================================
 *
 *  GameAudio.ts
 *  music for game(using cocoonjs and howl)
 *
 * ========================================================================= */
/// <reference path="./GameLocalData.ts" />
/// <reference path="./GameConfig.ts" />
/// <reference path="./Utils.ts" />
 module ECS{

    declare var CocoonJS:any;
    declare var Howl:any;
    declare var Howler:any;
    declare var TweenLite:any;
    
     export class GameAudio{
        soundPool:any = {};
        DEFAULT_FADE_OUT_TIME:any = 1;
        DEFAULT_FADE_IN_TIME:any = 1;
        MUTE_ALL:any = false;
    
        device:any = new Utils.DeviceDetect();
        localData:any = new GameLocalData(GameConfig.localID);

        soundList:any;
        constructor(){
            this.soundList = [{
                src: 'audio/mainLoop',
                volume: 0.6,
                maxVolume: 0.6,
                loop: true,
                autoPlay: false,
                type: 'music',
                name: 'gameMusic'
            }];
            this.init();
        }

        init() {
            if (this.device.cocoonJS === true) {
                for (var i = 0; i < this.soundList.length; i++) {
                    var cSound = this.soundList[i];
    
                    switch (cSound.type) {
                        case 'music':
    
                            CocoonJS.App.markAsMusic(cSound.src + ".ogg");
    
                            var music = document.createElement('audio');
                            music.src = cSound.src + ".ogg";
                            music.loop = cSound.loop;
    
                            cSound.audio = new CocoonJS.Music().setAudio(music);
                            cSound.audio.volume(cSound.volume);
    
                            this.soundPool[cSound.name] = cSound;
    
                            if (cSound.autoPlay === true) this.soundPool[cSound.name].audio.play();
    
                            break;
    
                        case 'sfx':
    
                            var sfx = new Audio();
                            sfx.src = cSound.src + ".ogg";
                            cSound.audio = new CocoonJS.Audio().setAudio(sfx);
                            cSound.audio.volume(cSound.volume);
    
                            this.soundPool[cSound.name] = cSound;
    
                            break;
                    }
                }
            } else {
                for (var i = 0; i < this.soundList.length; i++) {
                    var cSound = this.soundList[i];
    
                    cSound.audio = new Howl({
                        urls: [cSound.src + ".mp3"],
                        autoplay: cSound.autoPlay,
                        loop: cSound.loop,
                        volume: cSound.volume,
                        onload: function() {
                            //alert('loaded');
                        },
                        onend: function() {
                            //alert('finished playing sound');
                        },
                        onloaderror: function() {
                            alert('ERROR : Failed to load ' + cSound.src + ".m4a");
                        },
                        onplay: function() {
                            //alert('playing');
                        }
                    });
    
                    this.soundPool[cSound.name] = cSound;
                }
            }
    
            if (this.localData.get('gameMuted') === 'true') this.muteAll();
        }
    
        isMuted() {
            return this.MUTE_ALL;
        }
    
        muteAll() {
            this.MUTE_ALL = true;
            this.localData.store('gameMuted', true);
    
            if (this.device.cocoonJS === true) {
    
                for (var sKey in this.soundPool) {
                    var cSound = this.soundPool[sKey];
    
                    var holder = {
                        volume: cSound.audio.getVolume()
                    };
    
                    this.muteOneSound(cSound, holder);
                }
            } else {
                var cHolder = {
                    volume: 1
                };
    
                TweenLite.to(cHolder, 1, {
                    volume: 0,
                    onUpdate: function() {
                        Howler.volume(this.target.volume);
                    },
                    onComplete: function() {
                        Howler.mute();
                    }
                });
            }
        }
    
        muteOneSound(cSound, holder) {
            TweenLite.to(holder, 1, {
                volume: 0,
                onUpdate: function() {
                    cSound.audio.volume(this.target.volume);
                }
            });
        }
    
        unMuteOneSound(cSound, holder) {
            TweenLite.to(holder, 1, {
                volume: cSound.volume,
                onUpdate: function() {
                    cSound.audio.volume(this.target.volume);
                }
            });
        }
    
        unMuteAll() {
            this.MUTE_ALL = false;
            this.localData.store('gameMuted', false)
    
            if (this.device.cocoonJS === true) {
                for (var sKey in this.soundPool) {
                    var cSound = this.soundPool[sKey];
                    this.unMuteOneSound(cSound, {
                        volume: 0
                    });
                }
            } else {
                var cHolder = {
                    volume: 0
                };
    
                Howler.unmute();
    
                TweenLite.to(cHolder, 1, {
                    volume: 1,
                    onUpdate: function(cObject, sProperty) {
                        Howler.volume(this.target.volume);
                    }
                });
            }
        }
    
        play(id) {
            if (this.soundPool.hasOwnProperty(id)) {
                this.soundPool[id].audio.play();
    
            } else {
                console.log("WARNING :: Couldn't find sound '" + id + "'.");
            }
        }
    
        fadeOut(sKey) {
            var cSound = this.soundPool[sKey];
    
            var holder = {
                volume: 0
            };
    
            this.muteOneSound(cSound, holder);
        }
    
        fadeIn(id, time) {
            if (!this.soundExists(id)) return;
    
            var cSound = this.soundPool[id];
            var nFadeInTime = time || this.DEFAULT_FADE_IN_TIME;
    
            var cHolder = {
                volume: 0
            };
    
            TweenLite.to(cHolder, nFadeInTime, {
                volume: cSound.maxVolume,
                onUpdate: function(cObject, sProperty) {
                    this.setVolume(id, this.target.volume);
                }
            });
        }
    
        soundExists(id) {
            return this.soundPool.hasOwnProperty(id);
        }
    
        setVolume(id, volume) {
            if (!this.soundExists(id)) return;
    
            if (this.MUTE_ALL === true) {
                this.soundPool[id].volume = volume;
            } else {
                this.soundPool[id].audio.volume(volume);
            }
        }
    
        stop(id) {
            this.soundPool[id].audio.stop();
        }
     }
 }