////////////////////////////////////////////////////////////////
//ゲーム開発の基本機能とよく使う関数ライブラリ
///////////////////////////////////////////////////////////////
//長さと角度からベクトルの幅、高さを求める
function decVector(length, angle){
    return{
        width: -length * trig.cos[angle],
        height: -length * trig.sin[angle],
    }
}
//ベクトルの計算
function getVectorData(w, h){
    var length = Math.sqrt(w * w + h * h);
    var unit_x, unit_y;
    if(w == 0 || h == 0){//0除算を避ける
        unit_x = w;
        unit_y = h;
    }else{
        unit_x = w / length;
        unit_y = h / length;
    }
    return {
        w: w, h: h, length: length, unit_x: unit_x, unit_y: unit_y,
    }
}
//ベクトル当たり判定
//直線の原点は真上進行状態で画像下部に来るようにしておくこと
function vecLinearCollision(r, vec1, vec2){//r:キャラクターの半径)
    //先に幅と高さで範囲内に入っているかチェック
    if(vec2.h > 0){
        if(vec1.h - vec2.h > r ||  vec1.h < -r)return;
    }else{
        if(vec1.h - vec2.h < -r || vec1.h > r)return;
    }
    if(vec2.w > 0){
        if(vec1.w - vec2.w > r || vec1.w < -r)return;
    }else{
        if(vec1.w - vec2.w < -r || -vec1.w < -r)return;//
    }
    //
    var result = (vec1.w * vec2.h - vec1.h * vec2.w) / vec2.length;
    if(result < r && result > -r){
        return true; 
    }
    return false;
}
//ベクトル当たり判定
function vecCollision(r, vec1, vec2){//r:キャラクターの半径、vec1:キャラクター、vec2:地面など障害物)
    var result = (vec1.x * vec2.y - vec1.y * vec2.x) / vec2.length;
    if(result - r <= 0){
        var pushback = [];
        pushback.x = (result - r) * vec2.unit_x;//90度角度が変わるためｘとｙが逆になる
        pushback.y = -(result - r) * vec2.unit_y;//90度角度が変わるためｘとｙが逆になる。さらにこっちはマイナスになる
        return pushback;//押し戻す量を返す
    }
    return false;
}

//************************************************************
//内容：三角関数クラス
//引数：unitValu:ラジアンの単位幅。基本0.01
var Trigonometry = enchant.Class.create({
    initialize: function(unitValue){
        //円運動用配列作成
        this.PI = Math.PI;//数学関数は毎回呼び出すより、保持している方が速いらしい。。
        this.abs = Math.abs;
        this.atan2 = Math.atan2;
        this.unitValue = unitValue;//角度の単位幅（ラジアン）
        this.rate = 1 / this.unitValue;//整数にするために掛ける倍率を計算
        this.toDegValue = 180 / this.PI * this.unitValue;//degreeに変えるための変数
        this.sin = [];
        this.cos = [];
        for(var rad = 0, j = 0; rad < 2 * this.PI; rad += this.unitValue, j++){
            this.sin[j] = Math.sin(rad);
            this.cos[j] = Math.cos(rad);
        }
        this.arrMax = this.sin.length;
    },
    //引数の角度の値を返す
    getData: function(angle){
        if(this.abs(angle) >= this.arrMax){//範囲を超えていた場合
            angle = angle % this.arrMax;
        }
        if(angle < 0){//マイナスの値だった場合
            angle = this.arrMax + angle;
        }
        return {
            sin: this.sin[angle],
            cos: this.cos[angle],
            deg: angle * this.toDegValue,
        };
    },
    //２点間の角度を返す
    getAimAngle: function(x1, y1, x2, y2){
        var angle = this.atan2(y1 - y2, x1 - x2) * this.rate | 0;
        if(angle < 0){
            angle += this.arrMax;
        }
        return angle;
    }
});
//****************************************************************
//内容：Labelクラスを継承した自作ラベルクラス
//説明：文字サイズとフォントを宣言時に引数で指定できる(引数は省略可。その時は初期値が入る)
//初期値：サイズ:25px、フォント:sans-serif、色:white
var MyLabel = enchant.Class.create(enchant.Label,{
    initialize: function(size, font){
        enchant.Label.call(this);
        this.size = 24;
        this.fontStyle = "sans-serif";
        if(font){
            this.fontStyle = font + ',' + this.fontStyle;
        }
        if(size){
            this.size = size;
        }
        this.font = this.size + "px " + this.fontStyle;
        this.color = "white";
        this.width = 640;
    },
});
//****************************************************************
//内容：指定の大きさと色の円を作る
//説明：
var DrawCircle = enchant.Class.create(enchant.Surface, {
    initialize: function(w, h, color){//w, hは幅と高さ
        enchant.Surface.call(this, w, h);
        this.context.beginPath();
        this.context.arc(w*0.5, h*0.5, w*0.5, 0, Math.PI*2, false);//原点X、原点Y、半径、始点ラジアン、終点ラジアン
        this.context.fillStyle = color;
        this.context.fill();
    },
});
//****************************************************************
//内容：指定の大きさと色の矩形を作る
//説明：
var DrawRectangle = enchant.Class.create(enchant.Surface, {
    initialize: function(w, h, color){//w, hは幅と高さ
        enchant.Surface.call(this, w, h);
        this.context.beginPath();
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, w, h);//X、Y、W、H
    },
});
//****************************************************************
//内容：ローカルストレージのデータ読み書き
//説明：nameで指定されたストレージのデータを読み書きする
var Storage = enchant.Class.create({
    initialize: function(name){
        this.name = name;
        this.data = {};
    },
    delete: function(){
        window.localStorage.removeItem(this.name);
    },
    load: function(){
        var data;
        if(window.localStorage){//ローカルストレージ機能が使用可能なら
            data =  JSON.parse(window.localStorage.getItem(this.name));
        }
        if(data){//
            this.data = data;
            //内容の確認
            /*
            for(var key in data){
                console.log(data[key]);
            }
            */
        }
    },
    save: function(){
        data = JSON.stringify(this.data);
        if(window.localStorage){
            window.localStorage.setItem(this.name, data); //data.nameというキーでdata変数を記録
        }
    }
});

//*************************************************************************
//内容:円のあたり判定
//説明:[x:キャラの原点x][y:キャラの原点y][r:キャラの半径]
function circleCollision(x1, y1, r1, x2, y2, r2){
    if((x1-x2) * (x1-x2) + (y1-y2) * (y1-y2) <= (r1+r2) * (r1+r2)){
        return true;
    }
    return false;
}
//*************************************************************************
//内容:矩形の当たり判定
//説明:[L1:キャラ１の左端座標][R1:キャラ1の右端座標][T1:キャラ１のトップ座標][B1:キャラ1のボトム座標][L2:キャラ2の左端座標][R2:キャラ2の右端座標][T2:キャラ2のトップ座標][B2:キャラ2のボトム座標]
function rectCollision(L1, R1, T1, B1, L2, R2, T2, B2){
    if(L2 <= R1 && L1 <= R2){
        if(T2 <= B1 && T1 <= B2){
            return true;
        }
    }
    return false;
}          

//*************************************************************************
//内容:Y座標のあたり判定
//説明:[T1:キャラ１のトップ座標][B1:キャラ1のボトム座標][T2:キャラ2のトップ座標][B2:キャラ2のボトム座標]
function hitY(T1, B1, T2, B2){
    if((T1 <= T2 && B1 >= B2) || (B1 >= T2 && B1 <= B2) || (T1 >= T2 && T1 <= B2)){
        return true;                
    }
    return false;
}

//*************************************************************************
//内容:X座標のあたり判定
//説明:[L1:キャラ１の左端座標][R1:キャラ1の右端座標][L2:キャラ2の左端座標][R2:キャラ2の右端座標]
function hitX(L1, R1, L2, R2){
    if((L1 <= L2 && R1 >= R2) || (R1 >= L2 && R1 <= R2) || (L1 >= L2 && L1 <= R2)){
        return true;                
    }
    return false;
}          

//*************************************************************************
//内容:シーン内の子要素を全削除関数
function removeChildren(parent){
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}
//************************************************************************
//内容：min～maxの整数をランダムで返す
function random(min,max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
//************************************************************************
//内容：音の再生(同一音の複数同時再生可能）
var SoundEffect = enchant.Class.create({
    //ファイルセット関数(引数：ファイル、オブジェクト作成数(※必ず1以上)）
    set: function(data, max){
        this.sound = [];//サウンドオブジェクト保存用
        this.count = 0;//カウント用初期化
        this.max = max;//同時再生最大数
        for(var i = 0; i < this.max; i++){
            this.sound[i] = data.clone();    
        }
    },
    //再生関数(クローンを順繰りに再生) 
    play: function(){
        this.sound[this.count++].play();
        if(this.count >= this.max){
            this.count = 0;
        }
    },
    //一時停止(現在一時停止はできるが、鳴っていた音だけを続きから再生することができていない)
    pause: function(){
        for(var i = 0; i < this.max; i++){
            this.sound[i].pause();
        }
    }
});
//************************************************************************
//内容：BGM再生(ループ再生）、一時停止、停止
var Bgm = enchant.Class.create({
    initialize: function(){
        this.data = null;
        this.isPlay = false;//プレイの状態フラグ
        this.isPuase = false;
    },
    //BGM用音楽ファイルのセット
    set: function(data){
        this.data = data;
    },
    //再生(再生のみに使う)
    play: function(){
        this.data.play();
        this.isPlay = true;
        if(this.data.src != undefined){//srcプロパティを持っている場合(スマホの場合)
            this.data.src.loop = true;
        }
    },
    //再生(ループ無しの再生)
    playNoLoop: function(){
        this.data.play();
        this.isPlay = true;
        if(this.data.src != undefined){//srcプロパティを持っている場合(スマホの場合)
            this.data.src.loop = false;
        }
    },
    //ループ再生(必ずループ内に記述すること) PCでのループ再生で使う
    loop: function(){
        if(this.isPlay == true && this.data.src == undefined){//再生中でsrcプロパティを持っていない場合(PC)
            this.data.play();
            this.isPuase = false;//ポーズ画面から戻った場合は自動的に再生を再開させる（ポーズ解除を作るのが面倒だから）
        }else if(this.isPuase){//スマホでポーズ画面から戻ったとき用
            this.data.play();
            this.data.src.loop = true;//ポーズするとfalseになるっぽい(確認はしていない)
            this.isPuase = false;
        }
    },
    //再生停止(曲を入れ替える前は,必ずstop()させる)
    stop: function(){
        if(this.data != null){
            if(this.isPuase){
                this.isPlay = false;
                this.isPuase = false;
                this.data.currentTime = 0;
            }else if(this.isPlay){//プレイ中か？
                this.data.stop();
                this.isPlay = false;
            }
        }
    },
    //一時停止（ポーズ画面などの一時的な画面の切り替え時に音を止めたいときのみ使う）
    pause: function(){
        if(this.data != null){
            this.data.pause();
            this.isPuase = true;
        }
    }
});

//************************************************************************
//内容：画面のフェードアウト
var FadeOut = enchant.Class.create(enchant.Sprite, {
    initialize: function(w, h, color) {
        enchant.Sprite.call(this, w, h);
        
        // Surface作成
        var bg = new Surface(w, h);
        bg.context.fillStyle = color;
        bg.context.fillRect(0, 0, w, h);
        // Sprite作成
        Sprite.call(this, w, h);
        this.image = bg;
        this.x = 0;
        this.y = 0;
        this.opacity = 0;
        this.isStart = false;
    },
    //フェードアウト開始初期処理(引数にシーンが必要)
    start: function(scene){
        if(!this.isStart){
            scene.addChild(this);
            this.isStart = true;
        }
    },
    //実行処理(先にstart()で初期処理しないと作動しない)
    do: function(speed){//引数：フェードアウトの速さ0.01~0.5(大きいほど速い)
        if(this.isStart){
            this.opacity += speed;
            if(this.opacity >= 1){//終わったらtrueを返す
                return true;
            }
            return false;
        }
    },
    stop: function(){
        this.isStart = false;
        this.opacity = 0;
    }
});

